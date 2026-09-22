import { IsString, IsOptional, IsIn, MaxLength, IsArray, Max } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateUserDto {
  @ApiPropertyOptional({ example: "John Doe" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ example: "https://example.com/photo.jpg" })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiPropertyOptional({ example: "Bolivia" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({ enum: ["es", "en", "pt"] })
  @IsOptional()
  @IsIn(["es", "en", "pt"])
  language?: string;

  @ApiPropertyOptional({
    enum: ["mochilero", "medio", "premium"],
    description: "Rango de presupuesto del usuario (Módulo 8)",
  })
  @IsOptional()
  @IsIn(["mochilero", "medio", "premium"])
  budgetType?: string;

  @ApiPropertyOptional({
    enum: ["aventura", "cultura", "gastronomia", "naturaleza", "relax"],
    description: "Tipo de turismo preferido del usuario (Módulo 8)",
  })
  @IsOptional()
  @IsIn(["aventura", "cultura", "gastronomia", "naturaleza", "relax"])
  tourismType?: string;

  @ApiPropertyOptional({
    type: [String],
    description: "Intereses como slugs de categoría, ej. ['parques', 'museos']",
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Max(20, { each: true })
  interests?: string[];
}
