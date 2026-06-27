import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PlacesService } from './places.service';
import { CreatePlaceDto, UpdatePlaceDto, QueryPlacesDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('places')
@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Get()
  @ApiOperation({ summary: 'List places with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Paginated list of places' })
  async findAll(@Query() query: QueryPlacesDto) {
    return this.placesService.findAll(query);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured places' })
  @ApiResponse({ status: 200, description: 'Featured places list' })
  async findFeatured() {
    return this.placesService.findFeatured();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get place by ID' })
  @ApiResponse({ status: 200, description: 'Place details' })
  @ApiResponse({ status: 404, description: 'Place not found' })
  async findById(@Param('id') id: string) {
    return this.placesService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new place (Admin only)' })
  @ApiResponse({ status: 201, description: 'Place created' })
  async create(@Body() dto: CreatePlaceDto) {
    return this.placesService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a place (Admin only)' })
  @ApiResponse({ status: 200, description: 'Place updated' })
  async update(@Param('id') id: string, @Body() dto: UpdatePlaceDto) {
    return this.placesService.update(id, dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle place active status (Admin only)' })
  @ApiResponse({ status: 200, description: 'Status toggled' })
  async toggleStatus(@Param('id') id: string) {
    return this.placesService.toggleStatus(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a place (Admin only)' })
  @ApiResponse({ status: 200, description: 'Place deleted' })
  async remove(@Param('id') id: string) {
    return this.placesService.remove(id);
  }

  @Get(':id/photos')
  @ApiOperation({ summary: 'Get photos of a place' })
  @ApiResponse({ status: 200, description: 'Photos list' })
  async getPhotos(@Param('id') id: string) {
    return this.placesService.getPhotos(id);
  }

  @Post(':id/photos')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add photo to place (Admin only)' })
  @ApiResponse({ status: 201, description: 'Photo added' })
  async addPhoto(
    @Param('id') id: string,
    @Body() body: { url: string; altText?: string },
  ) {
    return this.placesService.addPhoto(id, body.url, body.altText);
  }
}
