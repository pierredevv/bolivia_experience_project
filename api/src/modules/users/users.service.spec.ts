import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { PrismaService } from "../../prisma/prisma.service";
import { NotFoundException } from "@nestjs/common";

describe("UsersService", () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockUser = {
    id: "user-1",
    email: "user@example.com",
    name: "Test User",
    photoUrl: null,
    country: "Bolivia",
    language: "es",
    role: "usuario",
    isPremium: true,
    points: 120,
    budgetType: "medio",
    tourismType: "aventura",
    interests: '["cerveza"]',
    createdAt: new Date(),
    _count: {
      reviews: 3,
      favorites: 5,
      userBadges: 2,
      reservations: 4,
      payments: 6,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getProfile", () => {
    it("should return profile with isPremium, points and activity counts", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getProfile("user-1");

      expect(result.isPremium).toBe(true);
      expect(result.points).toBe(120);
      expect(result._count).toEqual({
        reviews: 3,
        favorites: 5,
        userBadges: 2,
        reservations: 4,
        payments: 6,
      });
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.objectContaining({
            isPremium: true,
            _count: expect.objectContaining({
              select: expect.objectContaining({
                reservations: true,
                payments: true,
              }),
            }),
          }),
        }),
      );
    });

    it("should parse interests JSON to array", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getProfile("user-1");

      expect(result.interests).toEqual(["cerveza"]);
    });

    it("should throw NotFoundException when user does not exist", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile("missing")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("updateProfile", () => {
    it("should update and return the user", async () => {
      mockPrisma.user.update.mockResolvedValue({
        id: "user-1",
        email: "user@example.com",
        name: "Nuevo Nombre",
        photoUrl: null,
        country: "Bolivia",
        language: "es",
        budgetType: "premium",
        tourismType: "cultura",
        interests: '["museos"]',
      });

      const result = await service.updateProfile("user-1", {
        name: "Nuevo Nombre",
        budgetType: "premium",
        tourismType: "cultura",
      } as any);

      expect(result.name).toBe("Nuevo Nombre");
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: "Nuevo Nombre",
            budgetType: "premium",
            tourismType: "cultura",
          }),
        }),
      );
    });
  });
});