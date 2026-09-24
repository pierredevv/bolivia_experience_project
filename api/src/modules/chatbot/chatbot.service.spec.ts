import { Test, TestingModule } from "@nestjs/testing";
import { ChatbotService } from "./chatbot.service";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { PrismaService } from "../../prisma/prisma.service";
import { RecommendationsService } from "../recommendations/recommendations.service";
import { NotFoundException } from "@nestjs/common";
import { of, throwError } from "rxjs";

const mockReply = {
  data: {
    choices: [{ message: { content: "Te recomiendo El Palmar." } }],
  },
};

describe("ChatbotService", () => {
  let service: ChatbotService;
  let httpService: HttpService;
  let prisma: PrismaService;
  let recommendationsService: RecommendationsService;

  const mockPrisma = {
    chatConversation: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    chatMessage: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    place: {
      findMany: jest.fn(),
    },
    product: {
      findMany: jest.fn(),
    },
    reservation: {
      groupBy: jest.fn(),
    },
  };

  const mockRecommendations = {
    getPersonalized: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatbotService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue("sk-test-key") },
        },
        { provide: HttpService, useValue: { post: jest.fn() } },
        { provide: PrismaService, useValue: mockPrisma },
        {
          provide: RecommendationsService,
          useValue: mockRecommendations,
        },
      ],
    }).compile();

    service = module.get<ChatbotService>(ChatbotService);
    httpService = module.get<HttpService>(HttpService);
    prisma = module.get<PrismaService>(PrismaService);
    recommendationsService =
      module.get<RecommendationsService>(RecommendationsService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("sendMessage", () => {
    it("should build a prompt with places, products availability and recommendations", async () => {
      mockPrisma.place.findMany.mockResolvedValue([
        {
          id: "place-1",
          name: "El Palmar",
          description: "Comida cruceña",
          address: "Av. San Martín",
          category: { name: "Restaurantes" },
        },
      ]);
      mockPrisma.product.findMany.mockResolvedValue([
        {
          id: "product-1",
          name: "Mesa para 2 personas",
          type: "mesa",
          price: "60",
          currency: "BOB",
          capacity: 10,
          modalidadReserva: "instantanea",
          place: { id: "place-1", name: "El Palmar" },
        },
      ]);
      mockPrisma.reservation.groupBy.mockResolvedValue([
        { productId: "product-1", _count: { productId: 3 } },
      ]);
      mockRecommendations.getPersonalized.mockResolvedValue({
        recommendations: [
          {
            id: "r1",
            name: "La Casa de la Pascana",
            category: { name: "Restaurantes" },
          },
        ],
        basedOn: { favoriteCategories: [], preferences: {} },
      });
      mockPrisma.chatConversation.create.mockResolvedValue({
        id: "conv-1",
      });
      mockPrisma.chatMessage.create.mockResolvedValue({});

      (httpService.post as jest.Mock).mockReturnValue(of(mockReply));

      const result = await service.sendMessage("user-1", "quiero una mesa");

      expect(result.reply).toContain("El Palmar");
      expect(result.conversationId).toBe("conv-1");

      const postArgs = (httpService.post as jest.Mock).mock.calls[0];
      const messages = postArgs[1].messages as any[];
      const systemPrompt = messages[0].content as string;
      expect(systemPrompt).toContain("Mesa para 2 personas");
      expect(systemPrompt).toContain("cupos restantes: 7");
      expect(systemPrompt).toContain("La Casa de la Pascana");
      expect(systemPrompt).toContain(
        "¿Quieres que te arme esto directamente en la app?",
      );
      expect(messages[messages.length - 1]).toEqual({
        role: "user",
        content: "quiero una mesa",
      });
    });

    it("should reuse the existing conversation for history", async () => {
      mockPrisma.place.findMany.mockResolvedValue([]);
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockRecommendations.getPersonalized.mockResolvedValue({
        recommendations: [],
        basedOn: { favoriteCategories: [], preferences: {} },
      });
      mockPrisma.chatMessage.findMany.mockResolvedValue([
        { role: "user", content: "hola", createdAt: new Date() },
        { role: "assistant", content: "¿En qué te ayudo?", createdAt: new Date() },
      ]);
      mockPrisma.chatMessage.create.mockResolvedValue({});

      (httpService.post as jest.Mock).mockReturnValue(of(mockReply));

      await service.sendMessage("user-1", "continúa", "conv-1");

      const postArgs = (httpService.post as jest.Mock).mock.calls[0];
      const messages = postArgs[1].messages as any[];
      expect(messages).toHaveLength(4);
      expect(messages[1].content).toBe("hola");
      expect(messages[2].content).toBe("¿En qué te ayudo?");
    });

    it("should not ask recommendations when getPersonalized fails", async () => {
      mockPrisma.place.findMany.mockResolvedValue([]);
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockRecommendations.getPersonalized.mockRejectedValue(
        new Error("boom"),
      );
      mockPrisma.chatConversation.create.mockResolvedValue({
        id: "conv-2",
      });
      mockPrisma.chatMessage.create.mockResolvedValue({});

      (httpService.post as jest.Mock).mockReturnValue(of(mockReply));

      const result = await service.sendMessage("user-1", "hola");

      expect(result.reply).toContain("El Palmar");
      expect(result.conversationId).toBe("conv-2");
    });

    it("should throw 503 when OPENAI_API_KEY is missing", async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ChatbotService,
          {
            provide: ConfigService,
            useValue: { get: jest.fn().mockReturnValue(undefined) },
          },
          { provide: HttpService, useValue: { post: jest.fn() } },
          { provide: PrismaService, useValue: mockPrisma },
          {
            provide: RecommendationsService,
            useValue: mockRecommendations,
          },
        ],
      }).compile();

      const noKeyService = module.get<ChatbotService>(ChatbotService);

      await expect(noKeyService.sendMessage("user-1", "hola")).rejects.toMatchObject(
        { status: 503 },
      );
    });

    it("should throw 502 when OpenAI fails", async () => {
      mockPrisma.place.findMany.mockResolvedValue([]);
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockRecommendations.getPersonalized.mockResolvedValue({
        recommendations: [],
        basedOn: { favoriteCategories: [], preferences: {} },
      });

      (httpService.post as jest.Mock).mockReturnValue(
        throwError(() => new Error("upstream timeout")),
      );

      await expect(service.sendMessage("user-1", "hola")).rejects.toMatchObject(
        { status: 502 },
      );
    });
  });

  describe("getConversationMessages", () => {
    it("should return messages of an owned conversation", async () => {
      mockPrisma.chatConversation.findFirst.mockResolvedValue({
        id: "conv-1",
        userId: "user-1",
      });
      mockPrisma.chatMessage.findMany.mockResolvedValue([
        { id: "m1", role: "user", content: "hola" },
      ]);

      const result = await service.getConversationMessages(
        "conv-1",
        "user-1",
      );

      expect(result).toHaveLength(1);
      expect(mockPrisma.chatMessage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { conversationId: "conv-1" } }),
      );
      expect(mockPrisma.chatConversation.findFirst).toHaveBeenCalledWith({
        where: { id: "conv-1", userId: "user-1" },
      });
    });

    it("should throw NotFoundException for another user's conversation", async () => {
      mockPrisma.chatConversation.findFirst.mockResolvedValue(null);

      await expect(
        service.getConversationMessages("conv-1", "other-user"),
      ).rejects.toThrow(NotFoundException);
    });
  });
});