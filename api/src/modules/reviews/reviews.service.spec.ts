import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';
import { ReviewStatus } from '../../common/constants/review-status';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let prisma: PrismaService;

  const mockPrisma = {
    review: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    reviewReply: {
      create: jest.fn(),
    },
    place: {
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByPlace', () => {
    it('should return published reviews for a place', async () => {
      const mockReviews = [
        {
          id: 'review-1',
          placeId: 'place-1',
          rating: 5,
          comment: 'Great place!',
          status: ReviewStatus.PUBLISHED,
          user: { id: 'user-1', name: 'Test User', photoUrl: null },
          replies: [],
        },
      ];

      mockPrisma.review.findMany.mockResolvedValue(mockReviews);
      mockPrisma.review.count.mockResolvedValue(1);

      const result = await service.findByPlace('place-1');

      expect(result.data).toEqual(mockReviews);
      expect(result.meta.total).toBe(1);
      expect(mockPrisma.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ placeId: 'place-1', status: ReviewStatus.PUBLISHED }),
        })
      );
    });

    it('should only return published reviews', async () => {
      mockPrisma.review.findMany.mockResolvedValue([]);
      mockPrisma.review.count.mockResolvedValue(0);

      await service.findByPlace('place-1');

      expect(mockPrisma.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: ReviewStatus.PUBLISHED }),
        })
      );
    });
  });

  describe('create', () => {
    it('should create review with PUBLISHED status', async () => {
      const createDto = {
        rating: 5,
        comment: 'Excellent service!',
        photos: ['https://example.com/photo1.jpg'],
      };

      const mockReview = {
        id: 'review-new',
        userId: 'user-1',
        placeId: 'place-1',
        ...createDto,
        status: ReviewStatus.PUBLISHED,
        user: { id: 'user-1', name: 'Test User', photoUrl: null },
      };

      mockPrisma.review.findUnique.mockResolvedValue(null);
      mockPrisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          review: {
            create: jest.fn().mockResolvedValue(mockReview),
            aggregate: jest.fn().mockResolvedValue({ _avg: { rating: 5 }, _count: { rating: 1 } }),
          },
          place: { update: jest.fn() },
        };
        return fn(tx);
      });

      const result = await service.create('user-1', 'place-1', createDto);

      expect(result.status).toBe(ReviewStatus.PUBLISHED);
    });

    it('should throw ConflictException if user already reviewed place', async () => {
      const createDto = {
        rating: 5,
        comment: 'Already reviewed',
      };

      mockPrisma.review.findUnique.mockResolvedValue({
        id: 'existing-review',
        userId: 'user-1',
        placeId: 'place-1',
      });

      await expect(service.create('user-1', 'place-1', createDto)).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe('update', () => {
    it('should update own published review', async () => {
      const updateDto = {
        rating: 4,
        comment: 'Updated comment',
      };

      mockPrisma.review.findUnique.mockResolvedValue({
        id: 'review-1',
        userId: 'user-1',
        placeId: 'place-1',
        rating: 5,
        status: ReviewStatus.PUBLISHED,
      });

      mockPrisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          review: {
            update: jest.fn().mockResolvedValue({ id: 'review-1', ...updateDto }),
            aggregate: jest.fn().mockResolvedValue({ _avg: { rating: 4 }, _count: { rating: 1 } }),
          },
          place: { update: jest.fn() },
        };
        return fn(tx);
      });

      const result = await service.update('user-1', 'review-1', updateDto);

      expect(result.rating).toBe(4);
      expect(result.comment).toBe('Updated comment');
    });

    it('should throw ForbiddenException when editing others review', async () => {
      mockPrisma.review.findUnique.mockResolvedValue({
        id: 'review-1',
        userId: 'other-user',
        placeId: 'place-1',
        status: ReviewStatus.PUBLISHED,
      });

      await expect(
        service.update('user-1', 'review-1', { comment: 'Hacked' })
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when editing HIDDEN review', async () => {
      mockPrisma.review.findUnique.mockResolvedValue({
        id: 'review-1',
        userId: 'user-1',
        placeId: 'place-1',
        status: ReviewStatus.HIDDEN,
      });

      await expect(
        service.update('user-1', 'review-1', { comment: 'Test' })
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for invalid review id', async () => {
      mockPrisma.review.findUnique.mockResolvedValue(null);

      await expect(
        service.update('user-1', 'invalid-id', { comment: 'Test' })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update review status with audit fields', async () => {
      mockPrisma.review.findUnique.mockResolvedValue({
        id: 'review-1',
        status: ReviewStatus.PUBLISHED,
        placeId: 'place-1',
      });

      mockPrisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          review: {
            update: jest.fn().mockResolvedValue({ id: 'review-1', status: ReviewStatus.HIDDEN }),
            aggregate: jest.fn().mockResolvedValue({ _avg: { rating: 5 }, _count: { rating: 1 } }),
          },
          place: { update: jest.fn() },
        };
        return fn(tx);
      });

      const result = await service.updateStatus('review-1', ReviewStatus.HIDDEN, 'admin-1');

      expect(result.status).toBe(ReviewStatus.HIDDEN);
    });

    it('should return same review if status unchanged', async () => {
      const existingReview = {
        id: 'review-1',
        status: ReviewStatus.PUBLISHED,
      };

      mockPrisma.review.findUnique.mockResolvedValue(existingReview);

      const result = await service.updateStatus('review-1', ReviewStatus.PUBLISHED, 'admin-1');

      expect(result).toEqual(existingReview);
    });

    it('should throw BadRequestException when restoring DELETED review', async () => {
      mockPrisma.review.findUnique.mockResolvedValue({
        id: 'review-1',
        status: ReviewStatus.DELETED,
      });

      await expect(
        service.updateStatus('review-1', ReviewStatus.PUBLISHED, 'admin-1')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('respond', () => {
    it('should create review reply', async () => {
      const mockReply = {
        id: 'reply-1',
        reviewId: 'review-1',
        userId: 'user-1',
        comment: 'Thank you for your feedback!',
        createdAt: new Date(),
      };

      mockPrisma.review.findUnique.mockResolvedValue({ id: 'review-1' });
      mockPrisma.reviewReply.create.mockResolvedValue(mockReply);

      const result = await service.respond('user-1', 'review-1', 'Thank you for your feedback!');

      expect(result).toEqual(mockReply);
      expect(mockPrisma.reviewReply.create).toHaveBeenCalledWith({
        data: {
          reviewId: 'review-1',
          userId: 'user-1',
          comment: 'Thank you for your feedback!',
        },
      });
    });
  });

  describe('remove', () => {
    it('should soft delete own review', async () => {
      const mockReview = {
        id: 'review-1',
        userId: 'user-1',
        placeId: 'place-1',
        status: ReviewStatus.PUBLISHED,
      };

      mockPrisma.review.findUnique.mockResolvedValue(mockReview);
      mockPrisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          review: {
            update: jest.fn().mockResolvedValue({ ...mockReview, status: ReviewStatus.DELETED }),
            aggregate: jest.fn().mockResolvedValue({ _avg: { rating: 5 }, _count: { rating: 1 } }),
          },
          place: { update: jest.fn() },
        };
        return fn(tx);
      });

      const result = await service.remove('user-1', 'review-1', false);

      expect(result.message).toBe('Review deleted');
    });

    it('should allow admin to delete any review', async () => {
      const mockReview = {
        id: 'review-1',
        userId: 'other-user',
        placeId: 'place-1',
        status: ReviewStatus.PUBLISHED,
      };

      mockPrisma.review.findUnique.mockResolvedValue(mockReview);
      mockPrisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          review: {
            update: jest.fn(),
            aggregate: jest.fn().mockResolvedValue({ _avg: { rating: 5 }, _count: { rating: 1 } }),
          },
          place: { update: jest.fn() },
        };
        return fn(tx);
      });

      const result = await service.remove('admin-user', 'review-1', true);

      expect(result.message).toBe('Review deleted');
    });

    it('should throw ForbiddenException when deleting others review as non-admin', async () => {
      mockPrisma.review.findUnique.mockResolvedValue({
        id: 'review-1',
        userId: 'other-user',
        placeId: 'place-1',
        status: ReviewStatus.PUBLISHED,
      });

      await expect(service.remove('user-1', 'review-1', false)).rejects.toThrow(
        ForbiddenException
      );
    });

    it('should throw BadRequestException when deleting already deleted review', async () => {
      mockPrisma.review.findUnique.mockResolvedValue({
        id: 'review-1',
        userId: 'user-1',
        placeId: 'place-1',
        status: ReviewStatus.DELETED,
      });

      await expect(service.remove('user-1', 'review-1', false)).rejects.toThrow(
        BadRequestException
      );
    });
  });
});
