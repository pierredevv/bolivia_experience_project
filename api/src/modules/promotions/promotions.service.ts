import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { PaginatedResponse } from "../../common/dto/pagination.dto";

@Injectable()
export class PromotionsService {
  constructor(private prisma: PrismaService) {}

  private async verifyPlaceOwnership(
    userId: string,
    placeId: string,
    userRole: string,
  ) {
    if (userRole === "admin") return true;
    const place = await this.prisma.place.findUnique({
      where: { id: placeId },
    });
    if (!place) throw new NotFoundException("Place not found");
    if (place.ownerId !== userId)
      throw new ForbiddenException(
        "You can only manage promotions for your own place",
      );
    return true;
  }

  private async verifyPromotionOwnership(
    userId: string,
    promotionId: string,
    userRole: string,
  ) {
    if (userRole === "admin") return true;
    const promotion = await this.prisma.promotion.findUnique({
      where: { id: promotionId },
    });
    if (!promotion) throw new NotFoundException("Promotion not found");
    const place = await this.prisma.place.findUnique({
      where: { id: promotion.placeId },
    });
    if (!place || place.ownerId !== userId)
      throw new ForbiddenException("You can only manage your own promotions");
    return true;
  }

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
              photos: { take: 1, orderBy: { displayOrder: "asc" } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
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
              photos: { take: 1, orderBy: { displayOrder: "asc" } },
            },
          },
        },
        orderBy: { endDate: "asc" },
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
      throw new NotFoundException("Promotion not found");
    }

    return promotion;
  }

  async create(userId: string, userRole: string, placeId: string, data: any) {
    await this.verifyPlaceOwnership(userId, placeId, userRole);
    return this.prisma.promotion.create({
      data: { ...data, placeId },
    });
  }

  async update(
    userId: string,
    userRole: string,
    promotionId: string,
    data: any,
  ) {
    await this.verifyPromotionOwnership(userId, promotionId, userRole);
    return this.prisma.promotion.update({
      where: { id: promotionId },
      data,
    });
  }

  async remove(userId: string, userRole: string, promotionId: string) {
    await this.verifyPromotionOwnership(userId, promotionId, userRole);
    return this.prisma.promotion.delete({ where: { id: promotionId } });
  }
}
