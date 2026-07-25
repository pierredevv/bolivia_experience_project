import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RecommendationsService } from './recommendations.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('recommendations')
@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get('personalized')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get personalized recommendations' })
  async getPersonalized(
    @CurrentUser('id') userId: string,
    @Query('limit') limit?: number,
  ) {
    return this.recommendationsService.getPersonalized(userId, limit || 10);
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending places' })
  async getTrending(@Query('limit') limit?: number) {
    return this.recommendationsService.getTrending(limit || 10);
  }

  @Get('similar/:placeId')
  @ApiOperation({ summary: 'Get similar places' })
  async getSimilar(
    @Param('placeId') placeId: string,
    @Query('limit') limit?: number,
  ) {
    return this.recommendationsService.getSimilar(placeId, limit || 5);
  }
}
