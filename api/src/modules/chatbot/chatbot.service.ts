import {
  Injectable,
  HttpException,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { PrismaService } from "../../prisma/prisma.service";
import { RecommendationsService } from "../recommendations/recommendations.service";

@Injectable()
export class ChatbotService {
  private readonly apiKey: string;
  private readonly apiUrl = "https://api.openai.com/v1/chat/completions";

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private prisma: PrismaService,
    private recommendationsService: RecommendationsService,
  ) {
    this.apiKey = this.configService.get<string>("OPENAI_API_KEY") || "";
  }

  private assertApiKeyConfigured() {
    if (!this.apiKey) {
      throw new ServiceUnavailableException(
        "Chat no disponible: OPENAI_API_KEY no configurada",
      );
    }
  }

  async sendMessage(userId: string, message: string, conversationId?: string) {
    this.assertApiKeyConfigured();

    // Get conversation history
    const history = conversationId
      ? await this.getConversationHistory(conversationId)
      : [];

    // Get real context: places, products with booking availability and
    // personalized recommendations (Módulo 1) as chat suggestions source.
    const [placesContext, productsContext, recommendations] =
      await Promise.all([
        this.getPlacesContext(message),
        this.getProductsContext(message),
        this.getRecommendationsContext(userId),
      ]);

    const recommendationLines = recommendations
      .map(
        (r) =>
          `- ${r.name}${r.category ? ` (${r.category})` : ""}`,
      )
      .join("\n");

    const productLines = productsContext.products
      .map(
        (p) =>
          `- ${p.name} (${p.type}) en ${p.place ?? "Santa Cruz"}: ${
            p.currency === "BOB" ? `Bs. ${p.price}` : `US$ ${p.price}`
          } — cupos restantes: ${
            p.availability == null ? "sin límite" : p.availability
          }`,
      )
      .join("\n");

    const systemPrompt = `Sos el asistente virtual de BoliviaExperience, una app turística para Santa Cruz de la Sierra, Bolivia.
Tu objetivo es ayudar a los turistas a descubrir lugares, restaurantes, hoteles y eventos.
Sé amigable, entusiasta y usa un tono cercano (tutear).
Respondé en español.
Tenés acceso a ${placesContext.count} lugares y a ${productsContext.products.length} productos reservables con disponibilidad real en Santa Cruz.

Lugares relevantes:
${placesContext.places
  .map((p) => `- ${p.name}: ${p.description} (${p.address})`)
  .join("\n")}

Productos reservables (con disponibilidad real en cupos restantes):
${productLines}

Sugerencias personalizadas para este usuario (según sus favoritos, reseñas y preferencias de viaje):
${recommendationLines}

Reglas:
- Usá SIEMPRE los datos reales de lugares y productos de arriba; no inventes precios ni disponibilidad.
- Si proponés un plan concreto (lugares, restaurantes, tours o experiencias), cerrá tu respuesta con la oferta literal: "¿Quieres que te arme esto directamente en la app?"`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map((h) => ({ role: h.role, content: h.content })),
      { role: "user", content: message },
    ];

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          this.apiUrl,
          {
            model: "gpt-3.5-turbo",
            messages,
            max_tokens: 500,
            temperature: 0.7,
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              "Content-Type": "application/json",
            },
          },
        ),
      );

      const reply =
        response.data.choices[0]?.message?.content ||
        "No pude generar una respuesta.";

      // Save conversation
      const convId = conversationId || (await this.createConversation(userId));
      await this.saveMessage(convId, "user", message);
      await this.saveMessage(convId, "assistant", reply);

      return {
        reply,
        conversationId: convId,
      };
    } catch (error) {
      throw new HttpException("Error al procesar mensaje", 502);
    }
  }

  private async getPlacesContext(query: string) {
    const places = await this.prisma.place.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
          { category: { name: { contains: query } } },
        ],
      },
      include: {
        category: { select: { name: true } },
      },
      take: 10,
    });

    return {
      places: places.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        address: p.address,
      })),
      count: places.length,
    };
  }

  private async getProductsContext(query: string) {
    const products = await this.prisma.product.findMany({
      where: {
        modalidadReserva: { not: "ninguna" },
        place: { is: { isActive: true } },
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
          { type: { contains: query } },
          { place: { name: { contains: query } } },
        ],
      },
      include: {
        place: { select: { id: true, name: true } },
      },
      take: 8,
    });

    const ids = products.map((p) => p.id);
    const activeCounts =
      ids.length > 0
        ? await this.prisma.reservation.groupBy({
            by: ["productId"],
            where: {
              productId: { in: ids },
              status: { in: ["pending", "confirmed", "held"] },
            },
            _count: { productId: true },
          })
        : [];

    const countByProduct = new Map<string, number>();
    activeCounts.forEach((row) => {
      if (row.productId) countByProduct.set(row.productId, row._count.productId);
    });

    return {
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        price: Number(p.price),
        currency: p.currency,
        place: p.place?.name ?? null,
        capacity: p.capacity,
        availability:
          p.capacity == null
            ? null
            : Math.max(0, p.capacity - (countByProduct.get(p.id) ?? 0)),
      })),
    };
  }

  private async getRecommendationsContext(userId: string) {
    try {
      const { recommendations } =
        await this.recommendationsService.getPersonalized(userId, 5);
      return recommendations.map((r) => ({
        id: r.id,
        name: r.name,
        category: r.category?.name ?? null,
      }));
    } catch {
      return [];
    }
  }

  private async createConversation(userId: string): Promise<string> {
    const conv = await this.prisma.chatConversation.create({
      data: { userId },
    });
    return conv.id;
  }

  private async getConversationHistory(conversationId: string) {
    return this.prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      take: 20,
    });
  }

  private async saveMessage(
    conversationId: string,
    role: string,
    content: string,
  ) {
    return this.prisma.chatMessage.create({
      data: { conversationId, role, content },
    });
  }

  async getConversations(userId: string) {
    return this.prisma.chatConversation.findMany({
      where: { userId },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  async getConversationMessages(conversationId: string, userId: string) {
    const conversation = await this.prisma.chatConversation.findFirst({
      where: { id: conversationId, userId },
    });
    if (!conversation)
      throw new NotFoundException("Conversación no encontrada");
    return this.prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      take: 50,
    });
  }
}