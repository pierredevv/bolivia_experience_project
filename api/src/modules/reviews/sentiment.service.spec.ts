import { Test, TestingModule } from "@nestjs/testing";
import { SentimentService } from "./sentiment.service";

describe("SentimentService", () => {
  let service: SentimentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SentimentService],
    }).compile();

    service = module.get<SentimentService>(SentimentService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("analyzeSentiment", () => {
    it("should detect positive text", () => {
      const result = service.analyzeSentiment(
        "Excelente lugar, muy recomendado, Increíble servicio",
      );
      expect(result.score).toBeGreaterThan(0);
      expect(result.label).toBe("positive");
    });

    it("should detect negative text", () => {
      const result = service.analyzeSentiment(
        "Terrible experiencia, muy malo y horrible lugar",
      );
      expect(result.score).toBeLessThan(0);
      expect(result.label).toBe("negative");
    });

    it("should detect neutral text", () => {
      const result = service.analyzeSentiment(
        "El lugar está ahí, es un espacio",
      );
      expect(result.label).toBe("neutral");
    });

    it("should return neutral for empty text", () => {
      const result = service.analyzeSentiment("");
      expect(result.score).toBe(0);
      expect(result.label).toBe("neutral");
      expect(result.confidence).toBe(0);
    });

    it("should return neutral for null/undefined text", () => {
      const result = service.analyzeSentiment(null as any);
      expect(result.score).toBe(0);
      expect(result.label).toBe("neutral");
    });

    it("should handle mixed sentiment", () => {
      const result = service.analyzeSentiment(
        "El lugar es bueno pero el servicio es malo",
      );
      expect(result.label).toBe("neutral");
      expect(result.score).toBe(0);
    });
  });

  describe("analyzeReviewBatch", () => {
    it("should analyze multiple reviews", async () => {
      const reviews = [
        { id: "r1", comment: "Excelente lugar, genial" },
        { id: "r2", comment: "Terrible, horrible experiencia" },
        { id: "r3", comment: "Normal, nada especial" },
      ];

      const results = await service.analyzeReviewBatch(reviews);

      expect(results).toHaveLength(3);
      expect(results[0].label).toBe("positive");
      expect(results[1].label).toBe("negative");
      expect(results[2].label).toBe("neutral");
    });
  });
});
