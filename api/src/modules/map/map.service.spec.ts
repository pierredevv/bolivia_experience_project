import { Test, TestingModule } from "@nestjs/testing";
import { MapService } from "./map.service";
import { GeoRepository } from "../places/repositories/geo.repository";
import { PrismaService } from "../../prisma/prisma.service";

describe("MapService", () => {
  let service: MapService;

  const mockGeoRepository = {
    findNearby: jest.fn(),
    findClusters: jest.fn(),
    findByBounds: jest.fn(),
  };

  const mockPrisma = {
    safetyZone: {
      findMany: jest.fn(),
    },
    event: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MapService,
        { provide: GeoRepository, useValue: mockGeoRepository },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<MapService>(MapService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findSafetyZones", () => {
    it("should filter by bounds when provided", async () => {
      mockPrisma.safetyZone.findMany.mockResolvedValue([]);

      await service.findSafetyZones(-17.7, -63.1, -17.85, -63.25);

      expect(mockPrisma.safetyZone.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
            latitude: { gte: -17.85, lte: -17.7 },
            longitude: { gte: -63.25, lte: -63.1 },
          }),
        }),
      );
    });

    it("should return all active zones when no bounds provided", async () => {
      mockPrisma.safetyZone.findMany.mockResolvedValue([]);

      await service.findSafetyZones();

      expect(mockPrisma.safetyZone.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isActive: true }),
        }),
      );
    });
  });

  describe("checkSafetyZone", () => {
    const zone = {
      id: "zone-1",
      name: "Plan 3000",
      latitude: -17.84,
      longitude: -63.09,
      radioKm: 2.5,
      nivelRiesgo: "alto",
      description: null,
      city: "Santa Cruz de la Sierra",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should return inDangerZone=false when point is outside all zones", async () => {
      mockPrisma.safetyZone.findMany.mockResolvedValue([zone]);

      const result = await service.checkSafetyZone(-17.7833, -63.1821);

      expect(result.inDangerZone).toBe(false);
      expect(result.zones).toEqual([]);
    });

    it("should return inDangerZone=true when point is inside a zone (Haversine)", async () => {
      mockPrisma.safetyZone.findMany.mockResolvedValue([zone]);

      const result = await service.checkSafetyZone(-17.84, -63.09);

      expect(result.inDangerZone).toBe(true);
      expect(result.zones).toHaveLength(1);
      expect(result.zones[0].id).toBe("zone-1");
    });
  });

  describe("findMapEvents", () => {
    it("should return active events within bounds", async () => {
      const event = {
        id: "event-1",
        name: "Concierto",
        latitude: -17.783,
        longitude: -63.182,
        dateStart: new Date(),
        dateEnd: null,
        isActive: true,
      };
      mockPrisma.event.findMany.mockResolvedValue([event]);

      const result = await service.findMapEvents(-17.7, -63.1, -17.85, -63.25);

      expect(result).toEqual([event]);
      expect(mockPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
            latitude: { gte: -17.85, lte: -17.7 },
            longitude: { gte: -63.25, lte: -63.1 },
          }),
        }),
      );
    });
  });
});
