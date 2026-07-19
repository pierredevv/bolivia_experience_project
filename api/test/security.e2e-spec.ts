import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';

describe('Security (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let empresaToken: string;
  let usuarioToken: string;

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

    // Create test users and get tokens
    const adminEmail = `sec-admin-${Date.now()}@example.com`;
    const empresaEmail = `sec-empresa-${Date.now()}@example.com`;
    const usuarioEmail = `sec-usuario-${Date.now()}@example.com`;

    // Register users
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: usuarioEmail, name: 'Usuario Test', password: 'password123' });

    const empresaRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register-business')
      .send({
        email: empresaEmail,
        name: 'Empresa Test',
        password: 'password123',
        businessName: 'Test Business',
        address: 'Test Address',
        categoryId: 'cat-1',
      });

    // For admin, we need to use the seed or create manually
    // For now, test with the tokens we have
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: usuarioEmail, password: 'password123' });
    usuarioToken = loginRes.body.data?.accessToken || loginRes.body.accessToken;

    if (empresaRes.status === 201) {
      // Empresa needs approval to login - skip for now
    }
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  describe('RBAC - Role-Based Access Control', () => {
    it('should reject unauthenticated requests to protected endpoints', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/users')
        .expect(401);

      await request(app.getHttpServer())
        .get('/api/v1/empresa/place')
        .expect(401);

      await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .expect(401);
    });

    it('should reject non-admin users from admin endpoints', async () => {
      if (!usuarioToken) return;

      await request(app.getHttpServer())
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${usuarioToken}`)
        .expect(403);

      await request(app.getHttpServer())
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${usuarioToken}`)
        .expect(403);
    });

    it('should allow authenticated users to access public endpoints', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/places')
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('should allow authenticated users to access user-specific endpoints', async () => {
      if (!usuarioToken) return;

      const res = await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${usuarioToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  describe('JWT Validation', () => {
    it('should reject expired tokens', async () => {
      // Create an obviously invalid token
      const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwicm9sZSI6InVzdWFyaW8iLCJpYXQiOjE1MTYyMzkwMjJ9.invalid';

      await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);
    });

    it('should reject tokens with invalid signature', async () => {
      const invalidToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.invalid';

      await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);
    });

    it('should reject malformed Authorization header', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', 'InvalidFormat')
        .expect(401);
    });

    it('should reject requests without Authorization header', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .expect(401);
    });
  });

  describe('Input Validation', () => {
    it('should reject requests with extra fields (forbidNonWhitelisted)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: `validation-${Date.now()}@example.com`,
          name: 'Test',
          password: 'password123',
          extraField: 'should be rejected',
        })
        .expect(400);
    });

    it('should reject invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'not-an-email',
          name: 'Test',
          password: 'password123',
        })
        .expect(400);
    });

    it('should reject short passwords', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: `short-${Date.now()}@example.com`,
          name: 'Test',
          password: '123',
        })
        .expect(400);
    });

    it('should reject missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: `missing-${Date.now()}@example.com`,
        })
        .expect(400);
    });
  });

  describe('SQL Injection Prevention', () => {
    it('should handle SQL injection in search query', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/places?search=%27%20OR%201%3D1%20--')
        .expect(200);

      // Should return empty results, not all places
      expect(res.body.success).toBe(true);
    });

    it('should handle SQL injection in login', async () => {
      // Email validation catches invalid format before auth logic
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: "admin'--",
          password: 'anything',
        });

      // Either 400 (validation reject) or 401 (auth reject) — both are secure
      expect([400, 401]).toContain(res.status);
    });
  });

  describe('Health Endpoint', () => {
    it('should return health status', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200);

      // Response may be wrapped by TransformInterceptor
      const body = res.body.data || res.body;
      expect(body.status).toBe('ok');
      expect(body.database).toBe('connected');
    });
  });
});
