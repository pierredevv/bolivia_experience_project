import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { GuardsModule } from './common/guards/guards.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PlacesModule } from './modules/places/places.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { MapModule } from './modules/map/map.module';
import { SearchModule } from './modules/search/search.module';
import { EventsModule } from './modules/events/events.module';
import { PromotionsModule } from './modules/promotions/promotions.module';
import { WeatherModule } from './modules/weather/weather.module';
import { AdminModule } from './modules/admin/admin.module';
import { EmpresaModule } from './modules/empresa/empresa.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PrismaModule,
    GuardsModule,
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
  ],
})
export class AppModule {}
