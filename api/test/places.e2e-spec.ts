import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';

describe('Places (e2e)', () => {
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

  describe('GET /api/v1/places', () => {
    it('should return paginated places', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/places')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.data).toBeDefined();
      expect(res.body.data.meta).toBeDefined();
      expect(Array.isArray(res.body.data.data)).toBe(true);
    });

    it('should support pagination', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/places?page=1&limit=5')
        .expect(200);

      expect(res.body.data.data.length).toBeLessThanOrEqual(5);
      expect(res.body.data.meta.page).toBe(1);
      expect(res.body.data.meta.limit).toBe(5);
    });

    it('should filter by category', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/places?categoryId=cat-1')
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('should search by name', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/places?search=restaurante')
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/places/featured', () => {
    it('should return featured places', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/places/featured')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/places/:id', () => {
    it('should return a place by id', async () => {
      // First get a list to find a valid id
      const listRes = await request(app.getHttpServer())
        .get('/api/v1/places?limit=1')
        .expect(200);

      if (listRes.body.data.data.length > 0) {
        const placeId = listRes.body.data.data[0].id;
        const res = await request(app.getHttpServer())
          .get(`/api/v1/places/${placeId}`)
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toBe(placeId);
      }
    });

    it('should return 404 for non-existent place', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/places/non-existent-id')
        .expect(404);
    });
  });

  describe('GET /api/v1/places/:id/photos', () => {
    it('should return photos for a place', async () => {
      const listRes = await request(app.getHttpServer())
        .get('/api/v1/places?limit=1')
        .expect(200);

      if (listRes.body.data.data.length > 0) {
        const placeId = listRes.body.data.data[0].id;
        const res = await request(app.getHttpServer())
          .get(`/api/v1/places/${placeId}/photos`)
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
      }
    });
  });
});
