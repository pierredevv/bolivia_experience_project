import {
  IsOptional,
  IsString,
  IsIn,
  IsBoolean,
  IsInt,
  Min,
  Max,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
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
