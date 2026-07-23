import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from './reservations.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let prisma: PrismaService;

  const mockPrisma = {
    place: {
      findUnique: jest.fn(),
    },
    reservation: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      placeId: 'place-1',
      date: '2025-01-15',
      time: '19:00',
      partySize: 4,
      notes: 'Mesa cerca de la ventana',
      contactPhone: '79123456',
    };

    it('should create a reservation successfully', async () => {
      mockPrisma.place.findUnique.mockResolvedValue({ id: 'place-1', name: 'Restaurante' });
      mockPrisma.reservation.findFirst.mockResolvedValue(null);
      mockPrisma.reservation.create.mockResolvedValue({
        id: 'res-1',
        userId: 'user-1',
        ...createDto,
        date: new Date(createDto.date),
        place: { id: 'place-1', name: 'Restaurante', address: 'Av. Principal' },
      });

      const result = await service.create('user-1', createDto);

      expect(result.id).toBe('res-1');
      expect(result.userId).toBe('user-1');
      expect(mockPrisma.reservation.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if place does not exist', async () => {
      mockPrisma.place.findUnique.mockResolvedValue(null);

      await expect(service.create('user-1', createDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if time slot is not available', async () => {
      mockPrisma.place.findUnique.mockResolvedValue({ id: 'place-1' });
      mockPrisma.reservation.findFirst.mockResolvedValue({
        id: 'existing-res',
        placeId: 'place-1',
        status: 'confirmed',
      });

      await expect(service.create('user-1', createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByUser', () => {
    it('should return reservations for a user', async () => {
      const mockReservations = [
        { id: 'res-1', userId: 'user-1', place: { id: 'place-1', name: 'Restaurante', address: 'Av. Principal', phone: '79123456' } },
      ];
      mockPrisma.reservation.findMany.mockResolvedValue(mockReservations);

      const result = await service.findByUser('user-1');

      expect(result).toEqual(mockReservations);
      expect(mockPrisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1' },
        }),
      );
    });
  });

  describe('cancel', () => {
    it('should cancel a reservation', async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue({ id: 'res-1', userId: 'user-1', status: 'confirmed' });
      mockPrisma.reservation.update.mockResolvedValue({ id: 'res-1', status: 'cancelled' });

      const result = await service.cancel('res-1', 'user-1');

      expect(result.status).toBe('cancelled');
    });

    it('should throw NotFoundException for non-existent reservation', async () => {
      mockPrisma.reservation.findUnique.mockResolvedValue(null);

      await expect(service.cancel('invalid-id', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByPlace', () => {
    it('should return reservations for a place', async () => {
      const mockReservations = [
        { id: 'res-1', user: { id: 'user-1', name: 'Juan', email: 'juan@test.com' } },
      ];
      mockPrisma.reservation.findMany.mockResolvedValue(mockReservations);

      const result = await service.findByPlace('place-1');

      expect(result).toEqual(mockReservations);
    });
  });
});
