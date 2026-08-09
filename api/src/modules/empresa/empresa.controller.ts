import { Controller, Get, Put, Query, Body, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { EmpresaService } from "./empresa.service";
import { UpdatePlaceDto, EmpresaReviewsDto } from "./dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("empresa")
@Controller("empresa")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("empresa")
@ApiBearerAuth()
export class EmpresaController {
  constructor(private readonly empresaService: EmpresaService) {}

  @Get("place")
  @ApiOperation({ summary: "Get the place owned by current empresa user" })
  @ApiResponse({ status: 200, description: "Owner place data" })
  async getPlace(@CurrentUser("id") userId: string) {
    return this.empresaService.getOwnerPlace(userId);
  }

  @Put("place")
  @ApiOperation({ summary: "Update the place owned by current empresa user" })
  @ApiResponse({ status: 200, description: "Place updated" })
  async updatePlace(
    @CurrentUser("id") userId: string,
    @Body() dto: UpdatePlaceDto,
  ) {
    return this.empresaService.updateOwnerPlace(userId, dto);
  }

  @Get("reviews")
  @ApiOperation({ summary: "Get reviews for the owned place" })
  @ApiResponse({ status: 200, description: "Paginated reviews" })
  async getReviews(
    @CurrentUser("id") userId: string,
    @Query() dto: EmpresaReviewsDto,
  ) {
    return this.empresaService.getOwnerReviews(userId, dto);
  }

  @Get("analytics")
  @ApiOperation({ summary: "Get analytics for the owned place" })
  @ApiResponse({ status: 200, description: "Analytics data" })
  async getAnalytics(@CurrentUser("id") userId: string) {
    return this.empresaService.getOwnerStats(userId);
  }

  @Get("dashboard")
  @ApiOperation({ summary: "Get dashboard stats for empresa" })
  @ApiResponse({ status: 200, description: "Dashboard data" })
  async getDashboard(@CurrentUser("id") userId: string) {
    return this.empresaService.getOwnerDashboard(userId);
  }
}
