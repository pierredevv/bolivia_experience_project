import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { RestaurantsService } from "./restaurants.service";

@ApiTags("restaurants")
@Controller("restaurants")
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get()
  @ApiOperation({
    summary:
      "List restaurants with mesa products, price level (quartiles) and meta (reference place + cuisine categories)",
  })
  @ApiResponse({ status: 200, description: "Restaurants list with meta" })
  async findAll() {
    return this.restaurantsService.findAll();
  }
}
