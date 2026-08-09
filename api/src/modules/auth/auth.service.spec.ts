import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { PrismaService } from "../../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";

describe("AuthService", () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    refreshToken: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue("mock-jwt-token"),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue("7d"),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("register", () => {
    it("should create user and return tokens", async () => {
      const registerDto = {
        email: "test@example.com",
        name: "Test User",
        password: "password123",
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: "user-1",
        email: registerDto.email,
        name: registerDto.name,
        role: "usuario",
        language: "es",
      });
      mockPrisma.refreshToken.create.mockResolvedValue({});
      (jest.spyOn(bcrypt, "hash") as jest.Mock).mockResolvedValue(
        "hashed-password",
      );

      const result = await service.register(registerDto);

      expect(result.user.email).toBe(registerDto.email);
      expect(result.user.name).toBe(registerDto.name);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(mockPrisma.refreshToken.create).toHaveBeenCalled();
    });

    it("should hash password before saving", async () => {
      const registerDto = {
        email: "test@example.com",
        name: "Test User",
        password: "password123",
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: "user-1",
        email: registerDto.email,
        name: registerDto.name,
        role: "usuario",
        language: "es",
      });
      mockPrisma.refreshToken.create.mockResolvedValue({});
      const hashSpy = jest.spyOn(bcrypt, "hash") as jest.Mock;
      hashSpy.mockResolvedValue("hashed-password");

      await service.register(registerDto);

      expect(hashSpy).toHaveBeenCalledWith("password123", 10);
    });

    it("should throw ConflictException if email exists", async () => {
      const registerDto = {
        email: "existing@example.com",
        name: "Test User",
        password: "password123",
      };

      mockPrisma.user.findUnique.mockResolvedValue({ id: "existing-user" });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it("should use default language es if not provided", async () => {
      const registerDto = {
        email: "test@example.com",
        name: "Test User",
        password: "password123",
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: "user-1",
        email: registerDto.email,
        name: registerDto.name,
        role: "usuario",
        language: "es",
      });
      mockPrisma.refreshToken.create.mockResolvedValue({});
      (jest.spyOn(bcrypt, "hash") as jest.Mock).mockResolvedValue(
        "hashed-password",
      );

      await service.register(registerDto);

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ language: "es" }),
      });
    });
  });

  describe("login", () => {
    it("should return user and tokens for valid credentials", async () => {
      const loginDto = {
        email: "test@example.com",
        password: "password123",
      };

      const mockUser = {
        id: "user-1",
        email: loginDto.email,
        name: "Test User",
        role: "usuario",
        isActive: true,
        password: "hashed-password",
        photoUrl: null,
        approvalStatus: "approved",
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.refreshToken.create.mockResolvedValue({});
      (jest.spyOn(bcrypt, "compare") as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result.user.email).toBe(loginDto.email);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it("should throw UnauthorizedException for invalid email", async () => {
      const loginDto = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException for invalid password", async () => {
      const loginDto = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      const mockUser = {
        id: "user-1",
        email: loginDto.email,
        name: "Test User",
        role: "usuario",
        isActive: true,
        password: "hashed-password",
        photoUrl: null,
        approvalStatus: "approved",
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (jest.spyOn(bcrypt, "compare") as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException for inactive user", async () => {
      const loginDto = {
        email: "inactive@example.com",
        password: "password123",
      };

      const mockUser = {
        id: "user-1",
        email: loginDto.email,
        name: "Inactive User",
        role: "usuario",
        isActive: false,
        password: "hashed-password",
        photoUrl: null,
        approvalStatus: "approved",
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException for pending approval", async () => {
      const loginDto = {
        email: "pending@example.com",
        password: "password123",
      };

      const mockUser = {
        id: "user-1",
        email: loginDto.email,
        name: "Pending User",
        role: "empresa",
        isActive: false,
        password: "hashed-password",
        photoUrl: null,
        approvalStatus: "pending",
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("refreshToken", () => {
    it("should return new tokens for valid refresh token", async () => {
      const mockUser = {
        id: "user-1",
        email: "test@example.com",
        role: "usuario",
        isActive: true,
      };

      const mockStoredToken = {
        id: "token-1",
        userId: "user-1",
        token: "valid-refresh-token",
        expiresAt: new Date(Date.now() + 86400000),
        revoked: false,
      };

      mockPrisma.refreshToken.findUnique.mockResolvedValue(mockStoredToken);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.refreshToken.update.mockResolvedValue({
        ...mockStoredToken,
        revoked: true,
      });
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.refreshToken(
        "user-1",
        "valid-refresh-token",
      );

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(mockPrisma.refreshToken.update).toHaveBeenCalledWith({
        where: { id: "token-1" },
        data: { revoked: true },
      });
    });

    it("should throw UnauthorizedException for invalid refresh token", async () => {
      mockPrisma.refreshToken.findUnique.mockResolvedValue(null);

      await expect(
        service.refreshToken("user-1", "invalid-token"),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException for revoked refresh token", async () => {
      const mockStoredToken = {
        id: "token-1",
        userId: "user-1",
        token: "revoked-token",
        expiresAt: new Date(Date.now() + 86400000),
        revoked: true,
      };

      mockPrisma.refreshToken.findUnique.mockResolvedValue(mockStoredToken);

      await expect(
        service.refreshToken("user-1", "revoked-token"),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException for expired refresh token", async () => {
      const mockStoredToken = {
        id: "token-1",
        userId: "user-1",
        token: "expired-token",
        expiresAt: new Date(Date.now() - 86400000),
        revoked: false,
      };

      mockPrisma.refreshToken.findUnique.mockResolvedValue(mockStoredToken);

      await expect(
        service.refreshToken("user-1", "expired-token"),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
