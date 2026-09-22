import { Module } from "@nestjs/common";
import { SupportController } from "./support.controller";
import { SupportAdminController } from "./support.admin.controller";
import { SupportService } from "./support.service";
import { PrismaModule } from "../../prisma/prisma.module";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [SupportController, SupportAdminController],
  providers: [SupportService],
  exports: [SupportService],
})
export class SupportModule {}