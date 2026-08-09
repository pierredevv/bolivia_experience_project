import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

export const PRODUCT_TYPES = [
  "hospedaje",
  "transporte",
  "actividad",
  "guia",
  "mesa",
  "paquete",
  "experiencia",
] as const;
export const RESERVATION_MODALITIES = [
  "ninguna",
  "solicitud",
  "instantanea",
] as const;

export class CreateProductDto {
  @ApiPropertyOptional({ example: "clx..." })
  @IsOptional()
  @IsString()
  placeId?: string;

  @ApiProperty({ enum: PRODUCT_TYPES, example: "mesa" })
  @IsIn(PRODUCT_TYPES)
  type: string;

  @ApiProperty({ example: "Mesa para 4 - Terraza" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiProperty({ example: 45 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiPropertyOptional({ example: "BOB" })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ enum: RESERVATION_MODALITIES, example: "instantanea" })
  @IsIn(RESERVATION_MODALITIES)
  modalidadReserva: string;

  @ApiPropertyOptional({ enum: ["urbano", "rural", "ambos"] })
  @IsOptional()
  @IsString()
  tourismType?: string;

  @ApiPropertyOptional({ enum: ["mochilero", "medio", "premium"] })
  @IsOptional()
  @IsString()
  budgetRange?: string;

  @ApiPropertyOptional({ example: { capacidad: 4, cocina: "cruceña" } })
  @IsOptional()
  attributes?: Record<string, any>;

  @ApiPropertyOptional({ example: "Tours de Noche" })
  @IsOptional()
  @IsString()
  experienceCategory?: string;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt()
  @Min(1)
  duracionDias?: number;

  @ApiPropertyOptional({ example: 40 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pricePerAdult?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  priceVarByGroup?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  policyId?: string;

  @ApiPropertyOptional({ example: "4 horas" })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  @Min(0)
  minAge?: number;

  @ApiPropertyOptional({ example: 80 })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxAge?: number;

  @ApiPropertyOptional({ example: 15 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxGroup?: number;

  @ApiPropertyOptional({ example: "es" })
  @IsOptional()
  @IsString()
  guideLanguage?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  mobileTicket?: boolean;

  @ApiPropertyOptional({ example: 23 })
  @IsOptional()
  @IsInt()
  @Min(0)
  advanceDays?: number;

  @ApiPropertyOptional({ example: ["Garantía de precio más bajo", "Cancelación gratuita"] })
  @IsOptional()
  policies?: string[];

  // ── Hoteles (socio) ──
  @ApiPropertyOptional({ example: "Hotel boutique con piscina y spa" })
  @IsOptional()
  @IsString()
  caracteristicas?: string;

  @ApiPropertyOptional({ example: ["wifi", "desayuno"] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  comodidades?: string[];

  @ApiPropertyOptional({ enum: ["hotel", "bnb", "inn"] })
  @IsOptional()
  @IsIn(["hotel", "bnb", "inn"])
  tipoPropiedad?: string;

  @ApiPropertyOptional({ example: 4, minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  estrellas?: number;

  @ApiPropertyOptional({ example: "Precio por noche (incluye comisiones)" })
  @IsOptional()
  @IsString()
  textoPrecio?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  tieneOferta?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  reembolsable?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  pagoDiferido?: boolean;
}

export class UpdateProductDto {
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
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiPropertyOptional({ enum: RESERVATION_MODALITIES })
  @IsOptional()
  @IsIn(RESERVATION_MODALITIES)
  modalidadReserva?: string;

  @ApiPropertyOptional({ enum: ["urbano", "rural", "ambos"] })
  @IsOptional()
  @IsString()
  tourismType?: string;

  @ApiPropertyOptional({ enum: ["mochilero", "medio", "premium"] })
  @IsOptional()
  @IsString()
  budgetRange?: string;

  @ApiPropertyOptional()
  @IsOptional()
  attributes?: Record<string, any>;

  @ApiPropertyOptional({ example: "Tours de Noche" })
  @IsOptional()
  @IsString()
  experienceCategory?: string;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt()
  @Min(1)
  duracionDias?: number;

  @ApiPropertyOptional({ example: 40 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pricePerAdult?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  priceVarByGroup?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  policyId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: "4 horas" })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  @Min(0)
  minAge?: number;

  @ApiPropertyOptional({ example: 80 })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxAge?: number;

  @ApiPropertyOptional({ example: 15 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxGroup?: number;

  @ApiPropertyOptional({ example: "es" })
  @IsOptional()
  @IsString()
  guideLanguage?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  mobileTicket?: boolean;

  @ApiPropertyOptional({ example: 23 })
  @IsOptional()
  @IsInt()
  @Min(0)
  advanceDays?: number;

  @ApiPropertyOptional({ example: ["Garantía de precio más bajo", "Cancelación gratuita"] })
  @IsOptional()
  policies?: string[];

  // ── Hoteles (socio) ──
  @ApiPropertyOptional({ example: "Hotel boutique con piscina y spa" })
  @IsOptional()
  @IsString()
  caracteristicas?: string;

  @ApiPropertyOptional({ example: ["wifi", "desayuno"] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  comodidades?: string[];

  @ApiPropertyOptional({ enum: ["hotel", "bnb", "inn"] })
  @IsOptional()
  @IsIn(["hotel", "bnb", "inn"])
  tipoPropiedad?: string;

  @ApiPropertyOptional({ example: 4, minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  estrellas?: number;

  @ApiPropertyOptional({ example: "Precio por noche (incluye comisiones)" })
  @IsOptional()
  @IsString()
  textoPrecio?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  tieneOferta?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  reembolsable?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  pagoDiferido?: boolean;
}

export class QueryProductsDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  @ApiPropertyOptional({ enum: PRODUCT_TYPES })
  @IsOptional()
  @IsIn(PRODUCT_TYPES)
  type?: string;

  @ApiPropertyOptional({ enum: RESERVATION_MODALITIES })
  @IsOptional()
  @IsIn(RESERVATION_MODALITIES)
  modalidadReserva?: string;

  @ApiPropertyOptional({ enum: ["urbano", "rural", "ambos"] })
  @IsOptional()
  @IsString()
  tourismType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  placeId?: string;
}

export class CreateProductReviewDto {
  @ApiProperty({ minimum: 1, maximum: 5, example: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ example: "Experiencia increíble!" })
  @IsOptional()
  @IsString()
  comment?: string;
}

export class CreateProductSlotDto {
  @ApiProperty({ example: "2026-08-08" })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: "09:00" })
  @IsString()
  @IsNotEmpty()
  time: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;
}
