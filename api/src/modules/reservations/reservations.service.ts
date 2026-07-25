import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: {
    placeId: string;
    date: string;
    time: string;
    partySize: number;
    notes?: string;
    contactPhone?: string;
  }) {
    // Verify place exists
    const place = await this.prisma.place.findUnique({ where: { id: dto.placeId } });
    if (!place) throw new NotFoundException('Lugar no encontrado');

    // Check for conflicting reservations
    const existing = await this.prisma.reservation.findFirst({
      where: {
        placeId: dto.placeId,
        date: new Date(dto.date),
        time: dto.time,
        status: { in: ['pending', 'confirmed'] },
      },
    });

    if (existing) {
      throw new BadRequestException('Horario no disponible');
    }

    return this.prisma.reservation.create({
      data: {
        userId,
        placeId: dto.placeId,
        date: new Date(dto.date),
        time: dto.time,
        partySize: dto.partySize,
        notes: dto.notes,
        contactPhone: dto.contactPhone,
      },
      include: { place: { select: { id: true, name: true, address: true } } },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.reservation.findMany({
      where: { userId },
      include: { place: { select: { id: true, name: true, address: true, phone: true } } },
      orderBy: { date: 'desc' },
    });
  }

  async findByPlace(placeId: string, date?: string) {
    const where: any = { placeId, status: { in: ['pending', 'confirmed'] } };
    if (date) where.date = new Date(date);

    return this.prisma.reservation.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { time: 'asc' },
    });
  }

  async updateStatus(id: string, status: string, userId: string) {
    const reservation = await this.prisma.reservation.findUnique({ where: { id } });
    if (!reservation) throw new NotFoundException('Reserva no encontrada');

    return this.prisma.reservation.update({
      where: { id },
      data: { status },
    });
  }

  async cancel(id: string, userId: string) {
    return this.updateStatus(id, 'cancelled', userId);
  }
}
