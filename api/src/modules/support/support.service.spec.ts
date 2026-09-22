import { Test, TestingModule } from "@nestjs/testing";
import { SupportService } from "./support.service";
import { PrismaService } from "../../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { ForbiddenException, NotFoundException } from "@nestjs/common";

describe("SupportService", () => {
  let service: SupportService;

  const mockPrisma = {
    supportTicket: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    supportTicketMessage: {
      create: jest.fn(),
    },
    reservation: {
      findUnique: jest.fn(),
    },
  };

  const mockNotifications = {
    notify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupportService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsService, useValue: mockNotifications },
      ],
    }).compile();

    service = module.get<SupportService>(SupportService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    const dto = {
      type: "reservation",
      reservationId: "res-1",
      subject: "Problema con mi reserva",
      description: "No aparece confirmada",
    };

    it("creates a ticket with the initial message", async () => {
      mockPrisma.supportTicket.create.mockResolvedValue({
        id: "t-1",
        messages: ["m-1"],
      });
      mockPrisma.reservation.findUnique.mockResolvedValue({
        id: "res-1",
        product: { socio: { id: "host-1", name: "Socio" } },
      });

      const result = await service.create("user-1", dto);

      expect(mockPrisma.supportTicket.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: "user-1",
            subject: dto.subject,
            messages: {
              create: { authorId: "user-1", body: dto.description },
            },
          }),
        }),
      );
      expect(result.id).toBe("t-1");
    });

    it("notifies the host linked to the reservation", async () => {
      mockPrisma.supportTicket.create.mockResolvedValue({ id: "t-1" });
      mockPrisma.reservation.findUnique.mockResolvedValue({
        id: "res-1",
        product: { socio: { id: "host-1", name: "Socio" } },
      });

      await service.create("user-1", dto);

      expect(mockNotifications.notify).toHaveBeenCalledWith(
        "host-1",
        expect.objectContaining({
          type: "support",
          data: JSON.stringify({ ticketId: "t-1" }),
        }),
      );
    });

    it("skips notification when reservation has no host", async () => {
      mockPrisma.supportTicket.create.mockResolvedValue({ id: "t-1" });
      mockPrisma.reservation.findUnique.mockResolvedValue({
        id: "res-1",
        product: null,
      });

      await service.create("user-1", dto);

      expect(mockNotifications.notify).not.toHaveBeenCalled();
    });
  });

  describe("findMine", () => {
    it("returns paginated tickets for the user", async () => {
      mockPrisma.supportTicket.findMany.mockResolvedValue([{ id: "t-1" }]);
      mockPrisma.supportTicket.count.mockResolvedValue(1);

      const result = await service.findMine("user-1");

      expect(mockPrisma.supportTicket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: "user-1" } }),
      );
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });
  });

  describe("findOne", () => {
    it("throws NotFoundException when ticket does not exist", async () => {
      mockPrisma.supportTicket.findUnique.mockResolvedValue(null);

      await expect(service.findOne("user-1", "t-1")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("throws ForbiddenException when ticket belongs to another user", async () => {
      mockPrisma.supportTicket.findUnique.mockResolvedValue({
        id: "t-1",
        userId: "other",
      });

      await expect(service.findOne("user-1", "t-1")).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe("addMessage", () => {
    it("appends a message to the user ticket", async () => {
      mockPrisma.supportTicket.findUnique.mockResolvedValue({
        id: "t-1",
        userId: "user-1",
      });
      mockPrisma.supportTicketMessage.create.mockResolvedValue({
        id: "m-1",
      });

      const result = await service.addMessage("user-1", "t-1", {
        body: "Más contexto",
      });

      expect(mockPrisma.supportTicketMessage.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ ticketId: "t-1", authorId: "user-1" }),
        }),
      );
      expect(result.id).toBe("m-1");
    });
  });

  describe("adminUpdateStatus", () => {
    it("updates status and notifies ticket owner", async () => {
      mockPrisma.supportTicket.findUnique.mockResolvedValue({
        id: "t-1",
        userId: "user-1",
        subject: "Problema",
      });
      mockPrisma.supportTicket.update.mockResolvedValue({
        id: "t-1",
        status: "resolved",
      });

      const result = await service.adminUpdateStatus("t-1", {
        status: "resolved",
      });

      expect(mockNotifications.notify).toHaveBeenCalledWith(
        "user-1",
        expect.objectContaining({
          type: "support",
          data: JSON.stringify({ ticketId: "t-1" }),
        }),
      );
      expect(result.status).toBe("resolved");
    });
  });

  describe("adminAddMessage", () => {
    it("adds admin reply and notifies owner", async () => {
      mockPrisma.supportTicket.findUnique.mockResolvedValue({
        id: "t-1",
        userId: "user-1",
      });
      mockPrisma.supportTicketMessage.create.mockResolvedValue({
        id: "m-reply",
      });

      const result = await service.adminAddMessage("t-1", "admin-1", {
        body: "Estamos revisando",
      });

      expect(mockPrisma.supportTicketMessage.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            ticketId: "t-1",
            authorId: "admin-1",
            body: "Estamos revisando",
          },
        }),
      );
      expect(mockNotifications.notify).toHaveBeenCalledWith(
        "user-1",
        expect.objectContaining({ title: "El equipo te respondió" }),
      );
      expect(result.id).toBe("m-reply");
    });
  });
});