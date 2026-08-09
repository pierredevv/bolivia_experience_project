import { Injectable } from "@nestjs/common";

@Injectable()
export class SentimentService {
  // Simple keyword-based sentiment analysis for Spanish
  private readonly positiveWords = [
    "excelente",
    "increíble",
    "perfecto",
    "genial",
    "fantástico",
    "maravilloso",
    "bueno",
    "lindo",
    "bonito",
    "recomiendo",
    "delicioso",
    "rica",
    "rico",
    "fresco",
    "limpio",
    "amable",
    "profesional",
    "rápido",
    "eficiente",
    "cómodo",
    "agradable",
    "espectacular",
    "impecable",
    "top",
    "10/10",
    "amazing",
  ];

  private readonly negativeWords = [
    "malo",
    "terrible",
    "pésimo",
    "horrible",
    "feo",
    "sucio",
    "lento",
    "caro",
    "desagradable",
    "no recomiendo",
    "decepcionante",
    "decepcionado",
    "decepcionada",
    "error",
    "problema",
    "queja",
    "lamentable",
    "deficiente",
    "regular",
    "nunca más",
    "evitar",
    "peor",
    "asco",
    "asco",
  ];

  analyzeSentiment(text: string): {
    score: number;
    label: string;
    confidence: number;
  } {
    if (!text || text.trim().length === 0) {
      return { score: 0, label: "neutral", confidence: 0 };
    }

    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);

    let positiveCount = 0;
    let negativeCount = 0;

    for (const word of words) {
      if (this.positiveWords.some((pw) => word.includes(pw))) {
        positiveCount++;
      }
      if (this.negativeWords.some((nw) => word.includes(nw))) {
        negativeCount++;
      }
    }

    const total = positiveCount + negativeCount;
    if (total === 0) {
      return { score: 0, label: "neutral", confidence: 0.3 };
    }

    const score = (positiveCount - negativeCount) / total;
    const confidence = Math.min((total / words.length) * 3, 1);

    let label: string;
    if (score > 0.2) label = "positive";
    else if (score < -0.2) label = "negative";
    else label = "neutral";

    return {
      score: Math.round(score * 100) / 100,
      label,
      confidence: Math.round(confidence * 100) / 100,
    };
  }

  async analyzeReviewBatch(reviews: Array<{ id: string; comment: string }>) {
    return reviews.map((review) => ({
      id: review.id,
      ...this.analyzeSentiment(review.comment),
    }));
  }
}
