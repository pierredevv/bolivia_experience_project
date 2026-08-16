import { Test, TestingModule } from "@nestjs/testing";
import { PaymentsService } from "./payments.service";
import { PrismaService } from "../../prisma/prisma.service";
import { PlatformConfigService } from "../platform-config/platform-config.service";
import { PaymentProviderRegistry } from "./providers/payment-provider-registry.service";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";

describe("PaymentsService", () => {
  let service: PaymentsService;
  let prisma: PrismaService;

  const mockProvider = {
    createPaymentIntent: jest.fn().mockResolvedValue({
      providerTransactionId: "pi_123",
      clientSecret: "pi_123_secret",
    }),
    retrievePaymentIntent: jest.fn().mockResolvedValue({ status: "succeeded" }),
    refund: jest.fn(),
    verifyWebhookSignature: jest.fn(),
  };

  const mockRegistry = {
    getProvider: jest.fn().mockResolvedValue(mockProvider),
  };

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

  let exchangeRate = 6.96;
  const mockConfig = {
    getFloat: jest.fn((key: string, def: number) => {
      if (key === "commission_rate") return Promise.resolve(0.1);
      if (key === "exchange_rate_usd_bob") return Promise.resolve(exchangeRate);
      return Promise.resolve(def);
    }),
    get: jest.fn().mockResolvedValue("0.1"),
  };

  beforeEach(async () => {
    exchangeRate = 6.96;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: PlatformConfigService, useValue: mockConfig },
        { provide: PaymentProviderRegistry, useValue: mockRegistry },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
    mockProvider.createPaymentIntent.mockResolvedValue({
      providerTransactionId: "pi_123",
      clientSecret: "pi_123_secret",
    });
    mockProvider.retrievePaymentIntent.mockResolvedValue({
      status: "succeeded",
    });
    mockRegistry.getProvider.mockResolvedValue(mockProvider);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createPayment", () => {
    const createDto = {
      amount: 150.0,
      description: "Reserva en restaurante",
      type: "reservation",
      referenceId: "res-1",
    };

    it("should create a payment via the provider (Stripe intent)", async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue({
        id: "res-1",
        userId: "user-1",
        status: "pending",
        totalAmount: 150,
      });
      mockPrisma.payment.create.mockResolvedValue({
        id: "PAY-123-abc",
        userId: "user-1",
        amount: 150,
        currency: "USD",
        provider: "stripe",
        status: "pending",
        paymentIntentClientSecret: "pi_123_secret",
      });

      const result = await service.createPayment("user-1", createDto);

      expect(mockProvider.createPaymentIntent).toHaveBeenCalled();
      expect(mockPrisma.payment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            provider: "stripe",
            idempotencyKey: expect.any(String),
            providerTransactionId: "pi_123",
            paymentIntentClientSecret: "pi_123_secret",
            currency: "USD",
          }),
        }),
      );
      expect(result.paymentId).toBe("PAY-123-abc");
      expect(result.clientSecret).toBe("pi_123_secret");
    });

    it("should default currency to USD", async () => {
      mockPrisma.payment.create.mockResolvedValue({
        id: "PAY-456",
        userId: "user-1",
        currency: "USD",
        status: "pending",
      });

      const dto = { ...createDto, currency: undefined };
      await service.createPayment("user-1", dto);

      expect(mockPrisma.payment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ currency: "USD" }),
        }),
      );
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
      });
      mockPrisma.payment.findFirst.mockResolvedValue({
        id: "PAY-EXISTING",
        userId: "user-1",
        status: "pending",
        amount: 150,
        currency: "USD",
        provider: "stripe",
        paymentIntentClientSecret: "secret",
      });

      const result = await service.createPayment("user-1", {
        ...createDto,
        currency: "USD",
      });

      expect(result.paymentId).toBe("PAY-EXISTING");
      expect(mockPrisma.payment.create).not.toHaveBeenCalled();
      expect(mockProvider.createPaymentIntent).not.toHaveBeenCalled();
    });
  });

  describe("createPayment - conversión de moneda BOB→USD (C.1)", () => {
    it("convierte el total BOB a USD con exchange_rate_usd_bob y persiste el snapshot", async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue({
        id: "res-1",
        userId: "user-1",
        status: "pending",
        totalAmount: 696, // BOB
      });
      mockPrisma.payment.findFirst.mockResolvedValue(null);
      mockPrisma.payment.create.mockResolvedValue({
        id: "PAY-CONV",
        userId: "user-1",
        amount: 100,
        currency: "USD",
        provider: "stripe",
        status: "pending",
        paymentIntentClientSecret: "secret",
      });

      await service.createPayment("user-1", {
        amount: 150.0,
        description: "Reserva",
        type: "reservation",
        referenceId: "res-1",
        currency: "USD",
      });

      // 696 BOB / 6.96 = 100 USD -> amountCents 10000
      expect(mockProvider.createPaymentIntent).toHaveBeenCalledWith(
        expect.objectContaining({ amountCents: 10000, currency: "USD" }),
      );
      expect(mockPrisma.payment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            amount: 100,
            currency: "USD",
            exchangeRateSnapshot: 6.96,
          }),
        }),
      );
    });

    it("no convierte cuando la moneda del proveedor es BOB", async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue({
        id: "res-1",
        userId: "user-1",
        status: "pending",
        totalAmount: 150,
      });
      mockPrisma.payment.findFirst.mockResolvedValue(null);
      mockProvider.createPaymentIntent.mockResolvedValue({
        providerTransactionId: "qr_1",
        currency: "BOB",
      });
      mockPrisma.payment.create.mockResolvedValue({
        id: "PAY-BOB",
        userId: "user-1",
        amount: 150,
        currency: "BOB",
        provider: "qr_banco_local",
        status: "pending",
      });

      const result = await service.createPayment("user-1", {
        amount: 150.0,
        description: "Reserva",
        type: "reservation",
        referenceId: "res-1",
        currency: "BOB",
      });

      expect(mockProvider.createPaymentIntent).toHaveBeenCalledWith(
        expect.objectContaining({ amountCents: 15000, currency: "BOB" }),
      );
      expect(mockPrisma.payment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            amount: 150,
            currency: "BOB",
            exchangeRateSnapshot: 1,
          }),
        }),
      );
      expect(result.qrData).toBeUndefined();
    });

    it("lanza BadRequest si la tasa de cambio es inválida", async () => {
      exchangeRate = 0;
      mockPrisma.reservation.findUnique.mockResolvedValue({
        id: "res-1",
        userId: "user-1",
        status: "pending",
        totalAmount: 150,
      });
      mockPrisma.payment.findFirst.mockResolvedValue(null);

      await expect(
        service.createPayment("user-1", {
          amount: 150,
          description: "Reserva",
          type: "reservation",
          referenceId: "res-1",
          currency: "USD",
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("createPayment - idempotencia por proveedor (C.4)", () => {
    it("reutiliza el registro existente (sin duplicar por reservationId) si cambia de proveedor", async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue({
        id: "res-1",
        userId: "user-1",
        status: "pending",
        totalAmount: 150,
      });
      mockPrisma.payment.findFirst.mockResolvedValue({
        id: "PAY-STRIPE",
        userId: "user-1",
        status: "pending",
        provider: "stripe",
      });
      mockPrisma.payment.update.mockResolvedValue({
        id: "PAY-STRIPE",
        userId: "user-1",
        amount: 21.55,
        currency: "USD",
        provider: "paypal",
        status: "pending",
      });

      const result = await service.createPayment("user-1", {
        amount: 150.0,
        description: "Reserva",
        type: "reservation",
        referenceId: "res-1",
        currency: "USD",
        provider: "paypal",
      });

      expect(mockPrisma.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "PAY-STRIPE" },
          data: expect.objectContaining({ provider: "paypal" }),
        }),
      );
      expect(mockPrisma.payment.create).not.toHaveBeenCalled();
      expect(result.paymentId).toBe("PAY-STRIPE");
    });

    it("devuelve el pago existente sin duplicar si es del mismo proveedor", async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue({
        id: "res-1",
        userId: "user-1",
        status: "pending",
      });
      mockPrisma.payment.findFirst.mockResolvedValue({
        id: "PAY-EXISTING",
        userId: "user-1",
        status: "pending",
        provider: "paypal",
        amount: 21.55,
        currency: "USD",
      });

      const result = await service.createPayment("user-1", {
        amount: 150.0,
        description: "Reserva",
        type: "reservation",
        referenceId: "res-1",
        provider: "paypal",
      });

      expect(result.paymentId).toBe("PAY-EXISTING");
      expect(mockPrisma.payment.create).not.toHaveBeenCalled();
      expect(mockPrisma.payment.update).not.toHaveBeenCalled();
    });
  });

  describe("confirmPayment (hybrid: server validates against provider)", () => {
    it("should hold the payment only when provider reports succeeded", async () => {
      mockPrisma.payment.findUnique
        .mockResolvedValueOnce({
          id: "PAY-123",
          userId: "user-1",
          status: "pending",
          provider: "stripe",
          providerTransactionId: "pi_123",
        })
        .mockResolvedValue({
          id: "PAY-123",
          userId: "user-1",
          status: "pending",
          provider: "stripe",
        });
      mockPrisma.payment.update.mockResolvedValue({
        id: "PAY-123",
        status: "held",
        heldAt: new Date(),
        paidAt: new Date(),
      });

      const result = await service.confirmPayment("PAY-123", "user-1");

      expect(mockProvider.retrievePaymentIntent).toHaveBeenCalledWith("pi_123");
      expect(mockPrisma.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: "held" }),
        }),
      );
      expect(result.status).toBe("held");
    });

    it("should NOT hold if provider still requires action", async () => {
      mockPrisma.payment.findUnique.mockResolvedValue({
        id: "PAY-123",
        userId: "user-1",
        status: "pending",
        provider: "stripe",
        providerTransactionId: "pi_123",
      });
      mockProvider.retrievePaymentIntent.mockResolvedValue({
        status: "requires_action",
      });

      const result = await service.confirmPayment("PAY-123", "user-1");

      expect(mockPrisma.payment.update).not.toHaveBeenCalled();
      expect(result.requiresAction).toBe(true);
    });

    it("should confirm the linked reservation when type is reservation", async () => {
      mockPrisma.payment.findUnique
        .mockResolvedValueOnce({
          id: "PAY-123",
          userId: "user-1",
          status: "pending",
          provider: "stripe",
          providerTransactionId: "pi_123",
          type: "reservation",
          referenceId: "res-1",
        })
        .mockResolvedValue({
          id: "PAY-123",
          userId: "user-1",
          status: "pending",
          type: "reservation",
          referenceId: "res-1",
        });
      mockPrisma.payment.update.mockResolvedValue({
        id: "PAY-123",
        status: "held",
      });
      mockPrisma.reservation.findUnique.mockResolvedValue({
        id: "res-1",
        status: "pending",
      });
      mockPrisma.reservation.update.mockResolvedValue({
        id: "res-1",
        status: "confirmed",
      });

      await service.confirmPayment("PAY-123", "user-1");

      expect(mockPrisma.reservation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "res-1" },
          data: expect.objectContaining({ status: "confirmed" }),
        }),
      );
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
        provider: "stripe",
      });

      await expect(service.confirmPayment("PAY-123", "user-1")).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("should be idempotent if already held", async () => {
      mockPrisma.payment.findUnique.mockResolvedValue({
        id: "PAY-123",
        userId: "user-1",
        status: "held",
        provider: "stripe",
      });

      const result = await service.confirmPayment("PAY-123", "user-1");

      expect(mockProvider.retrievePaymentIntent).not.toHaveBeenCalled();
      expect(result.status).toBe("held");
    });
  });

  describe("markHeldByProviderTransactionId (webhook path)", () => {
    it("should hold the payment matching the provider transaction id", async () => {
      mockPrisma.payment
        .findFirst
        .mockResolvedValueOnce({
          id: "PAY-WB",
          status: "pending",
          type: "reservation",
          referenceId: "res-1",
        })
        .mockResolvedValue({
          id: "PAY-WB",
          status: "pending",
          type: "reservation",
          referenceId: "res-1",
        });
      mockPrisma.payment.findUnique.mockResolvedValue({
        id: "PAY-WB",
        status: "pending",
        type: "reservation",
        referenceId: "res-1",
      });
      mockPrisma.payment.update.mockResolvedValue({
        id: "PAY-WB",
        status: "held",
      });

      const result = await service.markHeldByProviderTransactionId("pi_123");

      expect(mockPrisma.payment.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { providerTransactionId: "pi_123" } }),
      );
      expect(result.status).toBe("held");
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
        currency: "USD",
        provider: "stripe",
        paidAt: new Date(),
        settlement: null,
      });

      const result = await service.getPaymentStatus("PAY-123", "user-1");

      expect(result.id).toBe("PAY-123");
      expect(result.status).toBe("held");
      expect(result.commissionAmount).toBe(10);
      expect(result.provider).toBe("stripe");
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
