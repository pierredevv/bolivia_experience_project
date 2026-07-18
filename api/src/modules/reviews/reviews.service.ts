import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto, UpdateReviewDto } from './dto';
import { PaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async findByPlace(placeId: string, page = 1, limit = 20) {
    const where = { placeId, isApproved: true };

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

  async create(userId: string, placeId: string, dto: CreateReviewDto) {
    const existing = await this.prisma.review.findUnique({
      where: { userId_placeId: { userId, placeId } },
    });

    if (existing) {
      throw new ConflictException('You already reviewed this place');
    }

    const dbUrl = process.env.DATABASE_URL || '';
    const isSQLite = dbUrl.includes('file:');

    return this.prisma.review.create({
      data: {
        userId,
        placeId,
        rating: dto.rating,
        comment: dto.comment,
        photos: isSQLite ? JSON.stringify(dto.photos || []) : JSON.stringify(dto.photos || []),
        visitDate: dto.visitDate || null,
      },
      include: {
        user: { select: { id: true, name: true, photoUrl: true } },
      },
    });
  }

  async update(userId: string, reviewId: string, dto: UpdateReviewDto) {
    const review = await this.findReviewOrThrow(reviewId);

    if (review.userId !== userId) {
      throw new ForbiddenException('You can only edit your own reviews');
    }

    const updateData: any = {};
    if (dto.rating !== undefined) updateData.rating = dto.rating;
    if (dto.comment !== undefined) updateData.comment = dto.comment;
    if (dto.photos !== undefined) updateData.photos = JSON.stringify(dto.photos);

    return this.prisma.review.update({
      where: { id: reviewId },
      data: updateData,
    });
  }

  async remove(userId: string, reviewId: string, isAdmin: boolean) {
    const review = await this.findReviewOrThrow(reviewId);

    if (!isAdmin && review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    return this.prisma.review.delete({ where: { id: reviewId } });
  }

  async approve(reviewId: string) {
    return this.prisma.review.update({
      where: { id: reviewId },
      data: { isApproved: true },
    });
  }

  async respond(userId: string, reviewId: string, comment: string) {
    return this.prisma.reviewReply.create({
      data: { reviewId, userId, comment },
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
