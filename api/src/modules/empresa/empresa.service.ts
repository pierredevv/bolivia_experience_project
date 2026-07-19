import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateEmpresaPlaceDto, QueryEmpresaReviewsDto } from './dto';
import { PaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class EmpresaService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(ownerId: string) {
    const place = await this.prisma.place.findFirst({
      where: { ownerId },
      select: { id: true },
    });

    if (!place) {
      throw new NotFoundException('No place found for this user');
    }

    const [totalReviews, pendingReviews, averageRating, recentReviews] =
      await Promise.all([
        this.prisma.review.count({
          where: { placeId: place.id, isApproved: true },
        }),
        this.prisma.review.count({
          where: { placeId: place.id, isApproved: false },
        }),
        this.prisma.review.aggregate({
          where: { placeId: place.id, isApproved: true },
          _avg: { rating: true },
        }),
        this.prisma.review.findMany({
          where: { placeId: place.id, isApproved: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            user: { select: { id: true, name: true, photoUrl: true } },
          },
        }),
      ]);

    return {
      stats: {
        totalReviews,
        pendingReviews,
        averageRating: averageRating._avg.rating || 0,
      },
      recentReviews,
    };
  }

  async getPlace(ownerId: string) {
    const place = await this.prisma.place.findFirst({
      where: { ownerId },
      include: {
        category: { select: { id: true, name: true, icon: true } },
        photos: { orderBy: { displayOrder: 'asc' } },
        hours: { orderBy: { dayOfWeek: 'asc' } },
        _count: {
          select: { reviews: { where: { isApproved: true } }, favorites: true },
        },
      },
    });

    if (!place) {
      throw new NotFoundException('No place found for this user');
    }

    return place;
  }

  async updatePlace(ownerId: string, dto: UpdateEmpresaPlaceDto) {
    const place = await this.prisma.place.findFirst({
      where: { ownerId },
    });

    if (!place) {
      throw new NotFoundException('No place found for this user');
    }

    return this.prisma.place.update({
      where: { id: place.id },
      data: dto,
      include: { category: true },
    });
  }

  async getReviews(ownerId: string, query: QueryEmpresaReviewsDto) {
    const place = await this.prisma.place.findFirst({
      where: { ownerId },
      select: { id: true },
    });

    if (!place) {
      throw new NotFoundException('No place found for this user');
    }

    const skip = ((query.page ?? 1) - 1) * (query.limit ?? 20);

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { placeId: place.id },
        include: {
          user: { select: { id: true, name: true, photoUrl: true } },
          replies: {
            include: { user: { select: { id: true, name: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      this.prisma.review.count({ where: { placeId: place.id } }),
    ]);

    return new PaginatedResponse(reviews, total, query.page ?? 1, query.limit ?? 20);
  }

  async getAnalytics(ownerId: string) {
    const place = await this.prisma.place.findFirst({
      where: { ownerId },
      select: { id: true },
    });

    if (!place) {
      throw new NotFoundException('No place found for this user');
    }

    const [reviewStats, favoriteCount, promotionCount] = await Promise.all([
      this.prisma.review.aggregate({
        where: { placeId: place.id, isApproved: true },
        _avg: { rating: true },
        _count: { id: true },
      }),
      this.prisma.favorite.count({
        where: { placeId: place.id },
      }),
      this.prisma.promotion.count({
        where: { placeId: place.id, isActive: true },
      }),
    ]);

    const ratingDistribution = await this.prisma.review.groupBy({
      by: ['rating'],
      where: { placeId: place.id, isApproved: true },
      _count: { rating: true },
      orderBy: { rating: 'asc' },
    });

    return {
      stats: {
        averageRating: reviewStats._avg.rating || 0,
        totalReviews: reviewStats._count.id,
        totalFavorites: favoriteCount,
        activePromotions: promotionCount,
      },
      ratingDistribution: ratingDistribution.map((item) => ({
        rating: item.rating,
        count: item._count.rating,
      })),
    };
  }
}
