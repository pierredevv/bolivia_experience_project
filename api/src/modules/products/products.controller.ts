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
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import * as multer from "multer";
import * as path from "path";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from "@nestjs/swagger";
import { ProductsService } from "./products.service";
import {
  CreateProductDto,
  UpdateProductDto,
  QueryProductsDto,
  CreateProductReviewDto,
  CreateProductSlotDto,
} from "./dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("products")
@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("empresa", "admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a product (socio only)" })
  async create(
    @CurrentUser("id") userId: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: "List active products" })
  async findAll(@Query() dto: QueryProductsDto) {
    return this.productsService.findAll(dto);
  }

  @Get("my")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("empresa", "admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "List products of current socio" })
  async findMy(@CurrentUser("id") userId: string) {
    return this.productsService.findMyProducts(userId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get product by id" })
  async findOne(@Param("id") id: string) {
    return this.productsService.findOne(id);
  }

  @Post(":id/photo")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("empresa", "admin")
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
      },
    },
  })
  @ApiOperation({ summary: "Upload a photo for a product (socio only)" })
  async uploadPhoto(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    return this.productsService.updatePhoto(userId, id, file);
  }

  @Get(":id/reviews")
  @ApiOperation({ summary: "List reviews of a product" })
  async findReviews(
    @Param("id") id: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.productsService.findProductReviews(
      id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get(":id/slots")
  @ApiOperation({ summary: "Upcoming availability slots of a product (public)" })
  async findUpcomingSlots(@Param("id") id: string) {
    return this.productsService.findUpcomingSlots(id, 5);
  }

  @Get(":id/slots/mine")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("empresa", "admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "List all slots of a product (socio only)" })
  async findMySlots(@CurrentUser("id") userId: string, @Param("id") id: string) {
    return this.productsService.findMySlots(id, userId);
  }

  @Post(":id/slots")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("empresa", "admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create an availability slot (socio only)" })
  async createSlot(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
    @Body() dto: CreateProductSlotDto,
  ) {
    return this.productsService.createSlot(userId, id, dto);
  }

  @Delete(":id/slots/:slotId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("empresa", "admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete an availability slot (socio only)" })
  async removeSlot(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
    @Param("slotId") slotId: string,
  ) {
    return this.productsService.removeSlot(userId, id, slotId);
  }

  @Post(":id/reviews")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a review for a product" })
  async createReview(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
    @Body() dto: CreateProductReviewDto,
  ) {
    return this.productsService.createProductReview(
      userId,
      id,
      dto.rating,
      dto.comment,
    );
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("empresa", "admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a product (socio only)" })
  async update(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(userId, id, dto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("empresa", "admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Deactivate a product (soft delete)" })
  async remove(@CurrentUser("id") userId: string, @Param("id") id: string) {
    return this.productsService.remove(userId, id);
  }
}
