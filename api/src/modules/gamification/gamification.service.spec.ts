import { Test, TestingModule } from "@nestjs/testing";
import { GamificationService } from "./gamification.service";
import { PrismaService } from "../../prisma/prisma.service";

describe("GamificationService", () => {
  let service: GamificationService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    reservation: { count: jest.fn() },
    review: { count: jest.fn() },
    favorite: { count: jest.fn() },
    badge: { findMany: jest.fn() },
    userBadge: {
      findMany: jest.fn(),
      createMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamificationService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<GamificationService>(GamificationService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should grant points based on totalAmount", async () => {
    mockPrisma.user.update.mockResolvedValue({ points: 250 });
    const points = await service.grantReservationPoints("u1", 250);
    expect(points).toBe(250);
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { points: { increment: 250 } },
    });
  });

  it("should grant minimum 1 point for zero amount", async () => {
    const points = await service.grantReservationPoints("u1", 0);
    expect(points).toBe(1);
  });

  it("should assign badges according to counters", async () => {
    mockPrisma.reservation.count.mockResolvedValue(5);
    mockPrisma.review.count.mockResolvedValue(1);
    mockPrisma.favorite.count.mockResolvedValue(1);
    mockPrisma.badge.findMany.mockResolvedValue([
      { id: "b-explorador", key: "explorador", name: "Explorador" },
      { id: "b-viajero", key: "viajero-frecuente", name: "Viajero Frecuente" },
    ]);
    mockPrisma.userBadge.findMany.mockResolvedValue([
      { badgeId: "b-explorador" },
    ]);
    mockPrisma.userBadge.createMany.mockResolvedValue({ count: 1 });

    const earned = await service.evaluateBadges("u1");

    expect(earned).toHaveLength(1);
    expect(earned[0].key).toBe("viajero-frecuente");
  });

  it("should return empty when no new badges earned", async () => {
    mockPrisma.reservation.count.mockResolvedValue(0);
    mockPrisma.review.count.mockResolvedValue(0);
    mockPrisma.favorite.count.mockResolvedValue(0);
    mockPrisma.badge.findMany.mockResolvedValue([]);

    const earned = await service.evaluateBadges("u1");
    expect(earned).toHaveLength(0);
    expect(mockPrisma.userBadge.createMany).not.toHaveBeenCalled();
  });

  it("should return user points and badges for getUserGamification", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: "u1", points: 450 });
    mockPrisma.userBadge.findMany.mockResolvedValue([
      {
        earnedAt: new Date("2024-01-01"),
        badge: {
          id: "b1",
          key: "explorador",
          name: "Explorador",
          nameEn: null,
          description: null,
          descriptionEn: null,
          icon: "explore",
          points: 100,
        },
      },
    ]);

    const result = await service.getUserGamification("u1");
    expect(result.points).toBe(450);
    expect(result.badges).toHaveLength(1);
    expect(result.badges[0].key).toBe("explorador");
  });
});
