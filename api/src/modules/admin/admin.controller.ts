import { Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { QueryUsersDto, QueryAllReviewsDto } from './dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '../../common/enums/role.enum';

@ApiTags('admin')
@Controller('admin')
@UseGuards(RolesGuard)
@Roles(Role.Admin)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard stats' })
  @ApiResponse({ status: 200, description: 'Dashboard data' })
  async getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('users')
  @ApiOperation({ summary: 'List all users' })
  @ApiResponse({ status: 200, description: 'Users list' })
  async getUsers(@Query() query: QueryUsersDto) {
    return this.adminService.getUsers(query);
  }

  @Patch('users/:id/ban')
  @ApiOperation({ summary: 'Toggle user active status (ban/unban)' })
  @ApiResponse({ status: 200, description: 'User status toggled' })
  async banUser(@Param('id') id: string) {
    return this.adminService.banUser(id);
  }

  @Get('reviews')
  @ApiOperation({ summary: 'List all reviews' })
  @ApiResponse({ status: 200, description: 'Reviews list' })
  async getAllReviews(@Query() query: QueryAllReviewsDto) {
    return this.adminService.getAllReviews(query);
  }
}
