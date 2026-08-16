import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { PlatformConfigService } from "../platform-config/platform-config.service";
import { CreatePaymentDto } from "./dto";
import { PaymentProviderRegistry } from "./providers/payment-provider-registry.service";
import { PaymentProvider, PaymentCurrency } from "./providers/payment-provider.interface";

const TERMINAL_PAYMENT_STATUSES = ["held", "released", "refunded", "cancelled"];

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private config: PlatformConfigService,
    private registry: PaymentProviderRegistry,
  ) {}

  private async computeEscrow(amount: number) {
    const rate = await this.config.getFloat("commission_rate", 0.1);
    const commissionAmount = Math.round(amount * rate * 100) / 100;
    return { subtotal: amount, commissionRate: rate, commissionAmount };
  }

  private generateIdempotencyKey(referenceId: string, provider: string) {
    const rand = Math.random().toString(36).slice(2, 10);
    return `${provider}:${referenceId}:${Date.now()}:${rand}`;
  }

  /**
   * Convierte un monto de negocio (BOB) a la moneda de cobro del proveedor.
   * - Proveedores USD (stripe/paypal): usa la tasa configurable exchange_rate_usd_bob.
   * - Moneda BOB (qr_banco_local): no convierte, devuelve el monto tal cual.
   */
  private async convertToProviderAmount(
    subtotalBOB: number,
    currency: string,
  ): Promise<{ providerAmount: number; exchangeRateSnapshot: number | null }> {
    if (currency === "USD") {
      const rate = await this.config.getFloat("exchange_rate_usd_bob", 1);
      if (!Number.isFinite(rate) || rate <= 0) {
        throw new BadRequestException(
          "Tasa de cambio BOB→USD inválida. Configurá exchange_rate_usd_bob.",
        );
      }
      const providerAmount = Math.round((subtotalBOB / rate) * 100) / 100;
      return { providerAmount, exchangeRateSnapshot: rate };
    }
    return { providerAmount: subtotalBOB, exchangeRateSnapshot: null };
  }

  private serializePayment(payment: any, payUrl?: string | null) {
    return {
      paymentId: payment.id,
      amount: Number(payment.amount),
      currency: payment.currency,
      provider: payment.provider,
      clientSecret: payment.paymentIntentClientSecret,
      payUrl: payUrl ?? payment.payUrl ?? undefined,
      qrData: payment.qrData ?? undefined,
      status: payment.status,
      expiresAt: payment.createdAt,
    };
  }

  async createPayment(userId: string, dto: CreatePaymentDto) {
    const providerName = dto.provider || "stripe";
    const provider: PaymentProvider =
      await this.registry.getProvider(providerName);

    const currency = dto.currency || "USD";
    if (!["USD", "BOB"].includes(currency)) {
      throw new BadRequestException("Moneda no soportada");
    }
    const idempotencyKey = this.generateIdempotencyKey(
      dto.referenceId,
      providerName,
    );

    let subtotal = dto.amount;
    let commissionRate = 0;
    let commissionAmount = 0;
    let existing: any = null;

    if (dto.type === "reservation") {
      const reservation = await this.prisma.reservation.findUnique({
        where: { id: dto.referenceId },
      });
      if (!reservation) throw new NotFoundException("Reserva no encontrada");
      if (reservation.userId !== userId) {
        throw new ForbiddenException("La reserva no pertenece al usuario");
      }
      if (reservation.status !== "pending") {
        throw new BadRequestException(
          "La reserva no está pendiente de pago",
        );
      }

      // Idempotencia POR PROVEEDOR: devolver el pago activo si es del mismo
      // proveedor; si cambió de método, se REUTILIZA el mismo registro
      // (la reserva tiene @@unique([reservationId])) actualizando sus datos,
      // en lugar de cancelar y crear otro que violaría la unicidad.
      existing = await this.prisma.payment.findFirst({
        where: {
          reservationId: reservation.id,
          status: { in: ["pending", "held", "processing"] },
        },
      });
      if (existing && existing.provider === providerName) {
        return this.serializePayment(existing);
      }

      subtotal = Number(reservation.totalAmount ?? dto.amount);
      const escrow = await this.computeEscrow(subtotal);
      commissionRate = escrow.commissionRate;
      commissionAmount = escrow.commissionAmount;
    }

    const converted = await this.convertToProviderAmount(subtotal, currency);
    const providerAmount = converted.providerAmount;

    // Si ya existía un pago activo de otro proveedor, se reutiliza su id
    // para no chocar con la unicidad de reservation_id.
    const paymentId =
      existing?.id ?? `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const amountCents = Math.round(providerAmount * 100);

    const intent = await provider.createPaymentIntent({
      amountCents,
      currency: currency as PaymentCurrency,
      idempotencyKey,
      description: dto.description,
      metadata: {
        paymentId,
        reservationId: dto.type === "reservation" ? dto.referenceId : "",
        type: dto.type,
      },
    });

    const paymentData = {
      type: dto.type,
      referenceId: dto.referenceId,
      provider: providerName,
      amount: providerAmount,
      currency,
      description: dto.description,
      providerTransactionId: intent.providerTransactionId,
      paymentIntentClientSecret: intent.clientSecret,
      payUrl: intent.payUrl,
      paymentMethodType: intent.currency === "BOB" ? "qr" : null,
      subtotal,
      commissionRate,
      commissionAmount,
      idempotencyKey,
      exchangeRateSnapshot: converted.exchangeRateSnapshot ?? 1,
      status: "pending",
    };

    if (existing) {
      // Al reutilizar el registro hay que LIMPIAR los campos específicos del
      // proveedor anterior: Prisma ignora `undefined`, así que se setean a null.
      const updated = await this.prisma.payment.update({
        where: { id: existing.id },
        data: {
          ...paymentData,
          paymentIntentClientSecret: intent.clientSecret ?? null,
          payUrl: intent.payUrl ?? null,
          qrData: null,
        },
      });
      return this.serializePayment(updated, intent.payUrl);
    }

    const payment = await this.prisma.payment.create({
      data: {
        id: paymentId,
        userId,
        reservationId: dto.type === "reservation" ? dto.referenceId : null,
        ...paymentData,
      },
    });

    return this.serializePayment(payment, intent.payUrl);
  }

  async getPaymentStatus(paymentId: string, userId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { settlement: true },
    });

    if (!payment) throw new NotFoundException("Pago no encontrado");
    if (payment.userId !== userId)
      throw new ForbiddenException("No tienes acceso a este pago");

    return {
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      subtotal: payment.subtotal,
      commissionAmount: payment.commissionAmount,
      currency: payment.currency,
      provider: payment.provider,
      providerTransactionId: payment.providerTransactionId,
      payUrl: payment.payUrl,
      paidAt: payment.paidAt,
      heldAt: payment.heldAt,
      releasedAt: payment.releasedAt,
      refundAmount: payment.refundAmount,
      refundedAt: payment.refundedAt,
      settlement: payment.settlement,
    };
  }

  /**
   * Camino disparado por el cliente ("ya presenté la sheet").
   * SOLO marca held si el proveedor confirma que el PaymentIntent está succeeded.
   * Nunca trata el aviso del cliente como confirmación por sí mismo.
   */
  async confirmPayment(paymentId: string, userId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });
    if (!payment) throw new NotFoundException("Pago no encontrado");
    if (payment.userId !== userId)
      throw new ForbiddenException("No tienes acceso a este pago");
    if (TERMINAL_PAYMENT_STATUSES.includes(payment.status)) {
      return { paymentId, status: payment.status };
    }

    const provider = await this.registry.getProvider(payment.provider);
    const intentStatus = await provider.retrievePaymentIntent(
      payment.providerTransactionId!,
    );
    if (intentStatus.status === "succeeded") {
      return this.applyHeld(payment.id);
    }
    return { paymentId, status: "pending", requiresAction: true };
  }

  /**
   * Camino del webhook (fuente de verdad en producción).
   * Idempotente: verifica el estado actual antes de escribir.
   */
  async markHeldByProviderTransactionId(providerTransactionId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { providerTransactionId },
    });
    if (!payment) {
      throw new NotFoundException(
        `Payment no encontrado para ${providerTransactionId}`,
      );
    }
    if (TERMINAL_PAYMENT_STATUSES.includes(payment.status)) {
      return { paymentId: payment.id, status: payment.status };
    }
    return this.applyHeld(payment.id);
  }

  /**
   * Actualiza el pago a held + confirma la reserva de forma idempotente.
   * Reutilizado por ambos caminos (retrieve del cliente y webhook).
   */
  private async applyHeld(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });
    if (!payment) throw new NotFoundException("Pago no encontrado");
    // Guard idempotente: si ya fue procesado, no duplicar efectos.
    if (TERMINAL_PAYMENT_STATUSES.includes(payment.status)) {
      return { paymentId, status: payment.status };
    }

    const updated = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "held",
        paidAt: new Date(),
        heldAt: new Date(),
      },
    });

    if (payment.type === "reservation" && payment.referenceId) {
      const res = await this.prisma.reservation.findUnique({
        where: { id: payment.referenceId },
      });
      // Solo confirmar si sigue pendiente — evita regresiones si otro camino ya confirmó.
      if (res && res.status === "pending") {
        await this.prisma.reservation.update({
          where: { id: payment.referenceId },
          data: { status: "confirmed", confirmedAt: new Date() },
        });
      }
    }

    return { paymentId, status: "held" };
  }

  async findByUser(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }
}
