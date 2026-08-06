import { IsString, IsOptional, IsEmail, MinLength, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

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

  @ApiPropertyOptional({ description: 'Price level 1-4 (1=cheapest, 4=most expensive)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  priceLevel?: number;
}

export class EmpresaReviewsDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ['all', 'published', 'hidden'] })
  @IsOptional()
  @IsString()
  filter?: 'all' | 'published' | 'hidden';
}
