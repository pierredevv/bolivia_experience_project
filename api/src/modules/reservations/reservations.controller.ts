import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReservationsService } from './reservations.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('reservations')
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a reservation' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() body: {
      placeId: string;
      date: string;
      time: string;
      partySize: number;
      notes?: string;
      contactPhone?: string;
    },
  ) {
    return this.reservationsService.create(userId, body);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user reservations' })
  async findByUser(@CurrentUser('id') userId: string) {
    return this.reservationsService.findByUser(userId);
  }

  @Get('place/:placeId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get reservations for a place' })
  async findByPlace(
    @Param('placeId') placeId: string,
    @Query('date') date?: string,
  ) {
    return this.reservationsService.findByPlace(placeId, date);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a reservation' })
  async cancel(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.reservationsService.cancel(id, userId);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update reservation status' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.reservationsService.updateStatus(id, status, userId);
  }
}
