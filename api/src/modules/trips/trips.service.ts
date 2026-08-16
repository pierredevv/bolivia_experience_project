import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { PlacesScoringService } from "../places/places-scoring.service";

@Injectable()
export class TripsService {
  constructor(
    private prisma: PrismaService,
    private readonly scoringService: PlacesScoringService,
  ) {}

  async createTrip(
    userId: string,
    data: {
      name: string;
      description?: string;
      destination?: string;
      startDate: string;
      endDate: string;
      budgetType?: string;
      budgetMin?: number;
      budgetMax?: number;
      tourismType?: string;
      groupType?: string;
      isPublic?: boolean;
    },
  ) {
    return this.prisma.trip.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
        destination: data.destination || "Santa Cruz",
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        budgetType: data.budgetType,
        budgetMin: data.budgetMin,
        budgetMax: data.budgetMax,
        tourismType: data.tourismType,
        groupType: data.groupType,
        isPublic: data.isPublic || false,
      },
      include: {
        days: { include: { items: true }, orderBy: { dayNumber: "asc" } },
      },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.trip.findMany({
      where: { userId },
      include: {
        days: {
          include: { items: true },
          orderBy: { dayNumber: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(tripId: string, userId: string) {
    const trip = await this.prisma.trip.findFirst({
      where: { id: tripId, userId },
      include: {
        days: {
          include: { items: true },
          orderBy: { dayNumber: "asc" },
        },
        user: { select: { id: true, name: true, email: true } },
      },
    });
    if (!trip) throw new NotFoundException("Viaje no encontrado");
    return trip;
  }

  async addDay(
    tripId: string,
    userId: string,
    data: {
      dayNumber: number;
      date: string;
      description?: string;
    },
  ) {
    const trip = await this.prisma.trip.findFirst({
      where: { id: tripId, userId },
    });
    if (!trip) throw new NotFoundException("Viaje no encontrado");

    const existing = await this.prisma.tripDay.findFirst({
      where: { tripId, dayNumber: data.dayNumber },
    });
    if (existing)
      throw new BadRequestException(
        `El día ${data.dayNumber} ya existe en este viaje`,
      );

    return this.prisma.tripDay.create({
      data: {
        tripId,
        dayNumber: data.dayNumber,
        date: new Date(data.date),
        description: data.description,
      },
      include: { items: true },
    });
  }

  async addItem(
    dayId: string,
    userId: string,
    data: {
      placeId?: string;
      title: string;
      description?: string;
      timeSlot?: string;
      orderIndex?: number;
    },
  ) {
    const day = await this.prisma.tripDay.findFirst({
      where: { id: dayId },
      include: { trip: true },
    });
    if (!day) throw new NotFoundException("Día no encontrado");
    if (day.trip.userId !== userId)
      throw new NotFoundException("Día no encontrado");

    return this.prisma.tripItem.create({
      data: {
        tripDayId: dayId,
        placeId: data.placeId,
        title: data.title,
        description: data.description,
        timeSlot: data.timeSlot,
        orderIndex: data.orderIndex ?? 0,
      },
    });
  }

  async removeItem(itemId: string, userId: string) {
    const item = await this.prisma.tripItem.findFirst({
      where: { id: itemId },
      include: { tripDay: { include: { trip: true } } },
    });
    if (!item) throw new NotFoundException("Item no encontrado");
    if (item.tripDay.trip.userId !== userId)
      throw new NotFoundException("Item no encontrado");

    await this.prisma.tripItem.delete({ where: { id: itemId } });
    return { success: true };
  }

  async removeDay(dayId: string, userId: string) {
    const day = await this.prisma.tripDay.findFirst({
      where: { id: dayId },
      include: { trip: true },
    });
    if (!day) throw new NotFoundException("Día no encontrado");
    if (day.trip.userId !== userId)
      throw new NotFoundException("Día no encontrado");

    await this.prisma.tripDay.delete({ where: { id: dayId } });
    return { success: true };
  }

  async deleteTrip(tripId: string, userId: string) {
    const trip = await this.prisma.trip.findFirst({
      where: { id: tripId, userId },
    });
    if (!trip) throw new NotFoundException("Viaje no encontrado");

    await this.prisma.trip.delete({ where: { id: tripId } });
    return { success: true };
  }

  /**
   * Genera un itinerario por reglas para el viaje del usuario.
   *
   * Lógica:
   *  1. Toma las preferencias del trip (budgetType/tourismType).
   *  2. Trae todos los lugares activos y los puntúa con PlacesScoringService.
   *  3. Distribuye los lugares entre los días (maxItemsPerDay por día, el resto
   *     se reparte equitativamente) preservando el orden por score.
   *  4. Reordena cada día por proximidad geográfica (vecino más cercano,
   *     distancia Haversine) para minimizar desplazamiento.
   *  5. Borra los días/items previos del borrador y crea la nueva versión.
   */
  async generateItinerary(tripId: string, userId: string) {
    const trip = await this.prisma.trip.findFirst({
      where: { id: tripId, userId },
    });
    if (!trip) throw new NotFoundException("Viaje no encontrado");

    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);
    const diffDays = Math.floor(
      (endDate.getTime() - startDate.getTime()) / 86_400_000,
    );
    const dayCount = Math.max(1, diffDays + 1);

    // Lugares activos con sus categorías
    const places = await this.prisma.place.findMany({
      where: { isActive: true },
      include: {
        category: { select: { id: true, name: true, icon: true } },
      },
    });

    const preferences = {
      budgetType: trip.budgetType,
      tourismType: trip.tourismType,
    };
    const scored = this.scoringService.scoreAndSort(places, preferences);

    if (scored.length === 0) {
      throw new BadRequestException(
        "No hay lugares disponibles para generar el itinerario",
      );
    }

    const maxPerDay = Math.max(
      1,
      Math.ceil(scored.length / dayCount),
    );

    // Distribuir equitativamente por día preservando orden por score
    const distribution: any[][] = Array.from(
      { length: dayCount },
      () => [],
    );
    for (let i = 0; i < scored.length; i++) {
      const dayIndex = Math.min(
        dayCount - 1,
        Math.floor(i / maxPerDay),
      );
      distribution[dayIndex].push(scored[i]);
    }

    // Reordenar cada día por proximidad geográfica (vecino más cercano)
    const orderedDays = distribution.map((dayPlaces) =>
      this.orderByProximity(dayPlaces),
    );

    // Regenerar el borrador dentro de una transacción
    const result = await this.prisma.$transaction(async (tx) => {
      await tx.tripDay.deleteMany({ where: { tripId } });

      const createdDays = [];
      for (let d = 0; d < orderedDays.length; d++) {
        const dayDate = new Date(
          startDate.getTime() + d * 86_400_000,
        );
        const day = await tx.tripDay.create({
          data: {
            tripId,
            dayNumber: d + 1,
            date: dayDate,
            description: `Día ${d + 1}`,
          },
        });

        const items = [];
        for (let i = 0; i < orderedDays[d].length; i++) {
          const place: any = orderedDays[d][i];
          items.push(
            await tx.tripItem.create({
              data: {
                tripDayId: day.id,
                placeId: place.id,
                title: place.name,
                description: place.category?.name ?? null,
                timeSlot: this.timeSlotForIndex(i),
                orderIndex: i,
              },
            }),
          );
        }
        createdDays.push({ ...day, items });
      }
      return createdDays;
    });

    return this.findOne(tripId, userId);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private timeSlotForIndex(index: number): string {
    const slots = ["manana", "mediodia", "tarde", "noche"];
    return slots[index % slots.length];
  }

  /**
   * Ordena lugares por proximidad geográfica (greedy nearest-neighbor).
   * Primero por score (desciende), luego encadena los más cercanos al último.
   */
  private orderByProximity(places: any[]): any[] {
    if (places.length <= 2) return places;

    const remaining = [...places];
    const sorted: any[] = [];
    // Arranca por el mejor puntaje
    const first = remaining.splice(0, 1)[0];
    sorted.push(first);

    while (remaining.length > 0) {
      const last = sorted[sorted.length - 1];
      let nearestIndex = 0;
      let nearestDist = Number.POSITIVE_INFINITY;
      for (let i = 0; i < remaining.length; i++) {
        const d = this.haversineKm(
          last.latitude,
          last.longitude,
          remaining[i].latitude,
          remaining[i].longitude,
        );
        if (d < nearestDist) {
          nearestDist = d;
          nearestIndex = i;
        }
      }
      sorted.push(remaining.splice(nearestIndex, 1)[0]);
    }

    return sorted;
  }

  private haversineKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
      return Number.POSITIVE_INFINITY;
    }
    const R = 6371;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }
}
