import { Module } from '@nestjs/common';
import { PlacesController } from './places.controller';
import { PlacesService } from './places.service';
import { GeoRepository } from './repositories/geo.repository';
import { FileUploadService } from '../../common/services/file-upload.service';

@Module({
  controllers: [PlacesController],
  providers: [PlacesService, GeoRepository, FileUploadService],
  exports: [PlacesService, GeoRepository],
})
export class PlacesModule {}
