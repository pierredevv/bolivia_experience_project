import { Test, TestingModule } from "@nestjs/testing";
import { PlacesService } from "./places.service";
import { PrismaService } from "../../prisma/prisma.service";
import { PlacesScoringService } from "./places-scoring.service";
import { NotFoundException } from "@nestjs/common";

describe("PlacesService", () => {
  let service: PlacesService;
  let prisma: PrismaService;

  const mockPrisma = {
    place: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    placePhoto: {
      aggregate: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockScoringService = {
    scoreAndSort: jest.fn((places: any[], _prefs?: any) => places),
    enrichWithPriceVerified: jest.fn((place: any) => place),
    verifyAndEnrichPrice: jest.fn((place: any) => place),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlacesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: PlacesScoringService, useValue: mockScoringService },
      ],
    }).compile();

    service = module.get<PlacesService>(PlacesService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return paginated active places by default with canReserve", async () => {
      const mockPlaces = [
        {
          id: "place-1",
          name: "Test Place",
          isActive: true,
          category: { id: "cat-1", name: "Restaurant", icon: "🍽️" },
          photos: [],
          _count: { products: 0 },
        },
      ];

      mockPrisma.place.findMany.mockResolvedValue(mockPlaces);
      mockPrisma.place.count.mockResolvedValue(1);

      const result = await service.findAll({ skip: 0, limit: 20 });

      expect(result.data).toEqual([
        {
          id: "place-1",
          name: "Test Place",
          isActive: true,
          category: { id: "cat-1", name: "Restaurant", icon: "🍽️" },
          photos: [],
          canReserve: false,
        },
      ]);
      expect(result.meta.total).toBe(1);
      expect(mockPrisma.place.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isActive: true }),
        }),
      );
    });

    it("should filter by categoryId", async () => {
      mockPrisma.place.findMany.mockResolvedValue([]);
      mockPrisma.place.count.mockResolvedValue(0);

      await service.findAll({ skip: 0, limit: 20, categoryId: "cat-1" });

      expect(mockPrisma.place.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ categoryId: "cat-1" }),
        }),
      );
    });

    it("should filter by isActive=false (hidden places)", async () => {
      const hiddenPlaces = [
        {
          id: "place-hidden",
          name: "Hidden Place",
          isActive: false,
          category: { id: "cat-1", name: "Restaurant", icon: "🍽️" },
          photos: [],
          _count: { products: 0 },
        },
      ];

      mockPrisma.place.findMany.mockResolvedValue(hiddenPlaces);
      mockPrisma.place.count.mockResolvedValue(1);

      const result = await service.findAll({
        skip: 0,
        limit: 20,
        isActive: false,
      });

      expect(result.data).toEqual([
        {
          id: "place-hidden",
          name: "Hidden Place",
          isActive: false,
          category: { id: "cat-1", name: "Restaurant", icon: "🍽️" },
          photos: [],
          canReserve: false,
        },
      ]);
      expect(mockPrisma.place.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isActive: false }),
        }),
      );
    });

    it("should show all statuses when allStatuses=true", async () => {
      mockPrisma.place.findMany.mockResolvedValue([]);
      mockPrisma.place.count.mockResolvedValue(0);

      await service.findAll({ skip: 0, limit: 20, allStatuses: true });

      expect(mockPrisma.place.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.not.objectContaining({ isActive: expect.anything() }),
        }),
      );
    });

    it("should search by name/description/address", async () => {
      mockPrisma.place.findMany.mockResolvedValue([]);
      mockPrisma.place.count.mockResolvedValue(0);

      await service.findAll({ skip: 0, limit: 20, search: "restaurant" });

      expect(mockPrisma.place.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                name: expect.objectContaining({ contains: "restaurant" }),
              }),
            ]),
          }),
        }),
      );
    });
  });

  describe("findById", () => {
    it("should return place with category, photos, hours, reviews", async () => {
      const mockPlace = {
        id: "place-1",
        name: "Test Place",
        category: { id: "cat-1", name: "Restaurant" },
        photos: [],
        hours: [],
        reviews: [],
        _count: { reviews: 5, favorites: 10, products: 1 },
      };

      mockPrisma.place.findUnique.mockResolvedValue(mockPlace);

      const result = await service.findById("place-1");

      expect(result.id).toBe("place-1");
      expect(result.canReserve).toBe(true);
      expect(result._count).toBeUndefined();
    });

    it("should throw NotFoundException for invalid id", async () => {
      mockPrisma.place.findUnique.mockResolvedValue(null);

      await expect(service.findById("invalid-id")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("create", () => {
    it("should create and return place with category", async () => {
      const createDto = {
        name: "New Place",
        description: "A new place",
        address: "123 Main St",
        latitude: -17.78,
        longitude: -63.18,
        categoryId: "cat-1",
        ownerId: "owner-1",
      };

      const mockCreatedPlace = {
        id: "place-new",
        ...createDto,
        category: { id: "cat-1", name: "Restaurant" },
      };

      mockPrisma.place.create.mockResolvedValue(mockCreatedPlace);

      const result = await service.create(createDto);

      expect(result).toEqual(mockCreatedPlace);
      expect(mockPrisma.place.create).toHaveBeenCalled();
    });
  });

  describe("toggleStatus", () => {
    it("should toggle isActive from true to false", async () => {
      const mockPlace = {
        id: "place-1",
        isActive: true,
      };

      mockPrisma.place.findUnique.mockResolvedValue(mockPlace);
      mockPrisma.place.update.mockResolvedValue({
        ...mockPlace,
        isActive: false,
      });

      const result = await service.toggleStatus("place-1");

      expect(result.isActive).toBe(false);
      expect(mockPrisma.place.update).toHaveBeenCalledWith({
        where: { id: "place-1" },
        data: { isActive: false },
      });
    });

    it("should throw NotFoundException for invalid id", async () => {
      mockPrisma.place.findUnique.mockResolvedValue(null);

      await expect(service.toggleStatus("invalid-id")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("remove", () => {
    it("should delete place", async () => {
      const mockPlace = { id: "place-1", name: "Test Place" };

      mockPrisma.place.findUnique.mockResolvedValue(mockPlace);
      mockPrisma.place.delete.mockResolvedValue(mockPlace);

      const result = await service.remove("place-1");

      expect(result).toEqual(mockPlace);
      expect(mockPrisma.place.delete).toHaveBeenCalledWith({
        where: { id: "place-1" },
      });
    });

    it("should throw NotFoundException for invalid id", async () => {
      mockPrisma.place.findUnique.mockResolvedValue(null);

      await expect(service.remove("invalid-id")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("addPhoto", () => {
    it("should add photo with correct displayOrder", async () => {
      mockPrisma.placePhoto.aggregate.mockResolvedValue({
        _max: { displayOrder: 3 },
      });
      mockPrisma.placePhoto.create.mockResolvedValue({
        id: "photo-1",
        placeId: "place-1",
        url: "https://example.com/photo.jpg",
        displayOrder: 4,
      });

      const result = await service.addPhoto(
        "place-1",
        "https://example.com/photo.jpg",
      );

      expect(result.displayOrder).toBe(4);
      expect(mockPrisma.placePhoto.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          placeId: "place-1",
          url: "https://example.com/photo.jpg",
          displayOrder: 4,
        }),
      });
    });
  });

  describe("getPhotos", () => {
    it("should return photos ordered by displayOrder", async () => {
      const mockPhotos = [
        { id: "photo-1", displayOrder: 1 },
        { id: "photo-2", displayOrder: 2 },
      ];

      mockPrisma.placePhoto.findMany.mockResolvedValue(mockPhotos);

      const result = await service.getPhotos("place-1");

      expect(result).toEqual(mockPhotos);
      expect(mockPrisma.placePhoto.findMany).toHaveBeenCalledWith({
        where: { placeId: "place-1" },
        orderBy: { displayOrder: "asc" },
      });
    });
  });
});
