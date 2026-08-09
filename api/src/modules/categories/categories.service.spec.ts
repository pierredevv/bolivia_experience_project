import { Test, TestingModule } from "@nestjs/testing";
import { CategoriesService } from "./categories.service";
import { PrismaService } from "../../prisma/prisma.service";
import { NotFoundException } from "@nestjs/common";

describe("CategoriesService", () => {
  let service: CategoriesService;
  let prisma: PrismaService;

  const mockPrisma = {
    category: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return active categories ordered by displayOrder", async () => {
      const mockCategories = [
        {
          id: "cat-1",
          name: "Restaurantes",
          icon: "🍽️",
          slug: "restaurantes",
          displayOrder: 1,
          isActive: true,
          _count: { places: 5 },
        },
        {
          id: "cat-2",
          name: "Hoteles",
          icon: "🏨",
          slug: "hoteles",
          displayOrder: 2,
          isActive: true,
          _count: { places: 3 },
        },
      ];

      mockPrisma.category.findMany.mockResolvedValue(mockCategories);

      const result = await service.findAll();

      expect(result).toEqual(mockCategories);
      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
        include: {
          _count: {
            select: { places: { where: { isActive: true } } },
          },
        },
      });
    });

    it("should include place count", async () => {
      const mockCategories = [
        {
          id: "cat-1",
          name: "Restaurantes",
          _count: { places: 5 },
        },
      ];

      mockPrisma.category.findMany.mockResolvedValue(mockCategories);

      const result = await service.findAll();

      expect(result[0]._count.places).toBe(5);
    });
  });

  describe("findBySlug", () => {
    it("should return category with places by slug", async () => {
      const mockCategory = {
        id: "cat-1",
        name: "Restaurantes",
        slug: "restaurantes",
        places: [
          {
            id: "place-1",
            name: "El Palmar",
            photos: [],
          },
        ],
      };

      mockPrisma.category.findUnique.mockResolvedValue(mockCategory);

      const result = await service.findBySlug("restaurantes");

      expect(result).toEqual(mockCategory);
      expect(result.places).toBeDefined();
    });

    it("should throw NotFoundException for invalid slug", async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null);

      await expect(service.findBySlug("invalid-slug")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("create", () => {
    it("should create and return category", async () => {
      const createData = {
        name: "Nueva Categoria",
        nameEn: "New Category",
        icon: "🆕",
        slug: "nueva-categoria",
      };

      const mockCreatedCategory = {
        id: "cat-new",
        ...createData,
        displayOrder: 10,
        isActive: true,
      };

      mockPrisma.category.create.mockResolvedValue(mockCreatedCategory);

      const result = await service.create(createData);

      expect(result).toEqual(mockCreatedCategory);
      expect(mockPrisma.category.create).toHaveBeenCalledWith({
        data: createData,
      });
    });
  });

  describe("update", () => {
    it("should update category", async () => {
      const updateData = { name: "Updated Category" };

      mockPrisma.category.update.mockResolvedValue({
        id: "cat-1",
        ...updateData,
      });

      const result = await service.update("cat-1", updateData);

      expect(result.name).toBe("Updated Category");
    });
  });

  describe("remove", () => {
    it("should delete category", async () => {
      const mockCategory = { id: "cat-1", name: "Category to Delete" };

      mockPrisma.category.delete.mockResolvedValue(mockCategory);

      const result = await service.remove("cat-1");

      expect(result).toEqual(mockCategory);
      expect(mockPrisma.category.delete).toHaveBeenCalledWith({
        where: { id: "cat-1" },
      });
    });
  });
});
