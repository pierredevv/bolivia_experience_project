import { Test, TestingModule } from "@nestjs/testing";
import { RecommendationsService } from "./recommendations.service";
import { PrismaService } from "../../prisma/prisma.service";
import { PlacesScoringService } from "../places/places-scoring.service";

describe("RecommendationsService", () => {
  let service: RecommendationsService;
  let prisma: PrismaService;

  const mockPrisma = {
    favorite: {
      findMany: jest.fn(),
    },
    review: {
      findMany: jest.fn(),
    },
    searchHistory: {
      findMany: jest.fn(),
    },
    trip: {
      findFirst: jest.fn(),
    },
    place: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationsService,
        PlacesScoringService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<RecommendationsService>(RecommendationsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getPersonalized", () => {
    it("should return personalized recommendations based on favorites", async () => {
      mockPrisma.favorite.findMany.mockResolvedValue([
        { placeId: "p1", place: { categoryId: "cat-1" } },
        { placeId: "p2", place: { categoryId: "cat-1" } },
      ]);
      mockPrisma.review.findMany.mockResolvedValue([
        {
          placeId: "p3",
          rating: 5,
          place: { categoryId: "cat-2", ratingAvg: 4.5 },
        },
      ]);
      mockPrisma.searchHistory.findMany.mockResolvedValue([]);
      mockPrisma.place.findMany.mockResolvedValue([
        {
          id: "p4",
          category: { id: "cat-1", name: "Restaurantes", icon: "🍽️" },
          photos: [],
        },
      ]);

      const result = await service.getPersonalized("user-1");

      expect(result.recommendations).toBeDefined();
      expect(result.basedOn.totalFavorites).toBe(2);
      expect(result.basedOn.totalReviews).toBe(1);
    });

    it("should fill with popular places when not enough category matches", async () => {
      mockPrisma.favorite.findMany.mockResolvedValue([]);
      mockPrisma.review.findMany.mockResolvedValue([]);
      mockPrisma.searchHistory.findMany.mockResolvedValue([]);
      mockPrisma.place.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ id: "p-popular", photos: [] }]);

      const result = await service.getPersonalized("user-1", 5);

      expect(result.recommendations).toBeDefined();
    });

    it("should use the most recent trip preferences and score places", async () => {
      mockPrisma.favorite.findMany.mockResolvedValue([]);
      mockPrisma.review.findMany.mockResolvedValue([]);
      mockPrisma.searchHistory.findMany.mockResolvedValue([]);
      mockPrisma.trip.findFirst.mockResolvedValue({
        budgetType: "luxury",
        tourismType: "urbano",
      });
      mockPrisma.place.findMany.mockResolvedValue([
        {
          id: "p-urban-luxury",
          priceLevel: 4,
          isUrban: true,
          photos: [],
          category: { id: "cat-1", name: "Restaurantes", icon: "🍽️" },
        },
        {
          id: "p-rural-cheap",
          priceLevel: 1,
          isUrban: false,
          photos: [],
          category: { id: "cat-2", name: "Naturaleza", icon: "🌿" },
        },
      ]);

      const result = await service.getPersonalized("user-1");

      expect(result.basedOn.preferences.source).toBe("trip");
      expect(result.basedOn.preferences.budgetType).toBe("luxury");
      expect(result.recommendations[0].id).toBe("p-urban-luxury");
      expect(result.recommendations[0].matchScore).toBeGreaterThan(
        result.recommendations[1].matchScore,
      );
    });

    it("should prioritize explicit query preferences over the trip", async () => {
      mockPrisma.favorite.findMany.mockResolvedValue([]);
      mockPrisma.review.findMany.mockResolvedValue([]);
      mockPrisma.searchHistory.findMany.mockResolvedValue([]);
      mockPrisma.place.findMany.mockResolvedValue([]);

      const result = await service.getPersonalized("user-1", 5, {
        budgetType: "low_cost",
        tourismType: "rural",
      });

      expect(result.basedOn.preferences.source).toBe("query");
      expect(result.basedOn.preferences.budgetType).toBe("low_cost");
    });
  });

  describe("getTrending", () => {
    it("should return trending places", async () => {
      const mockPlaces = [
        {
          id: "p1",
          name: "Lugar Trending",
          category: { id: "cat-1", name: "Restaurantes" },
          photos: [],
          _count: { reviews: 10, favorites: 5 },
        },
      ];
      mockPrisma.place.findMany.mockResolvedValue(mockPlaces);

      const result = await service.getTrending(10);

      expect(result).toEqual(mockPlaces);
      expect(mockPrisma.place.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true },
          take: 10,
        }),
      );
    });
  });

  describe("getSimilar", () => {
    it("should return similar places by category", async () => {
      mockPrisma.place.findUnique.mockResolvedValue({
        id: "place-1",
        categoryId: "cat-1",
        latitude: -17.78,
        longitude: -63.18,
      });
      mockPrisma.place.findMany.mockResolvedValue([
        {
          id: "p-similar",
          category: { id: "cat-1", name: "Restaurantes" },
          photos: [],
        },
      ]);

      const result = await service.getSimilar("place-1");

      expect(result).toHaveLength(1);
      expect(mockPrisma.place.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: { not: "place-1" },
            categoryId: "cat-1",
          }),
        }),
      );
    });

    it("should return empty array if place not found", async () => {
      mockPrisma.place.findUnique.mockResolvedValue(null);

      const result = await service.getSimilar("non-existent");

      expect(result).toEqual([]);
    });
  });
});
