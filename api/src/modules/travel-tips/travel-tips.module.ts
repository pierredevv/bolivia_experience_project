import { Module } from "@nestjs/common";
import { TravelTipsController } from "./travel-tips.controller";
import { TravelTipsService } from "./travel-tips.service";

@Module({
  controllers: [TravelTipsController],
  providers: [TravelTipsService],
  exports: [TravelTipsService],
})
export class TravelTipsModule {}
