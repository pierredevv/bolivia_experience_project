import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('favorites')
@Controller('favorites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: 'Get user favorites' })
  @ApiResponse({ status: 200, description: 'Favorites list' })
  async findAll(@CurrentUser('id') userId: string) {
    return this.favoritesService.findAll(userId);
  }

  @Post(':placeId')
  @ApiOperation({ summary: 'Add place to favorites' })
  @ApiResponse({ status: 201, description: 'Added to favorites' })
  async add(
    @CurrentUser('id') userId: string,
    @Param('placeId') placeId: string,
  ) {
    return this.favoritesService.add(userId, placeId);
  }

  @Delete(':placeId')
  @ApiOperation({ summary: 'Remove place from favorites' })
  @ApiResponse({ status: 200, description: 'Removed from favorites' })
  async remove(
    @CurrentUser('id') userId: string,
    @Param('placeId') placeId: string,
  ) {
    return this.favoritesService.remove(userId, placeId);
  }

  @Get('check/:placeId')
  @ApiOperation({ summary: 'Check if place is favorite' })
  @ApiResponse({ status: 200, description: 'Favorite status' })
  async check(
    @CurrentUser('id') userId: string,
    @Param('placeId') placeId: string,
  ) {
    return this.favoritesService.check(userId, placeId);
  }
}
