import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiPropertyOptional } from '@nestjs/swagger';
import { PromotionsService } from './promotions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

class QueryPromotionsDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Return all promotions regardless of date/active status' })
  @IsOptional()
  @Transform(({ obj }) => {
    const value = obj.all;
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    return Boolean(value);
  })
  @IsBoolean()
  all?: boolean;

  @ApiPropertyOptional({ description: 'Filter by place ID' })
  @IsOptional()
  @IsString()
  placeId?: string;
}

@ApiTags('promotions')
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Get()
  @ApiOperation({ summary: 'List promotions' })
  @ApiResponse({ status: 200, description: 'Promotions list' })
  async findAll(@Query() query: QueryPromotionsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    if (query.all) {
      return this.promotionsService.findAll(page, limit, query.placeId);
    }
    return this.promotionsService.findActive(page, limit);
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
