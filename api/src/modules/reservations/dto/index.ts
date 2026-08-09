import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

export class CreateReservationDto {
  @ApiPropertyOptional({ example: "clx..." })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional({ example: "clx..." })
  @IsOptional()
  @IsString()
  placeId?: string;

  @ApiProperty({ example: "2026-08-15" })
  @IsDateString()
  date: string;

  @ApiProperty({ example: "19:00" })
  @IsString()
  @IsNotEmpty()
  time: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  @Max(50)
  partySize: number;

  @ApiPropertyOptional({ example: "Mesa cerca de la ventana" })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: "+59171234567" })
  @IsOptional()
  @IsString()
  contactPhone?: string;
}

export class UpdateReservationStatusDto {
  @ApiProperty({
    enum: [
      "pending",
      "confirmed",
      "cancelled",
      "completed",
      "rejected",
      "expirada",
      "no_show",
    ],
  })
  @IsString()
  @IsNotEmpty()
  status: string;
}
