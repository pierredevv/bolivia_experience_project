import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';

describe('Promotions (e2e)', () => {
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

  describe('GET /api/v1/promotions', () => {
    it('should return paginated promotions', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/promotions')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.data).toBeDefined();
      expect(res.body.data.meta).toBeDefined();
    });

    it('should return active promotions by default', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/promotions')
        .expect(200);

      // All returned promotions should be active and within date range
      const promotions = res.body.data.data;
      promotions.forEach((promo: any) => {
        expect(promo.isActive).toBe(true);
      });
    });

    it('should return all promotions with all=true', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/promotions?all=true')
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('should filter by placeId', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/promotions?all=true&placeId=place-1')
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/promotions/:id', () => {
    it('should return promotion by id', async () => {
      const listRes = await request(app.getHttpServer())
        .get('/api/v1/promotions?all=true&limit=1')
        .expect(200);

      if (listRes.body.data.data.length > 0) {
        const promoId = listRes.body.data.data[0].id;
        const res = await request(app.getHttpServer())
          .get(`/api/v1/promotions/${promoId}`)
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toBe(promoId);
      }
    });

    it('should return 404 for non-existent promotion', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/promotions/non-existent-id')
        .expect(404);
    });
  });

  describe('POST /api/v1/promotions (auth required)', () => {
    it('should reject unauthenticated requests', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/promotions/places/place-1')
        .send({
          title: 'Test Promotion',
          startDate: '2026-07-01',
          endDate: '2026-12-31',
        })
        .expect(401);
    });
  });
});
