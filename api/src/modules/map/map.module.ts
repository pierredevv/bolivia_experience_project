import { Module } from "@nestjs/common";
import { MapController } from "./map.controller";
import { MapService } from "./map.service";
import { PlacesModule } from "../places/places.module";

@Module({
  imports: [PlacesModule],
  controllers: [MapController],
  providers: [MapService],
})
export class MapModule {}
