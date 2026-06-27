import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('reviews')
@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('places/:id/reviews')
  @ApiOperation({ summary: 'Get reviews for a place' })
  @ApiResponse({ status: 200, description: 'Reviews list' })
  async findByPlace(
    @Param('id') placeId: string,
    @Query() query: PaginationDto,
  ) {
    return this.reviewsService.findByPlace(placeId, query.page, query.limit);
  }

  @Post('places/:id/reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a review' })
  @ApiResponse({ status: 201, description: 'Review created' })
  async create(
    @CurrentUser('id') userId: string,
    @Param('id') placeId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(userId, placeId, dto);
  }

  @Put('reviews/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update own review' })
  async update(
    @CurrentUser('id') userId: string,
    @Param('id') reviewId: string,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(userId, reviewId, dto);
  }

  @Delete('reviews/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete review (own or admin)' })
  async remove(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Param('id') reviewId: string,
  ) {
    return this.reviewsService.remove(userId, reviewId, role === 'admin');
  }

  @Patch('reviews/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve a review (Admin only)' })
  async approve(@Param('id') reviewId: string) {
    return this.reviewsService.approve(reviewId);
  }

  @Post('reviews/:id/respond')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('empresa', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Respond to a review (Business owner)' })
  async respond(
    @CurrentUser('id') userId: string,
    @Param('id') reviewId: string,
    @Body() body: { comment: string },
  ) {
    return this.reviewsService.respond(userId, reviewId, body.comment);
  }
}
