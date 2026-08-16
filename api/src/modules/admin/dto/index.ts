import {
  IsOptional,
  IsString,
  IsIn,
  IsBoolean,
  IsInt,
  IsNumber,
  IsNotEmpty,
  Min,
  Max,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PaginationDto } from "../../../common/dto/pagination.dto";

export class AdminUsersDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ["admin", "empresa", "usuario"] })
  @IsOptional()
  @IsIn(["admin", "empresa", "usuario"])
  role?: string;
}

export class AdminReviewsDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ["pending", "approved", "rejected"] })
  @IsOptional()
  @IsIn(["pending", "approved", "rejected"])
  status?: string;
}

export class UpdateProductCashbackDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @ApiPropertyOptional({ example: 10, minimum: 0, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  porcentaje?: number;
}

export class UpdateProductPremiadoDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  premiado?: boolean;
}

export class UpdateExchangeRateDto {
  @ApiProperty({ example: 6.96, minimum: 0.0001 })
  @IsNumber()
  @Min(0.0001)
  rate: number;
}

export class CreateSafetyZoneDto {
  @ApiProperty({ example: "Zona Sur - Iluminación" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: -17.7833 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: -63.1821 })
  @IsNumber()
  longitude: number;

  @ApiProperty({ example: 2.5 })
  @IsNumber()
  @Min(0.1)
  radioKm: number;

  @ApiProperty({ enum: ["bajo", "medio", "alto"] })
  @IsIn(["bajo", "medio", "alto"])
  nivelRiesgo: string;

  @ApiPropertyOptional({ example: "Zona con poca iluminación nocturna" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: "Santa Cruz de la Sierra" })
  @IsOptional()
  @IsString()
  city?: string;
}

export class UpdateSafetyZoneDto {
  @ApiPropertyOptional({ example: "Zona Sur - Iluminación" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ example: -17.7833 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: -63.1821 })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ example: 2.5 })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  radioKm?: number;

  @ApiPropertyOptional({ enum: ["bajo", "medio", "alto"] })
  @IsOptional()
  @IsIn(["bajo", "medio", "alto"])
  nivelRiesgo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
