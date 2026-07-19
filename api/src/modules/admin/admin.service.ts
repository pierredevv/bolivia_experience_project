import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryUsersDto, QueryAllReviewsDto } from './dto';
import { PaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const [
      totalUsers,
      totalPlaces,
      totalReviews,
      totalEvents,
      activePromotions,
      recentReviews,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.place.count({ where: { isActive: true } }),
      this.prisma.review.count({ where: { isApproved: true } }),
      this.prisma.event.count({ where: { isActive: true } }),
      this.prisma.promotion.count({ where: { isActive: true } }),
      this.prisma.review.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          user: { select: { id: true, name: true, photoUrl: true } },
          place: { select: { id: true, name: true } },
        },
      }),
    ]);

    return {
      stats: {
        totalUsers,
        totalPlaces,
        totalReviews,
        totalEvents,
        activePromotions,
      },
      recentReviews,
    };
  }

  async getUsers(query: QueryUsersDto) {
    const where: any = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const skip = ((query.page ?? 1) - 1) * (query.limit ?? 20);

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: { reviews: true, places: true, favorites: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return new PaginatedResponse(users, total, query.page ?? 1, query.limit ?? 20);
  }

  async banUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
      select: { id: true, email: true, name: true, isActive: true },
    });
  }

  async getAllReviews(query: QueryAllReviewsDto) {
    const where: any = {};

    if (query.placeId) {
      where.placeId = query.placeId;
    }

    if (query.search) {
      where.OR = [
        { comment: { contains: query.search, mode: 'insensitive' } },
        { user: { name: { contains: query.search, mode: 'insensitive' } } },
        { place: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const skip = ((query.page ?? 1) - 1) * (query.limit ?? 20);

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, photoUrl: true } },
          place: { select: { id: true, name: true } },
          replies: {
            include: { user: { select: { id: true, name: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      this.prisma.review.count({ where }),
    ]);

    return new PaginatedResponse(reviews, total, query.page ?? 1, query.limit ?? 20);
  }
}
