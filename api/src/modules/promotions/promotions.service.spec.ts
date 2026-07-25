import { Test, TestingModule } from '@nestjs/testing';
import { PromotionsService } from './promotions.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('PromotionsService', () => {
  let service: PromotionsService;
  let prisma: PrismaService;

  const mockPrisma = {
    promotion: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    place: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromotionsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PromotionsService>(PromotionsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findActive', () => {
    it('should return active promotions', async () => {
      const mockPromotions = [
        {
          id: 'promo-1',
          title: '2x1 en almuerzos',
          isActive: true,
          startDate: new Date('2026-07-01'),
          endDate: new Date('2026-12-31'),
          place: {
            id: 'place-1',
            name: 'El Palmar',
            photos: [],
          },
        },
      ];

      mockPrisma.promotion.findMany.mockResolvedValue(mockPromotions);
      mockPrisma.promotion.count.mockResolvedValue(1);

      const result = await service.findActive();

      expect(result.data).toEqual(mockPromotions);
      expect(result.meta.total).toBe(1);
      expect(mockPrisma.promotion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isActive: true }),
        })
      );
    });
  });

  describe('findById', () => {
    it('should return promotion by id', async () => {
      const mockPromotion = {
        id: 'promo-1',
        title: '2x1 en almuerzos',
        place: { id: 'place-1', name: 'El Palmar' },
      };

      mockPrisma.promotion.findUnique.mockResolvedValue(mockPromotion);

      const result = await service.findById('promo-1');

      expect(result).toEqual(mockPromotion);
    });

    it('should throw NotFoundException for invalid id', async () => {
      mockPrisma.promotion.findUnique.mockResolvedValue(null);

      await expect(service.findById('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create promotion for owned place (empresa)', async () => {
      const createData = {
        title: '2x1 en almuerzos',
        description: 'Todos los martes',
        startDate: new Date('2026-07-01'),
        endDate: new Date('2026-12-31'),
      };

      const mockCreatedPromotion = {
        id: 'promo-new',
        ...createData,
        placeId: 'place-1',
        isActive: true,
      };

      mockPrisma.place.findUnique.mockResolvedValue({ id: 'place-1', ownerId: 'user-1' });
      mockPrisma.promotion.create.mockResolvedValue(mockCreatedPromotion);

      const result = await service.create('user-1', 'empresa', 'place-1', createData);

      expect(result).toEqual(mockCreatedPromotion);
      expect(mockPrisma.promotion.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ placeId: 'place-1' }),
      });
    });

    it('should create promotion for any place (admin)', async () => {
      const createData = {
        title: 'Admin Promotion',
        startDate: new Date('2026-07-01'),
        endDate: new Date('2026-12-31'),
      };

      const mockCreatedPromotion = {
        id: 'promo-new',
        ...createData,
        placeId: 'place-other',
        isActive: true,
      };

      mockPrisma.promotion.create.mockResolvedValue(mockCreatedPromotion);

      const result = await service.create('admin-1', 'admin', 'place-other', createData);

      expect(result).toEqual(mockCreatedPromotion);
    });

    it('should throw ForbiddenException when empresa tries to create for unowned place', async () => {
      const createData = {
        title: 'Unauthorized Promotion',
        startDate: new Date('2026-07-01'),
        endDate: new Date('2026-12-31'),
      };

      mockPrisma.place.findUnique.mockResolvedValue({ id: 'place-other', ownerId: 'other-user' });

      await expect(
        service.create('user-1', 'empresa', 'place-other', createData)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should update own promotion (empresa)', async () => {
      const updateData = { title: 'Updated Promotion' };

      mockPrisma.promotion.findUnique.mockResolvedValue({
        id: 'promo-1',
        title: 'Old Title',
        placeId: 'place-1',
      });
      mockPrisma.place.findUnique.mockResolvedValue({ id: 'place-1', ownerId: 'user-1' });
      mockPrisma.promotion.update.mockResolvedValue({
        id: 'promo-1',
        ...updateData,
      });

      const result = await service.update('user-1', 'empresa', 'promo-1', updateData);

      expect(result.title).toBe('Updated Promotion');
    });

    it('should update any promotion (admin)', async () => {
      const updateData = { title: 'Admin Updated' };

      mockPrisma.promotion.findUnique.mockResolvedValue({
        id: 'promo-1',
        title: 'Old Title',
        placeId: 'place-other',
      });
      mockPrisma.promotion.update.mockResolvedValue({
        id: 'promo-1',
        ...updateData,
      });

      const result = await service.update('admin-1', 'admin', 'promo-1', updateData);

      expect(result.title).toBe('Admin Updated');
    });

    it('should throw NotFoundException when updating nonexistent promotion', async () => {
      mockPrisma.promotion.findUnique.mockResolvedValue(null);

      await expect(
        service.update('user-1', 'empresa', 'invalid-id', { title: 'Test' })
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when empresa updates unowned promotion', async () => {
      mockPrisma.promotion.findUnique.mockResolvedValue({
        id: 'promo-1',
        placeId: 'place-other',
      });
      mockPrisma.place.findUnique.mockResolvedValue({ id: 'place-other', ownerId: 'other-user' });

      await expect(
        service.update('user-1', 'empresa', 'promo-1', { title: 'Test' })
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete own promotion (empresa)', async () => {
      const mockPromotion = { id: 'promo-1', title: 'Promotion to Delete', placeId: 'place-1' };

      mockPrisma.promotion.findUnique.mockResolvedValue(mockPromotion);
      mockPrisma.place.findUnique.mockResolvedValue({ id: 'place-1', ownerId: 'user-1' });
      mockPrisma.promotion.delete.mockResolvedValue(mockPromotion);

      const result = await service.remove('user-1', 'empresa', 'promo-1');

      expect(result).toEqual(mockPromotion);
      expect(mockPrisma.promotion.delete).toHaveBeenCalledWith({ where: { id: 'promo-1' } });
    });

    it('should delete any promotion (admin)', async () => {
      const mockPromotion = { id: 'promo-1', title: 'Admin Delete', placeId: 'place-other' };

      mockPrisma.promotion.findUnique.mockResolvedValue(mockPromotion);
      mockPrisma.promotion.delete.mockResolvedValue(mockPromotion);

      const result = await service.remove('admin-1', 'admin', 'promo-1');

      expect(result).toEqual(mockPromotion);
    });

    it('should throw NotFoundException when deleting nonexistent promotion', async () => {
      mockPrisma.promotion.findUnique.mockResolvedValue(null);

      await expect(
        service.remove('user-1', 'empresa', 'invalid-id')
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when empresa deletes unowned promotion', async () => {
      mockPrisma.promotion.findUnique.mockResolvedValue({
        id: 'promo-1',
        placeId: 'place-other',
      });
      mockPrisma.place.findUnique.mockResolvedValue({ id: 'place-other', ownerId: 'other-user' });

      await expect(
        service.remove('user-1', 'empresa', 'promo-1')
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
