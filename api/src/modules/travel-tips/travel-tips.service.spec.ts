import { Test, TestingModule } from "@nestjs/testing";
import { TravelTipsService } from "./travel-tips.service";
import { PrismaService } from "../../prisma/prisma.service";

describe("TravelTipsService", () => {
  let service: TravelTipsService;
  let prisma: PrismaService;

  const mockPrisma = {
    travelTip: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TravelTipsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TravelTipsService>(TravelTipsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return active travel tips ordered by createdAt asc", async () => {
      const tips = [
        { id: "tip-1", text: "Usa taxis con app (InDrive/Uber) para tarifas fijas.", category: "transporte" },
        { id: "tip-2", text: "El micro urbano cuesta Bs 2,50; lleva cambio exacto.", category: "transporte" },
      ];
      mockPrisma.travelTip.findMany.mockResolvedValue(tips);

      const result = await service.findAll();

      expect(result).toEqual(tips);
      expect(mockPrisma.travelTip.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
      });
    });

    it("should filter by category when provided", async () => {
      mockPrisma.travelTip.findMany.mockResolvedValue([]);

      await service.findAll("seguridad");

      expect(mockPrisma.travelTip.findMany).toHaveBeenCalledWith({
        where: { isActive: true, category: "seguridad" },
        orderBy: { createdAt: "asc" },
      });
    });

    it("should filter by category and city", async () => {
      mockPrisma.travelTip.findMany.mockResolvedValue([]);

      await service.findAll("gastronomia", "santa-cruz");

      expect(mockPrisma.travelTip.findMany).toHaveBeenCalledWith({
        where: { isActive: true, category: "gastronomia", city: "santa-cruz" },
        orderBy: { createdAt: "asc" },
      });
    });
  });
});
