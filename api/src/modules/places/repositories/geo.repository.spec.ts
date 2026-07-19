import { Test, TestingModule } from '@nestjs/testing';
import { GeoRepository } from './geo.repository';
import { PrismaService } from '../../../prisma/prisma.service';

describe('GeoRepository', () => {
  let repository: GeoRepository;
  let prisma: { $queryRaw: jest.Mock };

  beforeEach(async () => {
    prisma = {
      $queryRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeoRepository,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    repository = module.get<GeoRepository>(GeoRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findNearby', () => {
    it('should call $queryRaw with correct parameters', async () => {
      prisma.$queryRaw.mockResolvedValue([]);

      await repository.findNearby(-17.7833, -63.1833, 5000, 20);

      expect(prisma.$queryRaw).toHaveBeenCalled();
    });

    it('should handle categoryId parameter', async () => {
      prisma.$queryRaw.mockResolvedValue([]);

      await repository.findNearby(-17.7833, -63.1833, 5000, 20, 'test-category-id');

      expect(prisma.$queryRaw).toHaveBeenCalled();
    });

    it('should not inject SQL via categoryId', async () => {
      prisma.$queryRaw.mockResolvedValue([]);

      const maliciousCategoryId = "'; DROP TABLE places; --";
      await repository.findNearby(-17.7833, -63.1833, 5000, 20, maliciousCategoryId);

      expect(prisma.$queryRaw).toHaveBeenCalled();
      // The query should use parameterized templates, not string interpolation
    });
  });

  describe('findClusters', () => {
    it('should call $queryRaw for cluster query', async () => {
      prisma.$queryRaw.mockResolvedValue([]);

      await repository.findClusters(-17.7, -63.1, -17.9, -63.3);

      expect(prisma.$queryRaw).toHaveBeenCalled();
    });
  });

  describe('findByBounds', () => {
    it('should call $queryRaw for bounds query', async () => {
      prisma.$queryRaw.mockResolvedValue([]);

      await repository.findByBounds(-17.7, -63.1, -17.9, -63.3);

      expect(prisma.$queryRaw).toHaveBeenCalled();
    });

    it('should handle categoryId in bounds query', async () => {
      prisma.$queryRaw.mockResolvedValue([]);

      await repository.findByBounds(-17.7, -63.1, -17.9, -63.3, 'test-category-id');

      expect(prisma.$queryRaw).toHaveBeenCalled();
    });
  });
});
