import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { HotelsService } from "./hotels.service";

@ApiTags("hotels")
@Controller("hotels")
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Get()
  @ApiOperation({
    summary:
      "List hotels with reservable lodging products and meta (maxMinPrice + reference place)",
  })
  @ApiResponse({ status: 200, description: "Hotels list with meta" })
  async findAll() {
    return this.hotelsService.findAll();
  }
}
