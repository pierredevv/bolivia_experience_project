import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class HotelsService {
  constructor(private prisma: PrismaService) {}

  private reservableHotelProductFilter() {
    return {
      type: "hospedaje",
      isActive: true,
      modalidadReserva: { not: "ninguna" },
    };
  }

  async findAll() {
    const category = await this.prisma.category.findUnique({
      where: { slug: "hoteles" },
      select: { id: true },
    });

    const where: any = { isActive: true };
    if (category) where.categoryId = category.id;

    const [places, groups, referencePlace] = await Promise.all([
      this.prisma.place.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, slug: true, icon: true },
          },
          photos: { orderBy: { displayOrder: "asc" }, take: 1 },
          products: {
            where: this.reservableHotelProductFilter(),
            select: {
              id: true,
              name: true,
              price: true,
              currency: true,
              capacity: true,
              modalidadReserva: true,
              type: true,
              caracteristicas: true,
              comodidadesJson: true,
              tipoPropiedad: true,
              estrellas: true,
              textoPrecio: true,
              cashbackActivo: true,
              cashbackPorcentaje: true,
              premiado: true,
              tieneOferta: true,
              reembolsable: true,
              pagoDiferido: true,
            },
          },
        },
        orderBy: [{ ratingAvg: "desc" }, { name: "asc" }],
      }),
      this.prisma.product.groupBy({
        by: ["placeId"],
        where: {
          type: "hospedaje",
          isActive: true,
          placeId: { not: null },
        },
        _min: { price: true },
      }),
      this.prisma.place.findFirst({
        where: { name: { contains: "Plaza 24 de Septiembre" } },
        select: { id: true, name: true, latitude: true, longitude: true },
      }),
    ]);

    // Precio mínimo por hotel (MIN de sus productos hospedaje)
    const minPriceByPlace = new Map<string, number>();
    let maxMinPrice = 0;
    for (const g of groups) {
      const price = g._min.price;
      if (g.placeId && price !== null && price !== undefined) {
        const current = minPriceByPlace.get(g.placeId);
        if (current === undefined || price < current) {
          minPriceByPlace.set(g.placeId, price);
        }
        if (price > maxMinPrice) maxMinPrice = price;
      }
    }

    const hotels = places.map((p: any) => {
      const products = (p.products ?? []).map((prod: any) => {
        let comodidades: string[] = [];
        try {
          const parsed = JSON.parse(prod.comodidadesJson || "[]");
          comodidades = Array.isArray(parsed) ? parsed : [];
        } catch {
          comodidades = [];
        }
        const { comodidadesJson, ...rest } = prod;
        return { ...rest, comodidades };
      });

      const maxCapacity = products.reduce(
        (max: number, prod: any) =>
          prod.capacity !== null && prod.capacity !== undefined
            ? Math.max(max, prod.capacity)
            : max,
        0,
      );

      const { products: _products, ...placeRest } = p;
      return {
        ...placeRest,
        minPrice: minPriceByPlace.get(p.id) ?? 0,
        maxCapacity: maxCapacity > 0 ? maxCapacity : null,
        products,
      };
    });

    return {
      data: hotels,
      meta: {
        total: hotels.length,
        maxMinPrice,
        referencePlace: referencePlace
          ? {
              id: referencePlace.id,
              name: referencePlace.name,
              latitude: referencePlace.latitude,
              longitude: referencePlace.longitude,
            }
          : null,
      },
    };
  }
}
