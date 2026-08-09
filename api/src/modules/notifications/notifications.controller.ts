import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { NotificationsService } from "./notifications.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { RegisterTokenDto } from "./dto/register-token.dto";

@ApiTags("notifications")
@Controller("notifications")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: "List user notifications" })
  @ApiResponse({ status: 200, description: "Notifications list" })
  async findAll(
    @CurrentUser("id") userId: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.notificationsService.findAll(
      userId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get("unread/count")
  @ApiOperation({ summary: "Get unread notification count" })
  @ApiResponse({ status: 200, description: "Unread count" })
  async getUnreadCount(@CurrentUser("id") userId: string) {
    return this.notificationsService.findUnreadCount(userId);
  }

  @Post("register-token")
  @ApiOperation({ summary: "Register a device push token" })
  @ApiResponse({ status: 201, description: "Device token registered" })
  async registerToken(
    @CurrentUser("id") userId: string,
    @Body() dto: RegisterTokenDto,
  ) {
    return this.notificationsService.registerToken(
      userId,
      dto.token,
      dto.platform || "flutter",
    );
  }

  @Delete("register-token")
  @ApiOperation({ summary: "Remove a device push token" })
  @ApiResponse({ status: 200, description: "Device token removed" })
  async unregisterToken(
    @CurrentUser("id") userId: string,
    @Body() dto: RegisterTokenDto,
  ) {
    return this.notificationsService.unregisterToken(userId, dto.token);
  }

  @Patch(":id/read")
  @ApiOperation({ summary: "Mark notification as read" })
  @ApiResponse({ status: 200, description: "Notification marked as read" })
  async markAsRead(@CurrentUser("id") userId: string, @Param("id") id: string) {
    return this.notificationsService.markAsRead(userId, id);
  }

  @Patch("read-all")
  @ApiOperation({ summary: "Mark all notifications as read" })
  @ApiResponse({ status: 200, description: "All notifications marked as read" })
  async markAllAsRead(@CurrentUser("id") userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete notification" })
  @ApiResponse({ status: 200, description: "Notification deleted" })
  async remove(@CurrentUser("id") userId: string, @Param("id") id: string) {
    return this.notificationsService.remove(userId, id);
  }
}
