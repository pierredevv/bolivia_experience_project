import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';

describe('Referrals (e2e)', () => {
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

  describe('GET /api/v1/referrals/code', () => {
    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/referrals/code')
        .expect(401);
    });
  });

  describe('POST /api/v1/referrals/apply', () => {
    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/referrals/apply')
        .send({ code: 'SOMECODE' })
        .expect(401);
    });
  });

  describe('GET /api/v1/referrals/stats', () => {
    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/referrals/stats')
        .expect(401);
    });
  });
});
