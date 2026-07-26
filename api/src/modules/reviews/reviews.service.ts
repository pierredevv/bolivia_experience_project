import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto, UpdateReviewDto } from './dto';
import { ReviewStatus } from '../../common/constants/review-status';
import { Prisma } from '@prisma/client';
import { PaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async findByPlace(placeId: string, page = 1, limit = 20) {
    const where = { placeId, status: ReviewStatus.PUBLISHED };

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, photoUrl: true } },
          replies: {
            include: { user: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.review.count({ where }),
    ]);

    return new PaginatedResponse(reviews, total, page, limit);
  }

  async findByUser(userId: string, page = 1, limit = 20) {
    const where = { userId, status: ReviewStatus.PUBLISHED };

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: {
          place: { select: { id: true, name: true, photos: { take: 1 } } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.review.count({ where }),
    ]);

    return new PaginatedResponse(reviews, total, page, limit);
  }

  async getUserStats(userId: string) {
    const stats = await this.prisma.review.aggregate({
      where: { userId, status: ReviewStatus.PUBLISHED },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return {
      totalReviews: stats._count.rating,
      averageRating: stats._avg.rating ?? 0,
    };
  }

  async create(userId: string, placeId: string, dto: CreateReviewDto) {
    const existing = await this.prisma.review.findUnique({
      where: { userId_placeId: { userId, placeId } },
    });

    if (existing) {
      throw new ConflictException('You already reviewed this place');
    }

    return this.prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          userId,
          placeId,
          rating: dto.rating,
          comment: dto.comment,
          photos: JSON.stringify(dto.photos || []),
          visitDate: dto.visitDate || null,
          status: ReviewStatus.PUBLISHED,
        },
        include: {
          user: { select: { id: true, name: true, photoUrl: true } },
        },
      });

      await this.recalculatePlaceRating(tx, placeId);

      return review;
    });
  }

  async update(userId: string, reviewId: string, dto: UpdateReviewDto) {
    const review = await this.findReviewOrThrow(reviewId);

    if (review.userId !== userId) {
      throw new ForbiddenException('You can only edit your own reviews');
    }

    // No permitir editar reseñas DELETED o HIDDEN
    if (
      review.status === ReviewStatus.DELETED ||
      review.status === ReviewStatus.HIDDEN
    ) {
      throw new BadRequestException(
        'Cannot edit a review with this status',
      );
    }

    const updateData: any = {};
    if (dto.rating !== undefined) updateData.rating = dto.rating;
    if (dto.comment !== undefined) updateData.comment = dto.comment;
    if (dto.photos !== undefined) updateData.photos = JSON.stringify(dto.photos);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.review.update({
        where: { id: reviewId },
        data: updateData,
      });

      // Recalcular si cambió el rating
      if (dto.rating !== undefined && dto.rating !== review.rating) {
        await this.recalculatePlaceRating(tx, review.placeId);
      }

      return updated;
    });
  }

  async remove(userId: string, reviewId: string, isAdmin: boolean) {
    const review = await this.findReviewOrThrow(reviewId);

    if (review.status === ReviewStatus.DELETED) {
      throw new BadRequestException('Review already deleted');
    }

    if (!isAdmin && review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.review.update({
        where: { id: reviewId },
        data: { status: ReviewStatus.DELETED },
      });

      await this.recalculatePlaceRating(tx, review.placeId);

      return { message: 'Review deleted' };
    });
  }

  async updateStatus(
    reviewId: string,
    status: ReviewStatus,
    moderatedById: string,
  ) {
    const review = await this.findReviewOrThrow(reviewId);

    // Evitar cambios inútiles de estado
    if (review.status === status) {
      return review;
    }

    // Impedir restaurar DELETED
    if (
      review.status === ReviewStatus.DELETED &&
      status !== ReviewStatus.DELETED
    ) {
      throw new BadRequestException('Deleted reviews cannot be restored');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.review.update({
        where: { id: reviewId },
        data: {
          status,
          moderatedAt: new Date(),
          moderatedById,
        },
        include: {
          moderatedBy: { select: { id: true, name: true, photoUrl: true } },
        },
      });

      await this.recalculatePlaceRating(tx, review.placeId);

      return updated;
    });
  }

  async respond(userId: string, reviewId: string, comment: string) {
    await this.findReviewOrThrow(reviewId);

    return this.prisma.reviewReply.create({
      data: { reviewId, userId, comment },
    });
  }

  private async recalculatePlaceRating(
    tx: Prisma.TransactionClient,
    placeId: string,
  ): Promise<void> {
    const stats = await tx.review.aggregate({
      where: { placeId, status: ReviewStatus.PUBLISHED },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await tx.place.update({
      where: { id: placeId },
      data: {
        ratingAvg: stats._avg.rating ?? 0,
        ratingCount: stats._count.rating,
      },
    });
  }

  private async findReviewOrThrow(id: string) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    return review;
  }
}
