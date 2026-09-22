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
import { SupportService } from "./support.service";
import {
  AddSupportMessageDto,
  UpdateSupportTicketStatusDto,
} from "./dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("admin/support")
@Controller("admin/support")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
@ApiBearerAuth()
export class SupportAdminController {
  constructor(private readonly supportService: SupportService) {}

  @Get()
  @ApiOperation({ summary: "List all support tickets (admin only)" })
  @ApiResponse({ status: 200, description: "Paginated support tickets" })
  async findAll(
    @Query("status") status?: string,
    @Query("page") page = 1,
    @Query("limit") limit = 20,
  ) {
    return this.supportService.adminFindAll(status, Number(page), Number(limit));
  }

  @Get(":id")
  @ApiOperation({ summary: "Get ticket detail with messages (admin only)" })
  @ApiResponse({ status: 200, description: "Ticket detail" })
  async findOne(@Param("id") id: string) {
    return this.supportService.adminFindOne(id);
  }

  @Patch(":id/status")
  @ApiOperation({ summary: "Update ticket status (admin only)" })
  @ApiResponse({ status: 200, description: "Ticket updated" })
  async updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateSupportTicketStatusDto,
  ) {
    return this.supportService.adminUpdateStatus(id, dto);
  }

  @Patch(":id/messages")
  @ApiOperation({ summary: "Reply to a support ticket (admin only)" })
  @ApiResponse({ status: 201, description: "Message added" })
  async addMessage(
    @Param("id") id: string,
    @Body() dto: AddSupportMessageDto,
    @CurrentUser("id") adminId: string,
  ) {
    return this.supportService.adminAddMessage(id, adminId, dto);
  }
}