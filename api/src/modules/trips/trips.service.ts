import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TripsService {
  constructor(private prisma: PrismaService) {}

  async createTrip(userId: string, data: {
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
  }) {
    return this.prisma.trip.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
        destination: data.destination || 'Santa Cruz',
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        budgetType: data.budgetType,
        budgetMin: data.budgetMin,
        budgetMax: data.budgetMax,
        tourismType: data.tourismType,
        groupType: data.groupType,
        isPublic: data.isPublic || false,
      },
      include: { days: { include: { items: true }, orderBy: { dayNumber: 'asc' } } },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.trip.findMany({
      where: { userId },
      include: {
        days: {
          include: { items: true },
          orderBy: { dayNumber: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tripId: string, userId: string) {
    const trip = await this.prisma.trip.findFirst({
      where: { id: tripId, userId },
      include: {
        days: {
          include: { items: true },
          orderBy: { dayNumber: 'asc' },
        },
        user: { select: { id: true, name: true, email: true } },
      },
    });
    if (!trip) throw new NotFoundException('Viaje no encontrado');
    return trip;
  }

  async addDay(tripId: string, userId: string, data: {
    dayNumber: number;
    date: string;
    description?: string;
  }) {
    const trip = await this.prisma.trip.findFirst({ where: { id: tripId, userId } });
    if (!trip) throw new NotFoundException('Viaje no encontrado');

    const existing = await this.prisma.tripDay.findFirst({
      where: { tripId, dayNumber: data.dayNumber },
    });
    if (existing) throw new BadRequestException(`El día ${data.dayNumber} ya existe en este viaje`);

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

  async addItem(dayId: string, userId: string, data: {
    placeId?: string;
    title: string;
    description?: string;
    timeSlot?: string;
    orderIndex?: number;
  }) {
    const day = await this.prisma.tripDay.findFirst({
      where: { id: dayId },
      include: { trip: true },
    });
    if (!day) throw new NotFoundException('Día no encontrado');
    if (day.trip.userId !== userId) throw new NotFoundException('Día no encontrado');

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
    if (!item) throw new NotFoundException('Item no encontrado');
    if (item.tripDay.trip.userId !== userId) throw new NotFoundException('Item no encontrado');

    await this.prisma.tripItem.delete({ where: { id: itemId } });
    return { success: true };
  }

  async removeDay(dayId: string, userId: string) {
    const day = await this.prisma.tripDay.findFirst({
      where: { id: dayId },
      include: { trip: true },
    });
    if (!day) throw new NotFoundException('Día no encontrado');
    if (day.trip.userId !== userId) throw new NotFoundException('Día no encontrado');

    await this.prisma.tripDay.delete({ where: { id: dayId } });
    return { success: true };
  }

  async deleteTrip(tripId: string, userId: string) {
    const trip = await this.prisma.trip.findFirst({ where: { id: tripId, userId } });
    if (!trip) throw new NotFoundException('Viaje no encontrado');

    await this.prisma.trip.delete({ where: { id: tripId } });
    return { success: true };
  }
}
