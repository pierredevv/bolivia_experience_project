import { IsLatitude, IsLongitude, IsOptional, IsUUID, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class NearbyQueryDto {
  @ApiProperty({ example: -17.7833 })
  @IsLatitude()
  @Type(() => Number)
  lat: number;

  @ApiProperty({ example: -63.1833 })
  @IsLongitude()
  @Type(() => Number)
  lng: number;

  @ApiPropertyOptional({ example: 5000, default: 5000 })
  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(50000)
  @Type(() => Number)
  radius?: number = 5000;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}

export class ClusterQueryDto {
  @ApiProperty({ example: -17.7 })
  @IsLatitude()
  @Type(() => Number)
  neLat: number;

  @ApiProperty({ example: -63.1 })
  @IsLongitude()
  @Type(() => Number)
  neLng: number;

  @ApiProperty({ example: -17.9 })
  @IsLatitude()
  @Type(() => Number)
  swLat: number;

  @ApiProperty({ example: -63.3 })
  @IsLongitude()
  @Type(() => Number)
  swLng: number;
}

export class BoundsQueryDto extends ClusterQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
