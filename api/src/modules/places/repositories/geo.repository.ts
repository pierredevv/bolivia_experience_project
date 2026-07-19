import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
    const categoryCondition = categoryId
      ? Prisma.sql`AND p.category_id = ${categoryId}::uuid`
      : Prisma.empty;

    const rows = await this.prisma.$queryRaw<NearbyPlace[]>`
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
        ST_Distance(
          p.location::geography,
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
        ) as distance_meters
      FROM places p
      JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
        AND ST_DWithin(
          p.location::geography,
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
          ${radiusMeters}
        )
        ${categoryCondition}
      ORDER BY distance_meters ASC
      LIMIT ${limit}
    `;

    return rows;
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

    const rows = await this.prisma.$queryRaw<ClusterResult[]>`
      SELECT 
        FLOOR((latitude::float - ${southWestLat}) / ${latStep}) * 5 +
        FLOOR((longitude::float - ${southWestLng}) / ${lngStep}) as cluster_id,
        COUNT(*) as cluster_count,
        AVG(latitude::float)::DECIMAL(10,8) as avg_lat,
        AVG(longitude::float)::DECIMAL(11,8) as avg_lng
      FROM places
      WHERE is_active = true
      AND location &&& ST_MakeEnvelope(${southWestLng}, ${southWestLat}, ${northEastLng}, ${northEastLat}, 4326)
      GROUP BY cluster_id
      ORDER BY cluster_count DESC
    `;

    return rows;
  }

  async findByBounds(
    northEastLat: number,
    northEastLng: number,
    southWestLat: number,
    southWestLng: number,
    categoryId?: string,
  ): Promise<NearbyPlace[]> {
    const categoryCondition = categoryId
      ? Prisma.sql`AND p.category_id = ${categoryId}::uuid`
      : Prisma.empty;

    const rows = await this.prisma.$queryRaw<NearbyPlace[]>`
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
      AND p.location &&& ST_MakeEnvelope(${southWestLng}, ${southWestLat}, ${northEastLng}, ${northEastLat}, 4326)
        ${categoryCondition}
      ORDER BY p.rating_avg DESC, p.rating_count DESC
      LIMIT 100
    `;

    return rows;
  }
}
