import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MapService } from './map.service';

@ApiTags('map')
@Controller('map')
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @Get('nearby')
  @ApiOperation({ summary: 'Find nearby places' })
  @ApiResponse({ status: 200, description: 'Nearby places list' })
  async findNearby(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radius') radius?: number,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.mapService.findNearby(lat, lng, radius, categoryId);
  }

  @Get('cluster')
  @ApiOperation({ summary: 'Get place clusters for map' })
  @ApiResponse({ status: 200, description: 'Clusters data' })
  async findClusters(
    @Query('neLat') neLat: number,
    @Query('neLng') neLng: number,
    @Query('swLat') swLat: number,
    @Query('swLng') swLng: number,
  ) {
    return this.mapService.findClusters(neLat, neLng, swLat, swLng);
  }

  @Get('bounds')
  @ApiOperation({ summary: 'Find places within map bounds' })
  @ApiResponse({ status: 200, description: 'Places within bounds' })
  async findByBounds(
    @Query('neLat') neLat: number,
    @Query('neLng') neLng: number,
    @Query('swLat') swLat: number,
    @Query('swLng') swLng: number,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.mapService.findByBounds(neLat, neLng, swLat, swLng, categoryId);
  }
}
