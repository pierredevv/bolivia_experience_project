import { Module } from "@nestjs/common";
import { ToursController } from "./tours.controller";
import { ToursService } from "./tours.service";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [ToursController],
  providers: [ToursService],
})
export class ToursModule {}
