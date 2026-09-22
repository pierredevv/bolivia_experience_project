import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import {
  AddSupportMessageDto,
  CreateSupportTicketDto,
  UpdateSupportTicketStatusDto,
} from "./dto";

@Injectable()
export class SupportService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  private assertOwner(ticketUserId: string, userId: string) {
    if (ticketUserId !== userId) {
      throw new ForbiddenException("You can only access your own tickets");
    }
  }

  private async getTicketForUser(ticketId: string, userId: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });
    if (!ticket) {
      throw new NotFoundException("Support ticket not found");
    }
    this.assertOwner(ticket.userId, userId);
    return ticket;
  }

  private async findHostForReservation(reservationId?: string) {
    if (!reservationId) return null;
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        product: { include: { socio: { select: { id: true, name: true } } } },
      },
    });
    return reservation?.product?.socio ?? null;
  }

  async create(userId: string, dto: CreateSupportTicketDto) {
    const ticket = await this.prisma.supportTicket.create({
      data: {
        userId,
        reservationId: dto.reservationId,
        type: dto.type,
        subject: dto.subject,
        description: dto.description,
        messages: {
          create: {
            authorId: userId,
            body: dto.description,
          },
        },
      },
      include: { messages: true },
    });

    const host = await this.findHostForReservation(dto.reservationId);
    if (host) {
      await this.notifications.notify(host.id, {
        title: "Nuevo ticket de soporte",
        body: `${dto.subject} — ${dto.description.slice(0, 80)}`,
        type: "support",
        data: JSON.stringify({ ticketId: ticket.id }),
      });
    }

    return ticket;
  }

  async findMine(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            select: { id: true, authorId: true, body: true, createdAt: true },
          },
        },
      }),
      this.prisma.supportTicket.count({ where: { userId } }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(userId: string, ticketId: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
        reservation: {
          select: { id: true, date: true, time: true, status: true },
        },
      },
    });
    if (!ticket) throw new NotFoundException("Support ticket not found");
    this.assertOwner(ticket.userId, userId);
    return ticket;
  }

  async addMessage(userId: string, ticketId: string, dto: AddSupportMessageDto) {
    await this.getTicketForUser(ticketId, userId);
    return this.prisma.supportTicketMessage.create({
      data: { ticketId, authorId: userId, body: dto.body },
    });
  }

  async adminFindAll(status?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};
    const [data, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true } },
          _count: { select: { messages: true } },
        },
      }),
      this.prisma.supportTicket.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async adminFindOne(ticketId: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            ticket: {
              select: { userId: true },
            },
          },
        },
        reservation: {
          select: { id: true, date: true, time: true, status: true },
        },
      },
    });
    if (!ticket) throw new NotFoundException("Support ticket not found");
    return ticket;
  }

  async adminUpdateStatus(
    ticketId: string,
    dto: UpdateSupportTicketStatusDto,
  ) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });
    if (!ticket) throw new NotFoundException("Support ticket not found");

    await this.notifications.notify(ticket.userId, {
      title: "Ticket de soporte actualizado",
      body: `Tu ticket "${ticket.subject}" ahora está ${dto.status}.`,
      type: "support",
      data: JSON.stringify({ ticketId }),
    });

    return this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: dto.status },
    });
  }

  async adminAddMessage(
    ticketId: string,
    adminId: string,
    dto: AddSupportMessageDto,
  ) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });
    if (!ticket) throw new NotFoundException("Support ticket not found");

    const message = await this.prisma.supportTicketMessage.create({
      data: { ticketId, authorId: adminId, body: dto.body },
    });

    await this.notifications.notify(ticket.userId, {
      title: "El equipo te respondió",
      body: dto.body.slice(0, 120),
      type: "support",
      data: JSON.stringify({ ticketId }),
    });

    return message;
  }
}