import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';

describe('Notifications (e2e)', () => {
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
    const email = `notif-test-${Date.now()}@example.com`;
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email, name: 'Notif Test', password: 'password123' })
      .expect(201);

    userToken = res.body.data.accessToken;
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/notifications (auth required)', () => {
    it('should reject unauthenticated requests', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/notifications')
        .expect(401);
    });

    it('should return user notifications', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.data).toBeDefined();
      expect(res.body.data.meta).toBeDefined();
    });
  });

  describe('GET /api/v1/notifications/unread/count (auth required)', () => {
    it('should reject unauthenticated requests', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/notifications/unread/count')
        .expect(401);
    });

    it('should return unread count', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/notifications/unread/count')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(typeof res.body.data.count).toBe('number');
    });
  });

  describe('PATCH /api/v1/notifications/read-all (auth required)', () => {
    it('should reject unauthenticated requests', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/notifications/read-all')
        .expect(401);
    });

    it('should mark all as read', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/v1/notifications/read-all')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  describe('DELETE /api/v1/notifications/:id (auth required)', () => {
    it('should reject unauthenticated requests', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/notifications/some-id')
        .expect(401);
    });

    it('should return 404 for non-existent notification', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/notifications/non-existent-id')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });
});
