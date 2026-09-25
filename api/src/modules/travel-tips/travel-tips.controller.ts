import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { TravelTipsService } from "./travel-tips.service";

@ApiTags("travel-tips")
@Controller("travel-tips")
export class TravelTipsController {
  constructor(private readonly travelTipsService: TravelTipsService) {}

  @Get()
  @ApiOperation({ summary: "List active travel tips (options: category, city)" })
  @ApiQuery({ name: "category", required: false, description: "Filter by category: transporte | seguridad | cultura | gastronomia" })
  @ApiQuery({ name: "city", required: false, description: "Filter by city slug (default: santa-cruz)" })
  @ApiResponse({ status: 200, description: "Travel tips list" })
  async findAll(
    @Query("category") category?: string,
    @Query("city") city?: string,
  ) {
    return this.travelTipsService.findAll(category, city);
  }
}
