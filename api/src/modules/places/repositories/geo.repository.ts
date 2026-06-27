import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface NearbyPlace {
  id: string;
  name: string;
  description: string | null;
  address: string;
  phone: string | null;
  rating_avg: number;
  rating_count: number;
  category_name: string;
  category_icon: string;
  primary_photo: string | null;
  distance_meters: number;
}

export interface ClusterResult {
  cluster_id: number;
  cluster_count: number;
  avg_lat: number;
  avg_lng: number;
}

@Injectable()
export class GeoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findNearby(
    latitude: number,
    longitude: number,
    radiusMeters: number = 5000,
    limit: number = 20,
    categoryId?: string,
  ): Promise<NearbyPlace[]> {
    const categoryFilter = categoryId
      ? `AND p.category_id = '${categoryId}'`
      : '';

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
    const categoryFilter = categoryId
      ? `AND p.category_id = '${categoryId}'`
      : '';

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
