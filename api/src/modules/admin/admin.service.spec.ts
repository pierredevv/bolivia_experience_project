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
});
