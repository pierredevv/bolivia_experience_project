import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PromotionsService {
  constructor(private prisma: PrismaService) {}

  async findActive() {
    const now = new Date();
    return this.prisma.promotion.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        place: {
          select: { id: true, name: true, address: true },
          include: {
            photos: { take: 1, orderBy: { displayOrder: 'asc' } },
          },
        },
      },
      orderBy: { endDate: 'asc' },
    });
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
