import { Module } from "@nestjs/common";
import { PlacesController } from "./places.controller";
import { PlacesService } from "./places.service";
import { PlacesScoringService } from "./places-scoring.service";
import { GeoRepository } from "./repositories/geo.repository";
import { FileUploadService } from "../../common/services/file-upload.service";

@Module({
  controllers: [PlacesController],
  providers: [
    PlacesService,
    PlacesScoringService,
    GeoRepository,
    FileUploadService,
  ],
  exports: [PlacesService, PlacesScoringService, GeoRepository],
})
export class PlacesModule {}
