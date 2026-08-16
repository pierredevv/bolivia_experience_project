import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  AdminUsersDto,
  AdminReviewsDto,
  UpdateProductCashbackDto,
  UpdateProductPremiadoDto,
  CreateSafetyZoneDto,
  UpdateSafetyZoneDto,
} from "./dto";
import { PaginatedResponse } from "../../common/dto/pagination.dto";
import { ReviewStatus } from "../../common/constants/review-status";

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async findAllUsers(dto: AdminUsersDto) {
    const where: any = {};
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const skip = (page - 1) * limit;

    if (dto.search) {
      where.OR = [
        { name: { contains: dto.search } },
        { email: { contains: dto.search } },
      ];
    }

    if (dto.role) {
      where.role = dto.role;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          photoUrl: true,
          role: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: { reviews: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.user.count({ where }),
    ]);

    return new PaginatedResponse(users, total, page, limit);
  }

  async findAllReviews(dto: AdminReviewsDto) {
    const where: any = {};
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const skip = (page - 1) * limit;

    if (dto.status === "pending") {
      where.status = ReviewStatus.UNDER_REVIEW;
    } else if (dto.status === "approved") {
      where.status = ReviewStatus.PUBLISHED;
    } else if (dto.status === "hidden") {
      where.status = ReviewStatus.HIDDEN;
    } else if (dto.status === "deleted") {
      where.status = ReviewStatus.DELETED;
    }

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true, photoUrl: true },
          },
          place: {
            select: { id: true, name: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.review.count({ where }),
    ]);

    return new PaginatedResponse(reviews, total, page, limit);
  }

  async getDashboardStats() {
    const [
      totalUsers,
      totalPlaces,
      totalReviews,
      totalEvents,
      pendingReviews,
      recentReviews,
      recentUsers,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.place.count({ where: { isActive: true } }),
      this.prisma.review.count(),
      this.prisma.event.count({ where: { isActive: true } }),
      this.prisma.review.count({
        where: { status: ReviewStatus.UNDER_REVIEW },
      }),
      this.prisma.review.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true } },
          place: { select: { id: true, name: true } },
        },
      }),
      this.prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      stats: {
        totalUsers,
        totalPlaces,
        totalReviews,
        totalEvents,
        pendingReviews,
      },
      recentReviews,
      recentUsers,
    };
  }

  async findBusinesses(status?: string) {
    const where: any = { role: "empresa" };

    if (status === "pending") {
      where.approvalStatus = "pending";
    } else if (status === "approved") {
      where.approvalStatus = "approved";
    } else if (status === "rejected") {
      where.approvalStatus = "rejected";
    }

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        businessName: true,
        businessPhone: true,
        approvalStatus: true,
        isActive: true,
        isPremium: true,
        createdAt: true,
        places: {
          select: { id: true, name: true, address: true, isActive: true },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async approveBusiness(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== "empresa") {
      throw new NotFoundException("Business user not found");
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { isActive: true, approvalStatus: "approved" },
      });

      await tx.place.updateMany({
        where: { ownerId: userId },
        data: { isActive: true },
      });

      return { message: "Business approved successfully" };
    });
  }

  async suspendBusiness(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== "empresa") {
      throw new NotFoundException("Business user not found");
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { isActive: false, approvalStatus: "rejected" },
      });

      await tx.place.updateMany({
        where: { ownerId: userId },
        data: { isActive: false },
      });

      return { message: "Business suspended" };
    });
  }

  async togglePremium(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== "empresa") {
      throw new NotFoundException("Business user not found");
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { isPremium: !user.isPremium },
      select: {
        id: true,
        isPremium: true,
        name: true,
        businessName: true,
      },
    });
  }

  async setProductCashback(
    productId: string,
    dto: UpdateProductCashbackDto,
  ) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException("Product not found");

    const porcentaje =
      dto.porcentaje !== undefined ? dto.porcentaje : product.cashbackPorcentaje;
    const activo =
      dto.activo !== undefined
        ? dto.activo
        : porcentaje !== null && porcentaje > 0
          ? true
          : product.cashbackActivo;

    return this.prisma.product.update({
      where: { id: productId },
      data: {
        cashbackActivo: activo,
        cashbackPorcentaje: porcentaje,
      },
      select: {
        id: true,
        name: true,
        cashbackActivo: true,
        cashbackPorcentaje: true,
      },
    });
  }

  async toggleProductPremiado(
    productId: string,
    dto: UpdateProductPremiadoDto,
  ) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException("Product not found");

    return this.prisma.product.update({
      where: { id: productId },
      data: { premiado: dto.premiado ?? !product.premiado },
      select: { id: true, name: true, premiado: true },
    });
  }

  async listSafetyZones() {
    return this.prisma.safetyZone.findMany({
      orderBy: { name: "asc" },
    });
  }

  async createSafetyZone(dto: CreateSafetyZoneDto) {
    return this.prisma.safetyZone.create({ data: dto });
  }

  async updateSafetyZone(id: string, dto: UpdateSafetyZoneDto) {
    const zone = await this.prisma.safetyZone.findUnique({ where: { id } });
    if (!zone) throw new NotFoundException("Safety zone not found");

    return this.prisma.safetyZone.update({ where: { id }, data: dto });
  }

  async removeSafetyZone(id: string) {
    const zone = await this.prisma.safetyZone.findUnique({ where: { id } });
    if (!zone) throw new NotFoundException("Safety zone not found");

    return this.prisma.safetyZone.delete({ where: { id } });
  }

  // In-memory settings for MVP - can be migrated to DB later
  private settings: Record<string, any> = {
    siteName: "BoliviaExperience",
    contactEmail: "info@boliviaexperience.com",
    maintenanceMode: false,
    defaultLanguage: "es",
  };

  async getSettings() {
    return this.settings;
  }

  async updateSettings(data: Record<string, any>) {
    this.settings = { ...this.settings, ...data };
    return { message: "Settings updated", settings: this.settings };
  }
}
