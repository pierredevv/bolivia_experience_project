import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: PrismaService;

  const mockPrisma = {
    payment: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: string) => defaultValue),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPayment', () => {
    const createDto = {
      amount: 150.0,
      currency: 'BOB',
      description: 'Reserva en restaurante',
      type: 'reservation',
      referenceId: 'res-1',
    };

    it('should create a payment with QR data', async () => {
      mockPrisma.payment.create.mockResolvedValue({
        id: 'PAY-123-abc',
        userId: 'user-1',
        ...createDto,
        status: 'pending',
        qrData: '{"version":"01"}',
      });

      const result = await service.createPayment('user-1', createDto);

      expect(result.paymentId).toBe('PAY-123-abc');
      expect(result.amount).toBe(150.0);
      expect(result.status).toBe('pending');
      expect(result.qrData).toBeDefined();
      expect(result.expiresAt).toBeDefined();
    });

    it('should default currency to BOB', async () => {
      mockPrisma.payment.create.mockResolvedValue({
        id: 'PAY-456',
        userId: 'user-1',
        ...createDto,
        currency: 'BOB',
        status: 'pending',
        qrData: '{}',
      });

      const dtoNoCurrency = { ...createDto, currency: undefined };
      const result = await service.createPayment('user-1', dtoNoCurrency);

      expect(result.currency).toBe('BOB');
    });
  });

  describe('confirmPayment', () => {
    it('should confirm a pending payment', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue({
        id: 'PAY-123',
        status: 'pending',
      });
      mockPrisma.payment.update.mockResolvedValue({
        id: 'PAY-123',
        status: 'completed',
        paidAt: new Date(),
      });

      const result = await service.confirmPayment('PAY-123', 'TXN-001');

      expect(result.status).toBe('completed');
    });

    it('should throw BadRequestException if payment not found', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue(null);

      await expect(service.confirmPayment('invalid')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if payment already processed', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue({
        id: 'PAY-123',
        status: 'completed',
      });

      await expect(service.confirmPayment('PAY-123')).rejects.toThrow(BadRequestException);
    });
  });

  describe('getPaymentStatus', () => {
    it('should return payment status', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue({
        id: 'PAY-123',
        status: 'completed',
        amount: 100,
        currency: 'BOB',
        paidAt: new Date(),
      });

      const result = await service.getPaymentStatus('PAY-123');

      expect(result.id).toBe('PAY-123');
      expect(result.status).toBe('completed');
    });

    it('should throw BadRequestException if payment not found', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue(null);

      await expect(service.getPaymentStatus('invalid')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByUser', () => {
    it('should return payment history for a user', async () => {
      const mockPayments = [
        { id: 'PAY-1', userId: 'user-1', amount: 100, status: 'completed' },
        { id: 'PAY-2', userId: 'user-1', amount: 200, status: 'pending' },
      ];
      mockPrisma.payment.findMany.mockResolvedValue(mockPayments);

      const result = await service.findByUser('user-1');

      expect(result).toEqual(mockPayments);
      expect(mockPrisma.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1' },
        }),
      );
    });
  });
});
