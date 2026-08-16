import { Module } from "@nestjs/common";
import { ReservationsController } from "./reservations.controller";
import { ReservationsService } from "./reservations.service";
import { PrismaModule } from "../../prisma/prisma.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { GamificationModule } from "../gamification/gamification.module";
import { PaymentsModule } from "../payments/payments.module";

@Module({
  imports: [
    PrismaModule,
    NotificationsModule,
    GamificationModule,
    PaymentsModule,
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService],
  exports: [ReservationsService],
})
export class ReservationsModule {}
