import { Controller, Get, Put, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EmpresaService } from './empresa.service';
import { UpdateEmpresaPlaceDto, QueryEmpresaReviewsDto } from './dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '../../common/enums/role.enum';

@ApiTags('empresa')
@Controller('empresa')
@UseGuards(RolesGuard)
@Roles(Role.Empresa)
@ApiBearerAuth()
export class EmpresaController {
  constructor(private readonly empresaService: EmpresaService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get empresa dashboard stats' })
  @ApiResponse({ status: 200, description: 'Dashboard data' })
  async getDashboard(@CurrentUser('id') userId: string) {
    return this.empresaService.getDashboard(userId);
  }

  @Get('place')
  @ApiOperation({ summary: 'Get own place details' })
  @ApiResponse({ status: 200, description: 'Place details' })
  async getPlace(@CurrentUser('id') userId: string) {
    return this.empresaService.getPlace(userId);
  }

  @Put('place')
  @ApiOperation({ summary: 'Update own place' })
  @ApiResponse({ status: 200, description: 'Place updated' })
  async updatePlace(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateEmpresaPlaceDto,
  ) {
    return this.empresaService.updatePlace(userId, dto);
  }

  @Get('reviews')
  @ApiOperation({ summary: 'Get reviews for own place' })
  @ApiResponse({ status: 200, description: 'Reviews list' })
  async getReviews(
    @CurrentUser('id') userId: string,
    @Query() query: QueryEmpresaReviewsDto,
  ) {
    return this.empresaService.getReviews(userId, query);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get analytics for own place' })
  @ApiResponse({ status: 200, description: 'Analytics data' })
  async getAnalytics(@CurrentUser('id') userId: string) {
    return this.empresaService.getAnalytics(userId);
  }
}
