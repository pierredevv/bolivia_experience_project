import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class PromotionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 20, placeId?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (placeId) {
      where.placeId = placeId;
    }

    const [promotions, total] = await Promise.all([
      this.prisma.promotion.findMany({
        where,
        include: {
          place: {
            include: {
              photos: { take: 1, orderBy: { displayOrder: 'asc' } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.promotion.count({ where }),
    ]);

    return new PaginatedResponse(promotions, total, page, limit);
  }

  async findActive(page = 1, limit = 20) {
    const now = new Date();
    const skip = (page - 1) * limit;
    const where = {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    };

    const [promotions, total] = await Promise.all([
      this.prisma.promotion.findMany({
        where,
        include: {
          place: {
            include: {
              photos: { take: 1, orderBy: { displayOrder: 'asc' } },
            },
          },
        },
        orderBy: { endDate: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.promotion.count({ where }),
    ]);

    return new PaginatedResponse(promotions, total, page, limit);
  }

  async findById(id: string) {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id },
      include: { place: true },
    });

    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }

    return promotion;
  }

  async create(userId: string, placeId: string, data: any) {
    return this.prisma.promotion.create({
      data: { ...data, placeId },
    });
  }

  async update(userId: string, promotionId: string, data: any) {
    await this.findById(promotionId);
    return this.prisma.promotion.update({
      where: { id: promotionId },
      data,
    });
  }

  async remove(userId: string, promotionId: string) {
    await this.findById(promotionId);
    return this.prisma.promotion.delete({ where: { id: promotionId } });
  }
}
