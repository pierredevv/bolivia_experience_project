import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';

describe('Admin (e2e)', () => {
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

  describe('Admin endpoints (auth required)', () => {
    it('should reject unauthenticated requests to /admin/users', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/users')
        .expect(401);
    });

    it('should reject unauthenticated requests to /admin/reviews', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/reviews')
        .expect(401);
    });

    it('should reject unauthenticated requests to /admin/dashboard', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/dashboard')
        .expect(401);
    });

    it('should reject unauthenticated requests to /admin/businesses', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/businesses')
        .expect(401);
    });

    it('should reject unauthenticated requests to /admin/settings', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/settings')
        .expect(401);
    });
  });

  describe('Admin RBAC', () => {
    it('should reject non-admin users from admin endpoints', async () => {
      // Register a regular user
      const email = `admin-rbac-${Date.now()}@example.com`;
      const registerRes = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email, name: 'Regular User', password: 'password123' })
        .expect(201);

      const token = registerRes.body.data.accessToken;

      await request(app.getHttpServer())
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      await request(app.getHttpServer())
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      await request(app.getHttpServer())
        .get('/api/v1/admin/settings')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });
  });
});
