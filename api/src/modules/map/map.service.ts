import { Injectable } from '@nestjs/common';
import { GeoRepository } from '../places/repositories/geo.repository';

@Injectable()
export class MapService {
  constructor(private geoRepository: GeoRepository) {}

  async findNearby(latitude: number, longitude: number, radius?: number, categoryId?: string) {
    return this.geoRepository.findNearby(latitude, longitude, radius, 20, categoryId);
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
}
