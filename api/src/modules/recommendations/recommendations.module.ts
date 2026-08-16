import { Module } from "@nestjs/common";
import { RecommendationsController } from "./recommendations.controller";
import { RecommendationsService } from "./recommendations.service";
import { PrismaModule } from "../../prisma/prisma.module";
import { PlacesModule } from "../places/places.module";

@Module({
  imports: [PrismaModule, PlacesModule],
  controllers: [RecommendationsController],
  providers: [RecommendationsService],
  exports: [RecommendationsService],
})
export class RecommendationsModule {}
