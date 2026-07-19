import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../../common/services/email.service';
import { RegisterDto, LoginDto, RegisterBusinessDto } from './dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    private httpService: HttpService,
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

    // Generate email verification token
    const verificationToken = this.jwtService.sign(
      { sub: user.id, email: user.email, type: 'email_verification' },
      { expiresIn: '24h' },
    );

    // Send verification email (don't await — fire and forget)
    this.emailService.sendVerificationEmail(user.email, user.name, verificationToken).catch(() => {});

    const tokens = await this.generateTokens(user.id, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isEmailVerified: false,
      },
      ...tokens,
    };
  }

  async verifyEmail(token: string) {
    try {
      const payload = this.jwtService.verify(token);

      if (payload.type !== 'email_verification') {
        throw new BadRequestException('Invalid token type');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (user.isEmailVerified) {
        return { message: 'Email already verified', email: user.email };
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: { isEmailVerified: true },
      });

      return { message: 'Email verified successfully', email: user.email };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired verification token');
    }
  }

  async loginWithGoogle(idToken: string) {
    try {
      // Verify token with Google Token Info API
      const response = await firstValueFrom(
        this.httpService.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`),
      );

      const { email, name, picture, sub: googleId } = response.data;

      if (!email) {
        throw new UnauthorizedException('Invalid Google token: no email');
      }

      // Check if user exists by email or by provider+providerId
      let user = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { provider: 'google', providerId: googleId },
          ],
        },
      });

      if (!user) {
        // Create new user
        user = await this.prisma.user.create({
          data: {
            email,
            name: name || email.split('@')[0],
            photoUrl: picture,
            provider: 'google',
            providerId: googleId,
            isEmailVerified: true, // Google emails are verified
          },
        });
      } else if (user.provider !== 'google') {
        // User exists with email/password — link Google account
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            provider: 'google',
            providerId: googleId,
            photoUrl: picture || user.photoUrl,
            isEmailVerified: true,
          },
        });
      }

      const tokens = await this.generateTokens(user.id, user.role);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          photoUrl: user.photoUrl,
          isEmailVerified: user.isEmailVerified,
        },
        ...tokens,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  async loginWithFacebook(accessToken: string) {
    try {
      // Verify token with Facebook Graph API
      const response = await firstValueFrom(
        this.httpService.get(`https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`),
      );

      const { email, name, id: facebookId } = response.data;

      if (!email) {
        throw new UnauthorizedException('Invalid Facebook token: no email');
      }

      // Check if user exists by email or by provider+providerId
      let user = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { provider: 'facebook', providerId: facebookId },
          ],
        },
      });

      if (!user) {
        // Create new user
        user = await this.prisma.user.create({
          data: {
            email,
            name: name || email.split('@')[0],
            provider: 'facebook',
            providerId: facebookId,
            isEmailVerified: true, // Facebook emails are verified
          },
        });
      } else if (user.provider !== 'facebook') {
        // User exists with email/password — link Facebook account
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            provider: 'facebook',
            providerId: facebookId,
            isEmailVerified: true,
          },
        });
      }

      const tokens = await this.generateTokens(user.id, user.role);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          photoUrl: user.photoUrl,
          isEmailVerified: user.isEmailVerified,
        },
        ...tokens,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid Facebook token');
    }
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
        isEmailVerified: user.isEmailVerified,
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
      throw new UnauthorizedException('User not found or inactive');
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

  async logout(refreshToken: string) {
    try {
      await this.prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { revoked: true },
      });
    } catch (_) {}
    return { success: true };
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
    const accessPayload = { sub: userId, role, type: 'access' };
    const accessToken = await this.jwtService.signAsync(accessPayload);

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
