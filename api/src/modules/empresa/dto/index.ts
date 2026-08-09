import {
  IsString,
  IsOptional,
  IsEmail,
  MinLength,
  IsInt,
  Min,
  Max,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PaginationDto } from "../../../common/dto/pagination.dto";

export class UpdatePlaceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instagram?: string;

  @ApiPropertyOptional({
    description: "Price level 1-4 (1=cheapest, 4=most expensive)",
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  priceLevel?: number;

  @ApiPropertyOptional({
    description: "Destacado especial del establecimiento (p.ej. 'Piscina', 'Vista panorámica')",
  })
  @IsOptional()
  @IsString()
  specialFeature?: string;

  @ApiPropertyOptional({
    description: "Tipo de cocina para restaurantes (p.ej. 'Cruceña', 'Italiana')",
  })
  @IsOptional()
  @IsString()
  cuisineType?: string;
}

export class EmpresaReviewsDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ["all", "published", "hidden"] })
  @IsOptional()
  @IsString()
  filter?: "all" | "published" | "hidden";
}
