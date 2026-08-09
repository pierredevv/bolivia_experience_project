import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { ToursService } from "./tours.service";
import { OptionalJwtAuthGuard } from "../../common/guards/optional-jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("tours")
@Controller("tours")
export class ToursController {
  constructor(private readonly toursService: ToursService) {}

  @Get()
  @ApiOperation({ summary: "List all tour products (type experiencia) with subcategory and price brackets" })
  @ApiResponse({ status: 200, description: "Tours list" })
  async findAll() {
    return this.toursService.findAll();
  }

  @Get("recommended")
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary:
      "Recommended tours. If logged in, scored by budget + tourism type of the latest trip; otherwise sorted by rating.",
  })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiResponse({ status: 200, description: "Recommended tours" })
  async findRecommended(
    @CurrentUser("id") userId: string | undefined,
    @Query("limit") limit?: string,
  ) {
    return this.toursService.findRecommended(
      userId,
      limit ? parseInt(limit, 10) : 10,
    );
  }
}
