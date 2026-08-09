import { Test, TestingModule } from "@nestjs/testing";
import { PaymentsService } from "./payments.service";
import { PrismaService } from "../../prisma/prisma.service";
import { PlatformConfigService } from "../platform-config/platform-config.service";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";

describe("PaymentsService", () => {
  let service: PaymentsService;
  let prisma: PrismaService;

  const mockPrisma = {
    payment: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn().mockResolvedValue(null),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    reservation: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockConfig = {
    getFloat: jest.fn().mockResolvedValue(0.1),
    get: jest.fn().mockResolvedValue("0.1"),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: PlatformConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createPayment", () => {
    const createDto = {
      amount: 150.0,
      currency: "BOB",
      description: "Reserva en restaurante",
      type: "reservation",
      referenceId: "res-1",
    };

    it("should create a payment with QR data", async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue({
        id: "res-1",
        userId: "user-1",
        status: "pending",
        totalAmount: 150,
      });
      mockPrisma.payment.create.mockResolvedValue({
        id: "PAY-123-abc",
        userId: "user-1",
        ...createDto,
        status: "pending",
        qrData: '{"version":"01"}',
      });

      const result = await service.createPayment("user-1", createDto);

      expect(result.paymentId).toBe("PAY-123-abc");
      expect(result.amount).toBe(150.0);
      expect(result.status).toBe("pending");
      expect(result.qrData).toBeDefined();
      expect(result.expiresAt).toBeDefined();
    });

    it("should default currency to BOB", async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue({
        id: "res-1",
        userId: "user-1",
        status: "pending",
        totalAmount: 150,
      });
      mockPrisma.payment.create.mockResolvedValue({
        id: "PAY-456",
        userId: "user-1",
        ...createDto,
        currency: "BOB",
        status: "pending",
        qrData: "{}",
      });

      const dtoNoCurrency = { ...createDto, currency: undefined };
      const result = await service.createPayment("user-1", dtoNoCurrency);

      expect(result.currency).toBe("BOB");
    });

    it("should throw NotFoundException if reservation does not exist", async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue(null);

      await expect(service.createPayment("user-1", createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ForbiddenException if reservation belongs to another user", async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue({
        id: "res-1",
        userId: "other-user",
        status: "pending",
      });

      await expect(service.createPayment("user-1", createDto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("should return the existing active payment instead of creating a duplicate", async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue({
        id: "res-1",
        userId: "user-1",
        status: "pending",
        totalAmount: 150,
      });
      mockPrisma.payment.findFirst.mockResolvedValue({
        id: "PAY-EXISTING",
        userId: "user-1",
        status: "pending",
        amount: 150,
        currency: "BOB",
        qrData: "{}",
      });

      const result = await service.createPayment("user-1", createDto);

      expect(result.paymentId).toBe("PAY-EXISTING");
      expect(mockPrisma.payment.create).not.toHaveBeenCalled();
    });
  });

  describe("confirmPayment", () => {
    it("should hold a pending payment (escrow)", async () => {
      mockPrisma.payment.findUnique.mockResolvedValue({
        id: "PAY-123",
        userId: "user-1",
        status: "pending",
      });
      mockPrisma.payment.update.mockResolvedValue({
        id: "PAY-123",
        status: "held",
        heldAt: new Date(),
        paidAt: new Date(),
      });

      const result = await service.confirmPayment(
        "PAY-123",
        "user-1",
        "TXN-001",
      );

      expect(result.status).toBe("held");
      expect(mockPrisma.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: "held" }),
        }),
      );
    });

    it("should confirm the linked reservation when type is reservation", async () => {
      mockPrisma.payment.findUnique.mockResolvedValue({
        id: "PAY-123",
        userId: "user-1",
        status: "pending",
        type: "reservation",
        referenceId: "res-1",
      });
      mockPrisma.payment.update.mockResolvedValue({
        id: "PAY-123",
        status: "held",
        heldAt: new Date(),
        paidAt: new Date(),
      });
      mockPrisma.reservation.update.mockResolvedValue({
        id: "res-1",
        status: "confirmed",
      });

      await service.confirmPayment("PAY-123", "user-1", "TXN-001");

      expect(mockPrisma.reservation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "res-1" },
          data: expect.objectContaining({ status: "confirmed" }),
        }),
      );
    });

    it("should not touch reservation for non-reservation payments", async () => {
      mockPrisma.payment.findUnique.mockResolvedValue({
        id: "PAY-123",
        userId: "user-1",
        status: "pending",
        type: "ticket",
        referenceId: "ticket-1",
      });
      mockPrisma.payment.update.mockResolvedValue({
        id: "PAY-123",
        status: "held",
      });

      await service.confirmPayment("PAY-123", "user-1");

      expect(mockPrisma.reservation.update).not.toHaveBeenCalled();
    });

    it("should throw NotFoundException if payment not found", async () => {
      mockPrisma.payment.findUnique.mockResolvedValue(null);

      await expect(service.confirmPayment("invalid", "user-1")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ForbiddenException if not owner", async () => {
      mockPrisma.payment.findUnique.mockResolvedValue({
        id: "PAY-123",
        userId: "other-user",
        status: "pending",
      });

      await expect(service.confirmPayment("PAY-123", "user-1")).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("should throw BadRequestException if payment already processed", async () => {
      mockPrisma.payment.findUnique.mockResolvedValue({
        id: "PAY-123",
        userId: "user-1",
        status: "held",
      });

      await expect(service.confirmPayment("PAY-123", "user-1")).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("getPaymentStatus", () => {
    it("should return payment status", async () => {
      mockPrisma.payment.findUnique.mockResolvedValue({
        id: "PAY-123",
        userId: "user-1",
        status: "held",
        amount: 100,
        subtotal: 100,
        commissionAmount: 10,
        currency: "BOB",
        paidAt: new Date(),
        settlement: null,
      });

      const result = await service.getPaymentStatus("PAY-123", "user-1");

      expect(result.id).toBe("PAY-123");
      expect(result.status).toBe("held");
      expect(result.commissionAmount).toBe(10);
    });

    it("should throw ForbiddenException if not owner", async () => {
      mockPrisma.payment.findUnique.mockResolvedValue({
        id: "PAY-123",
        userId: "other-user",
        status: "held",
      });

      await expect(
        service.getPaymentStatus("PAY-123", "user-1"),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should throw NotFoundException if payment not found", async () => {
      mockPrisma.payment.findUnique.mockResolvedValue(null);

      await expect(
        service.getPaymentStatus("invalid", "user-1"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("findByUser", () => {
    it("should return payment history for a user", async () => {
      const mockPayments = [
        { id: "PAY-1", userId: "user-1", amount: 100, status: "held" },
        { id: "PAY-2", userId: "user-1", amount: 200, status: "pending" },
      ];
      mockPrisma.payment.findMany.mockResolvedValue(mockPayments);

      const result = await service.findByUser("user-1");

      expect(result).toEqual(mockPayments);
      expect(mockPrisma.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: "user-1" },
        }),
      );
    });
  });
});
