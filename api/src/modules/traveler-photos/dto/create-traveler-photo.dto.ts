import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateTravelerPhotoDto {
  @ApiProperty({ description: "Título de la foto" })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ description: "Descripción detallada del lugar" })
  @IsOptional()
  @IsString()
  description?: string;
}
