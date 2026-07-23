import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';

describe('Payments (e2e)', () => {
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

  describe('POST /api/v1/payments', () => {
    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/payments')
        .send({
          amount: 100,
          description: 'Test payment',
          type: 'reservation',
          referenceId: 'res-1',
        })
        .expect(401);
    });
  });

  describe('GET /api/v1/payments/:id', () => {
    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/payments/non-existent')
        .expect(401);
    });
  });

  describe('POST /api/v1/payments/:id/confirm', () => {
    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/payments/non-existent/confirm')
        .send({ transactionId: 'TXN-001' })
        .expect(401);
    });
  });

  describe('GET /api/v1/payments/my/history', () => {
    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/payments/my/history')
        .expect(401);
    });
  });
});
