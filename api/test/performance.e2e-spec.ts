import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';

describe('Performance Baseline (e2e)', () => {
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

  const measureTime = async (fn: () => Promise<any>): Promise<number> => {
    const start = Date.now();
    await fn();
    return Date.now() - start;
  };

  describe('GET /api/v1/places', () => {
    it('should respond within 500ms', async () => {
      const time = await measureTime(() =>
        request(app.getHttpServer()).get('/api/v1/places').expect(200)
      );
      console.log(`GET /places: ${time}ms`);
      expect(time).toBeLessThan(500);
    });

    it('should handle pagination efficiently', async () => {
      const time = await measureTime(() =>
        request(app.getHttpServer())
          .get('/api/v1/places?page=1&limit=20')
          .expect(200)
      );
      console.log(`GET /places?page=1&limit=20: ${time}ms`);
      expect(time).toBeLessThan(500);
    });
  });

  describe('GET /api/v1/categories', () => {
    it('should respond within 300ms', async () => {
      const time = await measureTime(() =>
        request(app.getHttpServer()).get('/api/v1/categories').expect(200)
      );
      console.log(`GET /categories: ${time}ms`);
      expect(time).toBeLessThan(300);
    });
  });

  describe('GET /api/v1/events', () => {
    it('should respond within 500ms', async () => {
      const time = await measureTime(() =>
        request(app.getHttpServer()).get('/api/v1/events').expect(200)
      );
      console.log(`GET /events: ${time}ms`);
      expect(time).toBeLessThan(500);
    });
  });

  describe('GET /api/v1/places/featured', () => {
    it('should respond within 300ms', async () => {
      const time = await measureTime(() =>
        request(app.getHttpServer()).get('/api/v1/places/featured').expect(200)
      );
      console.log(`GET /places/featured: ${time}ms`);
      expect(time).toBeLessThan(300);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should respond within 1000ms', async () => {
      const time = await measureTime(() =>
        request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({ email: 'admin@boliviaexperience.com', password: 'password123' })
      );
      console.log(`POST /auth/login: ${time}ms`);
      expect(time).toBeLessThan(1000);
    });
  });

  describe('Concurrent requests', () => {
    it('should handle 10 concurrent requests within 3000ms', async () => {
      const start = Date.now();
      const promises = Array(10)
        .fill(null)
        .map(() =>
          request(app.getHttpServer()).get('/api/v1/places').expect(200)
        );
      await Promise.all(promises);
      const totalTime = Date.now() - start;
      console.log(`10 concurrent GET /places: ${totalTime}ms`);
      expect(totalTime).toBeLessThan(3000);
    });
  });

  describe('Health check', () => {
    it('should respond within 200ms', async () => {
      const time = await measureTime(() =>
        request(app.getHttpServer()).get('/api/v1/health').expect(200)
      );
      console.log(`GET /health: ${time}ms`);
      expect(time).toBeLessThan(200);
    });
  });
});
