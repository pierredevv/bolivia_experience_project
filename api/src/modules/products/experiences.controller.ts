import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ProductsService } from "./products.service";

@ApiTags("experiences")
@Controller("experiences")
export class ExperiencesController {
  constructor(private readonly productsService: ProductsService) {}

  @Get("home")
  @ApiOperation({
    summary: "Home experiences (recommended/verified first)",
  })
  @ApiResponse({ status: 200, description: "List of home experiences" })
  async findHomeExperiences() {
    return this.productsService.findHomeExperiences();
  }

  @Get("essential")
  @ApiOperation({
    summary: "Essential experiences (curated mixed collection of places and products)",
  })
  @ApiResponse({ status: 200, description: "List of essential experiences" })
  async findEssentialExperiences() {
    return this.productsService.findEssentialExperiences();
  }

  @Get(":id")
  @ApiOperation({
    summary: "Experience detail with partner, place, policy and slots",
  })
  @ApiResponse({ status: 200, description: "Experience detail" })
  @ApiResponse({ status: 404, description: "Experience not found" })
  async findExperienceDetail(@Param("id") id: string) {
    return this.productsService.findExperienceDetail(id);
  }
}
