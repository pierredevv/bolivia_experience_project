import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class CreatePlaceDto {
  @ApiProperty({ example: 'Bioparque Güembé' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiProperty({ example: 'Km 7, Ruta a Cotoca' })
  @IsString()
  @MaxLength(500)
  address: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiProperty()
  @IsString()
  categoryId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ownerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instagram?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  facebook?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tiktok?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}

export class UpdatePlaceDto extends PartialType(CreatePlaceDto) {}

export class QueryPlacesDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'Filter by active status. Admin can see all.' })
  @IsOptional()
  @Transform(({ obj }) => {
    const value = obj.isActive;
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    return Boolean(value);
  })
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'If true, return all places regardless of active status.' })
  @IsOptional()
  @Transform(({ obj }) => {
    const value = obj.allStatuses;
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    return Boolean(value);
  })
  @IsBoolean()
  allStatuses?: boolean;

  @ApiPropertyOptional({ description: 'Minimum rating (1-5)' })
  @IsOptional()
  @Transform(({ obj }) => obj.minRating ? Number(obj.minRating) : undefined)
  @IsNumber()
  @Min(1)
  @Max(5)
  minRating?: number;

  @ApiPropertyOptional({ description: 'Maximum distance in meters from user location' })
  @IsOptional()
  @Transform(({ obj }) => obj.maxDistance ? Number(obj.maxDistance) : undefined)
  @IsNumber()
  maxDistance?: number;

  @ApiPropertyOptional({ description: 'User latitude for distance filter' })
  @IsOptional()
  @Transform(({ obj }) => obj.latitude ? Number(obj.latitude) : undefined)
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: 'User longitude for distance filter' })
  @IsOptional()
  @Transform(({ obj }) => obj.longitude ? Number(obj.longitude) : undefined)
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ description: 'Filter by open now status' })
  @IsOptional()
  @Transform(({ obj }) => {
    const value = obj.isOpenNow;
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    return Boolean(value);
  })
  @IsBoolean()
  isOpenNow?: boolean;

  @ApiPropertyOptional({ description: 'Sort by: rating, distance, name' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Filter by city: santa-cruz, la-paz, cochabamba' })
  @IsOptional()
  @IsString()
  city?: string;
}
