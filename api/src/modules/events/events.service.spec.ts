import { Test, TestingModule } from "@nestjs/testing";
import { EventsService } from "./events.service";
import { PrismaService } from "../../prisma/prisma.service";
import { NotFoundException } from "@nestjs/common";

describe("EventsService", () => {
  let service: EventsService;
  let prisma: PrismaService;

  const mockPrisma = {
    event: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return paginated events", async () => {
      const mockEvents = [
        {
          id: "event-1",
          name: "Festival de la Vera Cruz",
          dateStart: new Date("2026-09-14"),
          isActive: true,
        },
      ];

      mockPrisma.event.findMany.mockResolvedValue(mockEvents);
      mockPrisma.event.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toEqual(mockEvents);
      expect(result.meta.total).toBe(1);
      expect(mockPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
            status: "approved",
          }),
        }),
      );
    });

    it("should filter upcoming events by default", async () => {
      mockPrisma.event.findMany.mockResolvedValue([]);
      mockPrisma.event.count.mockResolvedValue(0);

      await service.findAll({ page: 1, limit: 20 });

      expect(mockPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ dateEnd: null }),
            ]),
          }),
        }),
      );
    });

    it("should return all events when upcoming=false", async () => {
      mockPrisma.event.findMany.mockResolvedValue([]);
      mockPrisma.event.count.mockResolvedValue(0);

      await service.findAll({ page: 1, limit: 20, upcoming: false });

      expect(mockPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.not.objectContaining({
            OR: expect.anything(),
          }),
        }),
      );
    });
  });

  describe("findById", () => {
    it("should return approved event by id", async () => {
      const mockEvent = {
        id: "event-1",
        name: "Festival de la Vera Cruz",
        dateStart: new Date("2026-09-14"),
        status: "approved",
      };

      mockPrisma.event.findFirst.mockResolvedValue(mockEvent);

      const result = await service.findById("event-1");

      expect(result).toEqual(mockEvent);
      expect(mockPrisma.event.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: "event-1",
            isActive: true,
            status: "approved",
          }),
        }),
      );
    });

    it("should throw NotFoundException for pending event", async () => {
      mockPrisma.event.findFirst.mockResolvedValue(null);

      await expect(service.findById("pending-id")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw NotFoundException for invalid id", async () => {
      mockPrisma.event.findFirst.mockResolvedValue(null);

      await expect(service.findById("invalid-id")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("create", () => {
    it("should create event as pending and inactive", async () => {
      const createData = {
        name: "New Event",
        description: "A new event",
        dateStart: new Date("2026-10-01"),
        location: "Santa Cruz",
      };

      const mockCreatedEvent = {
        id: "event-new",
        ...createData,
        status: "pending",
        isActive: false,
      };

      mockPrisma.event.create.mockResolvedValue(mockCreatedEvent);

      const result = await service.create(createData);

      expect(result).toEqual(mockCreatedEvent);
      expect(mockPrisma.event.create).toHaveBeenCalledWith({
        data: {
          ...createData,
          status: "pending",
          isActive: false,
        },
      });
    });
  });

  describe("findAllAdmin", () => {
    it("should list all events with status filter", async () => {
      mockPrisma.event.findMany.mockResolvedValue([]);
      mockPrisma.event.count.mockResolvedValue(0);

      await service.findAllAdmin({ status: "pending" });

      expect(mockPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: "pending" },
        }),
      );
    });
  });

  describe("updateStatus", () => {
    it("should approve an event and activate it", async () => {
      const mockEvent = { id: "event-1", name: "Test" };
      mockPrisma.event.findUnique.mockResolvedValue(mockEvent);
      mockPrisma.event.update.mockResolvedValue({
        ...mockEvent,
        status: "approved",
        isActive: true,
      });

      const result = await service.updateStatus("event-1", "approved");

      expect(result.status).toBe("approved");
      expect(result.isActive).toBe(true);
      expect(mockPrisma.event.update).toHaveBeenCalledWith({
        where: { id: "event-1" },
        data: { status: "approved", isActive: true },
      });
    });

    it("should reject an event and deactivate it", async () => {
      mockPrisma.event.findUnique.mockResolvedValue({ id: "event-1" });
      mockPrisma.event.update.mockResolvedValue({
        id: "event-1",
        status: "rejected",
        isActive: false,
      });

      const result = await service.updateStatus("event-1", "rejected");

      expect(result.status).toBe("rejected");
      expect(result.isActive).toBe(false);
    });
  });

  describe("update", () => {
    it("should update event", async () => {
      const updateData = { name: "Updated Event" };

      mockPrisma.event.findUnique.mockResolvedValue({
        id: "event-1",
        name: "Old Event",
      });
      mockPrisma.event.update.mockResolvedValue({
        id: "event-1",
        ...updateData,
      });

      const result = await service.update("event-1", updateData);

      expect(result.name).toBe("Updated Event");
    });

    it("should throw NotFoundException when updating nonexistent event", async () => {
      mockPrisma.event.findUnique.mockResolvedValue(null);

      await expect(
        service.update("invalid-id", { name: "Test" }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    it("should delete event", async () => {
      const mockEvent = { id: "event-1", name: "Event to Delete" };

      mockPrisma.event.findUnique.mockResolvedValue(mockEvent);
      mockPrisma.event.delete.mockResolvedValue(mockEvent);

      const result = await service.remove("event-1");

      expect(result).toEqual(mockEvent);
      expect(mockPrisma.event.delete).toHaveBeenCalledWith({
        where: { id: "event-1" },
      });
    });

    it("should throw NotFoundException when deleting nonexistent event", async () => {
      mockPrisma.event.findUnique.mockResolvedValue(null);

      await expect(service.remove("invalid-id")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
