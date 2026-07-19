import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RespondReviewDto {
  @ApiProperty({ example: 'Gracias por su visita!' })
  @IsString()
  @MaxLength(1000)
  comment: string;
}
