import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class RecommendationsService {
  constructor(private prisma: PrismaService) {}

  async getPersonalized(userId: string, limit: number = 10) {
    // Get user's favorites and reviews to understand preferences
    const [favorites, reviews, searchHistory] = await Promise.all([
      this.prisma.favorite.findMany({
        where: { userId },
        include: { place: { select: { categoryId: true } } },
      }),
      this.prisma.review.findMany({
        where: { userId },
        include: { place: { select: { categoryId: true, ratingAvg: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      this.prisma.searchHistory.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    // Extract preferred categories
    const categoryScores: Record<string, number> = {};

    // Favorites weight: 3
    favorites.forEach((fav) => {
      const catId = fav.place?.categoryId;
      if (catId) {
        categoryScores[catId] = (categoryScores[catId] || 0) + 3;
      }
    });

    // Reviews weight: 2-5 based on rating
    reviews.forEach((review) => {
      const catId = review.place?.categoryId;
      if (catId) {
        const weight = review.rating || 3;
        categoryScores[catId] = (categoryScores[catId] || 0) + weight;
      }
    });

    // Get top categories
    const sortedCategories = Object.entries(categoryScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([catId]) => catId);

    // Get place IDs to exclude (already favorited or reviewed)
    const excludePlaceIds = [
      ...favorites.map((f) => f.placeId),
      ...reviews.map((r) => r.placeId),
    ];

    // Find recommended places based on preferred categories
    const recommended = await this.prisma.place.findMany({
      where: {
        isActive: true,
        id: { notIn: excludePlaceIds },
        ...(sortedCategories.length > 0
          ? { categoryId: { in: sortedCategories } }
          : {}),
      },
      include: {
        category: { select: { id: true, name: true, icon: true } },
        photos: { take: 1, orderBy: { displayOrder: "asc" } },
      },
      orderBy: { ratingAvg: "desc" },
      take: limit,
    });

    // If not enough recommendations, fill with popular places
    if (recommended.length < limit) {
      const additional = await this.prisma.place.findMany({
        where: {
          isActive: true,
          id: { notIn: [...excludePlaceIds, ...recommended.map((r) => r.id)] },
        },
        include: {
          category: { select: { id: true, name: true, icon: true } },
          photos: { take: 1, orderBy: { displayOrder: "asc" } },
        },
        orderBy: { ratingAvg: "desc" },
        take: limit - recommended.length,
      });
      recommended.push(...additional);
    }

    return {
      recommendations: recommended,
      basedOn: {
        favoriteCategories: sortedCategories,
        totalFavorites: favorites.length,
        totalReviews: reviews.length,
      },
    };
  }

  async getTrending(limit: number = 10) {
    // Places with most recent reviews and high ratings
    return this.prisma.place.findMany({
      where: { isActive: true },
      include: {
        category: { select: { id: true, name: true, icon: true } },
        photos: { take: 1, orderBy: { displayOrder: "asc" } },
        _count: { select: { reviews: true, favorites: true } },
      },
      orderBy: [{ ratingAvg: "desc" }, { ratingCount: "desc" }],
      take: limit,
    });
  }

  async getSimilar(placeId: string, limit: number = 5) {
    const place = await this.prisma.place.findUnique({
      where: { id: placeId },
      select: { categoryId: true, latitude: true, longitude: true },
    });

    if (!place) return [];

    return this.prisma.place.findMany({
      where: {
        isActive: true,
        id: { not: placeId },
        categoryId: place.categoryId,
      },
      include: {
        category: { select: { id: true, name: true, icon: true } },
        photos: { take: 1, orderBy: { displayOrder: "asc" } },
      },
      orderBy: { ratingAvg: "desc" },
      take: limit,
    });
  }
}
