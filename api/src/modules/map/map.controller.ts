import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MapService } from './map.service';
import { NearbyQueryDto, ClusterQueryDto, BoundsQueryDto } from './dto/map-query.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('map')
@Controller('map')
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @Get('nearby')
  @Public()
  @ApiOperation({ summary: 'Find nearby places' })
  @ApiResponse({ status: 200, description: 'Nearby places list' })
  async findNearby(@Query() query: NearbyQueryDto) {
    return this.mapService.findNearby(
      query.lat,
      query.lng,
      query.radius,
      query.categoryId,
    );
  }

  @Get('cluster')
  @Public()
  @ApiOperation({ summary: 'Get place clusters for map' })
  @ApiResponse({ status: 200, description: 'Clusters data' })
  async findClusters(@Query() query: ClusterQueryDto) {
    return this.mapService.findClusters(
      query.neLat,
      query.neLng,
      query.swLat,
      query.swLng,
    );
  }

  @Get('bounds')
  @Public()
  @ApiOperation({ summary: 'Find places within map bounds' })
  @ApiResponse({ status: 200, description: 'Places within bounds' })
  async findByBounds(@Query() query: BoundsQueryDto) {
    return this.mapService.findByBounds(
      query.neLat,
      query.neLng,
      query.swLat,
      query.swLng,
      query.categoryId,
    );
  }
}
