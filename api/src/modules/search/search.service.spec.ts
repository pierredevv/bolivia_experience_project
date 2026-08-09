import { Test, TestingModule } from "@nestjs/testing";
import { SearchService } from "./search.service";
import { PrismaService } from "../../prisma/prisma.service";

describe("SearchService", () => {
  let service: SearchService;
  let prisma: PrismaService;

  const mockPrisma = {
    place: {
      findMany: jest.fn(),
    },
    searchHistory: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("search", () => {
    it("should return places matching query with canReserve", async () => {
      const mockPlaces = [
        { id: "1", name: "Restaurante Test", _count: { products: 1 } },
        { id: "2", name: "Museo", _count: { products: 0 } },
      ];
      mockPrisma.place.findMany.mockResolvedValue(mockPlaces);

      const result = await service.search("restaurante");
      expect(result).toEqual([
        { id: "1", name: "Restaurante Test", canReserve: true },
        { id: "2", name: "Museo", canReserve: false },
      ]);
      expect(mockPrisma.place.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
            OR: expect.arrayContaining([{ name: { contains: "restaurante" } }]),
          }),
          take: 20,
        }),
      );
    });

    it("should filter by categoryId when provided", async () => {
      mockPrisma.place.findMany.mockResolvedValue([]);

      await service.search("test", "cat1");
      expect(mockPrisma.place.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categoryId: "cat1",
          }),
        }),
      );
    });
  });

  describe("suggestions", () => {
    it("should return up to 5 suggestions", async () => {
      const mockSuggestions = [{ id: "1", name: "Test", address: "Address" }];
      mockPrisma.place.findMany.mockResolvedValue(mockSuggestions);

      const result = await service.suggestions("test");
      expect(result).toEqual(mockSuggestions);
      expect(mockPrisma.place.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 5 }),
      );
    });
  });

  describe("getHistory", () => {
    it("should return user search history", async () => {
      const mockHistory = [{ id: "1", query: "restaurante" }];
      mockPrisma.searchHistory.findMany.mockResolvedValue(mockHistory);

      const result = await service.getHistory("user1");
      expect(result).toEqual(mockHistory);
    });
  });

  describe("saveSearch", () => {
    it("should save search to history", async () => {
      mockPrisma.searchHistory.create.mockResolvedValue({ id: "1" });

      const result = await service.saveSearch("user1", "test query", 5);
      expect(result).toBeDefined();
      expect(mockPrisma.searchHistory.create).toHaveBeenCalledWith({
        data: { userId: "user1", query: "test query", resultsCount: 5 },
      });
    });
  });
});
