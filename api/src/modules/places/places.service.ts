import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlaceDto, UpdatePlaceDto, QueryPlacesDto } from './dto';
import { PaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class PlacesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryPlacesDto) {
    const where: any = { isActive: true };

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [places, total] = await Promise.all([
      this.prisma.place.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, icon: true } },
          photos: { take: 1, orderBy: { displayOrder: 'asc' } },
        },
        orderBy: { ratingAvg: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
      this.prisma.place.count({ where }),
    ]);

    return new PaginatedResponse(places, total, query.page ?? 1, query.limit ?? 20);
  }

  async findFeatured() {
    return this.prisma.place.findMany({
      where: { isFeatured: true, isActive: true },
      include: {
        category: { select: { id: true, name: true, icon: true } },
        photos: { take: 1, orderBy: { displayOrder: 'asc' } },
      },
      orderBy: { ratingAvg: 'desc' },
      take: 10,
    });
  }

  async findById(id: string) {
    const place = await this.prisma.place.findUnique({
      where: { id },
      include: {
        category: true,
        owner: { select: { id: true, name: true, photoUrl: true } },
        photos: { orderBy: { displayOrder: 'asc' } },
        hours: { orderBy: { dayOfWeek: 'asc' } },
        reviews: {
          where: { isApproved: true },
          include: { user: { select: { id: true, name: true, photoUrl: true } } },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: { reviews: { where: { isApproved: true } }, favorites: true },
        },
      },
    });

    if (!place) {
      throw new NotFoundException('Place not found');
    }

    return place;
  }

  async create(dto: CreatePlaceDto) {
    return this.prisma.place.create({
      data: dto,
      include: { category: true },
    });
  }

  async update(id: string, dto: UpdatePlaceDto) {
    await this.findPlaceOrThrow(id);
    return this.prisma.place.update({
      where: { id },
      data: dto,
      include: { category: true },
    });
  }

  async toggleStatus(id: string) {
    const place = await this.findPlaceOrThrow(id);
    return this.prisma.place.update({
      where: { id },
      data: { isActive: !place.isActive },
    });
  }

  async remove(id: string) {
    await this.findPlaceOrThrow(id);
    return this.prisma.place.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async addPhoto(placeId: string, url: string, altText?: string) {
    const maxOrder = await this.prisma.placePhoto.aggregate({
      where: { placeId },
      _max: { displayOrder: true },
    });

    return this.prisma.placePhoto.create({
      data: {
        placeId,
        url,
        altText,
        displayOrder: (maxOrder._max.displayOrder || 0) + 1,
      },
    });
  }

  async getPhotos(placeId: string) {
    return this.prisma.placePhoto.findMany({
      where: { placeId },
      orderBy: { displayOrder: 'asc' },
    });
  }

  private async findPlaceOrThrow(id: string) {
    const place = await this.prisma.place.findUnique({ where: { id } });
    if (!place) {
      throw new NotFoundException('Place not found');
    }
    return place;
  }
}
