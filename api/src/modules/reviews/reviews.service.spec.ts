import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let prisma: {
    review: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    reviewReply: {
      create: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      review: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      reviewReply: {
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('respond', () => {
    it('should throw NotFoundException if review not found', async () => {
      prisma.review.findUnique.mockResolvedValue(null);

      await expect(
        service.respond('user-1', 'review-999', 'Thanks!', 'empresa'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if empresa user is not owner', async () => {
      prisma.review.findUnique.mockResolvedValue({
        id: 'review-1',
        place: { ownerId: 'owner-1' },
      });

      await expect(
        service.respond('user-2', 'review-1', 'Thanks!', 'empresa'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow empresa user to respond to own place reviews', async () => {
      prisma.review.findUnique.mockResolvedValue({
        id: 'review-1',
        place: { ownerId: 'user-1' },
      });
      prisma.reviewReply.create.mockResolvedValue({
        id: 'reply-1',
        comment: 'Thanks!',
      });

      const result = await service.respond('user-1', 'review-1', 'Thanks!', 'empresa');

      expect(result.comment).toBe('Thanks!');
    });

    it('should allow admin to respond to any review', async () => {
      prisma.review.findUnique.mockResolvedValue({
        id: 'review-1',
        place: { ownerId: 'owner-1' },
      });
      prisma.reviewReply.create.mockResolvedValue({
        id: 'reply-1',
        comment: 'Admin response',
      });

      const result = await service.respond('admin-1', 'review-1', 'Admin response', 'admin');

      expect(result.comment).toBe('Admin response');
    });
  });

  describe('create', () => {
    it('should throw ConflictException if user already reviewed place', async () => {
      prisma.review.findUnique.mockResolvedValue({
        id: 'existing-review',
        userId: 'user-1',
        placeId: 'place-1',
      });

      await expect(
        service.create('user-1', 'place-1', { rating: 5, comment: 'Great!' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should throw ForbiddenException if not own review', async () => {
      prisma.review.findUnique.mockResolvedValue({
        id: 'review-1',
        userId: 'user-2',
      });

      await expect(
        service.update('user-1', 'review-1', { rating: 4 }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should throw ForbiddenException if not own review and not admin', async () => {
      prisma.review.findUnique.mockResolvedValue({
        id: 'review-1',
        userId: 'user-2',
      });

      await expect(
        service.remove('user-1', 'review-1', false),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow admin to delete any review', async () => {
      prisma.review.findUnique.mockResolvedValue({
        id: 'review-1',
        userId: 'user-2',
      });
      prisma.review.delete.mockResolvedValue({ id: 'review-1' });

      const result = await service.remove('admin-1', 'review-1', true);

      expect(result.id).toBe('review-1');
    });
  });
});
