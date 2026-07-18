import { Test, TestingModule } from '@nestjs/testing';
import { EmpresaService } from './empresa.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('EmpresaService', () => {
  let service: EmpresaService;
  let prisma: PrismaService;

  const mockPrisma = {
    place: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    review: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    favorite: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmpresaService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<EmpresaService>(EmpresaService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOwnerPlace', () => {
    it('should return place for owner', async () => {
      const mockPlace = {
        id: 'place-1',
        name: 'El Palmar',
        ownerId: 'user-1',
        category: { id: 'cat-1', name: 'Restaurantes', slug: 'restaurantes' },
        photos: [],
        hours: [],
        _count: { reviews: 10, favorites: 5 },
      };

      mockPrisma.place.findFirst.mockResolvedValue(mockPlace);

      const result = await service.getOwnerPlace('user-1');

      expect(result).toEqual(mockPlace);
      expect(mockPrisma.place.findFirst).toHaveBeenCalledWith({
        where: { ownerId: 'user-1' },
        include: expect.objectContaining({
          category: expect.anything(),
          photos: expect.anything(),
          hours: expect.anything(),
          _count: expect.anything(),
        }),
      });
    });

    it('should throw NotFoundException if no place', async () => {
      mockPrisma.place.findFirst.mockResolvedValue(null);

      await expect(service.getOwnerPlace('invalid-user')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateOwnerPlace', () => {
    it('should update owner place', async () => {
      const mockPlace = {
        id: 'place-1',
        name: 'El Palmar',
        ownerId: 'user-1',
      };

      const updateDto = { name: 'El Palmar Updated' };

      mockPrisma.place.findFirst.mockResolvedValue(mockPlace);
      mockPrisma.place.update.mockResolvedValue({
        ...mockPlace,
        ...updateDto,
        category: { id: 'cat-1', name: 'Restaurantes', slug: 'restaurantes' },
        photos: [],
        hours: [],
      });

      const result = await service.updateOwnerPlace('user-1', updateDto);

      expect(result.name).toBe('El Palmar Updated');
      expect(mockPrisma.place.update).toHaveBeenCalledWith({
        where: { id: 'place-1' },
        data: updateDto,
        include: expect.objectContaining({
          category: expect.anything(),
          photos: expect.anything(),
          hours: expect.anything(),
        }),
      });
    });

    it('should throw NotFoundException if no place', async () => {
      mockPrisma.place.findFirst.mockResolvedValue(null);

      await expect(
        service.updateOwnerPlace('invalid-user', { name: 'Test' })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getOwnerReviews', () => {
    it('should return reviews for owner place', async () => {
      const mockPlace = {
        id: 'place-1',
        name: 'El Palmar',
        ownerId: 'user-1',
      };

      const mockReviews = [
        {
          id: 'review-1',
          rating: 5,
          comment: 'Excellent!',
          user: { id: 'user-1', name: 'Test User', email: 'test@example.com', photoUrl: null },
          replies: [],
        },
      ];

      mockPrisma.place.findFirst.mockResolvedValue(mockPlace);
      mockPrisma.review.findMany.mockResolvedValue(mockReviews);
      mockPrisma.review.count.mockResolvedValue(1);

      const result = await service.getOwnerReviews('user-1', { skip: 0, limit: 20 });

      expect(result.data).toEqual(mockReviews);
      expect(result.meta.total).toBe(1);
    });

    it('should throw NotFoundException if no place', async () => {
      mockPrisma.place.findFirst.mockResolvedValue(null);

      await expect(
        service.getOwnerReviews('invalid-user', { skip: 0, limit: 20 })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getOwnerStats', () => {
    it('should return stats for owner place', async () => {
      const mockPlace = {
        id: 'place-1',
        name: 'El Palmar',
        ownerId: 'user-1',
        ratingAvg: 4.5,
        ratingCount: 25,
      };

      mockPrisma.place.findFirst.mockResolvedValue(mockPlace);
      mockPrisma.review.count.mockResolvedValue(25);
      mockPrisma.favorite.count.mockResolvedValue(10);

      const result = await service.getOwnerStats('user-1');

      expect(result.placeId).toBe('place-1');
      expect(result.placeName).toBe('El Palmar');
      expect(result.ratingAvg).toBe(4.5);
      expect(result.ratingCount).toBe(25);
      expect(result.totalReviews).toBe(25);
      expect(result.favoriteCount).toBe(10);
    });

    it('should throw NotFoundException if no place', async () => {
      mockPrisma.place.findFirst.mockResolvedValue(null);

      await expect(service.getOwnerStats('invalid-user')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getOwnerDashboard', () => {
    it('should return dashboard with place, reviews, favorites', async () => {
      const mockPlace = {
        id: 'place-1',
        name: 'El Palmar',
        address: 'Av. Monseñor 456',
        ownerId: 'user-1',
        ratingAvg: 4.5,
        ratingCount: 25,
      };

      const mockReviews = [
        {
          id: 'review-1',
          rating: 5,
          comment: 'Excellent!',
          createdAt: new Date(),
          user: { id: 'user-1', name: 'Test User' },
        },
      ];

      mockPrisma.place.findFirst.mockResolvedValue(mockPlace);
      mockPrisma.review.count.mockResolvedValue(25);
      mockPrisma.favorite.count.mockResolvedValue(10);
      mockPrisma.review.findMany.mockResolvedValue(mockReviews);

      const result = await service.getOwnerDashboard('user-1');

      expect(result.place).toBeDefined();
      expect(result.place.id).toBe('place-1');
      expect(result.place.name).toBe('El Palmar');
      expect(result.place.totalReviews).toBe(25);
      expect(result.place.favoriteCount).toBe(10);
      expect(result.recentReviews).toEqual(mockReviews);
    });

    it('should throw NotFoundException if no place', async () => {
      mockPrisma.place.findFirst.mockResolvedValue(null);

      await expect(service.getOwnerDashboard('invalid-user')).rejects.toThrow(NotFoundException);
    });
  });
});
