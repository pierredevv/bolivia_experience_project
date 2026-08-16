import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { PrismaModule } from "./prisma/prisma.module";
import { GuardsModule } from "./common/guards/guards.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { PlacesModule } from "./modules/places/places.module";
import { CategoriesModule } from "./modules/categories/categories.module";
import { ReviewsModule } from "./modules/reviews/reviews.module";
import { FavoritesModule } from "./modules/favorites/favorites.module";
import { MapModule } from "./modules/map/map.module";
import { SearchModule } from "./modules/search/search.module";
import { EventsModule } from "./modules/events/events.module";
import { PromotionsModule } from "./modules/promotions/promotions.module";
import { WeatherModule } from "./modules/weather/weather.module";
import { AdminModule } from "./modules/admin/admin.module";
import { EmpresaModule } from "./modules/empresa/empresa.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { ReservationsModule } from "./modules/reservations/reservations.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { ProductsModule } from "./modules/products/products.module";
import { HotelsModule } from "./modules/hotels/hotels.module";
import { RestaurantsModule } from "./modules/restaurants/restaurants.module";
import { ToursModule } from "./modules/tours/tours.module";
import { PlatformConfigModule } from "./modules/platform-config/platform-config.module";
import { ReferralsModule } from "./modules/referrals/referrals.module";
import { RecommendationsModule } from "./modules/recommendations/recommendations.module";
import { ChatbotModule } from "./modules/chatbot/chatbot.module";
import { TripsModule } from "./modules/trips/trips.module";
import { TravelerPhotosModule } from "./modules/traveler-photos/traveler-photos.module";
import { GamificationModule } from "./modules/gamification/gamification.module";
import { HealthController } from "./common/controllers/health.controller";
import configuration from "./config/configuration";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProd = config.get("NODE_ENV") === "production";
        const isTest = config.get("NODE_ENV") === "test";
        return [
          {
            ttl: isTest ? 0 : 60000,
            limit: isTest ? 999999 : isProd ? 100 : 999999,
          },
        ];
      },
    }),
    PrismaModule,
    GuardsModule,
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    PlacesModule,
    CategoriesModule,
    ReviewsModule,
    FavoritesModule,
    MapModule,
    SearchModule,
    EventsModule,
    PromotionsModule,
    WeatherModule,
    AdminModule,
    EmpresaModule,
    NotificationsModule,
    ReservationsModule,
    PaymentsModule,
    ProductsModule,
    HotelsModule,
    RestaurantsModule,
    ToursModule,
    PlatformConfigModule,
    ReferralsModule,
    RecommendationsModule,
    ChatbotModule,
    TripsModule,
    TravelerPhotosModule,
    GamificationModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
