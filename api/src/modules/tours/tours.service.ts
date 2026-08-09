import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

// Tramo de precio por tamaño de grupo (JSON en tramos_precio)
export interface PriceTramo {
  min: number;
  max: number;
  precio: number;
}

// Subcategorías de tours soportadas (definidas por el socio en subcategoria_tour)
export const TOUR_SUBCATEGORIES = [
  "naturaleza_vida_salvaje",
  "cultural_rural",
  "multi_dia",
  "visita_privada",
  "privada_lujo",
  "recorrido_historico",
  "caminata_turistica",
  "caminata_sin_guia",
] as const;

// Budget range del Producto (mochilero | medio | premium) → niveles ideales
const BUDGET_RANGE_PRICE_MAP: Record<string, number[]> = {
  mochilero: [1, 2],
  medio: [2, 3],
  premium: [3, 4],
};

// Budget type del viaje (Trip.budgetType) → rango de presupuesto del producto
const BUDGET_TYPE_TO_RANGE: Record<string, string> = {
  low_cost: "mochilero",
  medio: "medio",
  premium: "premium",
  luxury: "premium", // alias premium
};

const BUDGET_SCORE_EXACT = 60;
const BUDGET_SCORE_ADJACENT = 35;
const BUDGET_SCORE_FAR = 15;
const BUDGET_SCORE_NEUTRAL = 30;

const TOURISM_SCORE_MATCH = 40;
const TOURISM_SCORE_NEUTRAL = 20;

@Injectable()
export class ToursService {
  constructor(private prisma: PrismaService) {}

  /**
   * Lista todos los productos-tour activos (type="experiencia") con subcategoría
   * y tramos de precio parseados. El frontend agrupa por subcategoriaTour.
   */
  async findAll() {
    const products = await this.prisma.product.findMany({
      where: { isActive: true, type: "experiencia" },
      include: {
        socio: { select: { id: true, name: true, isPremium: true } },
        place: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            category: { select: { id: true, name: true, slug: true } },
          },
        },
      },
      orderBy: { ratingAvg: "desc" },
    });

    const tours = products.map((p) => this.toTourDto(p));
    return { data: tours, meta: { total: tours.length } };
  }

  /**
   * Tours recomendados. Si el usuario tiene sesión, prioriza por presupuesto y
   * tipo de turismo (del viaje más reciente). Sin sesión/perfil: orden por rating.
   */
  async findRecommended(userId?: string | null, limit = 10) {
    const preferences = userId
      ? await this.latestTripPreferences(userId)
      : null;

    const products = await this.prisma.product.findMany({
      where: { isActive: true, type: "experiencia" },
      include: {
        socio: { select: { id: true, name: true, isPremium: true } },
        place: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            category: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    let items = products.map((p) => this.toTourDto(p));

    if (preferences && (preferences.budgetType || preferences.tourismType)) {
      items = items
        .map((tour: any) => ({
          ...tour,
          matchScore: this.calculateMatchScore(tour, preferences),
        }))
        .sort((a: any, b: any) => b.matchScore - a.matchScore)
        .map(({ matchScore, ...tour }: any) => tour);
    } else {
      items.sort((a: any, b: any) => b.ratingAvg - a.ratingAvg);
    }

    const data = items.slice(0, limit);
    return {
      data,
      meta: {
        total: data.length,
        personalized: Boolean(preferences?.budgetType || preferences?.tourismType),
      },
    };
  }

  private async latestTripPreferences(userId: string) {
    const trip = await this.prisma.trip.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { budgetType: true, tourismType: true },
    });
    return trip ?? null;
  }

  /**
   * Score de match 0-100 (presupuesto 0-60 + turismo 0-40), adaptado de
   * PlacesScoringService a Product (budgetRange + tourismType).
   */
  calculateMatchScore(
    product: { budgetRange?: string | null; tourismType?: string | null },
    preferences: { budgetType?: string | null; tourismType?: string | null },
  ): number {
    return (
      this.calculateBudgetScore(product.budgetRange, preferences.budgetType) +
      this.calculateTourismScore(product.tourismType, preferences.tourismType)
    );
  }

  private calculateBudgetScore(
    budgetRange: string | null | undefined,
    budgetType: string | null | undefined,
  ): number {
    if (!budgetType) return BUDGET_SCORE_NEUTRAL;
    if (!budgetRange) return BUDGET_SCORE_NEUTRAL;

    const idealRange = BUDGET_TYPE_TO_RANGE[budgetType];
    if (!idealRange) return BUDGET_SCORE_NEUTRAL;

    if (budgetRange === idealRange) return BUDGET_SCORE_EXACT;

    const idealLevels = BUDGET_RANGE_PRICE_MAP[idealRange];
    const actualLevels = BUDGET_RANGE_PRICE_MAP[budgetRange];
    if (!idealLevels || !actualLevels) return BUDGET_SCORE_NEUTRAL;

    const distance = Math.min(
      Math.abs(Math.min(...actualLevels) - Math.min(...idealLevels)),
      Math.abs(Math.max(...actualLevels) - Math.max(...idealLevels)),
    );

    if (distance === 1) return BUDGET_SCORE_ADJACENT;
    return BUDGET_SCORE_FAR;
  }

  private calculateTourismScore(
    tourismType: string | null | undefined,
    preferred: string | null | undefined,
  ): number {
    if (!preferred || preferred === "ambos") return TOURISM_SCORE_NEUTRAL;
    if (!tourismType || tourismType === "ambos") return TOURISM_SCORE_NEUTRAL;
    return tourismType === preferred ? TOURISM_SCORE_MATCH : 0;
  }

  private toTourDto(p: any) {
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      descriptionEn: p.descriptionEn,
      type: p.type,
      experienceCategory: p.experienceCategory,
      subcategoriaTour: p.subcategoriaTour,
      duracionDias: p.duracionDias,
      esImprescindible: p.esImprescindible,
      tramosPrecio: this.parseTramos(p.tramosPrecioJson),
      price: p.price,
      pricePerAdult: p.pricePerAdult,
      priceVarByGroup: p.priceVarByGroup,
      currency: p.currency,
      photoUrl: p.photoUrl,
      ratingAvg: p.ratingAvg,
      ratingCount: p.ratingCount,
      tourismType: p.tourismType,
      budgetRange: p.budgetRange,
      recommended: (p.socio?.isPremium ?? false) ||
        (p.ratingCount >= 3 && p.ratingAvg >= 4.75),
      verified: p.socio?.isPremium ?? false,
      socio: p.socio
        ? { id: p.socio.id, name: p.socio.name, isPremium: p.socio.isPremium }
        : null,
      place: p.place
        ? {
            id: p.place.id,
            name: p.place.name,
            address: p.place.address,
            city: p.place.city,
            categorySlug: p.place.category?.slug ?? null,
          }
        : null,
    };
  }

  private parseTramos(json: string | null | undefined): PriceTramo[] {
    if (!json) return [];
    try {
      const parsed = JSON.parse(json);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter(
          (t: any) =>
            t && typeof t.min === "number" &&
            typeof t.max === "number" &&
            typeof t.precio === "number",
        )
        .map((t: any) => ({
          min: t.min,
          max: t.max,
          precio: t.precio,
        }));
    } catch {
      return [];
    }
  }
}
