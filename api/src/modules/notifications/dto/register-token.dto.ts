import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class RegisterTokenDto {
  @ApiProperty({ example: "fcm-token-123" })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiPropertyOptional({ example: "flutter", default: "flutter" })
  @IsOptional()
  @IsString()
  platform?: string;
}
