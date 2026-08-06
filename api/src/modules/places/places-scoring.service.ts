import { Injectable } from '@nestjs/common';

/**
 * PlacesScoringService
 * 
 * Calculates match scores for places based on a trip's preferences.
 * This is a SCORING service (reordering), NOT a filtering service.
 * All places are always returned — they are just re-sorted by match quality.
 * 
 * Score design:
 *   - Budget match:   0–60 points (primary signal)
 *   - Tourism match:  0–40 points (secondary signal)
 *   - priceLevel null: NEUTRAL (50 points budget, no bonus/penalty)
 *   - Total range:    0–100
 */

export interface TripPreferences {
  budgetType?: string | null;
  tourismType?: string | null;
}

export interface ScoredPlace {
  matchScore: number;
  priceVerified: boolean;
  [key: string]: any;
}

// Budget type → which price levels are prioritized
const BUDGET_PRICE_MAP: Record<string, number[]> = {
  low_cost: [1, 2],
  medio: [2, 3],
  premium: [3, 4],
  luxury: [3, 4], // alias for premium (used in existing seed data)
};

// Score for exact match vs adjacent match
const BUDGET_SCORE_EXACT = 60;   // priceLevel is in the ideal range
const BUDGET_SCORE_ADJACENT = 35; // priceLevel is 1 step outside ideal range
const BUDGET_SCORE_FAR = 15;      // priceLevel is 2+ steps outside
const BUDGET_SCORE_NEUTRAL = 30;  // priceLevel is null (truly neutral — middle of range)

const TOURISM_SCORE_MATCH = 40;   // place type matches trip preference
const TOURISM_SCORE_NEUTRAL = 20; // trip preference is "ambos" or not set

@Injectable()
export class PlacesScoringService {

  /**
   * Calculate a match score (0–100) for a single place against trip preferences.
   * 
   * Key invariant: places with priceLevel=null get a NEUTRAL score (30),
   * NOT zero (which would penalize them) and NOT max (which would favor them).
   * They should end up in the middle of the sorted list.
   */
  calculateMatchScore(
    place: { priceLevel?: number | null; isUrban?: boolean },
    preferences: TripPreferences,
  ): number {
    const budgetScore = this.calculateBudgetScore(place.priceLevel, preferences.budgetType);
    const tourismScore = this.calculateTourismScore(place.isUrban, preferences.tourismType);
    return budgetScore + tourismScore;
  }

  /**
   * Budget scoring:
   *   - null priceLevel → NEUTRAL (30 pts, middle of 0–60 range)
   *   - priceLevel in ideal range → 60 pts  
   *   - priceLevel 1 step off → 35 pts
   *   - priceLevel 2+ steps off → 15 pts
   *   - no budgetType preference → everyone gets 30 (neutral)
   */
  private calculateBudgetScore(
    priceLevel: number | null | undefined,
    budgetType: string | null | undefined,
  ): number {
    // No budget preference set → all places score neutral
    if (!budgetType) return BUDGET_SCORE_NEUTRAL;

    // Price not verified → neutral score (no penalty, no bonus)
    if (priceLevel === null || priceLevel === undefined) return BUDGET_SCORE_NEUTRAL;

    const idealLevels = BUDGET_PRICE_MAP[budgetType];
    // Unknown budget type → neutral
    if (!idealLevels) return BUDGET_SCORE_NEUTRAL;

    // Exact match: priceLevel is in the ideal range
    if (idealLevels.includes(priceLevel)) return BUDGET_SCORE_EXACT;

    // Calculate distance from ideal range
    const minIdeal = Math.min(...idealLevels);
    const maxIdeal = Math.max(...idealLevels);
    const distance = Math.min(
      Math.abs(priceLevel - minIdeal),
      Math.abs(priceLevel - maxIdeal),
    );

    if (distance === 1) return BUDGET_SCORE_ADJACENT;
    return BUDGET_SCORE_FAR;
  }

  /**
   * Tourism scoring:
   *   - "ambos" or no preference → neutral (20 pts)
   *   - match (urbano+urban or rural+rural) → 40 pts
   *   - mismatch → 0 pts
   */
  private calculateTourismScore(
    isUrban: boolean | undefined,
    tourismType: string | null | undefined,
  ): number {
    // No preference or "ambos" → neutral for all
    if (!tourismType || tourismType === 'ambos') return TOURISM_SCORE_NEUTRAL;

    // isUrban not set → neutral
    if (isUrban === undefined) return TOURISM_SCORE_NEUTRAL;

    const wantsUrban = tourismType === 'urbano';
    return (wantsUrban === isUrban) ? TOURISM_SCORE_MATCH : 0;
  }

  /**
   * Apply scoring to a list of places and sort by matchScore descending.
   * Adds `matchScore` and `priceVerified` fields to each place.
   * Does NOT filter — all places are returned.
   */
  scoreAndSort<T extends { priceLevel?: number | null; isUrban?: boolean }>(
    places: T[],
    preferences: TripPreferences,
  ): ScoredPlace[] {
    return places
      .map(place => ({
        ...place,
        matchScore: this.calculateMatchScore(place, preferences),
        priceVerified: place.priceLevel !== null && place.priceLevel !== undefined,
      }))
      .sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Enrich a single place with priceVerified (for non-scored responses).
   */
  enrichWithPriceVerified<T extends { priceLevel?: number | null }>(
    place: T,
  ): T & { priceVerified: boolean } {
    return {
      ...place,
      priceVerified: place.priceLevel !== null && place.priceLevel !== undefined,
    };
  }
}
