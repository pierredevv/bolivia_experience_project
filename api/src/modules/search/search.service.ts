import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AdvancedSearchDto } from './dto/advanced-search.dto';
import { PaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(query: string, categoryId?: string) {
    const where: any = {
      isActive: true,
      OR: [
        { name: { contains: query } },
        { description: { contains: query } },
        { address: { contains: query } },
      ],
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const places = await this.prisma.place.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, icon: true } },
        photos: { take: 1, orderBy: { displayOrder: 'asc' } },
      },
      orderBy: { ratingAvg: 'desc' },
      take: 20,
    });

    return places;
  }

  async advancedSearch(dto: AdvancedSearchDto) {
    const where: any = {
      isActive: true,
    };

    // Text search
    if (dto.q) {
      where.OR = [
        { name: { contains: dto.q, mode: 'insensitive' } },
        { description: { contains: dto.q, mode: 'insensitive' } },
        { address: { contains: dto.q, mode: 'insensitive' } },
      ];
    }

    // Category filter
    if (dto.categoryId) {
      where.categoryId = dto.categoryId;
    }

    // Rating filter
    if (dto.minRating || dto.maxRating) {
      where.ratingAvg = {};
      if (dto.minRating) {
        where.ratingAvg.gte = dto.minRating;
      }
      if (dto.maxRating) {
        where.ratingAvg.lte = dto.maxRating;
      }
    }

    // Featured filter
    if (dto.featured !== undefined) {
      where.isFeatured = dto.featured;
    }

    // Build orderBy
    let orderBy: any = { ratingAvg: 'desc' };
    if (dto.sortBy) {
      const order = dto.sortOrder === 'asc' ? 'asc' : 'desc';
      orderBy = { [dto.sortBy]: order };
    }

    const skip = ((dto.page ?? 1) - 1) * (dto.limit ?? 20);

    const [places, total] = await Promise.all([
      this.prisma.place.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, icon: true } },
          photos: { take: 1, orderBy: { displayOrder: 'asc' } },
        },
        orderBy,
        skip,
        take: dto.limit,
      }),
      this.prisma.place.count({ where }),
    ]);

    // If location-based search, calculate distances
    if (dto.lat && dto.lng && dto.radius) {
      const placesWithDistance = places.map((place) => {
        const distance = this.calculateDistance(
          dto.lat!,
          dto.lng!,
          Number(place.latitude),
          Number(place.longitude),
        );
        return { ...place, distance };
      });

      // Filter by radius
      const filtered = placesWithDistance.filter((p) => p.distance <= dto.radius!);

      // Sort by distance if requested
      if (dto.sortBy === 'distance') {
        filtered.sort((a, b) =>
          dto.sortOrder === 'asc' ? a.distance - b.distance : b.distance - a.distance,
        );
      }

      return new PaginatedResponse(filtered, filtered.length, dto.page ?? 1, dto.limit ?? 20);
    }

    return new PaginatedResponse(places, total, dto.page ?? 1, dto.limit ?? 20);
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  async suggestions(query: string) {
    const places = await this.prisma.place.findMany({
      where: {
        isActive: true,
        name: { contains: query },
      },
      select: { id: true, name: true, address: true },
      take: 5,
    });

    return places;
  }

  async getHistory(userId: string) {
    return this.prisma.searchHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  async saveSearch(userId: string | null, query: string, resultsCount: number) {
    return this.prisma.searchHistory.create({
      data: { userId, query, resultsCount },
    });
  }
}
