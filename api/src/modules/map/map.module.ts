import { Module } from "@nestjs/common";
import { MapController } from "./map.controller";
import { MapService } from "./map.service";
import { PlacesModule } from "../places/places.module";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
  imports: [PlacesModule, PrismaModule],
  controllers: [MapController],
  providers: [MapService],
})
export class MapModule {}
