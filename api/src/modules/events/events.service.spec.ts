import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('EventsService', () => {
  let service: EventsService;
  let prisma: PrismaService;

  const mockPrisma = {
    event: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated events', async () => {
      const mockEvents = [
        {
          id: 'event-1',
          name: 'Festival de la Vera Cruz',
          dateStart: new Date('2026-09-14'),
          isActive: true,
        },
      ];

      mockPrisma.event.findMany.mockResolvedValue(mockEvents);
      mockPrisma.event.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toEqual(mockEvents);
      expect(result.meta.total).toBe(1);
      expect(mockPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isActive: true }),
        })
      );
    });

    it('should filter upcoming events by default', async () => {
      mockPrisma.event.findMany.mockResolvedValue([]);
      mockPrisma.event.count.mockResolvedValue(0);

      await service.findAll({ page: 1, limit: 20 });

      expect(mockPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ dateEnd: null }),
            ]),
          }),
        })
      );
    });

    it('should return all events when upcoming=false', async () => {
      mockPrisma.event.findMany.mockResolvedValue([]);
      mockPrisma.event.count.mockResolvedValue(0);

      await service.findAll({ page: 1, limit: 20, upcoming: false });

      expect(mockPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.not.objectContaining({
            OR: expect.anything(),
          }),
        })
      );
    });
  });

  describe('findById', () => {
    it('should return event by id', async () => {
      const mockEvent = {
        id: 'event-1',
        name: 'Festival de la Vera Cruz',
        dateStart: new Date('2026-09-14'),
      };

      mockPrisma.event.findUnique.mockResolvedValue(mockEvent);

      const result = await service.findById('event-1');

      expect(result).toEqual(mockEvent);
    });

    it('should throw NotFoundException for invalid id', async () => {
      mockPrisma.event.findUnique.mockResolvedValue(null);

      await expect(service.findById('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create event', async () => {
      const createData = {
        name: 'New Event',
        description: 'A new event',
        dateStart: new Date('2026-10-01'),
        location: 'Santa Cruz',
      };

      const mockCreatedEvent = {
        id: 'event-new',
        ...createData,
        isActive: true,
      };

      mockPrisma.event.create.mockResolvedValue(mockCreatedEvent);

      const result = await service.create(createData);

      expect(result).toEqual(mockCreatedEvent);
      expect(mockPrisma.event.create).toHaveBeenCalledWith({ data: createData });
    });
  });

  describe('update', () => {
    it('should update event', async () => {
      const updateData = { name: 'Updated Event' };

      mockPrisma.event.findUnique.mockResolvedValue({ id: 'event-1', name: 'Old Event' });
      mockPrisma.event.update.mockResolvedValue({ id: 'event-1', ...updateData });

      const result = await service.update('event-1', updateData);

      expect(result.name).toBe('Updated Event');
    });

    it('should throw NotFoundException when updating nonexistent event', async () => {
      mockPrisma.event.findUnique.mockResolvedValue(null);

      await expect(service.update('invalid-id', { name: 'Test' })).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('remove', () => {
    it('should delete event', async () => {
      const mockEvent = { id: 'event-1', name: 'Event to Delete' };

      mockPrisma.event.findUnique.mockResolvedValue(mockEvent);
      mockPrisma.event.delete.mockResolvedValue(mockEvent);

      const result = await service.remove('event-1');

      expect(result).toEqual(mockEvent);
      expect(mockPrisma.event.delete).toHaveBeenCalledWith({ where: { id: 'event-1' } });
    });

    it('should throw NotFoundException when deleting nonexistent event', async () => {
      mockPrisma.event.findUnique.mockResolvedValue(null);

      await expect(service.remove('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });
});
