import { Module } from '@nestjs/common';
import { PlacesController } from './places.controller';
import { PlacesService } from './places.service';
import { GeoRepository } from './repositories/geo.repository';

@Module({
  controllers: [PlacesController],
  providers: [PlacesService, GeoRepository],
  exports: [PlacesService, GeoRepository],
})
export class PlacesModule {}
