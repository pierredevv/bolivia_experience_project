import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreatePaymentDto {
  @ApiProperty({ example: 150 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ enum: ["BOB", "USD"], example: "BOB" })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ example: "Reserva - Bioparque Güembé" })
  @IsString()
  description: string;

  @ApiProperty({
    enum: ["reservation", "ticket", "tour", "coupon"],
    example: "reservation",
  })
  @IsIn(["reservation", "ticket", "tour", "coupon"])
  type: string;

  @ApiProperty({ example: "clx..." })
  @IsString()
  referenceId: string;
}
