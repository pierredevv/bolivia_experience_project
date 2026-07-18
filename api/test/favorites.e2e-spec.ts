import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';

describe('Favorites (e2e)', () => {
  let app: INestApplication;
  let userToken: string;

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

    // Create a test user
    const email = `fav-test-${Date.now()}@example.com`;
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email, name: 'Fav Test', password: 'password123' })
      .expect(201);

    userToken = res.body.data.accessToken;
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/favorites (auth required)', () => {
    it('should reject unauthenticated requests', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/favorites')
        .expect(401);
    });

    it('should return user favorites', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/favorites')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('POST /api/v1/favorites/:placeId (auth required)', () => {
    it('should reject unauthenticated requests', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/favorites/place-1')
        .expect(401);
    });

    it('should add a place to favorites', async () => {
      // Get a valid place id
      const placeRes = await request(app.getHttpServer())
        .get('/api/v1/places?limit=1')
        .expect(200);

      if (placeRes.body.data.data.length > 0) {
        const placeId = placeRes.body.data.data[0].id;
        const res = await request(app.getHttpServer())
          .post(`/api/v1/favorites/${placeId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .expect(201);

        expect(res.body.success).toBe(true);
      }
    });
  });

  describe('DELETE /api/v1/favorites/:placeId (auth required)', () => {
    it('should reject unauthenticated requests', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/favorites/place-1')
        .expect(401);
    });
  });

  describe('GET /api/v1/favorites/check/:placeId (auth required)', () => {
    it('should reject unauthenticated requests', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/favorites/check/place-1')
        .expect(401);
    });

    it('should check if place is favorited', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/favorites/check/place-1')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.isFavorite).toBeDefined();
      expect(typeof res.body.data.isFavorite).toBe('boolean');
    });
  });
});
