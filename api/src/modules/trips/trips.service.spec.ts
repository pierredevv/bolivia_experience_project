import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { TripsService } from "./trips.service";
import { PrismaService } from "../../prisma/prisma.service";
import { PlacesScoringService } from "../places/places-scoring.service";

describe("TripsService", () => {
  let service: TripsService;
  let prisma: PrismaService;

  const mockTx = {
    tripDay: {
      deleteMany: jest.fn(),
      create: jest.fn(),
    },
    tripItem: {
      create: jest.fn(),
    },
  };

  const mockPrisma = {
    trip: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
    },
    place: {
      findMany: jest.fn(),
    },
    tripDay: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    tripItem: {
      findFirst: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn((cb: any) => cb(mockTx)),
  };

  const baseTrip = {
    id: "trip-1",
    userId: "user-1",
    name: "Viaje a Santa Cruz",
    destination: "Santa Cruz",
    startDate: new Date("2026-08-10T00:00:00.000Z"),
    endDate: new Date("2026-08-12T00:00:00.000Z"),
    budgetType: "low_cost",
    tourismType: "urbano",
    days: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripsService,
        PlacesScoringService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TripsService>(TripsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("generateItinerary", () => {
    it("should throw NotFoundException when trip does not exist", async () => {
      mockPrisma.trip.findFirst.mockResolvedValue(null);

      await expect(
        service.generateItinerary("nope", "user-1"),
      ).rejects.toThrow(NotFoundException);
    });

    it("should generate days with items distributed and geosorted", async () => {
      mockPrisma.trip.findFirst.mockResolvedValue(baseTrip);
      mockPrisma.place.findMany.mockResolvedValue([
        {
          id: "p1",
          name: "Plaza 24 de Septiembre",
          latitude: -17.7836,
          longitude: -63.1821,
          priceLevel: 1,
          isUrban: true,
          category: { name: "Cultura" },
        },
        {
          id: "p2",
          name: "Museo de Arte",
          latitude: -17.7841,
          longitude: -63.1815,
          priceLevel: 1,
          isUrban: true,
          category: { name: "Museos" },
        },
        {
          id: "p3",
          name: "Parque Urbano",
          latitude: -17.7695,
          longitude: -63.189,
          priceLevel: 2,
          isUrban: true,
          category: { name: "Parques" },
        },
        {
          id: "p4",
          name: "Mercado Los Pozos",
          latitude: -17.7905,
          longitude: -63.176,
          priceLevel: 1,
          isUrban: true,
          category: { name: "Compras" },
        },
      ]);

      mockTx.tripDay.deleteMany.mockResolvedValue({ count: 0 });
      mockTx.tripDay.create
        .mockResolvedValueOnce({ id: "day-1", dayNumber: 1 })
        .mockResolvedValueOnce({ id: "day-2", dayNumber: 2 })
        .mockResolvedValueOnce({ id: "day-3", dayNumber: 3 });
      mockTx.tripItem.create.mockImplementation(async ({ data }) => ({
        id: `item-${data.orderIndex}`,
        ...data,
      }));

      mockPrisma.trip.findFirst
        .mockResolvedValueOnce(baseTrip)
        .mockResolvedValueOnce({ ...baseTrip, days: [] });

      const result = await service.generateItinerary("trip-1", "user-1");

      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
      expect(mockTx.tripDay.deleteMany).toHaveBeenCalledWith({
        where: { tripId: "trip-1" },
      });
      // 3 días (10-11-12 agosto)
      expect(mockTx.tripDay.create).toHaveBeenCalledTimes(3);
      // Todos los lugares distribuidos
      expect(mockTx.tripItem.create).toHaveBeenCalledTimes(4);
      expect(mockPrisma.trip.findFirst).toHaveBeenCalledTimes(2);
      expect(result).toBeDefined();
    });

    it("should throw BadRequestException when no active places", async () => {
      mockPrisma.trip.findFirst.mockResolvedValue(baseTrip);
      mockPrisma.place.findMany.mockResolvedValue([]);

      await expect(
        service.generateItinerary("trip-1", "user-1"),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
