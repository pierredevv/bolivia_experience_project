import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreatePaymentDto {
  @ApiProperty({ example: 150 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ enum: ["USD", "BOB"], example: "USD" })
  @IsOptional()
  @IsIn(["USD", "BOB"])
  currency?: string;

  @ApiPropertyOptional({ enum: ["stripe", "paypal", "qr_banco_local"] })
  @IsOptional()
  @IsIn(["stripe", "paypal", "qr_banco_local"])
  provider?: string;

  @ApiProperty({ example: "Reserva - Bioparque Guembé" })
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
