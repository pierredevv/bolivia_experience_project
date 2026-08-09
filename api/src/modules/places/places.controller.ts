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
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from "@nestjs/swagger";
import { PlacesService } from "./places.service";
import { PlacesScoringService } from "./places-scoring.service";
import {
  CreatePlaceDto,
  UpdatePlaceDto,
  QueryPlacesDto,
  QueryScoredPlacesDto,
} from "./dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { FileUploadService } from "../../common/services/file-upload.service";
import { PrismaService } from "../../prisma/prisma.service";
import * as multer from "multer";

@ApiTags("places")
@Controller("places")
export class PlacesController {
  constructor(
    private readonly placesService: PlacesService,
    private readonly fileUploadService: FileUploadService,
    private readonly scoringService: PlacesScoringService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @ApiOperation({ summary: "List places with pagination and filters" })
  @ApiResponse({ status: 200, description: "Paginated list of places" })
  async findAll(@Query() query: QueryPlacesDto) {
    return this.placesService.findAll(query);
  }

  @Get("featured")
  @ApiOperation({ summary: "Get featured places" })
  @ApiResponse({ status: 200, description: "Featured places list" })
  async findFeatured() {
    return this.placesService.findFeatured();
  }

  @Get("feed")
  @ApiOperation({
    summary: "Places feed for 'Cosas que hacer' top bar (filter by categorySlug)",
  })
  @ApiResponse({ status: 200, description: "Places feed" })
  async findFeed(@Query("categorySlug") categorySlug?: string) {
    return this.placesService.findFeed(categorySlug);
  }

  @Get("scored")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get places scored by match with trip preferences",
    description:
      "Returns ALL places (never filters), reordered by match score based on budget and tourism type preferences. Places with priceLevel=null appear in neutral position.",
  })
  @ApiResponse({ status: 200, description: "Scored and sorted places list" })
  async findScored(
    @CurrentUser() user: any,
    @Query() query: QueryScoredPlacesDto,
  ) {
    let preferences = {
      budgetType: query.budgetType,
      tourismType: query.tourismType,
    };

    // If tripId provided, fetch preferences from the trip
    if (query.tripId) {
      const trip = await this.prisma.trip.findFirst({
        where: { id: query.tripId, userId: user.id },
        select: { budgetType: true, tourismType: true },
      });
      if (trip) {
        preferences = {
          budgetType: trip.budgetType || query.budgetType,
          tourismType: trip.tourismType || query.tourismType,
        };
      }
    }

    return this.placesService.findAllScored(preferences, query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get place by ID" })
  @ApiResponse({ status: 200, description: "Place details" })
  @ApiResponse({ status: 404, description: "Place not found" })
  async findById(@Param("id") id: string) {
    return this.placesService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new place (Admin only)" })
  @ApiResponse({ status: 201, description: "Place created" })
  async create(@Body() dto: CreatePlaceDto) {
    return this.placesService.create(dto);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a place (Admin only)" })
  @ApiResponse({ status: 200, description: "Place updated" })
  async update(@Param("id") id: string, @Body() dto: UpdatePlaceDto) {
    return this.placesService.update(id, dto);
  }

  @Patch(":id/status")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Toggle place active status (Admin only)" })
  @ApiResponse({ status: 200, description: "Status toggled" })
  async toggleStatus(@Param("id") id: string) {
    return this.placesService.toggleStatus(id);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a place (Admin only)" })
  @ApiResponse({ status: 200, description: "Place deleted" })
  async remove(@Param("id") id: string) {
    return this.placesService.remove(id);
  }

  @Get(":id/photos")
  @ApiOperation({ summary: "Get photos of a place" })
  @ApiResponse({ status: 200, description: "Photos list" })
  async getPhotos(@Param("id") id: string) {
    return this.placesService.getPhotos(id);
  }

  @Post(":id/photos")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "empresa")
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor("file", {
      storage: multer.memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (
        _req: any,
        file: Express.Multer.File,
        cb: multer.FileFilterCallback,
      ) => {
        const allowedMimes = [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/gif",
        ];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error("Solo se permiten archivos JPEG, PNG, WebP o GIF"));
        }
      },
    }),
  )
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: { type: "string", format: "binary" },
        altText: { type: "string" },
      },
    },
  })
  @ApiOperation({ summary: "Upload photo to place (Admin or Business owner)" })
  @ApiResponse({ status: 201, description: "Photo uploaded" })
  async addPhoto(
    @Param("id") id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body("altText") altText?: string,
  ) {
    if (!file) {
      throw new Error("No file provided");
    }
    const url = await this.fileUploadService.uploadFile(file);
    return this.placesService.addPhoto(id, url, altText);
  }
}
