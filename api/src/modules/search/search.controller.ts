import { Controller, Get, Query, Delete, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { SearchService } from "./search.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("search")
@Controller("search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: "Search places" })
  @ApiResponse({ status: 200, description: "Search results" })
  async search(
    @Query("q") query: string,
    @Query("categoryId") categoryId?: string,
  ) {
    return this.searchService.search(query, categoryId);
  }

  @Get("suggestions")
  @ApiOperation({ summary: "Get search suggestions" })
  @ApiResponse({ status: 200, description: "Suggestions list" })
  async suggestions(@Query("q") query: string) {
    return this.searchService.suggestions(query);
  }

  @Get("history")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get search history" })
  @ApiResponse({ status: 200, description: "Search history" })
  async getHistory(@CurrentUser("id") userId: string) {
    return this.searchService.getHistory(userId);
  }

  @Delete("history")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Clear search history" })
  @ApiResponse({ status: 200, description: "Search history cleared" })
  async deleteHistory(@CurrentUser("id") userId: string) {
    return this.searchService.deleteHistory(userId);
  }
}
