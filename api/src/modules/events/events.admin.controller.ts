import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { EventsService } from "./events.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { IsIn } from "class-validator";

export class UpdateEventStatusDto {
  @IsIn(["pending", "approved", "rejected"])
  status: string;
}

@ApiTags("admin/events")
@Controller("admin/events")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
@ApiBearerAuth()
export class EventsAdminController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: "List all events (admin only)" })
  @ApiResponse({ status: 200, description: "Paginated events" })
  async findAll(
    @Query("status") status?: string,
    @Query("page") page = 1,
    @Query("limit") limit = 20,
  ) {
    return this.eventsService.findAllAdmin(
      status ? { status, page: Number(page), limit: Number(limit) } : { page: Number(page), limit: Number(limit) },
    );
  }

  @Patch(":id/status")
  @ApiOperation({ summary: "Approve or reject an event (admin only)" })
  @ApiResponse({ status: 200, description: "Event status updated" })
  async updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateEventStatusDto,
  ) {
    return this.eventsService.updateStatus(id, dto.status);
  }
}