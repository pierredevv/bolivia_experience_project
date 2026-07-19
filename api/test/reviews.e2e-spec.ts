import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';

describe('Reviews (e2e)', () => {
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

  describe('GET /api/v1/places/:id/reviews', () => {
    it('should return reviews for a place', async () => {
      // First get a valid place id
      const placeRes = await request(app.getHttpServer())
        .get('/api/v1/places?limit=1')
        .expect(200);

      if (placeRes.body.data.data.length > 0) {
        const placeId = placeRes.body.data.data[0].id;
        const res = await request(app.getHttpServer())
          .get(`/api/v1/places/${placeId}/reviews`)
          .expect(200);

        expect(res.body.success).toBe(true);
        // Reviews endpoint returns paginated data
        expect(res.body.data.data).toBeDefined();
        expect(Array.isArray(res.body.data.data)).toBe(true);
      }
    });

    it('should return empty results for place with no reviews', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/places/non-existent-place/reviews')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.data).toBeDefined();
      expect(res.body.data.data.length).toBe(0);
    });
  });

  describe('POST /api/v1/places/:id/reviews (auth required)', () => {
    it('should reject unauthenticated requests', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/places/place-1/reviews')
        .send({
          rating: 5,
          comment: 'Great place!',
        })
        .expect(401);
    });
  });

  describe('PATCH /api/v1/reviews/:id/approve (auth required)', () => {
    it('should reject unauthenticated requests', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/reviews/review-1/approve')
        .expect(401);
    });

    it('should reject non-admin users', async () => {
      // Register a regular user
      const email = `review-test-${Date.now()}@example.com`;
      const registerRes = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email, name: 'Test', password: 'password123' })
        .expect(201);

      const token = registerRes.body.data.accessToken;

      await request(app.getHttpServer())
        .patch('/api/v1/reviews/review-1/approve')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });
  });
});
