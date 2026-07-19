import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { AdvancedSearchDto } from './dto/advanced-search.dto';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Search places' })
  @ApiResponse({ status: 200, description: 'Search results' })
  async search(
    @Query('q') query: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.searchService.search(query, categoryId);
  }

  @Get('advanced')
  @Public()
  @ApiOperation({ summary: 'Advanced search with filters' })
  @ApiResponse({ status: 200, description: 'Advanced search results' })
  async advancedSearch(@Query() dto: AdvancedSearchDto) {
    return this.searchService.advancedSearch(dto);
  }

  @Get('suggestions')
  @Public()
  @ApiOperation({ summary: 'Get search suggestions' })
  @ApiResponse({ status: 200, description: 'Suggestions list' })
  async suggestions(@Query('q') query: string) {
    return this.searchService.suggestions(query);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get search history' })
  @ApiResponse({ status: 200, description: 'Search history' })
  async getHistory(@CurrentUser('id') userId: string) {
    return this.searchService.getHistory(userId);
  }
}
