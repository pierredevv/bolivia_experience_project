import { Injectable, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChatbotService {
  private readonly apiKey: string;
  private readonly apiUrl = 'https://api.openai.com/v1/chat/completions';

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private prisma: PrismaService,
  ) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY') || '';
  }

  async sendMessage(userId: string, message: string, conversationId?: string) {
    // Get conversation history
    const history = conversationId
      ? await this.getConversationHistory(conversationId)
      : [];

    // Get context about places
    const placesContext = await this.getPlacesContext(message);

    const systemPrompt = `Sos el asistente virtual de BoliviaExperience, una app turística para Santa Cruz de la Sierra, Bolivia. 
Tu objetivo es ayudar a los turistas a descubrir lugares, restaurantes, hoteles y eventos.
Sé amigable, entusiasta y usa un tono cercano (tutear).
Respondé en español.
Tenés acceso a información de ${placesContext.count} lugares en Santa Cruz.

Lugares relevantes:
${placesContext.places.map(p => `- ${p.name}: ${p.description} (${p.address})`).join('\n')}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message },
    ];

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          this.apiUrl,
          {
            model: 'gpt-3.5-turbo',
            messages,
            max_tokens: 500,
            temperature: 0.7,
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const reply = response.data.choices[0]?.message?.content || 'No pude generar una respuesta.';

      // Save conversation
      const convId = conversationId || await this.createConversation(userId);
      await this.saveMessage(convId, 'user', message);
      await this.saveMessage(convId, 'assistant', reply);

      return {
        reply,
        conversationId: convId,
      };
    } catch (error) {
      throw new HttpException('Error al procesar mensaje', 502);
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

    return { places, count: places.length };
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
      orderBy: { createdAt: 'asc' },
      take: 20,
    });
  }

  private async saveMessage(conversationId: string, role: string, content: string) {
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
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }
}
