import {
  Injectable,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { ConfigService } from "@nestjs/config";
import { randomBytes } from "crypto";

@Injectable()
export class ReferralsService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async getReferralCode(userId: string) {
    let referral = await this.prisma.referral.findUnique({
      where: { userId },
    });

    if (!referral) {
      const code = this.generateCode();
      referral = await this.prisma.referral.create({
        data: {
          userId,
          code,
          referralCount: 0,
          rewardsEarned: 0,
        },
      });
    }

    return {
      code: referral.code,
      referralCount: referral.referralCount,
      rewardsEarned: referral.rewardsEarned,
      shareUrl: `${this.configService.get("APP_URL", "https://boliviaexperience.app")}/invite/${referral.code}`,
    };
  }

  async applyReferralCode(userId: string, code: string) {
    const referral = await this.prisma.referral.findUnique({
      where: { code },
    });

    if (!referral) {
      throw new BadRequestException("Código de referido inválido");
    }

    if (referral.userId === userId) {
      throw new BadRequestException("No podés usar tu propio código");
    }

    // Check if user already used a referral code
    const existingUse = await this.prisma.referralUse.findUnique({
      where: { referredUserId: userId },
    });

    if (existingUse) {
      throw new ConflictException("Ya usaste un código de referido");
    }

    // Create the referral use
    await this.prisma.referralUse.create({
      data: {
        referrerId: referral.userId,
        referredUserId: userId,
        code,
      },
    });

    // Update referrer stats
    await this.prisma.referral.update({
      where: { userId: referral.userId },
      data: {
        referralCount: { increment: 1 },
        rewardsEarned: { increment: 10 }, // 10 points per referral
      },
    });

    // Award points to referrer
    await this.prisma.user.update({
      where: { id: referral.userId },
      data: {
        points: { increment: 10 },
      },
    });

    // Award points to referred user
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        points: { increment: 5 }, // 5 points for signing up via referral
      },
    });

    return { success: true, message: "Código aplicado exitosamente" };
  }

  async getReferralStats(userId: string) {
    const referral = await this.prisma.referral.findUnique({
      where: { userId },
    });

    const uses = await this.prisma.referralUse.findMany({
      where: { referrerId: userId },
      include: {
        referredUser: {
          select: { id: true, name: true, createdAt: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      code: referral?.code ?? null,
      totalReferrals: referral?.referralCount ?? 0,
      totalRewards: referral?.rewardsEarned ?? 0,
      recentReferrals: uses.map((use) => ({
        userName: use.referredUser.name,
        date: use.createdAt,
      })),
    };
  }

  private generateCode(): string {
    return randomBytes(4).toString("hex").toUpperCase();
  }
}
