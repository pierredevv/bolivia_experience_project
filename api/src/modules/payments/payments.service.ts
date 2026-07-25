import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async createPayment(userId: string, dto: {
    amount: number;
    currency?: string;
    description: string;
    type: string; // 'reservation', 'ticket', 'tour', 'coupon'
    referenceId: string;
  }) {
    const paymentId = `PAY-${Date.now()}-${randomBytes(4).toString('hex')}`;

    // Generate QR code data for BCB (Banco Central de Bolivia)
    const qrData = this.generateQRData({
      amount: dto.amount,
      currency: dto.currency || 'BOB',
      merchantName: 'BoliviaExperience',
      reference: paymentId,
    });

    const payment = await this.prisma.payment.create({
      data: {
        id: paymentId,
        userId,
        amount: dto.amount,
        currency: dto.currency || 'BOB',
        description: dto.description,
        type: dto.type,
        referenceId: dto.referenceId,
        status: 'pending',
        qrData,
      },
    });

    return {
      paymentId: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      qrData: payment.qrData,
      status: payment.status,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    };
  }

  async getPaymentStatus(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new BadRequestException('Pago no encontrado');
    }

    return {
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      paidAt: payment.paidAt,
    };
  }

  async confirmPayment(paymentId: string, transactionId?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new BadRequestException('Pago no encontrado');
    }

    if (payment.status !== 'pending') {
      throw new BadRequestException('El pago ya fue procesado');
    }

    return this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'completed',
        transactionId,
        paidAt: new Date(),
      },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  private generateQRData(data: {
    amount: number;
    currency: string;
    merchantName: string;
    reference: string;
  }): string {
    // QR BCB format (simplified)
    return JSON.stringify({
      version: '01',
      merchant: data.merchantName,
      amount: data.amount,
      currency: data.currency,
      reference: data.reference,
      timestamp: new Date().toISOString(),
    });
  }
}
