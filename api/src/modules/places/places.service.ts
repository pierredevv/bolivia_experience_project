import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreatePlaceDto, UpdatePlaceDto, QueryPlacesDto } from "./dto";
import { PaginatedResponse } from "../../common/dto/pagination.dto";
import {
  PlacesScoringService,
  TripPreferences,
} from "./places-scoring.service";

@Injectable()
export class PlacesService {
  constructor(
    private prisma: PrismaService,
    private scoringService: PlacesScoringService,
  ) {}

  async findAll(query: QueryPlacesDto) {
    const where: any = {};
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    // Admin can see all places (active + inactive), public only sees active
    if (query.allStatuses) {
      // Don't filter by isActive
    } else if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    } else {
      where.isActive = true;
    }

    // Support filtering by categorySlug (resolve to categoryId)
    if (query.categorySlug) {
      const category = await this.prisma.category.findUnique({
        where: { slug: query.categorySlug },
        select: { id: true },
      });
      if (category) {
        where.categoryId = category.id;
      } else {
        // Category not found, return empty results
        return new PaginatedResponse([], 0, page, limit);
      }
    } else if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    // Exclude a category by slug (e.g. notCategorySlug=hoteles for 'Cosas que Hacer')
    if (query.notCategorySlug) {
      const excluded = await this.prisma.category.findUnique({
        where: { slug: query.notCategorySlug },
        select: { id: true },
      });
      if (excluded) {
        where.NOT = { ...(where.NOT || {}), categoryId: excluded.id };
      }
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { address: { contains: query.search } },
      ];
    }

    // City filter
    if (query.city) {
      where.city = query.city;
    }

    // Advanced filters
    if (query.minRating) {
      where.ratingAvg = { gte: query.minRating };
    }

    if (query.isOpenNow) {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      where.hours = {
        some: {
          dayOfWeek,
          openTime: { lte: currentTime },
          closeTime: { gte: currentTime },
        },
      };
    }

    // Sorting
    let orderBy: any = { ratingAvg: "desc" };
    if (query.sortBy === "name") {
      orderBy = { name: "asc" };
    } else if (query.sortBy === "newest") {
      orderBy = { createdAt: "desc" };
    }

    const [places, total] = await Promise.all([
      this.prisma.place.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, icon: true } },
          photos: { take: 1, orderBy: { displayOrder: "asc" } },
          _count: {
            select: { products: { where: this.reservableProductFilter() } },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.place.count({ where }),
    ]);

    // Filter by distance if coordinates provided
    let filteredPlaces = places.map((p) => this.withCanReserve(p));
    if (query.maxDistance && query.latitude && query.longitude) {
      filteredPlaces = places
        .map((p) => this.withCanReserve(p))
        .filter((place: any) => {
          if (!place.latitude || !place.longitude) return false;
          const distance = this.calculateDistance(
            query.latitude!,
            query.longitude!,
            place.latitude,
            place.longitude,
          );
          (place as any).distance = Math.round(distance);
          return distance <= query.maxDistance!;
        });
      filteredPlaces.sort((a: any, b: any) => a.distance - b.distance);
    }

    return new PaginatedResponse(
      filteredPlaces,
      filteredPlaces.length,
      page,
      limit,
    );
  }

  /**
   * Find all places scored and sorted by match against trip preferences.
   * This NEVER filters (excludes) places — it only REORDERS them.
   * Places with priceLevel=null get a neutral score (middle of the list).
   */
  async findAllScored(preferences: TripPreferences, query: QueryPlacesDto) {
    const where: any = { isActive: true };
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    // Apply basic filters (category, search, city) but NOT ordering from DB
    if (query.categorySlug) {
      const category = await this.prisma.category.findUnique({
        where: { slug: query.categorySlug },
        select: { id: true },
      });
      if (category) {
        where.categoryId = category.id;
      } else {
        return new PaginatedResponse([], 0, page, limit);
      }
    } else if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    // Exclude a category by slug (e.g. notCategorySlug=hoteles for 'Cosas que Hacer')
    if (query.notCategorySlug) {
      const excluded = await this.prisma.category.findUnique({
        where: { slug: query.notCategorySlug },
        select: { id: true },
      });
      if (excluded) {
        where.NOT = { ...(where.NOT || {}), categoryId: excluded.id };
      }
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { address: { contains: query.search } },
      ];
    }

    if (query.city) {
      where.city = query.city;
    }

    if (query.minRating) {
      where.ratingAvg = { gte: query.minRating };
    }

    // Fetch ALL matching places (no pagination yet — we need to score first, then paginate)
    const allPlaces = await this.prisma.place.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, icon: true } },
        photos: { take: 1, orderBy: { displayOrder: "asc" } },
        _count: {
          select: { products: { where: this.reservableProductFilter() } },
        },
      },
    });

    // Score and sort all places
    const scored = this.scoringService.scoreAndSort(allPlaces, preferences);

    // Now paginate the scored results
    const total = scored.length;
    const skip = (page - 1) * limit;
    const paginated = scored.slice(skip, skip + limit);

    return new PaginatedResponse(
      paginated.map((p) => this.withCanReserve(p)),
      total,
      page,
      limit,
    );
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Productos que se pueden reservar: activos y con modalidad de reserva definida.
  private reservableProductFilter() {
    return { isActive: true, modalidadReserva: { not: "ninguna" } };
  }

  // Añade canReserve y elimina el _count interno de la respuesta.
  private withCanReserve(place: any) {
    const { _count, ...rest } = place;
    return { ...rest, canReserve: (_count?.products ?? 0) > 0 };
  }

  async findFeatured() {
    const places = await this.prisma.place.findMany({
      where: { isFeatured: true, isActive: true },
      include: {
        category: { select: { id: true, name: true, icon: true } },
        photos: { take: 1, orderBy: { displayOrder: "asc" } },
        _count: {
          select: { products: { where: this.reservableProductFilter() } },
        },
      },
      orderBy: { ratingAvg: "desc" },
      take: 10,
    });
    return places.map((p) => this.withCanReserve(p));
  }

  /**
   * Feed de lugares para el top bar de "Cosas que hacer": filtra por categoría
   * (categorySlug) o devuelve todo el contenido no-hotel si no se indica.
   * Forma compacta de tarjeta (photo, rating, canReserve).
   */
  async findFeed(categorySlug?: string) {
    const where: any = { isActive: true };
    if (categorySlug) {
      const category = await this.prisma.category.findUnique({
        where: { slug: categorySlug },
        select: { id: true },
      });
      if (category) {
        where.categoryId = category.id;
      } else {
        return { data: [], meta: { total: 0, categorySlug } };
      }
    } else {
      const excluded = await this.prisma.category.findUnique({
        where: { slug: "hoteles" },
        select: { id: true },
      });
      if (excluded) {
        where.NOT = { categoryId: excluded.id };
      }
    }

    const places = await this.prisma.place.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, slug: true, icon: true } },
        photos: { take: 1, orderBy: { displayOrder: "asc" } },
        _count: {
          select: { products: { where: this.reservableProductFilter() } },
        },
      },
      orderBy: [{ ratingAvg: "desc" }, { name: "asc" }],
    });

    const data = places.map((p) => this.withCanReserve(p));
    return { data, meta: { total: data.length, categorySlug: categorySlug ?? null } };
  }

  async findById(id: string) {
    const place = await this.prisma.place.findUnique({
      where: { id },
      include: {
        category: true,
        owner: { select: { id: true, name: true, photoUrl: true } },
        photos: { orderBy: { displayOrder: "asc" } },
        hours: { orderBy: { dayOfWeek: "asc" } },
        reviews: {
          where: { status: "PUBLISHED" },
          include: {
            user: { select: { id: true, name: true, photoUrl: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        _count: {
          select: {
            reviews: { where: { status: "PUBLISHED" } },
            favorites: true,
            products: { where: this.reservableProductFilter() },
          },
        },
        products: {
          where: this.reservableProductFilter(),
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            currency: true,
            capacity: true,
            modalidadReserva: true,
            type: true,
          },
        },
      },
    });

    if (!place) {
      throw new NotFoundException("Place not found");
    }

    const enriched = await this.scoringService.enrichWithPriceVerified(place);
    return this.withCanReserve(enriched);
  }

  async create(dto: CreatePlaceDto) {
    const { photos, ...rest } = dto;
    const placeData: any = { ...rest };
    if (placeData.priceLevel !== undefined && placeData.priceLevel !== null) {
      placeData.priceUpdatedAt = new Date();
    }
    return this.prisma.place.create({
      data: {
        ...placeData,
        ...(photos &&
          photos.length > 0 && {
            photos: {
              create: photos.map((p, index) => ({
                url: p.url,
                displayOrder: index,
              })),
            },
          }),
      },
      include: { category: true, photos: { orderBy: { displayOrder: "asc" } } },
    });
  }

  async update(id: string, dto: UpdatePlaceDto) {
    await this.findPlaceOrThrow(id);

    const { photos, ...placeData } = dto;

    return this.prisma.place.update({
      where: { id },
      data: {
        ...placeData,
        ...(photos !== undefined && {
          photos: {
            deleteMany: {},
            create: photos.map((p, index) => ({
              url: p.url,
              displayOrder: index,
            })),
          },
        }),
      },
      include: { category: true, photos: { orderBy: { displayOrder: "asc" } } },
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
    return this.prisma.place.delete({ where: { id } });
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
      orderBy: { displayOrder: "asc" },
    });
  }

  private async findPlaceOrThrow(id: string) {
    const place = await this.prisma.place.findUnique({ where: { id } });
    if (!place) {
      throw new NotFoundException("Place not found");
    }
    return place;
  }
}
