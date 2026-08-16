import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { PlatformConfigService } from "../platform-config/platform-config.service";
import { NotificationsService } from "../notifications/notifications.service";
import { GamificationService } from "../gamification/gamification.service";
import { PaymentProviderRegistry } from "../payments/providers/payment-provider-registry.service";
import { CreateReservationDto } from "./dto";

type Tx = any;

@Injectable()
export class ReservationsService {
  constructor(
    private prisma: PrismaService,
    private config: PlatformConfigService,
    private notifications: NotificationsService,
    private gamification: GamificationService,
    private paymentRegistry: PaymentProviderRegistry,
  ) {}

  // Expira automáticamente solicitudes sin responder y pagos no completados.
  @Cron("*/5 * * * *")
  async handleOverdueCron() {
    return this.expireOverdue();
  }

  // ---------- helpers ----------

  private async resolveProduct(dto: CreateReservationDto) {
    let product: any = null;
    if (dto.productId) {
      product = await this.prisma.product.findUnique({
        where: { id: dto.productId },
      });
      if (!product) throw new BadRequestException("Producto no encontrado");
    } else if (dto.placeId) {
      product = await this.prisma.product.findFirst({
        where: {
          placeId: dto.placeId,
          isActive: true,
          modalidadReserva: { not: "ninguna" },
        },
        orderBy: { createdAt: "asc" },
      });
      if (!product)
        throw new BadRequestException("Este lugar no ofrece reservas");
    } else {
      throw new BadRequestException("Se requiere productId o placeId");
    }
    if (!product.isActive)
      throw new BadRequestException("Producto no disponible");
    if (product.modalidadReserva === "ninguna") {
      throw new BadRequestException("Este producto no ofrece reservas");
    }
    return product;
  }

  private async computeEscrow(totalAmount: number) {
    const rate = await this.config.getFloat("commission_rate", 0.1);
    const commissionAmount = Math.round(totalAmount * rate * 100) / 100;
    return { subtotal: totalAmount, commissionRate: rate, commissionAmount };
  }

  // Libera el pago retenido y crea la liquidación al socio.
  private async releaseAndSettle(tx: Tx, reservation: any, payment: any) {
    const gross = Number(payment.subtotal || payment.amount);
    const commission = Number(payment.commissionAmount ?? 0);
    const net = Math.round((gross - commission) * 100) / 100;
    const product = await tx.product.findUnique({
      where: { id: reservation.productId! },
    });
    if (!product) throw new BadRequestException("Producto no encontrado");

    await tx.payment.update({
      where: { id: payment.id },
      data: { status: "released", releasedAt: new Date() },
    });

    await tx.settlement.upsert({
      where: { paymentId: payment.id },
      update: { status: "released", releasedAt: new Date() },
      create: {
        paymentId: payment.id,
        socioId: product.socioId,
        grossAmount: gross,
        commissionAmount: commission,
        netAmount: net,
        status: "released",
        releasedAt: new Date(),
      },
    });

    return { gross, commission, net };
  }

  private parseRules(
    policy: any,
  ): { hastaHoras?: number; reembolso: number }[] {
    if (!policy) return [];
    try {
      const rules = JSON.parse(policy.rulesJson || "[]");
      return Array.isArray(rules) ? rules : [];
    } catch {
      return [];
    }
  }

  // % de reembolso según la política y las horas hasta la fecha del servicio.
  private computeRefundRate(policy: any, serviceDateTime: Date, now: Date) {
    const rules = this.parseRules(policy);
    if (rules.length === 0) return 0;
    const hoursUntil = (serviceDateTime.getTime() - now.getTime()) / 36e5;
    const withBound = rules
      .filter((r) => r.hastaHoras !== undefined)
      .sort((a, b) => a.hastaHoras! - b.hastaHoras!);
    // Regla con el mayor hastaHoras que siga siendo válido a la hora actual.
    const match = [...withBound]
      .reverse()
      .find((r) => hoursUntil >= r.hastaHoras!);
    if (match) return (match.reembolso ?? 0) / 100;
    // Si no aplica ningún límite superior, cae a la última regla (catch-all).
    const last = rules[rules.length - 1];
    return (last?.reembolso ?? 0) / 100;
  }

  private serviceDateTime(date: Date, time: string): Date {
    const [h, m] = time.split(":").map(Number);
    const dt = new Date(date);
    if (!Number.isNaN(h)) dt.setUTCHours(h, Number.isNaN(m) ? 0 : m, 0, 0);
    return dt;
  }

