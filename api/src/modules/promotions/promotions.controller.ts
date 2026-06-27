import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PromotionsService } from './promotions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('promotions')
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Get()
  @ApiOperation({ summary: 'List active promotions' })
  @ApiResponse({ status: 200, description: 'Active promotions' })
  async findActive() {
    return this.promotionsService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get promotion by ID' })
  @ApiResponse({ status: 200, description: 'Promotion details' })
  async findById(@Param('id') id: string) {
    return this.promotionsService.findById(id);
  }

  @Post('places/:placeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('empresa', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create promotion for place' })
  @ApiResponse({ status: 201, description: 'Promotion created' })
  async create(
    @CurrentUser('id') userId: string,
    @Param('placeId') placeId: string,
    @Body() body: any,
  ) {
    return this.promotionsService.create(userId, placeId, body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('empresa', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update promotion' })
  async update(
    @CurrentUser('id') userId: string,
    @Param('id') promotionId: string,
    @Body() body: any,
  ) {
    return this.promotionsService.update(userId, promotionId, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('empresa', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete promotion' })
  async remove(
    @CurrentUser('id') userId: string,
    @Param('id') promotionId: string,
  ) {
    return this.promotionsService.remove(userId, promotionId);
  }
}
