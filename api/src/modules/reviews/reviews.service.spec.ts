import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';

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
    },
    reviewReply: {
      create: jest.fn(),
    },
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
    it('should return approved reviews for a place', async () => {
      const mockReviews = [
        {
          id: 'review-1',
          placeId: 'place-1',
          rating: 5,
          comment: 'Great place!',
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
          where: expect.objectContaining({ placeId: 'place-1', isApproved: true }),
        })
      );
    });

    it('should only return approved reviews (not pending)', async () => {
      mockPrisma.review.findMany.mockResolvedValue([]);
      mockPrisma.review.count.mockResolvedValue(0);

      await service.findByPlace('place-1');

      expect(mockPrisma.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isApproved: true }),
        })
      );
    });
  });

  describe('create', () => {
    it('should create review for authenticated user', async () => {
      const createDto = {
        rating: 5,
        comment: 'Excellent service!',
        photos: ['https://example.com/photo1.jpg'],
      };

      mockPrisma.review.findUnique.mockResolvedValue(null);
      mockPrisma.review.create.mockResolvedValue({
        id: 'review-new',
        userId: 'user-1',
        placeId: 'place-1',
        ...createDto,
        user: { id: 'user-1', name: 'Test User', photoUrl: null },
      });

      const result = await service.create('user-1', 'place-1', createDto);

      expect(result.userId).toBe('user-1');
      expect(result.placeId).toBe('place-1');
      expect(result.rating).toBe(5);
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
    it('should update own review', async () => {
      const updateDto = {
        rating: 4,
        comment: 'Updated comment',
      };

      mockPrisma.review.findUnique.mockResolvedValue({
        id: 'review-1',
        userId: 'user-1',
        placeId: 'place-1',
      });

      mockPrisma.review.update.mockResolvedValue({
        id: 'review-1',
        userId: 'user-1',
        placeId: 'place-1',
        ...updateDto,
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
      });

      await expect(
        service.update('user-1', 'review-1', { comment: 'Hacked' })
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException for invalid review id', async () => {
      mockPrisma.review.findUnique.mockResolvedValue(null);

      await expect(
        service.update('user-1', 'invalid-id', { comment: 'Test' })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('approve', () => {
    it('should set isApproved to true', async () => {
      mockPrisma.review.update.mockResolvedValue({
        id: 'review-1',
        isApproved: true,
      });

      const result = await service.approve('review-1');

      expect(result.isApproved).toBe(true);
      expect(mockPrisma.review.update).toHaveBeenCalledWith({
        where: { id: 'review-1' },
        data: { isApproved: true },
      });
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

      mockPrisma.reviewReply.create.mockResolvedValue(mockReply);

      const result = await service.respond('user-1', 'review-1', 'Thank you for your feedback!', 'usuario');

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
    it('should delete own review', async () => {
      const mockReview = {
        id: 'review-1',
        userId: 'user-1',
        placeId: 'place-1',
      };

      mockPrisma.review.findUnique.mockResolvedValue(mockReview);
      mockPrisma.review.delete.mockResolvedValue(mockReview);

      const result = await service.remove('user-1', 'review-1', false);

      expect(result).toEqual(mockReview);
      expect(mockPrisma.review.delete).toHaveBeenCalledWith({ where: { id: 'review-1' } });
    });

    it('should allow admin to delete any review', async () => {
      const mockReview = {
        id: 'review-1',
        userId: 'other-user',
        placeId: 'place-1',
      };

      mockPrisma.review.findUnique.mockResolvedValue(mockReview);
      mockPrisma.review.delete.mockResolvedValue(mockReview);

      const result = await service.remove('admin-user', 'review-1', true);

      expect(result).toEqual(mockReview);
    });

    it('should throw ForbiddenException when deleting others review as non-admin', async () => {
      mockPrisma.review.findUnique.mockResolvedValue({
        id: 'review-1',
        userId: 'other-user',
        placeId: 'place-1',
      });

      await expect(service.remove('user-1', 'review-1', false)).rejects.toThrow(
        ForbiddenException
      );
    });
  });
});
