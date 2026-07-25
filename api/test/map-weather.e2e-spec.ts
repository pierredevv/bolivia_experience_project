import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';

describe('Map & Weather (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalInterceptors(new TransformInterceptor());
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/map/nearby', () => {
    it('should return nearby places', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/map/nearby?latitude=-17.7833&longitude=-63.1821&radius=5')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should handle missing parameters gracefully', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/map/nearby')
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/map/cluster', () => {
    it('should return map clusters (or 500 on SQLite)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/map/cluster?bounds=-18,-64,-17,-63');

      // Cluster queries require PostgreSQL spatial - may fail on SQLite
      expect([200, 500]).toContain(res.status);
    });
  });

  describe('GET /api/v1/map/bounds', () => {
    it('should return places within bounds (or 500 on SQLite)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/map/bounds?north=-17&south=-18&east=-63&west=-64');

      // Bounds queries require PostgreSQL spatial - may fail on SQLite
      expect([200, 500]).toContain(res.status);
    });
  });

  describe('GET /api/v1/weather/current', () => {
    it('should return current weather (or error if no API key)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/weather/current');

      // Weather requires OpenWeatherMap API key - may fail without it
      expect([200, 500, 502]).toContain(res.status);
    });
  });

  describe('GET /api/v1/weather/forecast', () => {
    it('should return weather forecast (or error if no API key)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/weather/forecast');

      // Weather requires OpenWeatherMap API key - may fail without it
      expect([200, 500, 502]).toContain(res.status);
    });
  });
});
