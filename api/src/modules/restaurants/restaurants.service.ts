import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) {}

  private reservableMesaFilter() {
    return { type: "mesa", isActive: true };
  }

  async findAll() {
    const [referencePlace, cocinaCategories] = await Promise.all([
      this.prisma.place.findFirst({
        where: { name: { contains: "Plaza 24 de Septiembre" } },
        select: { id: true, name: true, latitude: true, longitude: true },
      }),
      this.prisma.category.findMany({
        where: { slug: { startsWith: "cocina-" } },
        orderBy: { displayOrder: "asc" },
        select: { id: true, name: true, slug: true, icon: true },
      }),
    ]);

    // Todos los lugares con productos de mesa (independiente de su categoría de
    // top bar: un restaurante puede estar bajo "gastronomia" p.ej.).
    const where: any = {
      isActive: true,
      products: { some: this.reservableMesaFilter() },
    };

    const places = await this.prisma.place.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true, icon: true },
        },
        photos: { orderBy: { displayOrder: "asc" }, take: 1 },
        products: {
          where: this.reservableMesaFilter(),
          select: {
            id: true,
            name: true,
            price: true,
            currency: true,
            capacity: true,
            modalidadReserva: true,
            caracteristicas: true,
            comodidadesJson: true,
            textoPrecio: true,
            cashbackActivo: true,
            cashbackPorcentaje: true,
            tipoCocinaId: true,
            cocina: { select: { id: true, name: true, slug: true, icon: true } },
          },
        },
      },
      orderBy: [{ ratingAvg: "desc" }, { name: "asc" }],
    });

    // Nivel de precio (1-4) por cuartiles del precio promedio por persona
    const prices = places
      .map((p) => this.minMesaPrice(p))
      .filter((price): price is number => price !== null)
      .sort((a, b) => a - b);

    const quartiles = this.quartiles(prices);

    const restaurants = places.map((p: any) => {
      const mesa = p.products?.[0] ?? null;
      const comodidades = this.parseComodidades(mesa?.comodidadesJson);

      const precioPromedio = this.minMesaPrice(p);
      const nivelPrecio =
        precioPromedio === null
          ? null
          : this.priceLevelFromQuartiles(precioPromedio, quartiles);

      const { products: _products, ...placeRest } = p;
      return {
        ...placeRest,
        mesa,
        precioPromedio,
        nivelPrecio,
        comodidades,
        canReserve: mesa ? mesa.modalidadReserva !== "ninguna" : false,
      };
    });

    return {
      data: restaurants,
      meta: {
        total: restaurants.length,
        referencePlace: referencePlace
          ? {
              id: referencePlace.id,
              name: referencePlace.name,
              latitude: referencePlace.latitude,
              longitude: referencePlace.longitude,
            }
          : null,
        cocinaCategories: cocinaCategories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          icon: c.icon,
        })),
      },
    };
  }

  private minMesaPrice(place: any): number | null {
    const prices = (place.products ?? [])
      .map((prod: any) => prod.price)
      .filter((price: any) => typeof price === "number");
    if (prices.length === 0) return null;
    return Math.min(...prices);
  }

  private parseComodidades(json?: string | null): string[] {
    if (!json) return [];
    try {
      const parsed = JSON.parse(json);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private quartiles(prices: number[]) {
    if (prices.length === 0) return { q1: null, q2: null, q3: null };
    const idx = (p: number) => Math.floor(prices.length * p);
    return {
      q1: prices[idx(0.25)],
      q2: prices[idx(0.5)],
      q3: prices[idx(0.75)],
    };
  }

  private priceLevelFromQuartiles(
    price: number,
    quartiles: { q1: number | null; q2: number | null; q3: number | null },
  ): number {
    const { q1, q2, q3 } = quartiles;
    if (q3 !== null && price > q3) return 4;
    if (q2 !== null && price > q2) return 3;
    if (q1 !== null && price > q1) return 2;
    return 1;
  }
}
