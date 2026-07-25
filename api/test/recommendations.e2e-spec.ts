import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';

describe('Recommendations (e2e)', () => {
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

  describe('GET /api/v1/recommendations/trending', () => {
    it('should return trending places', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/recommendations/trending')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should support limit parameter', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/recommendations/trending?limit=3')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeLessThanOrEqual(3);
    });
  });

  describe('GET /api/v1/recommendations/similar/:placeId', () => {
    it('should return similar places', async () => {
      // First get a valid place id
      const listRes = await request(app.getHttpServer())
        .get('/api/v1/places?limit=1')
        .expect(200);

      if (listRes.body.data.data.length > 0) {
        const placeId = listRes.body.data.data[0].id;
        const res = await request(app.getHttpServer())
          .get(`/api/v1/recommendations/similar/${placeId}`)
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
      }
    });

    it('should return empty array for non-existent place', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/recommendations/similar/non-existent-id')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });
  });

  describe('GET /api/v1/recommendations/personalized', () => {
    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/recommendations/personalized')
        .expect(401);
    });
  });
});
