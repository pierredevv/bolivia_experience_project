import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../../prisma/prisma.service";

export interface NearbyPlace {
  id: string;
  name: string;
  description: string | null;
  address: string;
  phone: string | null;
  latitude: number;
  longitude: number;
  rating_avg: number;
  rating_count: number;
  category_name: string;
  category_icon: string;
  primary_photo: string | null;
  distance_meters: number;
  can_reserve: boolean;
}

export interface ClusterResult {
  cluster_id: number;
  cluster_count: number;
  avg_lat: number;
  avg_lng: number;
}

@Injectable()
export class GeoRepository {
  private isSQLite: boolean;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const dbUrl = this.configService.get("DATABASE_URL", "");
    this.isSQLite = dbUrl.includes("file:");
  }

  // Haversine formula implemented in JavaScript for SQLite
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371000; // Earth radius in meters
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  async findNearby(
    latitude: number,
    longitude: number,
    radiusMeters: number = 5000,
    limit: number = 20,
    categoryId?: string,
  ): Promise<NearbyPlace[]> {
    if (this.isSQLite) {
      return this.findNearbySQLite(
        latitude,
        longitude,
        radiusMeters,
        limit,
        categoryId,
      );
    }
    return this.findNearbyPostgres(
      latitude,
      longitude,
      radiusMeters,
      limit,
      categoryId,
    );
  }

  private async findNearbySQLite(
    latitude: number,
    longitude: number,
    radiusMeters: number,
    limit: number,
    categoryId?: string,
  ): Promise<NearbyPlace[]> {
    const where: any = { isActive: true };
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const places = await this.prisma.place.findMany({
      where,
      include: {
        category: { select: { name: true, icon: true } },
        photos: { take: 1, orderBy: { displayOrder: "asc" } },
        _count: {
          select: {
            products: {
              where: { isActive: true, modalidadReserva: { not: "ninguna" } },
            },
          },
        },
      },
    });

    const withDistance = places
      .map((place) => ({
        id: place.id,
        name: place.name,
        description: place.description,
        address: place.address,
        phone: place.phone,
        latitude: Number(place.latitude),
        longitude: Number(place.longitude),
        rating_avg: Number(place.ratingAvg),
        rating_count: place.ratingCount,
        category_name: place.category?.name || "",
        category_icon: place.category?.icon || "",
        primary_photo: place.photos[0]?.url || null,
        distance_meters: this.calculateDistance(
          latitude,
          longitude,
          Number(place.latitude),
          Number(place.longitude),
        ),
        can_reserve: (place._count?.products ?? 0) > 0,
      }))
      .filter((p) => p.distance_meters <= radiusMeters)
      .sort((a, b) => a.distance_meters - b.distance_meters)
      .slice(0, limit);

    return withDistance;
  }

  private async findNearbyPostgres(
    latitude: number,
    longitude: number,
    radiusMeters: number,
    limit: number,
    categoryId?: string,
  ): Promise<NearbyPlace[]> {
    const categoryFilter = categoryId
      ? `AND p.category_id = '${categoryId}'`
      : "";

    const query = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.address,
        p.phone,
        p.rating_avg,
        p.rating_count,
        c.name as category_name,
        c.icon as category_icon,
        (
          SELECT url FROM place_photos 
          WHERE place_id = p.id 
          ORDER BY display_order 
          LIMIT 1
        ) as primary_photo,
        EXISTS(
          SELECT 1 FROM products pr
          WHERE pr.place_id = p.id
          AND pr.is_active = true
          AND pr.modalidad_reserva != 'ninguna'
        ) as can_reserve,
        (
          6371000 * acos(
            cos(radians(${latitude})) * cos(radians(p.latitude::float)) *
            cos(radians(p.longitude::float) - radians(${longitude})) +
            sin(radians(${latitude})) * sin(radians(p.latitude::float))
          )
        ) as distance_meters
      FROM places p
      JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
      ${categoryFilter}
      HAVING (
        6371000 * acos(
          cos(radians(${latitude})) * cos(radians(p.latitude::float)) *
          cos(radians(p.longitude::float) - radians(${longitude})) +
          sin(radians(${latitude})) * sin(radians(p.latitude::float))
        )
      ) <= ${radiusMeters}
      ORDER BY distance_meters ASC
      LIMIT ${limit}
    `;

    return this.prisma.$queryRawUnsafe<NearbyPlace[]>(query);
  }

  async findClusters(
    northEastLat: number,
    northEastLng: number,
    southWestLat: number,
    southWestLng: number,
    _epsMeters: number = 500,
  ): Promise<ClusterResult[]> {
    if (this.isSQLite) {
      return this.findClustersSQLite(
        northEastLat,
        northEastLng,
        southWestLat,
        southWestLng,
      );
    }
    return this.findClustersPostgres(
      northEastLat,
      northEastLng,
      southWestLat,
      southWestLng,
    );
  }

  private async findClustersSQLite(
    northEastLat: number,
    northEastLng: number,
    southWestLat: number,
    southWestLng: number,
  ): Promise<ClusterResult[]> {
    const places = await this.prisma.place.findMany({
      where: {
        isActive: true,
        latitude: { gte: southWestLat, lte: northEastLat },
        longitude: { gte: southWestLng, lte: northEastLng },
      },
    });

    const latStep = (northEastLat - southWestLat) / 5;
    const lngStep = (northEastLng - southWestLng) / 5;

    const clusters = new Map<
      number,
      { count: number; sumLat: number; sumLng: number }
    >();

    for (const place of places) {
      const lat = Number(place.latitude);
      const lng = Number(place.longitude);
      const clusterId =
        Math.floor((lat - southWestLat) / latStep) * 5 +
        Math.floor((lng - southWestLng) / lngStep);

      const existing = clusters.get(clusterId) || {
        count: 0,
        sumLat: 0,
        sumLng: 0,
      };
      existing.count++;
      existing.sumLat += lat;
      existing.sumLng += lng;
      clusters.set(clusterId, existing);
    }

    return Array.from(clusters.entries())
      .map(([id, data]) => ({
        cluster_id: id,
        cluster_count: data.count,
        avg_lat: data.sumLat / data.count,
        avg_lng: data.sumLng / data.count,
      }))
      .sort((a, b) => b.cluster_count - a.cluster_count);
  }

  private async findClustersPostgres(
    northEastLat: number,
    northEastLng: number,
    southWestLat: number,
    southWestLng: number,
  ): Promise<ClusterResult[]> {
    const latStep = (northEastLat - southWestLat) / 5;
    const lngStep = (northEastLng - southWestLng) / 5;

    const query = `
      SELECT 
        FLOOR((latitude::float - ${southWestLat}) / ${latStep}) * 5 +
        FLOOR((longitude::float - ${southWestLng}) / ${lngStep}) as cluster_id,
        COUNT(*) as cluster_count,
        AVG(latitude::float)::DECIMAL(10,8) as avg_lat,
        AVG(longitude::float)::DECIMAL(11,8) as avg_lng
      FROM places
      WHERE is_active = true
      AND latitude::float BETWEEN ${southWestLat} AND ${northEastLat}
      AND longitude::float BETWEEN ${southWestLng} AND ${northEastLng}
      GROUP BY cluster_id
      ORDER BY cluster_count DESC
    `;

    return this.prisma.$queryRawUnsafe<ClusterResult[]>(query);
  }

  async findByBounds(
    northEastLat: number,
    northEastLng: number,
    southWestLat: number,
    southWestLng: number,
    categoryId?: string,
  ): Promise<NearbyPlace[]> {
    if (this.isSQLite) {
      return this.findByBoundsSQLite(
        northEastLat,
        northEastLng,
        southWestLat,
        southWestLng,
        categoryId,
      );
    }
    return this.findByBoundsPostgres(
      northEastLat,
      northEastLng,
      southWestLat,
      southWestLng,
      categoryId,
    );
  }

  private async findByBoundsSQLite(
    northEastLat: number,
    northEastLng: number,
    southWestLat: number,
    southWestLng: number,
    categoryId?: string,
  ): Promise<NearbyPlace[]> {
    const where: any = {
      isActive: true,
      latitude: { gte: southWestLat, lte: northEastLat },
      longitude: { gte: southWestLng, lte: northEastLng },
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const places = await this.prisma.place.findMany({
      where,
      include: {
        category: { select: { name: true, icon: true } },
        photos: { take: 1, orderBy: { displayOrder: "asc" } },
        _count: {
          select: {
            products: {
              where: { isActive: true, modalidadReserva: { not: "ninguna" } },
            },
          },
        },
      },
      orderBy: [{ ratingAvg: "desc" }, { ratingCount: "desc" }],
      take: 100,
    });

    return places.map((place) => ({
      id: place.id,
      name: place.name,
      description: place.description,
      address: place.address,
      phone: place.phone,
      latitude: Number(place.latitude),
      longitude: Number(place.longitude),
      rating_avg: Number(place.ratingAvg),
      rating_count: place.ratingCount,
      category_name: place.category?.name || "",
      category_icon: place.category?.icon || "",
      primary_photo: place.photos[0]?.url || null,
      distance_meters: 0,
      can_reserve: (place._count?.products ?? 0) > 0,
    }));
  }

  private async findByBoundsPostgres(
    northEastLat: number,
    northEastLng: number,
    southWestLat: number,
    southWestLng: number,
    categoryId?: string,
  ): Promise<NearbyPlace[]> {
    const categoryFilter = categoryId
      ? `AND p.category_id = '${categoryId}'`
      : "";

    const query = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.address,
        p.phone,
        p.rating_avg,
        p.rating_count,
        c.name as category_name,
        c.icon as category_icon,
        (
          SELECT url FROM place_photos 
          WHERE place_id = p.id 
          ORDER BY display_order 
          LIMIT 1
        ) as primary_photo,
        EXISTS(
          SELECT 1 FROM products pr
          WHERE pr.place_id = p.id
          AND pr.is_active = true
          AND pr.modalidad_reserva != 'ninguna'
        ) as can_reserve,
        0 as distance_meters
      FROM places p
      JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
      AND p.latitude::float BETWEEN ${southWestLat} AND ${northEastLat}
      AND p.longitude::float BETWEEN ${southWestLng} AND ${northEastLng}
      ${categoryFilter}
      ORDER BY p.rating_avg DESC, p.rating_count DESC
      LIMIT 100
    `;

    return this.prisma.$queryRawUnsafe<NearbyPlace[]>(query);
  }
}
