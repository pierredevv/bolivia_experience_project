import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class CreateSupportTicketDto {
  @ApiProperty({
    enum: ["reservation", "payment", "tours", "bill", "opinion", "other"],
    example: "reservation",
  })
  @IsIn(["reservation", "payment", "tours", "bill", "opinion", "other"])
  type: string;

  @ApiPropertyOptional({ example: "clx..." })
  @IsOptional()
  @IsString()
  reservationId?: string;

  @ApiProperty({ example: "Problema con mi reserva" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  subject: string;

  @ApiProperty({ example: "No aparece confirmada la reserva del sábado" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  description: string;
}

export class AddSupportMessageDto {
  @ApiProperty({ example: "Adjunto más contexto..." })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  body: string;
}

export class UpdateSupportTicketStatusDto {
  @ApiProperty({
    enum: ["open", "in_progress", "resolved", "closed"],
    example: "in_progress",
  })
  @IsIn(["open", "in_progress", "resolved", "closed"])
  status: string;
}

export class AdminCreateSupportTicketDto extends CreateSupportTicketDto {
  @ApiProperty({ example: "clx..." })
  @IsString()
  @IsNotEmpty()
  userId: string;
}