import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { UpdateUserDto } from "./dto";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        photoUrl: true,
        country: true,
        language: true,
        role: true,
        points: true,
        budgetType: true,
        tourismType: true,
        interests: true,
        createdAt: true,
        _count: {
          select: {
            reviews: true,
            favorites: true,
            userBadges: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return {
      ...user,
      interests: user.interests ? JSON.parse(user.interests) : [],
    };
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    const data: Record<string, unknown> = {
      name: dto.name,
      photoUrl: dto.photoUrl,
      country: dto.country,
      language: dto.language,
      budgetType: dto.budgetType,
      tourismType: dto.tourismType,
    };
    if (dto.interests !== undefined) {
      data.interests = JSON.stringify(dto.interests);
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        photoUrl: true,
        country: true,
        language: true,
        budgetType: true,
        tourismType: true,
        interests: true,
      },
    });

    return {
      ...user,
      interests: user.interests ? JSON.parse(user.interests) : [],
    };
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        photoUrl: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }
}