  private isSqlite(): boolean {
    return (process.env.DATABASE_URL ?? "").startsWith("file:");
  }

  // Ejecuta el callback dentro de una transacción atómica para el chequeo de cupo.
  // Postgres: isolation Serializable + retry en P2034 (serialization failure) para
  // eliminar la race condition read-then-write del conteo de reservas.
  // SQLite: serializa escrituras a nivel de archivo, la transacción interactiva basta.
  private async withAtomicTx<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
    if (this.isSqlite()) {
      return this.prisma.$transaction(fn);
    }
    const maxAttempts = 3;
    for (let attempt = 0; ; attempt++) {
      try {
        return await this.prisma.$transaction(fn, {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          maxWait: 2000,
          timeout: 10000,
        });
      } catch (e: any) {
        if (e?.code === "P2034" && attempt < maxAttempts - 1) continue;
        throw e;
      }
    }
  }

  // Valida cupo de un producto para fecha/hora.
  // capacity null o 0 = sin límite (no restringe).
  // mode "before-create": cuenta reservas existentes, rechaza si booked >= capacity.
  // mode "before-confirm": la reserva a confirmar ya está en "pending" y se cuenta a sí misma;
  //   rechaza si booked > capacity (evita sobre-confirmar más allá del cupo).
  private async assertCapacity(
    tx: Tx,
    product: any,
    serviceDate: Date,
    time: string,
    mode: "before-create" | "before-confirm" = "before-create",
  ) {
    if (!product.capacity || product.capacity <= 0) return;
    const booked = await tx.reservation.count({
      where: {
        productId: product.id,
        date: serviceDate,
        time,
        status: { in: ["pending", "confirmed"] },
      },
    });
    const exceed =
      mode === "before-create"
        ? booked >= product.capacity
        : booked > product.capacity;
    if (exceed) {
      throw new BadRequestException("Sin cupo disponible para ese horario");
    }
  }

  // ---------- create ----------

  async create(userId: string, dto: CreateReservationDto) {
    const product = await this.resolveProduct(dto);
    const serviceDate = new Date(dto.date);

    if (product.modalidadReserva === "instantanea") {
      return this.createInstantanea(userId, product, serviceDate, dto);
    }
    return this.createSolicitud(userId, product, serviceDate, dto);
  }

  private async createInstantanea(
    userId: string,
    product: any,
    serviceDate: Date,
    dto: CreateReservationDto,
  ) {
    const paymentWindowMin = await this.config.getInt(
      "instantanea_payment_minutes",
      15,
    );
    const totalAmount = Math.round(product.price * dto.partySize * 100) / 100;
    const escrow = await this.computeEscrow(totalAmount);
    // Monto de cobro en USD del proveedor (productos en BOB → USD).
    const usdRate = await this.config.getFloat("exchange_rate_usd_bob", 1);
    const providerAmountUSD =
      usdRate > 0 ? Math.round((totalAmount / usdRate) * 100) / 100 : totalAmount;
    const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const idempotencyKey = `stripe:${product.id}:${Date.now()}:${Math.random()
      .toString(36)
      .slice(2, 10)}`;

    const result = await this.withAtomicTx(async (tx) => {
      await this.assertCapacity(tx, product, serviceDate, dto.time, "before-create");

      const reservation = await tx.reservation.create({
        data: {
          userId,
          productId: product.id,
          placeId: product.placeId,
          date: serviceDate,
          time: dto.time,
          partySize: dto.partySize,
          notes: dto.notes,
          contactPhone: dto.contactPhone,
          status: "pending",
          modalidad: "instantanea",
          responseDeadline: new Date(Date.now() + paymentWindowMin * 60 * 1000),
          totalAmount,
        },
      });

      const payment = await tx.payment.create({
        data: {
          id: paymentId,
          userId,
          reservationId: reservation.id,
          amount: providerAmountUSD,
          currency: "USD",
          description: `Reserva: ${product.name}`,
          type: "reservation",
          referenceId: reservation.id,
          provider: "stripe",
          idempotencyKey,
          subtotal: escrow.subtotal,
          commissionRate: escrow.commissionRate,
          commissionAmount: escrow.commissionAmount,
          exchangeRateSnapshot: usdRate > 0 ? usdRate : 1,
          status: "pending",
        },
      });

      return this.serializeReservation(reservation, payment);
    });

    await this.provisionInstantaneaIntent(paymentId, {
      amountCents: Math.round(providerAmountUSD * 100),
      description: `Reserva: ${product.name}`,
      reservationId: result.id,
      productId: product.id,
    });

    await this.notifications.notify(userId, {
      title: "Reserva generada",
      body: `Tu reserva en ${product.name} quedó pendiente de pago. Completá el pago para confirmarla.`,
      type: "reservation",
      data: JSON.stringify({
        reservationId: result.id,
        placeId: product.placeId,
        productId: product.id,
        modalidad: "instantanea",
      }),
    });

    const freshPayment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });
    return { ...result, payment: freshPayment };
  }

  // Crea el PaymentIntent en el proveedor (Stripe) fuera de la transacción y
  // le asocia el clientSecret. Si Stripe no está configurado, el pago queda
  // con provider qr_banco_local y el QR simulado como fallback de desarrollo.
  private async provisionInstantaneaIntent(
    paymentId: string,
    opts: {
      amountCents: number;
      description: string;
      reservationId: string;
      productId: string;
    },
  ) {
    const provider = await this.paymentRegistry
      .getProviderIfAvailable("stripe")
      .catch(() => null);
    if (!provider) {
      const qrData = JSON.stringify({
        version: "01",
        merchant: "BoliviaExperience",
        amount: opts.amountCents / 100,
        currency: "USD",
        reference: paymentId,
        timestamp: new Date().toISOString(),
      });
      await this.prisma.payment.update({
        where: { id: paymentId },
        data: { provider: "qr_banco_local", qrData },
      });
      return;
    }
    try {
      const intent = await provider.createPaymentIntent({
        amountCents: opts.amountCents,
        currency: "USD",
        idempotencyKey: `instantanea:${paymentId}`,
        description: opts.description,
        metadata: {
          paymentId,
          reservationId: opts.reservationId,
          productId: opts.productId,
          type: "reservation",
        },
      });
      await this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          provider: "stripe",
          providerTransactionId: intent.providerTransactionId,
          paymentIntentClientSecret: intent.clientSecret,
        },
      });
    } catch {
      const qrData = JSON.stringify({
        version: "01",
        merchant: "BoliviaExperience",
        amount: opts.amountCents / 100,
        currency: "USD",
        reference: paymentId,
        timestamp: new Date().toISOString(),
      });
      await this.prisma.payment.update({
        where: { id: paymentId },
        data: { provider: "qr_banco_local", qrData },
      });
    }
  }

  private async createSolicitud(
    userId: string,
    product: any,
    serviceDate: Date,
    dto: CreateReservationDto,
  ) {
    const hours = await this.config.getInt("solicitud_response_hours", 24);
    const reservation = await this.prisma.reservation.create({
      data: {
        userId,
        productId: product.id,
        placeId: product.placeId,
        date: serviceDate,
        time: dto.time,
        partySize: dto.partySize,
        notes: dto.notes,
        contactPhone: dto.contactPhone,
        status: "pending",
        modalidad: "solicitud",
        responseDeadline: new Date(Date.now() + hours * 36e5),
      },
    });

    if (product.socioId) {
      await this.notifications.notify(product.socioId, {
        title: "Nueva solicitud de reserva",
        body: `${product.name}: ${dto.partySize} persona(s) para el ${dto.date} a las ${dto.time}.`,
        type: "reservation_request",
        data: JSON.stringify({
          reservationId: reservation.id,
          placeId: product.placeId,
          productId: product.id,
          modalidad: "solicitud",
        }),
      });
    }

    return this.serializeReservation(reservation, null);
  }

  private serializeReservation(reservation: any, payment: any) {
    return {
      id: reservation.id,
      status: reservation.status,
      modalidad: reservation.modalidad,
      responseDeadline: reservation.responseDeadline,
      payment,
    };
  }

  // ---------- reads ----------

  async expireOverdue() {
    const now = new Date();
    const overdue = await this.prisma.reservation.findMany({
      where: { status: "pending", responseDeadline: { lt: now } },
    });
    let count = 0;
    for (const r of overdue) {
      await this.prisma.$transaction(async (tx) => {
        await tx.reservation.update({
          where: { id: r.id },
          data: { status: "expirada" },
        });
        if (r.modalidad === "instantanea") {
          await tx.payment.updateMany({
            where: { reservationId: r.id, status: "pending" },
            data: { status: "cancelled" },
          });
        }
      });
      await this.notifications.notify(r.userId, {
        title:
          r.modalidad === "instantanea"
            ? "Pago expirado"
            : "Solicitud expirada",
        body:
          r.modalidad === "instantanea"
            ? "No completaste el pago a tiempo. Tu reserva fue cancelada."
            : "El socio no respondió a tiempo. Tu solicitud fue cancelada.",
        type: "reservation_expired",
        data: JSON.stringify({ reservationId: r.id, modalidad: r.modalidad }),
      });
      count++;
    }
    return { expired: count };
  }

  async findByUser(userId: string) {
    await this.expireOverdue();
    return this.prisma.reservation.findMany({
      where: { userId },
      include: {
        product: { select: { id: true, name: true, type: true } },
        place: { select: { id: true, name: true, address: true, phone: true } },
        payments: {
          select: {
            id: true,
            status: true,
            amount: true,
            currency: true,
            provider: true,
            paymentIntentClientSecret: true,
            qrData: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { date: "desc" },
    });
  }

  async findByPlace(placeId: string, date?: string) {
    await this.expireOverdue();
    const where: any = {
      placeId,
      status: { in: ["pending", "confirmed"] },
    };
    if (date) where.date = new Date(date);

    return this.prisma.reservation.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, name: true, type: true } },
      },
      orderBy: { time: "asc" },
    });
  }

  async findBySocio(socioId: string, status?: string) {
    await this.expireOverdue();
    const where: any = { product: { socioId } };
    if (status) where.status = status;
    return this.prisma.reservation.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        product: {
          select: { id: true, name: true, type: true, placeId: true },
        },
        payments: {
          select: { id: true, status: true, amount: true, currency: true },
        },
      },
      orderBy: { date: "desc" },
    });
  }

  private async getOwnedReservation(id: string, socioId: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: { product: true },
    });
    if (!reservation) throw new NotFoundException("Reserva no encontrada");
    if (!reservation.product || reservation.product.socioId !== socioId) {
      throw new ForbiddenException("No tienes acceso a esta reserva");
    }
    return reservation;
  }

  // ---------- socio actions ----------

  async confirm(socioId: string, id: string) {
    const reservation = await this.getOwnedReservation(id, socioId);
    if (
      reservation.status !== "pending" ||
      reservation.modalidad !== "solicitud"
    ) {
      throw new BadRequestException(
        "Solo se pueden confirmar solicitudes pendientes",
      );
    }
    const product = reservation.product!;
    const totalAmount =
      Math.round(product.price * reservation.partySize * 100) / 100;
    const escrow = await this.computeEscrow(totalAmount);

    const result = await this.withAtomicTx(async (tx) => {
      await this.assertCapacity(
        tx,
        product,
        reservation.date,
        reservation.time,
        "before-confirm",
      );

      const updated = await tx.reservation.update({
        where: { id },
        data: {
          status: "confirmed",
          respondedAt: new Date(),
          confirmedAt: new Date(),
          totalAmount,
        },
      });

      const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const qrData = JSON.stringify({
        version: "01",
        merchant: "BoliviaExperience",
        amount: totalAmount,
        currency: product.currency || "BOB",
        reference: paymentId,
        timestamp: new Date().toISOString(),
      });

      const payment = await tx.payment.create({
        data: {
          id: paymentId,
          userId: reservation.userId,
          reservationId: reservation.id,
          amount: totalAmount,
          currency: product.currency || "BOB",
          description: `Reserva: ${product.name}`,
          type: "reservation",
          referenceId: reservation.id,
          subtotal: escrow.subtotal,
          commissionRate: escrow.commissionRate,
          commissionAmount: escrow.commissionAmount,
          status: "pending",
          qrData,
        },
      });

      return { ...updated, payment };
    });

    await this.notifications.notify(reservation.userId, {
      title: "Reserva confirmada",
      body: `El socio confirmó tu solicitud en ${product.name}. Pagá con el QR para asegurar tu lugar.`,
      type: "reservation_confirmed",
      data: JSON.stringify({
        reservationId: result.id,
        placeId: product.placeId,
        productId: product.id,
        modalidad: "solicitud",
        paymentId: result.payment.id,
      }),
    });

    return result;
  }

  async reject(socioId: string, id: string) {
    const reservation = await this.getOwnedReservation(id, socioId);
    if (reservation.status !== "pending") {
      throw new BadRequestException(
        "Solo se pueden rechazar solicitudes pendientes",
      );
    }
    const updated = await this.prisma.reservation.update({
      where: { id },
      data: { status: "rejected", respondedAt: new Date() },
    });

    await this.notifications.notify(reservation.userId, {
      title: "Reserva rechazada",
      body: `El socio rechazó tu solicitud en ${reservation.product!.name}.`,
      type: "reservation_rejected",
      data: JSON.stringify({
        reservationId: updated.id,
        placeId: reservation.product!.placeId,
      }),
    });

    return updated;
  }

  async complete(socioId: string, id: string) {
    const reservation = await this.getOwnedReservation(id, socioId);
    if (reservation.status !== "confirmed") {
      throw new BadRequestException(
        "Solo se pueden completar reservas confirmadas",
      );
    }
    const payment = await this.prisma.payment.findFirst({
      where: { reservationId: id, status: "held" },
    });

    const result = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.reservation.update({
        where: { id },
        data: { status: "completed", completedAt: new Date() },
      });
      let settlement = null;
      if (payment) {
        settlement = await this.releaseAndSettle(tx, reservation, payment);
      }
      return { ...updated, settlement };
    });

    const points = await this.gamification.grantReservationPoints(
      reservation.userId,
      Number(reservation.totalAmount ?? 0),
    );
    const earnedBadges = await this.gamification.evaluateBadges(
      reservation.userId,
    );

    await this.notifications.notify(reservation.userId, {
      title: "Visita completada",
      body: `Tu reserva en ${reservation.product!.name} fue marcada como completada. ¡Ganaste ${points} pts!`,
      type: "reservation_completed",
      data: JSON.stringify({
        reservationId: result.id,
        placeId: reservation.product!.placeId,
        points,
      }),
    });

    if (earnedBadges.length > 0) {
      await this.notifications.notify(reservation.userId, {
        title: "¡Nueva insignia desbloqueada!",
        body: `Has desbloqueado “${earnedBadges[0].name}”.`,
        type: "badge_earned",
        data: JSON.stringify({
          badgeKey: earnedBadges[0].key,
        }),
      });
    }

    return { ...result, pointsEarned: points, badgesEarned: earnedBadges };
  }

  async noShow(socioId: string, id: string) {
    const reservation = await this.getOwnedReservation(id, socioId);
    if (reservation.status !== "confirmed") {
      throw new BadRequestException(
        "Solo se puede marcar no-show a reservas confirmadas",
      );
    }
    const payment = await this.prisma.payment.findFirst({
      where: { reservationId: id, status: "held" },
    });

    const result = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.reservation.update({
        where: { id },
        data: { status: "no_show" },
      });
      let settlement = null;
      if (payment) {
        settlement = await this.releaseAndSettle(tx, reservation, payment);
      }
      return { ...updated, settlement };
    });

    await this.notifications.notify(reservation.userId, {
      title: "No asististe",
      body: `Tu reserva en ${reservation.product!.name} fue marcada como no asistida.`,
      type: "reservation_no_show",
      data: JSON.stringify({
        reservationId: result.id,
        placeId: reservation.product!.placeId,
      }),
    });

    return result;
  }

  // ---------- user actions ----------

  async cancel(userId: string, id: string, reason?: string) {
    await this.expireOverdue();
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: { product: { include: { policy: true } } },
    });
    if (!reservation) throw new NotFoundException("Reserva no encontrada");
    if (reservation.userId !== userId) {
      throw new ForbiddenException("No puedes cancelar esta reserva");
    }
    if (!["pending", "confirmed"].includes(reservation.status)) {
      throw new BadRequestException("La reserva no se puede cancelar");
    }

    const refundRate = this.computeRefundRate(
      reservation.product?.policy,
      this.serviceDateTime(reservation.date, reservation.time),
      new Date(),
    );

    const result = await this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findFirst({
        where: { reservationId: id, status: { in: ["pending", "held"] } },
      });

      let refundAmount: number | null = null;
      if (payment) {
        if (payment.status === "held") {
          refundAmount =
            Math.round(Number(payment.subtotal) * refundRate * 100) / 100;
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: "refunded",
              refundedAt: new Date(),
              refundAmount,
            },
          });
        } else {
          await tx.payment.update({
            where: { id: payment.id },
            data: { status: "cancelled" },
          });
        }
      }

      const updated = await tx.reservation.update({
        where: { id },
        data: {
          status: "cancelled",
          cancelledAt: new Date(),
          cancelReason: reason || "Cancelada por el usuario",
        },
      });

      return { ...updated, refundRate, refundAmount };
    });

    if (reservation.product?.socioId) {
      await this.notifications.notify(reservation.product.socioId, {
        title: "Reserva cancelada",
        body: `Un usuario canceló su reserva en ${reservation.product.name} (${result.cancelReason}).`,
        type: "reservation_cancelled",
        data: JSON.stringify({
          reservationId: result.id,
          placeId: reservation.product.placeId,
          productId: reservation.product.id,
          userId,
        }),
      });
    }

    return result;
  }
}
