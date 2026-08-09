import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import helmet from "helmet";
import * as compression from "compression";
import * as path from "path";
import { AppModule } from "./app.module";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // Validate JWT_SECRET is set and not default
  const jwtSecret = configService.get("JWT_SECRET");
  if (!jwtSecret || jwtSecret === "bolivia-experience-dev-secret-key-2024") {
    if (configService.get("NODE_ENV") === "production") {
      throw new Error(
        "JWT_SECRET must be set to a strong random value in production",
      );
    }
    console.warn(
      "WARNING: Using default JWT_SECRET. Change this in production!",
    );
  }

  app.use(helmet());
  app.use(compression());

  app.useStaticAssets(path.join(process.cwd(), "uploads"), {
    prefix: "/uploads/",
  });

  const corsOrigin = configService.get("CORS_ORIGIN", "http://localhost:5173");
  app.enableCors({
    origin: corsOrigin.split(",").map((origin: string) => origin.trim()),
    credentials: true,
  });

  app.setGlobalPrefix("api/v1");

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle("BoliviaExperience API")
    .setDescription("API REST para la plataforma turística BoliviaExperience")
    .setVersion("1.0")
    .addBearerAuth()
    .addTag("auth", "Autenticación y autorización")
    .addTag("users", "Gestión de usuarios")
    .addTag("places", "Lugares turísticos")
    .addTag("categories", "Categorías de lugares")
    .addTag("reviews", "Reseñas y calificaciones")
    .addTag("favorites", "Lugares favoritos")
    .addTag("map", "Geolocalización y mapa")
    .addTag("search", "Búsqueda de lugares")
    .addTag("events", "Eventos turísticos")
    .addTag("promotions", "Promociones de negocios")
    .addTag("weather", "Información climática")
    .addTag("notifications", "Notificaciones del usuario")
    .addTag("health", "Health check")
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("docs", app, document);

  const port = configService.get("PORT", 3000);
  await app.listen(port, "0.0.0.0");
  console.log(`Application running on: http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/docs`);
}

bootstrap();
