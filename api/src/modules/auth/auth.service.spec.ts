import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findUnique: jest.Mock; create: jest.Mock } };
  let jwt: { signAsync: jest.Mock; verify: jest.Mock };
  let config: { get: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };
    jwt = {
      signAsync: jest.fn(),
      verify: jest.fn(),
    };
    config = {
      get: jest.fn((key: string, defaultValue?: any) => {
        const values: Record<string, string> = {
          JWT_SECRET: 'test-secret',
          JWT_REFRESH_SECRET: 'test-refresh-secret',
          JWT_EXPIRATION: '15m',
          REFRESH_TOKEN_EXPIRATION: '7d',
        };
        return values[key] || defaultValue;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw ConflictException if email already exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@test.com' });

      await expect(
        service.register({ email: 'test@test.com', name: 'Test', password: '123456' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create user and return tokens', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        name: 'Test',
        role: 'usuario',
      });
      jwt.signAsync.mockResolvedValue('mock-token');

      const result = await service.register({
        email: 'test@test.com',
        name: 'Test',
        password: '123456',
      });

      expect(result.user.email).toBe('test@test.com');
      expect(result.accessToken).toBe('mock-token');
      expect(result.refreshToken).toBe('mock-token');
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'test@test.com', password: '123456' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: '1', isActive: false });

      await expect(
        service.login({ email: 'test@test.com', password: '123456' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    it('should throw UnauthorizedException if token is invalid', async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshToken('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if token type is not refresh', async () => {
      jwt.verify.mockReturnValue({ sub: '1', role: 'usuario', type: 'access' });

      await expect(service.refreshToken('access-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return new tokens for valid refresh token', async () => {
      jwt.verify.mockReturnValue({ sub: '1', role: 'usuario', type: 'refresh' });
      prisma.user.findUnique.mockResolvedValue({ id: '1', isActive: true });
      jwt.signAsync.mockResolvedValue('new-token');

      const result = await service.refreshToken('valid-refresh-token');

      expect(result.accessToken).toBe('new-token');
      expect(result.refreshToken).toBe('new-token');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      jwt.verify.mockReturnValue({ sub: '999', role: 'usuario', type: 'refresh' });
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.refreshToken('valid-refresh-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('generateTokens', () => {
    it('should generate access token with type access', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: '1', isActive: true });
      jwt.signAsync.mockResolvedValue('token');
      jwt.verify.mockReturnValue({ sub: '1', role: 'usuario', type: 'refresh' });

      await service.refreshToken('refresh-token');

      const accessCall = jwt.signAsync.mock.calls[0];
      expect(accessCall[0]).toHaveProperty('type', 'access');
    });

    it('should generate refresh token with type refresh', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: '1', isActive: true });
      jwt.signAsync.mockResolvedValue('token');
      jwt.verify.mockReturnValue({ sub: '1', role: 'usuario', type: 'refresh' });

      await service.refreshToken('refresh-token');

      const refreshCall = jwt.signAsync.mock.calls[1];
      expect(refreshCall[0]).toHaveProperty('type', 'refresh');
    });

    it('should use different secret for refresh token', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: '1', isActive: true });
      jwt.signAsync.mockResolvedValue('token');
      jwt.verify.mockReturnValue({ sub: '1', role: 'usuario', type: 'refresh' });

      await service.refreshToken('refresh-token');

      const refreshCall = jwt.signAsync.mock.calls[1];
      expect(refreshCall[1]).toHaveProperty('secret', 'test-refresh-secret');
    });
  });
});
