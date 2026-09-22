import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  PlacesScoringService,
  TripPreferences,
} from "../places/places-scoring.service";

@Injectable()
export class RecommendationsService {
  constructor(
    private prisma: PrismaService,
    private readonly scoringService: PlacesScoringService,
  ) {}

  async getPersonalized(
    userId: string,
    limit: number = 10,
    queryPreferences?: TripPreferences,
  ) {
    // Resolve preferences: explicit query > user profile > most recent trip > none
    let prefsSource: "query" | "user" | "trip" | "none" =
      queryPreferences?.budgetType || queryPreferences?.tourismType
        ? "query"
        : "none";
    let preferences: TripPreferences = {};

    if (prefsSource === "none") {
      // Onboarding preferences stored on the user profile (Módulo 8)
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { budgetType: true, tourismType: true, interests: true },
      });
      if (user?.budgetType || user?.tourismType || user?.interests) {
        preferences = {
          budgetType: user.budgetType,
          tourismType: user.tourismType,
          interests: user.interests,
        };
        prefsSource = "user";
      }
    }

    if (prefsSource === "none") {
      const latestTrip = await this.prisma.trip.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { budgetType: true, tourismType: true },
      });
      if (latestTrip?.budgetType || latestTrip?.tourismType) {
        preferences = {
          budgetType: latestTrip.budgetType,
          tourismType: latestTrip.tourismType,
        };
        prefsSource = "trip";
      }
    } else if (prefsSource === "query") {
      preferences = queryPreferences ?? {};
    }

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

    // Onboarding preference boosts (Módulo 8): interests + thematic tourism type
    // translate into preferred category slugs → look up ids and weight them.
    const interestSlugs = this.parseInterests(preferences.interests);
    const tourismSlugs = this.scoringService.resolveTourismCategories(
      preferences.tourismType,
    );
    const boostSlugs = [...new Set([...interestSlugs, ...tourismSlugs])];
    if (boostSlugs.length > 0) {
      const boostCategories = await this.prisma.category.findMany({
        where: { slug: { in: boostSlugs } },
        select: { id: true },
      });
      boostCategories.forEach((cat) => {
        categoryScores[cat.id] = (categoryScores[cat.id] || 0) + 2;
      });
    }

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

    // Score and reorder by match against trip/query preferences
    const scored = this.scoringService.scoreAndSort(recommended, preferences);

    // If not enough recommendations, fill with popular places
    if (scored.length < limit) {
      const additional = await this.prisma.place.findMany({
        where: {
          isActive: true,
          id: { notIn: [...excludePlaceIds, ...scored.map((r) => r.id)] },
        },
        include: {
          category: { select: { id: true, name: true, icon: true } },
          photos: { take: 1, orderBy: { displayOrder: "asc" } },
        },
        orderBy: { ratingAvg: "desc" },
        take: limit - scored.length,
      });
      const additionalScored = this.scoringService.scoreAndSort(
        additional,
        preferences,
      );
      scored.push(...additionalScored);
    }

    return {
      recommendations: scored,
      basedOn: {
        favoriteCategories: sortedCategories,
        totalFavorites: favorites.length,
        totalReviews: reviews.length,
        preferences: {
          budgetType: preferences.budgetType ?? null,
          tourismType: preferences.tourismType ?? null,
          interests: this.parseInterests(preferences.interests),
          source: prefsSource,
        },
      },
    };
  }

  /**
   * Parse the user's `interests` string (JSON array of category slugs) into a
   * clean string list. Returns [] for null/malformed input.
   */
  private parseInterests(interests?: string | null): string[] {
    if (!interests) return [];
    try {
      const parsed = JSON.parse(interests);
      if (Array.isArray(parsed)) {
        return parsed.map((i) => String(i)).filter(Boolean);
      }
    } catch {
      // Ignore malformed JSON — treated as no interests.
    }
    return [];
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
