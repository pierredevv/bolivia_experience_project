import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class GamificationService {
  constructor(private prisma: PrismaService) {}

  async grantReservationPoints(userId: string, totalAmount: number) {
    const points = Math.max(1, Math.round(totalAmount));
    await this.prisma.user.update({
      where: { id: userId },
      data: { points: { increment: points } },
    });
    return points;
  }

  async evaluateBadges(userId: string) {
    const [completedCount, reviewCount, favoriteCount] = await Promise.all([
      this.prisma.reservation.count({ where: { userId, status: "completed" } }),
      this.prisma.review.count({ where: { userId } }),
      this.prisma.favorite.count({ where: { userId } }),
    ]);

    const earnedKeys: string[] = [];
    if (completedCount >= 1) earnedKeys.push("explorador");
    if (completedCount >= 5) earnedKeys.push("viajero-frecuente");
    if (completedCount >= 10) earnedKeys.push("aventurero");
    if (reviewCount >= 3) earnedKeys.push("reviewer");
    if (favoriteCount >= 5) earnedKeys.push("coleccionista");

    const badges = await this.prisma.badge.findMany({
      where: { key: { in: earnedKeys }, isActive: true },
    });

    const newlyEarned: typeof badges = [];
    if (badges.length > 0) {
      const existing = await this.prisma.userBadge.findMany({
        where: { userId, badgeId: { in: badges.map((b) => b.id) } },
        select: { badgeId: true },
      });
      const existingIds = new Set(existing.map((e) => e.badgeId));
      const toCreate = badges.filter((b) => !existingIds.has(b.id));
      if (toCreate.length > 0) {
        await this.prisma.userBadge.createMany({
          data: toCreate.map((b) => ({ userId, badgeId: b.id })),
        });
        newlyEarned.push(...toCreate);
      }
    }

    return newlyEarned;
  }

  async getUserGamification(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, points: true },
    });

    const userBadges = await this.prisma.userBadge.findMany({
      where: { userId },
      orderBy: { earnedAt: "asc" },
      include: { badge: true },
    });

    return {
      userId,
      points: user?.points ?? 0,
      badges: userBadges.map((ub) => ({
        id: ub.badge.id,
        key: ub.badge.key,
        name: ub.badge.name,
        nameEn: ub.badge.nameEn,
        description: ub.badge.description,
        descriptionEn: ub.badge.descriptionEn,
        icon: ub.badge.icon,
        points: ub.badge.points,
        earnedAt: ub.earnedAt,
      })),
    };
  }

  async findAllBadges() {
    return this.prisma.badge.findMany({
      where: { isActive: true },
      orderBy: { points: "desc" },
      include: { _count: { select: { userBadges: true } } },
    });
  }
}
