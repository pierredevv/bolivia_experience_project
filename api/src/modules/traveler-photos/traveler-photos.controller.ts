import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
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
} from "@nestjs/swagger";
import * as multer from "multer";
import * as path from "path";
import { TravelerPhotosService } from "./traveler-photos.service";
import { CreateTravelerPhotoDto } from "./dto/create-traveler-photo.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { OptionalJwtAuthGuard } from "../../common/guards/optional-jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("traveler-photos")
@Controller("traveler-photos")
export class TravelerPhotosController {
  constructor(
    private readonly travelerPhotosService: TravelerPhotosService,
  ) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: "List traveler photos (público, likeByUser si hay token)",
  })
  @ApiResponse({ status: 200, description: "Paginated traveler photos" })
  async findAll(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @CurrentUser("id") userId?: string,
  ) {
    return this.travelerPhotosService.findAll(
      page ? parseInt(page) : 1,
      limit ? Math.min(parseInt(limit) || 20, 50) : 20,
      userId,
    );
  }

  @Get(":id")
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: "Get a traveler photo by ID" })
  @ApiResponse({ status: 200, description: "Traveler photo detail" })
  @ApiResponse({ status: 404, description: "Photo not found" })
  async findById(
    @Param("id") id: string,
    @CurrentUser("id") userId?: string,
  ) {
    return this.travelerPhotosService.findById(id, userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor("file", {
      storage: multer.diskStorage({
        destination: (_req, _file, cb) => {
          cb(null, path.join(process.cwd(), "uploads"));
        },
        filename: (_req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = path.extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
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
        title: { type: "string" },
        description: { type: "string" },
      },
    },
  })
  @ApiOperation({ summary: "Upload a traveler photo" })
  @ApiResponse({ status: 201, description: "Photo uploaded" })
  async create(
    @CurrentUser("id") userId: string,
    @Body() dto: CreateTravelerPhotoDto,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    return this.travelerPhotosService.create(
      userId,
      dto.title,
      dto.description,
      file as Express.Multer.File,
    );
  }

  @Post(":id/like")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Toggle like on a traveler photo" })
  @ApiResponse({ status: 200, description: "Like toggled" })
  async toggleLike(
    @Param("id") id: string,
    @CurrentUser("id") userId: string,
  ) {
    return this.travelerPhotosService.toggleLike(userId, id);
  }

  @Delete(":id/like")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Remove like from a traveler photo" })
  @ApiResponse({ status: 200, description: "Like removed" })
  async removeLike(
    @Param("id") id: string,
    @CurrentUser("id") userId: string,
  ) {
    return this.travelerPhotosService.removeLike(userId, id);
  }
}
