import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: {
        place: {
          include: {
            category: { select: { id: true, name: true, icon: true } },
            photos: { take: 1, orderBy: { displayOrder: "asc" } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async add(userId: string, placeId: string) {
    const existing = await this.prisma.favorite.findUnique({
      where: { userId_placeId: { userId, placeId } },
    });

    if (existing) {
      throw new ConflictException("Already in favorites");
    }

    return this.prisma.favorite.create({
      data: { userId, placeId },
    });
  }

  async remove(userId: string, placeId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: { userId_placeId: { userId, placeId } },
    });

    if (!favorite) {
      throw new NotFoundException("Favorite not found");
    }

    return this.prisma.favorite.delete({
      where: { userId_placeId: { userId, placeId } },
    });
  }

  async check(userId: string, placeId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: { userId_placeId: { userId, placeId } },
    });

    return { isFavorite: !!favorite };
  }
}
