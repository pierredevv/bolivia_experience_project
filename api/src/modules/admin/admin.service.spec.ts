import { Test, TestingModule } from "@nestjs/testing";
import { AdminService } from "./admin.service";
import { PrismaService } from "../../prisma/prisma.service";

describe("AdminService", () => {
  let service: AdminService;
  let prisma: PrismaService;

  const mockPrisma = {
    user: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    review: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    place: {
      count: jest.fn(),
    },
    event: {
      count: jest.fn(),
    },
    safetyZone: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAllUsers", () => {
    it("should return paginated users", async () => {
      const mockUsers = [
        {
          id: "user-1",
          email: "test@example.com",
          name: "Test User",
          role: "usuario",
          isActive: true,
          createdAt: new Date(),
          _count: { reviews: 5 },
        },
      ];

      mockPrisma.user.findMany.mockResolvedValue(mockUsers);
      mockPrisma.user.count.mockResolvedValue(1);

      const result = await service.findAllUsers({ skip: 0, limit: 20 });

      expect(result.data).toEqual(mockUsers);
      expect(result.meta.total).toBe(1);
      expect(mockPrisma.user.findMany).toHaveBeenCalled();
    });

    it("should filter by role", async () => {
      mockPrisma.user.findMany.mockResolvedValue([]);
      mockPrisma.user.count.mockResolvedValue(0);

      await service.findAllUsers({ skip: 0, limit: 20, role: "admin" });

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ role: "admin" }),
        }),
      );
    });

    it("should search by name or email", async () => {
      mockPrisma.user.findMany.mockResolvedValue([]);
      mockPrisma.user.count.mockResolvedValue(0);

      await service.findAllUsers({ skip: 0, limit: 20, search: "test" });

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                name: expect.objectContaining({ contains: "test" }),
              }),
            ]),
          }),
        }),
      );
    });
  });

  describe("findAllReviews", () => {
    it("should return paginated reviews", async () => {
      const mockReviews = [
        {
          id: "review-1",
          rating: 5,
          comment: "Great place!",
          user: {
            id: "user-1",
            name: "Test User",
            email: "test@example.com",
            photoUrl: null,
          },
          place: { id: "place-1", name: "Test Place" },
        },
      ];

      mockPrisma.review.findMany.mockResolvedValue(mockReviews);
      mockPrisma.review.count.mockResolvedValue(1);

      const result = await service.findAllReviews({ skip: 0, limit: 20 });

      expect(result.data).toEqual(mockReviews);
      expect(result.meta.total).toBe(1);
      expect(mockPrisma.review.findMany).toHaveBeenCalled();
    });

    it("should filter by status (pending)", async () => {
      mockPrisma.review.findMany.mockResolvedValue([]);
      mockPrisma.review.count.mockResolvedValue(0);

      await service.findAllReviews({ skip: 0, limit: 20, status: "pending" });

      expect(mockPrisma.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: "UNDER_REVIEW" }),
        }),
      );
    });

    it("should filter by status (approved)", async () => {
      mockPrisma.review.findMany.mockResolvedValue([]);
      mockPrisma.review.count.mockResolvedValue(0);

      await service.findAllReviews({ skip: 0, limit: 20, status: "approved" });

      expect(mockPrisma.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: "PUBLISHED" }),
        }),
      );
    });
  });

  describe("getDashboardStats", () => {
    it("should return stats with counts and recent data", async () => {
      mockPrisma.user.count.mockResolvedValue(10);
      mockPrisma.place.count.mockResolvedValue(15);
      mockPrisma.review.count.mockResolvedValue(50);
      mockPrisma.event.count.mockResolvedValue(8);

      mockPrisma.review.findMany.mockResolvedValue([
        {
          id: "review-1",
          rating: 5,
          comment: "Great!",
          user: { id: "user-1", name: "Test User" },
          place: { id: "place-1", name: "Test Place" },
        },
      ]);

      mockPrisma.user.findMany.mockResolvedValue([
        {
          id: "user-1",
          name: "Test User",
          email: "test@example.com",
          role: "usuario",
          createdAt: new Date(),
        },
      ]);

      const result = await service.getDashboardStats();

      expect(result.stats).toBeDefined();
      expect(result.stats.totalUsers).toBe(10);
      expect(result.stats.totalPlaces).toBe(15);
      expect(result.stats.totalReviews).toBe(50);
      expect(result.stats.totalEvents).toBe(8);
      expect(result.recentReviews).toBeDefined();
      expect(result.recentUsers).toBeDefined();
    });
  });

  describe("Safety zones", () => {
    const zone = {
      id: "zone-1",
      name: "Plan 3000",
      latitude: -17.84,
      longitude: -63.09,
      radioKm: 2.5,
      nivelRiesgo: "alto",
      description: "Zona periférica",
      city: "Santa Cruz de la Sierra",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should list safety zones", async () => {
      mockPrisma.safetyZone.findMany.mockResolvedValue([zone]);

      const result = await service.listSafetyZones();

      expect(result).toEqual([zone]);
      expect(mockPrisma.safetyZone.findMany).toHaveBeenCalled();
    });

    it("should create a safety zone", async () => {
      mockPrisma.safetyZone.create.mockResolvedValue(zone);

      const result = await service.createSafetyZone({
        name: "Plan 3000",
        latitude: -17.84,
        longitude: -63.09,
        radioKm: 2.5,
        nivelRiesgo: "alto",
      });

      expect(result).toEqual(zone);
      expect(mockPrisma.safetyZone.create).toHaveBeenCalled();
    });

    it("should update a safety zone", async () => {
      mockPrisma.safetyZone.findUnique.mockResolvedValue(zone);
      mockPrisma.safetyZone.update.mockResolvedValue({ ...zone, name: "Plan 3000 Norte" });

      const result = await service.updateSafetyZone("zone-1", { name: "Plan 3000 Norte" });

      expect(result.name).toBe("Plan 3000 Norte");
      expect(mockPrisma.safetyZone.update).toHaveBeenCalled();
    });

    it("should throw NotFound when updating a missing zone", async () => {
      mockPrisma.safetyZone.findUnique.mockResolvedValue(null);

      await expect(
        service.updateSafetyZone("missing", { name: "X" }),
      ).rejects.toThrow("Safety zone not found");
    });

    it("should delete a safety zone", async () => {
      mockPrisma.safetyZone.findUnique.mockResolvedValue(zone);
      mockPrisma.safetyZone.delete.mockResolvedValue(zone);

      const result = await service.removeSafetyZone("zone-1");

      expect(result).toEqual(zone);
      expect(mockPrisma.safetyZone.delete).toHaveBeenCalledWith({ where: { id: "zone-1" } });
    });

    it("should throw NotFound when deleting a missing zone", async () => {
      mockPrisma.safetyZone.findUnique.mockResolvedValue(null);

      await expect(service.removeSafetyZone("missing")).rejects.toThrow(
        "Safety zone not found",
      );
    });
  });
});
