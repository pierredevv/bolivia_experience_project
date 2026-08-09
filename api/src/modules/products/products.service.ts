import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { Prisma } from "@prisma/client";
import {
  CreateProductDto,
  UpdateProductDto,
  QueryProductsDto,
  CreateProductSlotDto,
} from "./dto";
import { ReviewStatus } from "../../common/constants/review-status";
import { PaginatedResponse } from "../../common/dto/pagination.dto";

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  private parseAttributes(
    attributes?: Record<string, any>,
  ): string | undefined {
    if (!attributes) return undefined;
    try {
      return JSON.stringify(attributes);
    } catch {
      throw new BadRequestException("Atributos no válidos");
    }
  }

  async create(socioId: string, dto: CreateProductDto) {
    if (dto.placeId) {
      const place = await this.prisma.place.findUnique({
        where: { id: dto.placeId },
      });
      if (!place) throw new NotFoundException("Establecimiento no encontrado");
      if (place.ownerId && place.ownerId !== socioId) {
        throw new ForbiddenException(
          "El establecimiento pertenece a otro socio",
        );
      }
    }

    return this.prisma.product.create({
      data: {
        socioId,
        placeId: dto.placeId,
        type: dto.type,
        name: dto.name,
        description: dto.description,
        descriptionEn: dto.descriptionEn,
        price: dto.price,
        currency: dto.currency || "BOB",
        capacity: dto.capacity,
        modalidadReserva: dto.modalidadReserva,
        tourismType: dto.tourismType,
        budgetRange: dto.budgetRange,
        attributesJson: this.parseAttributes(dto.attributes),
        policyId: dto.policyId,
        experienceCategory: dto.experienceCategory,
        duracionDias: dto.duracionDias,
        pricePerAdult: dto.pricePerAdult,
        priceVarByGroup: dto.priceVarByGroup,
        photoUrl: dto.photoUrl,
        duration: dto.duration,
        minAge: dto.minAge,
        maxAge: dto.maxAge,
        maxGroup: dto.maxGroup,
        guideLanguage: dto.guideLanguage,
        mobileTicket: dto.mobileTicket,
        advanceDays: dto.advanceDays,
        policiesJson: dto.policies ? JSON.stringify(dto.policies) : undefined,
        // Hoteles (socio)
        caracteristicas: dto.caracteristicas,
        comodidadesJson: dto.comodidades
          ? JSON.stringify(dto.comodidades)
          : undefined,
        tipoPropiedad: dto.tipoPropiedad,
        estrellas: dto.estrellas,
        textoPrecio: dto.textoPrecio,
        tieneOferta: dto.tieneOferta,
        reembolsable: dto.reembolsable,
        pagoDiferido: dto.pagoDiferido,
        priceUpdatedAt: new Date(),
      },
      include: { place: { select: { id: true, name: true, address: true } } },
    });
  }

  async findAll(dto: QueryProductsDto) {
    const page = dto.page || 1;
    const limit = dto.limit || 10;
    const where: any = { isActive: true };
    if (dto.type) where.type = dto.type;
    if (dto.modalidadReserva) where.modalidadReserva = dto.modalidadReserva;
    if (dto.tourismType) where.tourismType = dto.tourismType;
    if (dto.placeId) where.placeId = dto.placeId;

    const [total, items] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        include: {
          place: {
            select: {
              id: true,
              name: true,
              address: true,
              latitude: true,
              longitude: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        place: {
          select: {
            id: true,
            name: true,
            address: true,
            latitude: true,
            longitude: true,
          },
        },
        policy: { select: { id: true, name: true, rulesJson: true } },
      },
    });
    if (!product) throw new NotFoundException("Producto no encontrado");
    return product;
  }

  async findHomeExperiences() {
    const experiences = await this.prisma.product.findMany({
      where: { isActive: true, type: "experiencia" },
      include: {
        socio: { select: { id: true, name: true, isPremium: true } },
        place: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            category: { select: { id: true, name: true, slug: true } },
          },
        },
      },
      orderBy: { ratingAvg: "desc" },
      take: 10,
    });

    return experiences.map((p) => {
      const premium = p.socio?.isPremium ?? false;
      const highScore = p.ratingCount >= 3 && p.ratingAvg >= 4.75;
      const recommended = premium || highScore;
      const recommendedReason = premium
        ? "Socio recomendado"
        : highScore
          ? "Altamente valorado"
          : null;

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        descriptionEn: p.descriptionEn,
        type: p.type,
        experienceCategory: p.experienceCategory,
        price: p.price,
        pricePerAdult: p.pricePerAdult,
        priceVarByGroup: p.priceVarByGroup,
        currency: p.currency,
        photoUrl: p.photoUrl,
        ratingAvg: p.ratingAvg,
        ratingCount: p.ratingCount,
        recommended,
        recommendedReason,
        verified: premium,
        place: p.place
          ? {
              id: p.place.id,
              name: p.place.name,
              address: p.place.address,
              city: p.place.city,
              categorySlug: p.place.category?.slug ?? null,
            }
          : null,
      };
    });
  }

  /**
   * Colección curada "Experiencias imprescindibles" (mixta lugar + producto).
   * Incluye items de tipo 'place' (Lugar) y 'product' (Experiencia) marcados
   * con es_imprescindible. La tarjeta diferencia ambos por el campo `tipo`.
   */
  async findEssentialExperiences() {
    const [places, products] = await Promise.all([
      this.prisma.place.findMany({
        where: { isActive: true, esImprescindible: true },
        include: {
          category: { select: { id: true, name: true, slug: true, icon: true } },
          photos: { take: 1, orderBy: { displayOrder: "asc" } },
        },
        orderBy: { ratingAvg: "desc" },
      }),
      this.prisma.product.findMany({
        where: { isActive: true, type: "experiencia", esImprescindible: true },
        include: {
          socio: { select: { id: true, name: true, isPremium: true } },
          place: {
            select: {
              id: true,
              name: true,
              address: true,
              city: true,
              category: { select: { id: true, name: true, slug: true } },
            },
          },
        },
        orderBy: { ratingAvg: "desc" },
      }),
    ]);

    const placeItems = places.map((p) => ({
      tipo: "place",
      id: p.id,
      name: p.name,
      description: p.description,
      descriptionEn: p.descriptionEn,
      address: p.address,
      city: p.city,
      latitude: p.latitude,
      longitude: p.longitude,
      ratingAvg: p.ratingAvg,
      ratingCount: p.ratingCount,
      photoUrl: p.photos?.[0]?.url ?? null,
      category: p.category
        ? { id: p.category.id, name: p.category.name, slug: p.category.slug }
        : null,
    }));

    const productItems = products.map((p) => {
      const premium = p.socio?.isPremium ?? false;
      const highScore = p.ratingCount >= 3 && p.ratingAvg >= 4.75;
      return {
        tipo: "product",
        id: p.id,
        name: p.name,
        description: p.description,
        descriptionEn: p.descriptionEn,
        experienceCategory: p.experienceCategory,
        subcategoriaTour: p.subcategoriaTour,
        duracionDias: p.duracionDias,
        price: p.price,
        pricePerAdult: p.pricePerAdult,
        priceVarByGroup: p.priceVarByGroup,
        currency: p.currency,
        photoUrl: p.photoUrl,
        ratingAvg: p.ratingAvg,
        ratingCount: p.ratingCount,
        modalidadReserva: p.modalidadReserva,
        recommended: premium || highScore,
        verified: premium,
        place: p.place
          ? {
              id: p.place.id,
              name: p.place.name,
              address: p.place.address,
              city: p.place.city,
              categorySlug: p.place.category?.slug ?? null,
            }
          : null,
      };
    });

    return [...placeItems, ...productItems];
  }

  async findProductReviews(
    productId: string,
    page = 1,
    limit = 20,
  ) {
    await this.findProductOrThrow(productId);
    const where = { productId, status: ReviewStatus.PUBLISHED };

    const [reviews, total] = await Promise.all([
      this.prisma.productReview.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, photoUrl: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.productReview.count({ where }),
    ]);

    return new PaginatedResponse(reviews, total, page, limit);
  }

  async createProductReview(
    userId: string,
    productId: string,
    rating: number,
    comment?: string,
  ) {
    await this.findProductOrThrow(productId);

    const existing = await this.prisma.productReview.findUnique({
      where: { productId_userId: { productId, userId } },
    });

    if (existing) {
      throw new ConflictException("Ya reseñaste esta experiencia");
    }

    return this.prisma.$transaction(async (tx) => {
      const review = await tx.productReview.create({
        data: {
          productId,
          userId,
          rating,
          comment,
          status: ReviewStatus.PUBLISHED,
        },
        include: {
          user: { select: { id: true, name: true, photoUrl: true } },
        },
      });

      await this.recalculateProductRating(tx, productId);

      return review;
    });
  }

  private async findProductOrThrow(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException("Producto no encontrado");
    return product;
  }

  private async recalculateProductRating(
    tx: Prisma.TransactionClient,
    productId: string,
  ): Promise<void> {
    const stats = await tx.productReview.aggregate({
      where: { productId, status: ReviewStatus.PUBLISHED },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await tx.product.update({
      where: { id: productId },
      data: {
        ratingAvg: stats._avg.rating ?? 0,
        ratingCount: stats._count.rating,
      },
    });
  }

  async findMyProducts(socioId: string) {
    return this.prisma.product.findMany({
      where: { socioId },
      include: { place: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  private async findOwnedOrThrow(id: string, socioId: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException("Producto no encontrado");
    if (product.socioId !== socioId) {
      throw new ForbiddenException("No puedes modificar este producto");
    }
    return product;
  }

  async createSlot(socioId: string, productId: string, dto: CreateProductSlotDto) {
    await this.findOwnedOrThrow(productId, socioId);

    const existing = await this.prisma.productSlot.findFirst({
      where: {
        productId,
        date: dto.date,
        time: dto.time,
      },
    });
    if (existing) {
      throw new ConflictException("Ya existe un slot para esa fecha y hora");
    }

    return this.prisma.productSlot.create({
      data: {
        productId,
        date: dto.date,
        time: dto.time,
        capacity: dto.capacity ?? 10,
      },
    });
  }

  async removeSlot(socioId: string, productId: string, slotId: string) {
    await this.findOwnedOrThrow(productId, socioId);
    const slot = await this.prisma.productSlot.findUnique({ where: { id: slotId } });
    if (!slot || slot.productId !== productId) {
      throw new NotFoundException("Slot no encontrado");
    }
    await this.prisma.productSlot.delete({ where: { id: slotId } });
    return { deleted: true };
  }

  async findMySlots(productId: string, socioId: string) {
    await this.findOwnedOrThrow(productId, socioId);
    return this.prisma.productSlot.findMany({
      where: { productId },
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });
  }

  async findUpcomingSlots(productId: string, take = 5) {
    await this.findProductOrThrow(productId);
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    return this.prisma.productSlot.findMany({
      where: { productId, date: { gte: todayStr } },
      orderBy: [{ date: "asc" }, { time: "asc" }],
      take,
    });
  }

  private generateFallbackSlots() {
    const times = ["09:00", "14:00", "18:00"];
    const slots: Array<{
      id: string;
      productId: string;
      date: string;
      time: string;
      capacity: number;
      createdAt: Date;
    }> = [];
    for (let i = 1; i <= 3; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      slots.push({
        id: `fallback-${i}`,
        productId: "",
        date,
        time: times[i - 1],
        capacity: 10,
        createdAt: new Date(),
      });
    }
    return slots;
  }

  async findExperienceDetail(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        socio: {
          select: {
            id: true,
            name: true,
            businessName: true,
            isPremium: true,
          },
        },
        place: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            latitude: true,
            longitude: true,
            category: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
        policy: {
          select: { id: true, name: true, rulesJson: true },
        },
      },
    });

    if (!product || product.type !== "experiencia" || !product.isActive) {
      throw new NotFoundException("Experiencia no encontrada");
    }

    const upcoming = await this.findUpcomingSlots(id, 5);
    const slots = upcoming.length > 0 ? upcoming : this.generateFallbackSlots();

    const premium = product.socio?.isPremium ?? false;
    const highScore = product.ratingCount >= 3 && product.ratingAvg >= 4.75;
    const recommended = premium || highScore;

    let policies: string[] = [];
    try {
      policies = JSON.parse(product.policiesJson || "[]");
    } catch {
      policies = [];
    }

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      descriptionEn: product.descriptionEn,
      experienceCategory: product.experienceCategory,
      price: product.price,
      pricePerAdult: product.pricePerAdult,
      priceVarByGroup: product.priceVarByGroup,
      currency: product.currency,
      photoUrl: product.photoUrl,
      duration: product.duration,
      minAge: product.minAge,
      maxAge: product.maxAge,
      maxGroup: product.maxGroup,
      guideLanguage: product.guideLanguage,
      mobileTicket: product.mobileTicket,
      advanceDays: product.advanceDays,
      policies,
      ratingAvg: product.ratingAvg,
      ratingCount: product.ratingCount,
      recommended,
      recommendedReason: premium
        ? "Socio recomendado"
        : highScore
          ? "Altamente valorado"
          : null,
      socio: product.socio
        ? {
            id: product.socio.id,
            name: product.socio.businessName || product.socio.name,
            businessName: product.socio.businessName,
            isPremium: product.socio.isPremium,
          }
        : null,
      place: product.place
        ? {
            id: product.place.id,
            name: product.place.name,
            address: product.place.address,
            city: product.place.city,
            latitude: product.place.latitude,
            longitude: product.place.longitude,
            category: product.place.category
              ? {
                  id: product.place.category.id,
                  name: product.place.category.name,
                  slug: product.place.category.slug,
                }
              : null,
          }
        : null,
      policy: product.policy
        ? {
            id: product.policy.id,
            name: product.policy.name,
            rulesJson: product.policy.rulesJson,
          }
        : null,
      slots,
    };
  }

  async update(socioId: string, id: string, dto: UpdateProductDto) {
    await this.findOwnedOrThrow(id, socioId);
    return this.prisma.product.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        descriptionEn: dto.descriptionEn,
        price: dto.price,
        capacity: dto.capacity,
        modalidadReserva: dto.modalidadReserva,
        tourismType: dto.tourismType,
        budgetRange: dto.budgetRange,
        attributesJson: dto.attributes
          ? this.parseAttributes(dto.attributes)
          : undefined,
        policyId: dto.policyId,
        isActive: dto.isActive,
        experienceCategory: dto.experienceCategory,
        duracionDias: dto.duracionDias,
        pricePerAdult: dto.pricePerAdult,
        priceVarByGroup: dto.priceVarByGroup,
        photoUrl: dto.photoUrl,
        duration: dto.duration,
        minAge: dto.minAge,
        maxAge: dto.maxAge,
        maxGroup: dto.maxGroup,
        guideLanguage: dto.guideLanguage,
        mobileTicket: dto.mobileTicket,
        advanceDays: dto.advanceDays,
        policiesJson: dto.policies ? JSON.stringify(dto.policies) : undefined,
        // Hoteles (socio)
        caracteristicas: dto.caracteristicas,
        comodidadesJson: dto.comodidades
          ? JSON.stringify(dto.comodidades)
          : undefined,
        tipoPropiedad: dto.tipoPropiedad,
        estrellas: dto.estrellas,
        textoPrecio: dto.textoPrecio,
        tieneOferta: dto.tieneOferta,
        reembolsable: dto.reembolsable,
        pagoDiferido: dto.pagoDiferido,
        priceUpdatedAt: dto.price !== undefined ? new Date() : undefined,
      },
      include: { place: { select: { id: true, name: true, address: true } } },
    });
  }

  async updatePhoto(
    socioId: string,
    id: string,
    file: Express.Multer.File | undefined,
  ) {
    if (!file) {
      throw new BadRequestException("Archivo no proporcionado");
    }
    await this.findOwnedOrThrow(id, socioId);
    const photoUrl = `uploads/${file.filename}`;
    return this.prisma.product.update({
      where: { id },
      data: { photoUrl },
    });
  }

  async remove(socioId: string, id: string) {
    await this.findOwnedOrThrow(id, socioId);
    await this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
    return { deleted: true };
  }
}
