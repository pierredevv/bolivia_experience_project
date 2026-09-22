import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { SupportService } from "./support.service";
import {
  CreateSupportTicketDto,
  AddSupportMessageDto,
} from "./dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("support")
@Controller("support")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post()
  @ApiOperation({ summary: "Create a support ticket" })
  @ApiResponse({ status: 201, description: "Support ticket created" })
  async create(
    @CurrentUser("id") userId: string,
    @Body() dto: CreateSupportTicketDto,
  ) {
    return this.supportService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: "List my support tickets" })
  @ApiResponse({ status: 200, description: "Paginated tickets" })
  async findMine(
    @CurrentUser("id") userId: string,
    @Query("page") page = 1,
    @Query("limit") limit = 20,
  ) {
    return this.supportService.findMine(userId, Number(page), Number(limit));
  }

  @Get(":id")
  @ApiOperation({ summary: "Get ticket detail with messages" })
  @ApiResponse({ status: 200, description: "Ticket detail" })
  async findOne(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
  ) {
    return this.supportService.findOne(userId, id);
  }

  @Patch(":id/messages")
  @ApiOperation({ summary: "Add a message to my ticket" })
  @ApiResponse({ status: 201, description: "Message added" })
  async addMessage(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
    @Body() dto: AddSupportMessageDto,
  ) {
    return this.supportService.addMessage(userId, id, dto);
  }
}