import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { FileUploadService } from "../../common/services/file-upload.service";
import { TravelerPhotosController } from "./traveler-photos.controller";
import { TravelerPhotosService } from "./traveler-photos.service";

@Module({
  imports: [PrismaModule],
  controllers: [TravelerPhotosController],
  providers: [TravelerPhotosService, FileUploadService],
  exports: [TravelerPhotosService],
})
export class TravelerPhotosModule {}
