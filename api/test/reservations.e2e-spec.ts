import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';

describe('Reservations (e2e)', () => {
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

  describe('POST /api/v1/reservations', () => {
    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/reservations')
        .send({
          placeId: 'place-1',
          date: '2025-06-01',
          time: '19:00',
          partySize: 4,
        })
        .expect(401);
    });
  });

  describe('GET /api/v1/reservations/my', () => {
    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/reservations/my')
        .expect(401);
    });
  });

  describe('PATCH /api/v1/reservations/:id/cancel', () => {
    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/reservations/non-existent/cancel')
        .expect(401);
    });
  });

  describe('GET /api/v1/reservations/place/:placeId', () => {
    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/reservations/place/place-1')
        .expect(401);
    });
  });
});
