import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { page?: number; limit?: number; upcoming?: boolean }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: any = { isActive: true };

    if (query.upcoming !== false) {
      where.OR = [
        { dateEnd: null },
        { dateEnd: { gte: new Date() } },
      ];
    }

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        orderBy: { dateStart: 'asc' },
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
        dateStart: { lte: tomorrow },
        OR: [
          { dateEnd: null },
          { dateEnd: { gte: today } },
        ],
      },
      orderBy: { dateStart: 'asc' },
    });
  }

  async findById(id: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async create(data: any) {
    return this.prisma.event.create({ data });
  }

  async update(id: string, data: any) {
    await this.findById(id);
    return this.prisma.event.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.event.delete({ where: { id } });
  }
}
