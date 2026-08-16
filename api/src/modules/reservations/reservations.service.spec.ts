import { Test, TestingModule } from "@nestjs/testing";
import { ReservationsService } from "./reservations.service";
import { PrismaService } from "../../prisma/prisma.service";
import { PlatformConfigService } from "../platform-config/platform-config.service";
import { NotificationsService } from "../notifications/notifications.service";
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { GamificationService } from "../gamification/gamification.service";
import { PaymentProviderRegistry } from "../payments/providers/payment-provider-registry.service";

describe("ReservationsService", () => {
  let service: ReservationsService;
  let prisma: PrismaService;
  let config: PlatformConfigService;

  const mockConfig = {
    getFloat: jest.fn().mockResolvedValue(0.1),
    getInt: jest.fn().mockResolvedValue(24),
    get: jest.fn().mockResolvedValue("0.1"),
  };

  const mockNotifications = {
    notify: jest.fn().mockResolvedValue({}),
  };

  const mockGamification = {
    grantReservationPoints: jest.fn().mockResolvedValue(100),
    evaluateBadges: jest.fn().mockResolvedValue([]),
  };

  const mockPaymentRegistry = {
    getProviderIfAvailable: jest.fn().mockResolvedValue(null),
    getProvider: jest.fn(),
  };

  const mockTx = {
    reservation: {
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    payment: {
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      findFirst: jest.fn(),
    },
    settlement: {
      upsert: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
    },
  };

  const mockPrisma = {
    $transaction: jest.fn((cb: any) => cb(mockTx)),
    place: { findUnique: jest.fn() },
    product: { findUnique: jest.fn(), findFirst: jest.fn() },
    reservation: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    payment: {
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn().mockResolvedValue({ id: "PAY" }),
    },
    platformConfig: { findUnique: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: PlatformConfigService, useValue: mockConfig },
        { provide: NotificationsService, useValue: mockNotifications },
        { provide: GamificationService, useValue: mockGamification },
        { provide: PaymentProviderRegistry, useValue: mockPaymentRegistry },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    prisma = module.get<PrismaService>(PrismaService);
    config = module.get<PlatformConfigService>(PlatformConfigService);

    jest.clearAllMocks();
    mockPrisma.reservation.findMany.mockResolvedValue([]);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create (solicitud)", () => {
    const dto = {
      productId: "prod-1",
      date: "2026-08-15",
      time: "19:00",
      partySize: 2,
    };

    it("should create a solicitud reservation with a response deadline", async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        id: "prod-1",
        name: "Tour Salar",
        price: 100,
        currency: "BOB",
        placeId: "place-1",
        isActive: true,
        modalidadReserva: "solicitud",
      });
      mockPrisma.reservation.create.mockResolvedValue({
        id: "res-1",
        status: "pending",
        modalidad: "solicitud",
        responseDeadline: new Date(),
      });

      const result = await service.create("user-1", dto);

      expect(result.status).toBe("pending");
      expect(result.modalidad).toBe("solicitud");
      expect(mockConfig.getInt).toHaveBeenCalledWith(
        "solicitud_response_hours",
        24,
      );
      expect(mockPrisma.reservation.create).toHaveBeenCalled();
    });

    it("should throw BadRequestException for a place without reservable products", async () => {
      mockPrisma.product.findFirst.mockResolvedValue(null);

      await expect(
        service.create("user-1", {
          placeId: "place-mall",
          date: "2026-08-15",
          time: "19:00",
          partySize: 2,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("create (instantanea)", () => {
    const dto = {
      productId: "prod-1",
      date: "2026-08-15",
      time: "19:00",
      partySize: 2,
    };

    it("should create reservation + payment atomically with capacity check", async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        id: "prod-1",
        name: "Hotel Buganvilia",
        price: 150,
        currency: "BOB",
        placeId: "place-1",
        isActive: true,
        modalidadReserva: "instantanea",
        capacity: 5,
      });
      mockTx.reservation.count.mockResolvedValue(2);
      mockTx.reservation.create.mockResolvedValue({
        id: "res-1",
        status: "pending",
        modalidad: "instantanea",
        responseDeadline: new Date(),
      });
      mockTx.payment.create.mockResolvedValue({
        id: "PAY-1",
        status: "pending",
        amount: 300,
        currency: "BOB",
        qrData: "{}",
      });

      const result = await service.create("user-1", dto);

      expect(result.id).toBe("res-1");
      expect(mockTx.reservation.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            productId: "prod-1",
            status: { in: ["pending", "confirmed"] },
          }),
        }),
      );
      expect(mockTx.payment.create).toHaveBeenCalled();
    });

    it("should throw BadRequestException when no capacity available", async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        id: "prod-1",
        name: "Hotel",
        price: 150,
        currency: "BOB",
        placeId: "place-1",
        isActive: true,
        modalidadReserva: "instantanea",
        capacity: 2,
      });
      mockTx.reservation.count.mockResolvedValue(2);

      await expect(service.create("user-1", dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should NOT block bookings when capacity is 0 (treated as no limit)", async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        id: "prod-1",
        name: "Hotel",
        price: 150,
        currency: "BOB",
        placeId: "place-1",
        isActive: true,
        modalidadReserva: "instantanea",
        capacity: 0,
      });
      mockTx.reservation.count.mockResolvedValue(50);
      mockTx.reservation.create.mockResolvedValue({
        id: "res-1",
        status: "pending",
        modalidad: "instantanea",
        responseDeadline: new Date(),
      });
      mockTx.payment.create.mockResolvedValue({
        id: "PAY-1",
        status: "pending",
        amount: 300,
        currency: "BOB",
        qrData: "{}",
      });

      const result = await service.create("user-1", dto);
      expect(result.id).toBe("res-1");
      expect(mockTx.reservation.count).not.toHaveBeenCalled();
    });

    it("should NOT block bookings when capacity is null (no limit)", async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        id: "prod-1",
        name: "Hotel",
        price: 150,
        currency: "BOB",
        placeId: "place-1",
        isActive: true,
        modalidadReserva: "instantanea",
        capacity: null,
      });
      mockTx.reservation.create.mockResolvedValue({
        id: "res-1",
        status: "pending",
        modalidad: "instantanea",
        responseDeadline: new Date(),
      });
      mockTx.payment.create.mockResolvedValue({
        id: "PAY-1",
        status: "pending",
        amount: 300,
        currency: "BOB",
        qrData: "{}",
      });

      const result = await service.create("user-1", dto);
      expect(result.id).toBe("res-1");
    });

    it("should retry the atomic transaction on P2034 serialization conflict", async () => {
      const originalUrl = process.env.DATABASE_URL;
      process.env.DATABASE_URL = "postgresql://user:pass@localhost/db";

      mockPrisma.product.findUnique.mockResolvedValue({
        id: "prod-1",
        name: "Hotel",
        price: 150,
        currency: "BOB",
        placeId: "place-1",
        isActive: true,
        modalidadReserva: "instantanea",
        capacity: 5,
      });
      mockTx.reservation.count.mockResolvedValue(0);
      mockTx.reservation.create.mockResolvedValue({
        id: "res-1",
        status: "pending",
        modalidad: "instantanea",
        responseDeadline: new Date(),
      });
      mockTx.payment.create.mockResolvedValue({
        id: "PAY-1",
        status: "pending",
        amount: 300,
        currency: "BOB",
        qrData: "{}",
      });

      const conflict = new Error("serialization conflict");
      (conflict as any).code = "P2034";
      mockPrisma.$transaction
        .mockImplementationOnce(() => Promise.reject(conflict))
        .mockImplementationOnce((cb: any) => cb(mockTx));

      try {
        const result = await service.create("user-1", dto);
        expect(result.id).toBe("res-1");
        expect(mockPrisma.$transaction).toHaveBeenCalledTimes(2);
      } finally {
        process.env.DATABASE_URL = originalUrl;
      }
    });
  });

  describe("findByUser", () => {
    it("should expire overdue reservations then return user reservations", async () => {
      mockPrisma.reservation.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ id: "res-1", userId: "user-1" }]);

      const result = await service.findByUser("user-1");

      expect(result).toEqual([{ id: "res-1", userId: "user-1" }]);
      expect(mockPrisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: "user-1" } }),
      );
    });
  });

  describe("confirm (socio)", () => {
    it("should confirm a pending solicitud and create escrow payment", async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue({
        id: "res-1",
        productId: "prod-1",
        userId: "user-1",
        partySize: 2,
        status: "pending",
        modalidad: "solicitud",
        product: {
          id: "prod-1",
          socioId: "socio-1",
          name: "Tour",
          price: 100,
          currency: "BOB",
        },
      });
      mockTx.reservation.update.mockResolvedValue({
        id: "res-1",
        status: "confirmed",
        respondedAt: new Date(),
        confirmedAt: new Date(),
        totalAmount: 200,
      });
      mockTx.payment.create.mockResolvedValue({
        id: "PAY-1",
        status: "pending",
        subtotal: 200,
        commissionRate: 0.1,
        commissionAmount: 20,
      });

      const result = await service.confirm("socio-1", "res-1");

      expect(result.status).toBe("confirmed");
      expect(mockTx.payment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            subtotal: 200,
            commissionRate: 0.1,
            commissionAmount: 20,
          }),
        }),
      );
    });

    it("should throw ForbiddenException if not the product owner", async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue({
        id: "res-1",
        productId: "prod-1",
        product: { id: "prod-1", socioId: "other-socio" },
      });

      await expect(service.confirm("socio-1", "res-1")).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("should throw BadRequestException when confirming exceeds capacity", async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue({
        id: "res-1",
        productId: "prod-1",
        userId: "user-1",
        partySize: 2,
        status: "pending",
        modalidad: "solicitud",
        date: new Date("2026-08-15"),
        time: "19:00",
        product: {
          id: "prod-1",
          socioId: "socio-1",
          name: "Tour",
          price: 100,
          currency: "BOB",
          capacity: 1,
        },
      });
      mockTx.reservation.count.mockResolvedValue(2);

      await expect(service.confirm("socio-1", "res-1")).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("cancel (user)", () => {
    it("should cancel without refund if no policy and no held payment", async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue({
        id: "res-1",
        userId: "user-1",
        productId: "prod-1",
        status: "pending",
        modalidad: "solicitud",
        date: new Date("2026-08-15"),
        time: "19:00",
        product: { policy: null },
      });
      mockTx.payment.findFirst.mockResolvedValue(null);
      mockTx.reservation.update.mockResolvedValue({
        id: "res-1",
        status: "cancelled",
      });

      const result = await service.cancel("user-1", "res-1");

      expect(result.status).toBe("cancelled");
      expect(result.refundAmount).toBeNull();
    });

    it("should refund a held payment according to policy", async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue({
        id: "res-1",
        userId: "user-1",
        productId: "prod-1",
        status: "confirmed",
        modalidad: "instantanea",
        date: new Date("2026-08-15"),
        time: "19:00",
        product: {
          policy: {
            id: "pol-1",
            rulesJson: JSON.stringify([
              { hastaHoras: 72, reembolso: 100 },
              { hastaHoras: 24, reembolso: 50 },
              { reembolso: 0 },
            ]),
          },
        },
      });
      mockTx.payment.findFirst.mockResolvedValue({
        id: "PAY-1",
        status: "held",
        subtotal: 200,
      });
      mockTx.reservation.update.mockResolvedValue({
        id: "res-1",
        status: "cancelled",
      });

      // >72h antes del servicio -> 100%
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2026-08-01T10:00:00"));
      let result = await service.cancel("user-1", "res-1");
      expect(result.refundRate).toBe(1);
      expect(result.refundAmount).toBe(200);

      // entre 24h y 72h -> 50%
      jest.setSystemTime(new Date("2026-08-14T10:00:00"));
      result = await service.cancel("user-1", "res-1");
      expect(result.refundRate).toBe(0.5);
      expect(result.refundAmount).toBe(100);
      jest.useRealTimers();

      expect(mockTx.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: "refunded",
            refundAmount: 200,
          }),
        }),
      );
    });

    it("should throw ForbiddenException if not the owner", async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue({
        id: "res-1",
        userId: "other-user",
        product: { policy: null },
      });

      await expect(service.cancel("user-1", "res-1")).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe("complete (socio)", () => {
    it("should complete reservation and release the escrow to a settlement", async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue({
        id: "res-1",
        productId: "prod-1",
        product: { id: "prod-1", socioId: "socio-1" },
        status: "confirmed",
      });
      mockPrisma.payment.findFirst.mockResolvedValue({
        id: "PAY-1",
        status: "held",
        subtotal: 200,
        commissionAmount: 20,
      });
      mockTx.product.findUnique.mockResolvedValue({
        id: "prod-1",
        socioId: "socio-1",
      });
      mockTx.reservation.update.mockResolvedValue({
        id: "res-1",
        status: "completed",
        completedAt: new Date(),
      });
      mockTx.settlement.upsert.mockResolvedValue({
        id: "SET-1",
        status: "released",
      });

      const result = await service.complete("socio-1", "res-1");

      expect(result.status).toBe("completed");
      expect(mockTx.settlement.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            grossAmount: 200,
            commissionAmount: 20,
            netAmount: 180,
            status: "released",
          }),
        }),
      );
    });
  });
});
