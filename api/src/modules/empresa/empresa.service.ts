import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdatePlaceDto, EmpresaReviewsDto } from './dto';
import { PaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class EmpresaService {
  constructor(private prisma: PrismaService) {}

  async getOwnerPlace(userId: string) {
    const place = await this.prisma.place.findFirst({
      where: { ownerId: userId },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        photos: { orderBy: { displayOrder: 'asc' } },
        hours: { orderBy: { dayOfWeek: 'asc' } },
        _count: {
          select: { reviews: true, favorites: true },
        },
      },
    });

    if (!place) {
      throw new NotFoundException('No place found for this user');
    }

    return place;
  }

  async updateOwnerPlace(userId: string, dto: UpdatePlaceDto) {
    const place = await this.prisma.place.findFirst({
      where: { ownerId: userId },
    });

    if (!place) {
      throw new NotFoundException('No place found for this user');
    }

    return this.prisma.place.update({
      where: { id: place.id },
      data: dto,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        photos: { orderBy: { displayOrder: 'asc' } },
        hours: { orderBy: { dayOfWeek: 'asc' } },
      },
    });
  }

  async getOwnerReviews(userId: string, dto: EmpresaReviewsDto) {
    const place = await this.prisma.place.findFirst({
      where: { ownerId: userId },
    });

    if (!place) {
      throw new NotFoundException('No place found for this user');
    }

    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { placeId: place.id },
        include: {
          user: {
            select: { id: true, name: true, email: true, photoUrl: true },
          },
          replies: {
            include: {
              user: { select: { id: true, name: true } },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({ where: { placeId: place.id } }),
    ]);

    return new PaginatedResponse(reviews, total, page, limit);
  }

  async getOwnerStats(userId: string) {
    const place = await this.prisma.place.findFirst({
      where: { ownerId: userId },
    });

    if (!place) {
      throw new NotFoundException('No place found for this user');
    }

    const [totalReviews, approvedReviews, pendingReviews, favoriteCount] =
      await Promise.all([
        this.prisma.review.count({ where: { placeId: place.id } }),
        this.prisma.review.count({
          where: { placeId: place.id, isApproved: true },
        }),
        this.prisma.review.count({
          where: { placeId: place.id, isApproved: false },
        }),
        this.prisma.favorite.count({ where: { placeId: place.id } }),
      ]);

    return {
      placeId: place.id,
      placeName: place.name,
      ratingAvg: place.ratingAvg,
      ratingCount: place.ratingCount,
      totalReviews,
      approvedReviews,
      pendingReviews,
      favoriteCount,
    };
  }

  async getOwnerDashboard(userId: string) {
    const place = await this.prisma.place.findFirst({
      where: { ownerId: userId },
    });

    if (!place) {
      throw new NotFoundException('No place found for this user');
    }

    const [totalReviews, favoriteCount, recentReviews] = await Promise.all([
      this.prisma.review.count({ where: { placeId: place.id } }),
      this.prisma.favorite.count({ where: { placeId: place.id } }),
      this.prisma.review.findMany({
        where: { placeId: place.id },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true } },
        },
      }),
    ]);

    return {
      place: {
        id: place.id,
        name: place.name,
        address: place.address,
        ratingAvg: place.ratingAvg,
        ratingCount: place.ratingCount,
        totalReviews,
        favoriteCount,
      },
      recentReviews,
    };
  }
}
