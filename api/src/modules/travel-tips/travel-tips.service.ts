import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class TravelTipsService {
  constructor(private prisma: PrismaService) {}

  async findAll(category?: string, city?: string) {
    return this.prisma.travelTip.findMany({
      where: {
        isActive: true,
        ...(category ? { category } : {}),
        ...(city ? { city } : {}),
      },
      orderBy: { createdAt: "asc" },
    });
  }
}
