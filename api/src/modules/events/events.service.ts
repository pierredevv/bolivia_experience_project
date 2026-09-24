import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { PaginatedResponse } from "../../common/dto/pagination.dto";

// Events created by regular users start as "pending" and only become visible
// once an admin approves them (Módulo 9).
export const EVENT_STATUS_PENDING = "pending";
export const EVENT_STATUS_APPROVED = "approved";
export const EVENT_STATUS_REJECTED = "rejected";

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findAllAdmin(query: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: any = {};
    if (query.status) {
      where.status = query.status;
    }

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        orderBy: { dateStart: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.event.count({ where }),
    ]);

    return new PaginatedResponse(events, total, page, limit);
  }

  async updateStatus(id: string, status: string) {
    const event = await this.findByIdRaw(id);
    return this.prisma.event.update({
      where: { id },
      data: {
        status,
        isActive: status === EVENT_STATUS_APPROVED,
      },
    });
  }

  async findByIdRaw(id: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) {
      throw new NotFoundException("Event not found");
    }
    return event;
  }

  async findAll(query: { page?: number; limit?: number; upcoming?: boolean }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: any = { isActive: true, status: EVENT_STATUS_APPROVED };

    if (query.upcoming !== false) {
      where.OR = [{ dateEnd: null }, { dateEnd: { gte: new Date() } }];
    }

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        orderBy: { dateStart: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.event.count({ where }),
    ]);

    return new PaginatedResponse(events, total, page, limit);
  }

  async findToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prisma.event.findMany({
      where: {
        isActive: true,
        status: EVENT_STATUS_APPROVED,
        dateStart: { lte: tomorrow },
        OR: [{ dateEnd: null }, { dateEnd: { gte: today } }],
      },
      orderBy: { dateStart: "asc" },
    });
  }

  async findById(id: string) {
    const event = await this.prisma.event.findFirst({
      where: { id, isActive: true, status: EVENT_STATUS_APPROVED },
    });
    if (!event) {
      throw new NotFoundException("Event not found");
    }
    return event;
  }

  async create(data: any) {
    return this.prisma.event.create({
      data: {
        ...data,
        status: EVENT_STATUS_PENDING,
        isActive: false,
      },
    });
  }

  async update(id: string, data: any) {
    await this.findByIdRaw(id);
    return this.prisma.event.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findByIdRaw(id);
    return this.prisma.event.delete({ where: { id } });
  }
}
