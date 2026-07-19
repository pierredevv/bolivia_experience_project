import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';

describe('Events (e2e)', () => {
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

  describe('GET /api/v1/events', () => {
    it('should return paginated events', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/events')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.data).toBeDefined();
      expect(res.body.data.meta).toBeDefined();
    });

    it('should support pagination', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/events?page=1&limit=3')
        .expect(200);

      expect(res.body.data.data.length).toBeLessThanOrEqual(3);
    });
  });

  describe('GET /api/v1/events/today', () => {
    it('should return today events', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/events/today')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/events/:id', () => {
    it('should return event by id', async () => {
      const listRes = await request(app.getHttpServer())
        .get('/api/v1/events?limit=1')
        .expect(200);

      if (listRes.body.data.data.length > 0) {
        const eventId = listRes.body.data.data[0].id;
        const res = await request(app.getHttpServer())
          .get(`/api/v1/events/${eventId}`)
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toBe(eventId);
      }
    });

    it('should return 404 for non-existent event', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/events/non-existent-id')
        .expect(404);
    });
  });
});
