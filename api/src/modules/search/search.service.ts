import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(query: string, categoryId?: string) {
    const where: any = {
      isActive: true,
      OR: [{ name: { contains: query } }, { address: { contains: query } }],
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const places = await this.prisma.place.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, icon: true } },
        photos: { take: 1, orderBy: { displayOrder: "asc" } },
        _count: {
          select: {
            products: {
              where: { isActive: true, modalidadReserva: { not: "ninguna" } },
            },
          },
        },
      },
      orderBy: { ratingAvg: "desc" },
      take: 20,
    });

    return places.map(({ _count, ...place }) => ({
      ...place,
      canReserve: (_count?.products ?? 0) > 0,
    }));
  }

  async suggestions(query: string) {
    const places = await this.prisma.place.findMany({
      where: {
        isActive: true,
        name: { contains: query },
      },
      select: { id: true, name: true, address: true },
      take: 5,
    });

    return places;
  }

  async getHistory(userId: string) {
    return this.prisma.searchHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  }

  async deleteHistory(userId: string) {
    await this.prisma.searchHistory.deleteMany({ where: { userId } });
    return { message: "Search history cleared" };
  }

  async saveSearch(userId: string | null, query: string, resultsCount: number) {
    return this.prisma.searchHistory.create({
      data: { userId, query, resultsCount },
    });
  }
}
