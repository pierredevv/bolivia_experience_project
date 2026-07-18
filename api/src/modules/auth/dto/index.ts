import { IsEmail, IsString, MinLength, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: 'es', enum: ['es', 'en', 'pt'] })
  @IsOptional()
  @IsIn(['es', 'en', 'pt'])
  language?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  refreshToken: string;
}

export class RegisterBusinessDto {
  @ApiProperty({ example: 'empresa@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Carlos Mendoza' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Restaurante El Sabor' })
  @IsString()
  @MinLength(2)
  businessName: string;

  @ApiPropertyOptional({ example: '+591 3 123456' })
  @IsOptional()
  @IsString()
  businessPhone?: string;

  @ApiProperty({ example: 'Av. Principal #123' })
  @IsString()
  address: string;

  @ApiProperty({ description: 'Category ID for the place' })
  @IsString()
  categoryId: string;

  @ApiPropertyOptional({ example: -17.7833 })
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({ example: -63.1821 })
  @IsOptional()
  longitude?: number;
}
