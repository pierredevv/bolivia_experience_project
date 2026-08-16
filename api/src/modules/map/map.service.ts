import { Injectable } from "@nestjs/common";
import { GeoRepository } from "../places/repositories/geo.repository";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class MapService {
  constructor(
    private geoRepository: GeoRepository,
    private prisma: PrismaService,
  ) {}

  async findNearby(
    latitude: number,
    longitude: number,
    radius?: number,
    categoryId?: string,
  ) {
    return this.geoRepository.findNearby(
      latitude,
      longitude,
      radius,
      20,
      categoryId,
    );
  }

  async findClusters(
    northEastLat: number,
    northEastLng: number,
    southWestLat: number,
    southWestLng: number,
  ) {
    return this.geoRepository.findClusters(
      northEastLat,
      northEastLng,
      southWestLat,
      southWestLng,
    );
  }

  async findByBounds(
    northEastLat: number,
    northEastLng: number,
    southWestLat: number,
    southWestLng: number,
    categoryId?: string,
  ) {
    return this.geoRepository.findByBounds(
      northEastLat,
      northEastLng,
      southWestLat,
      southWestLng,
      categoryId,
    );
  }

  async findSafetyZones(
    northEastLat?: number,
    northEastLng?: number,
    southWestLat?: number,
    southWestLng?: number,
  ) {
    const where: any = { isActive: true };

    const hasBounds =
      this.isFiniteNumber(northEastLat) &&
      this.isFiniteNumber(northEastLng) &&
      this.isFiniteNumber(southWestLat) &&
      this.isFiniteNumber(southWestLng);

    if (hasBounds) {
      where.latitude = { gte: southWestLat, lte: northEastLat };
      where.longitude = { gte: southWestLng, lte: northEastLng };
    }

    return this.prisma.safetyZone.findMany({
      where,
      orderBy: { name: "asc" },
    });
  }

  async checkSafetyZone(lat: number, lng: number) {
    const zones = await this.prisma.safetyZone.findMany({
      where: { isActive: true },
    });

    const result = zones.filter((zone) => {
      const distanceKm = this.haversineKm(lat, lng, Number(zone.latitude), Number(zone.longitude));
      return distanceKm <= Number(zone.radioKm);
    });

    return {
      inDangerZone: result.length > 0,
      zones: result,
    };
  }

  async findMapEvents(
    northEastLat: number,
    northEastLng: number,
    southWestLat: number,
    southWestLng: number,
  ) {
    const where: any = {
      isActive: true,
      latitude: { gte: southWestLat, lte: northEastLat },
      longitude: { gte: southWestLng, lte: northEastLng },
    };

    return this.prisma.event.findMany({
      where,
      orderBy: { dateStart: "asc" },
      take: 50,
    });
  }

  private haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private isFiniteNumber(value: any): value is number {
    return typeof value === "number" && Number.isFinite(value);
  }
}
