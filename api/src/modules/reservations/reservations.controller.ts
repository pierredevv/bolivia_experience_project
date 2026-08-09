import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { ReservationsService } from "./reservations.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateReservationDto } from "./dto";

@ApiTags("reservations")
@Controller("reservations")
export class ReservationsController {
  constructor(
    private readonly reservationsService: ReservationsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a reservation (instantanea or solicitud)" })
  async create(
    @CurrentUser("id") userId: string,
    @Body() dto: CreateReservationDto,
  ) {
    return this.reservationsService.create(userId, dto);
  }

  @Get("my")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get user reservations" })
  async findByUser(@CurrentUser("id") userId: string) {
    return this.reservationsService.findByUser(userId);
  }

  @Post("expire")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Expire overdue solicitudes/pending payments (admin/internal)",
  })
  async expire() {
    return this.reservationsService.expireOverdue();
  }

  @Get("socio")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("empresa", "admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get all reservations of the socio products" })
  async findBySocio(
    @Query("status") status?: string,
    @CurrentUser("id") userId: string = "",
  ) {
    return this.reservationsService.findBySocio(userId, status);
  }

  @Get("place/:placeId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("empresa")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get reservations for a place (empresa owner only)",
  })
  async findByPlace(
    @Param("placeId") placeId: string,
    @Query("date") date?: string,
    @CurrentUser("id") userId?: string,
  ) {
    const place = await this.prisma.place.findUnique({
      where: { id: placeId },
    });
    if (!place) throw new NotFoundException("Lugar no encontrado");
    if (place.ownerId && place.ownerId !== userId) {
      throw new ForbiddenException(
        "No tienes acceso a las reservas de este lugar",
      );
    }
    return this.reservationsService.findByPlace(placeId, date);
  }

  @Post(":id/confirm")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("empresa", "admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Confirm a solicitud (socio only)" })
  async confirm(@Param("id") id: string, @CurrentUser("id") userId: string) {
    return this.reservationsService.confirm(userId, id);
  }

  @Post(":id/reject")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("empresa", "admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Reject a solicitud (socio only)" })
  async reject(@Param("id") id: string, @CurrentUser("id") userId: string) {
    return this.reservationsService.reject(userId, id);
  }

  @Post(":id/complete")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("empresa", "admin")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Complete a reservation and release the escrow (socio only)",
  })
  async complete(@Param("id") id: string, @CurrentUser("id") userId: string) {
    return this.reservationsService.complete(userId, id);
  }

  @Post(":id/no-show")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("empresa", "admin")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Mark a reservation as no-show and settle to socio (socio only)",
  })
  async noShow(@Param("id") id: string, @CurrentUser("id") userId: string) {
    return this.reservationsService.noShow(userId, id);
  }

  @Patch(":id/cancel")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Cancel a reservation (user only)" })
  async cancel(
    @Param("id") id: string,
    @Body("reason") reason: string | undefined,
    @CurrentUser("id") userId: string,
  ) {
    return this.reservationsService.cancel(userId, id, reason);
  }
}
