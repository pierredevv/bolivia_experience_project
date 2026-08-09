import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { PlatformConfigService } from "../platform-config/platform-config.service";
import { CreatePaymentDto } from "./dto";

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private config: PlatformConfigService,
  ) {}

  private async computeEscrow(amount: number) {
    const rate = await this.config.getFloat("commission_rate", 0.1);
    const commissionAmount = Math.round(amount * rate * 100) / 100;
    return { subtotal: amount, commissionRate: rate, commissionAmount };
  }

  private generateQRData(data: {
    amount: number;
    currency: string;
    merchantName: string;
    reference: string;
  }): string {
    return JSON.stringify({
      version: "01",
      merchant: data.merchantName,
      amount: data.amount,
      currency: data.currency,
      reference: data.reference,
      timestamp: new Date().toISOString(),
    });
  }

  async createPayment(userId: string, dto: CreatePaymentDto) {
    const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    let subtotal = dto.amount;
    let commissionRate = 0;
    let commissionAmount = 0;

    if (dto.type === "reservation") {
      const reservation = await this.prisma.reservation.findUnique({
        where: { id: dto.referenceId },
      });
      if (!reservation) throw new NotFoundException("Reserva no encontrada");
      if (reservation.userId !== userId) {
        throw new ForbiddenException("La reserva no pertenece al usuario");
      }
      if (reservation.status !== "pending") {
        throw new BadRequestException("La reserva no está pendiente de pago");
      }

      // Idempotencia: si la reserva ya tiene un pago activo, devolverlo en vez de crear uno duplicado.
      const existing = await this.prisma.payment.findFirst({
        where: {
          reservationId: reservation.id,
          status: { in: ["pending", "held"] },
        },
      });
      if (existing) {
        return {
          paymentId: existing.id,
          amount: existing.amount,
          currency: existing.currency,
          qrData: existing.qrData,
          status: existing.status,
          expiresAt: existing.createdAt,
        };
      }

      subtotal = reservation.totalAmount ?? dto.amount;
      const escrow = await this.computeEscrow(subtotal);
      commissionRate = escrow.commissionRate;
      commissionAmount = escrow.commissionAmount;
    }

    const qrData = this.generateQRData({
      amount: subtotal,
      currency: dto.currency || "BOB",
      merchantName: "BoliviaExperience",
      reference: paymentId,
    });

    const payment = await this.prisma.payment.create({
      data: {
        id: paymentId,
        userId,
        reservationId: dto.type === "reservation" ? dto.referenceId : null,
        amount: subtotal,
        currency: dto.currency || "BOB",
        description: dto.description,
        type: dto.type,
        referenceId: dto.referenceId,
        subtotal,
        commissionRate,
        commissionAmount,
        status: "pending",
        qrData,
      },
    });

    return {
      paymentId: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      qrData: payment.qrData,
      status: payment.status,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    };
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
      paidAt: payment.paidAt,
      heldAt: payment.heldAt,
      releasedAt: payment.releasedAt,
      refundAmount: payment.refundAmount,
      refundedAt: payment.refundedAt,
      settlement: payment.settlement,
    };
  }

  // Usuario paga: el monto queda retenido (escrow) hasta la fecha del servicio.
  async confirmPayment(
    paymentId: string,
    userId: string,
    transactionId?: string,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) throw new NotFoundException("Pago no encontrado");
    if (payment.userId !== userId)
      throw new ForbiddenException("No tienes acceso a este pago");
    if (payment.status !== "pending")
      throw new BadRequestException("El pago ya fue procesado");

    const updated = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "held",
        transactionId,
        paidAt: new Date(),
        heldAt: new Date(),
      },
    });

    if (payment.type === "reservation") {
      await this.prisma.reservation.update({
        where: { id: payment.referenceId },
        data: { status: "confirmed", confirmedAt: new Date() },
      });
    }

    return updated;
  }

  async findByUser(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }
}
