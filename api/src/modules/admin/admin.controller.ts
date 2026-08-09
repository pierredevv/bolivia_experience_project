import {
  Controller,
  Get,
  Put,
  Patch,
  Query,
  Param,
  Body,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { AdminService } from "./admin.service";
import {
  AdminUsersDto,
  AdminReviewsDto,
  UpdateProductCashbackDto,
  UpdateProductPremiadoDto,
} from "./dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@ApiTags("admin")
@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("users")
  @ApiOperation({ summary: "List all users (admin only)" })
  @ApiResponse({ status: 200, description: "Paginated users list" })
  async getUsers(@Query() dto: AdminUsersDto) {
    return this.adminService.findAllUsers(dto);
  }

  @Get("reviews")
  @ApiOperation({ summary: "List all reviews (admin only)" })
  @ApiResponse({ status: 200, description: "Paginated reviews list" })
  async getReviews(@Query() dto: AdminReviewsDto) {
    return this.adminService.findAllReviews(dto);
  }

  @Get("dashboard")
  @ApiOperation({ summary: "Get admin dashboard stats" })
  @ApiResponse({ status: 200, description: "Dashboard statistics" })
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get("businesses")
  @ApiOperation({ summary: "List businesses with approval status filter" })
  @ApiResponse({ status: 200, description: "Businesses list" })
  async getBusinesses(@Query("status") status?: string) {
    return this.adminService.findBusinesses(status);
  }

  @Patch("businesses/:id/approve")
  @ApiOperation({ summary: "Approve a pending business" })
  @ApiResponse({ status: 200, description: "Business approved" })
  async approveBusiness(@Param("id") id: string) {
    return this.adminService.approveBusiness(id);
  }

  @Patch("businesses/:id/suspend")
  @ApiOperation({ summary: "Suspend a business" })
  @ApiResponse({ status: 200, description: "Business suspended" })
  async suspendBusiness(@Param("id") id: string) {
    return this.adminService.suspendBusiness(id);
  }

  @Patch("businesses/:id/premium")
  @ApiOperation({ summary: "Toggle premium status of a business (socio recomendado)" })
  @ApiResponse({ status: 200, description: "Premium status toggled" })
  async togglePremium(@Param("id") id: string) {
    return this.adminService.togglePremium(id);
  }

  @Patch("products/:id/cashback")
  @ApiOperation({
    summary: "Set cashback status/percentage for a hotel product (admin only)",
  })
  @ApiResponse({ status: 200, description: "Cashback updated" })
  async setProductCashback(
    @Param("id") id: string,
    @Body() dto: UpdateProductCashbackDto,
  ) {
    return this.adminService.setProductCashback(id, dto);
  }

  @Patch("products/:id/premiado")
  @ApiOperation({
    summary: "Toggle 'premiado' flag for a hotel product (admin only)",
  })
  @ApiResponse({ status: 200, description: "Premiado flag updated" })
  async toggleProductPremiado(
    @Param("id") id: string,
    @Body() dto: UpdateProductPremiadoDto,
  ) {
    return this.adminService.toggleProductPremiado(id, dto);
  }

  @Get("settings")
  @ApiOperation({ summary: "Get admin settings" })
  @ApiResponse({ status: 200, description: "Admin settings" })
  async getSettings() {
    return this.adminService.getSettings();
  }

  @Put("settings")
  @ApiOperation({ summary: "Update admin settings" })
  @ApiResponse({ status: 200, description: "Settings updated" })
  async updateSettings(@Body() body: Record<string, any>) {
    return this.adminService.updateSettings(body);
  }
}
