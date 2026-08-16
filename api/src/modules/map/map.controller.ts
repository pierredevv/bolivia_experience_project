import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { MapService } from "./map.service";

@ApiTags("map")
@Controller("map")
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @Get("nearby")
  @ApiOperation({ summary: "Find nearby places" })
  @ApiResponse({ status: 200, description: "Nearby places list" })
  async findNearby(
    @Query("lat") lat: number,
    @Query("lng") lng: number,
    @Query("radius") radius?: number,
    @Query("categoryId") categoryId?: string,
  ) {
    return this.mapService.findNearby(lat, lng, radius, categoryId);
  }

  @Get("cluster")
  @ApiOperation({ summary: "Get place clusters for map" })
  @ApiResponse({ status: 200, description: "Clusters data" })
  async findClusters(
    @Query("neLat") neLat: number,
    @Query("neLng") neLng: number,
    @Query("swLat") swLat: number,
    @Query("swLng") swLng: number,
  ) {
    return this.mapService.findClusters(neLat, neLng, swLat, swLng);
  }

  @Get("bounds")
  @ApiOperation({ summary: "Find places within map bounds" })
  @ApiResponse({ status: 200, description: "Places within bounds" })
  async findByBounds(
    @Query("neLat") neLat: number,
    @Query("neLng") neLng: number,
    @Query("swLat") swLat: number,
    @Query("swLng") swLng: number,
    @Query("categoryId") categoryId?: string,
  ) {
    return this.mapService.findByBounds(neLat, neLng, swLat, swLng, categoryId);
  }

  @Get("safety-zones")
  @ApiOperation({ summary: "List active safety zones (optionally within bounds)" })
  @ApiResponse({ status: 200, description: "Safety zones list" })
  async findSafetyZones(
    @Query("neLat") neLat?: number,
    @Query("neLng") neLng?: number,
    @Query("swLat") swLat?: number,
    @Query("swLng") swLng?: number,
  ) {
    return this.mapService.findSafetyZones(neLat, neLng, swLat, swLng);
  }

  @Get("safety-zones/check")
  @ApiOperation({ summary: "Check if a point falls inside any safety zone (Haversine)" })
  @ApiResponse({ status: 200, description: "Zones containing the point" })
  async checkSafetyZone(
    @Query("lat") lat: number,
    @Query("lng") lng: number,
  ) {
    return this.mapService.checkSafetyZone(lat, lng);
  }

  @Get("events")
  @ApiOperation({ summary: "Find active events within map bounds" })
  @ApiResponse({ status: 200, description: "Events within bounds" })
  async findMapEvents(
    @Query("neLat") neLat: number,
    @Query("neLng") neLng: number,
    @Query("swLat") swLat: number,
    @Query("swLng") swLng: number,
  ) {
    return this.mapService.findMapEvents(neLat, neLng, swLat, swLng);
  }
}
