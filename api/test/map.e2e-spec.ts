import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Map (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/map/nearby', () => {
    it('should return nearby places with valid coordinates', () => {
      return request(app.getHttpServer())
        .get('/api/v1/map/nearby')
        .query({ lat: -17.7833, lng: -63.1833, radius: 5000 })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should reject invalid latitude', () => {
      return request(app.getHttpServer())
        .get('/api/v1/map/nearby')
        .query({ lat: 999, lng: -63.1833 })
        .expect(400);
    });

    it('should reject invalid longitude', () => {
      return request(app.getHttpServer())
        .get('/api/v1/map/nearby')
        .query({ lat: -17.7833, lng: 999 })
        .expect(400);
    });

    it('should handle categoryId parameter', () => {
      return request(app.getHttpServer())
        .get('/api/v1/map/nearby')
        .query({ lat: -17.7833, lng: -63.1833, categoryId: 'test-category' })
        .expect(200);
    });

    it('should not allow SQL injection via categoryId', () => {
      return request(app.getHttpServer())
        .get('/api/v1/map/nearby')
        .query({ lat: -17.7833, lng: -63.1833, categoryId: "'; DROP TABLE places; --" })
        .expect(400);
    });
  });

  describe('GET /api/v1/map/bounds', () => {
    it('should return places within bounds', () => {
      return request(app.getHttpServer())
        .get('/api/v1/map/bounds')
        .query({
          neLat: -17.7,
          neLng: -63.1,
          swLat: -17.9,
          swLng: -63.3,
        })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('GET /api/v1/map/cluster', () => {
    it('should return clusters', () => {
      return request(app.getHttpServer())
        .get('/api/v1/map/cluster')
        .query({
          neLat: -17.7,
          neLng: -63.1,
          swLat: -17.9,
          swLng: -63.3,
        })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('Public access', () => {
    it('should allow unauthenticated access to /map/nearby', () => {
      return request(app.getHttpServer())
        .get('/api/v1/map/nearby')
        .query({ lat: -17.7833, lng: -63.1833 })
        .expect(200);
    });
  });
});
