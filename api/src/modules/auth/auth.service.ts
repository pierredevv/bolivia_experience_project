import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto, LoginDto, RegisterBusinessDto } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: hashedPassword,
        language: dto.language || 'es',
      },
    });

    const tokens = await this.generateTokens(user.id, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check approval status before active status — pending businesses get a specific message
    if (user.approvalStatus === 'pending') {
      throw new UnauthorizedException('Tu cuenta está pendiente de aprobación. Te notificaremos por correo cuando sea aprobada por nuestro equipo.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Tu cuenta ha sido desactivada. Contacta al soporte.');
    }

    if (!user.password) {
      throw new UnauthorizedException('Account created with Google. Use Google login.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        photoUrl: user.photoUrl,
        approvalStatus: user.approvalStatus,
      },
      ...tokens,
    };
  }

  async refreshToken(userId: string, refreshToken: string) {
    // Verify the refresh token exists and is not revoked
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken || storedToken.revoked) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found');
    }

    // Revoke the old refresh token
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });

    // Generate new tokens
    const tokens = await this.generateTokens(user.id, user.role);

    return tokens;
  }

  async registerBusiness(dto: RegisterBusinessDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          name: dto.name,
          password: hashedPassword,
          role: 'empresa',
          isActive: false,
          businessName: dto.businessName,
          businessPhone: dto.businessPhone || null,
          approvalStatus: 'pending',
        },
      });

      await tx.place.create({
        data: {
          name: dto.businessName,
          address: dto.address,
          categoryId: dto.categoryId,
          latitude: dto.latitude || 0,
          longitude: dto.longitude || 0,
          ownerId: user.id,
          isActive: false,
        },
      });

      return user;
    });

    return {
      message: 'Registro exitoso. Tu cuenta está pendiente de aprobación.',
      user: {
        id: result.id,
        email: result.email,
        name: result.name,
        businessName: result.businessName,
        approvalStatus: result.approvalStatus,
      },
    };
  }

  private async generateTokens(userId: string, role: string) {
    const payload = { sub: userId, role };

    const accessToken = await this.jwtService.signAsync(payload);

    const refreshTokenPayload = { sub: userId, role, type: 'refresh', jti: Date.now().toString() };
    const refreshToken = await this.jwtService.signAsync(refreshTokenPayload, {
      expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRATION', '7d'),
    });

    // Calculate expiration date from REFRESH_TOKEN_EXPIRATION
    const expirationStr = this.configService.get('REFRESH_TOKEN_EXPIRATION', '7d');
    const days = parseInt(expirationStr) || 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    // Store refresh token in database
    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }
}
