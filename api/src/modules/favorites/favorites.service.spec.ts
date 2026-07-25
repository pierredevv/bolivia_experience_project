import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesService } from './favorites.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('FavoritesService', () => {
  let service: FavoritesService;
  let prisma: PrismaService;

  const mockPrisma = {
    favorite: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<FavoritesService>(FavoritesService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return user favorites', async () => {
      const mockFavorites = [
        { id: '1', userId: 'user1', placeId: 'place1', place: { name: 'Test Place' } },
      ];
      mockPrisma.favorite.findMany.mockResolvedValue(mockFavorites);

      const result = await service.findAll('user1');
      expect(result).toEqual(mockFavorites);
      expect(mockPrisma.favorite.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        include: expect.objectContaining({
          place: expect.any(Object),
        }),
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array for user with no favorites', async () => {
      mockPrisma.favorite.findMany.mockResolvedValue([]);
      const result = await service.findAll('user1');
      expect(result).toEqual([]);
    });
  });

  describe('add', () => {
    it('should add a favorite', async () => {
      mockPrisma.favorite.findUnique.mockResolvedValue(null);
      mockPrisma.favorite.create.mockResolvedValue({ id: '1', userId: 'user1', placeId: 'place1' });

      const result = await service.add('user1', 'place1');
      expect(result).toEqual({ id: '1', userId: 'user1', placeId: 'place1' });
    });

    it('should throw ConflictException if already in favorites', async () => {
      mockPrisma.favorite.findUnique.mockResolvedValue({ id: '1', userId: 'user1', placeId: 'place1' });

      await expect(service.add('user1', 'place1')).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove a favorite', async () => {
      mockPrisma.favorite.findUnique.mockResolvedValue({ id: '1', userId: 'user1', placeId: 'place1' });
      mockPrisma.favorite.delete.mockResolvedValue({ id: '1', userId: 'user1', placeId: 'place1' });

      const result = await service.remove('user1', 'place1');
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if favorite not found', async () => {
      mockPrisma.favorite.findUnique.mockResolvedValue(null);

      await expect(service.remove('user1', 'place1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('check', () => {
    it('should return isFavorite true when exists', async () => {
      mockPrisma.favorite.findUnique.mockResolvedValue({ id: '1' });
      const result = await service.check('user1', 'place1');
      expect(result).toEqual({ isFavorite: true });
    });

    it('should return isFavorite false when not exists', async () => {
      mockPrisma.favorite.findUnique.mockResolvedValue(null);
      const result = await service.check('user1', 'place1');
      expect(result).toEqual({ isFavorite: false });
    });
  });
});
