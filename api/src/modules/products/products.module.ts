import { Module } from "@nestjs/common";
import { ProductsController } from "./products.controller";
import { ExperiencesController } from "./experiences.controller";
import { ProductsService } from "./products.service";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [ProductsController, ExperiencesController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
