import {
  IsString,
  IsEmail,
  IsNumber,
  IsOptional,
  IsDateString,
  IsNotEmpty,
  Min,
  Max,
} from 'class-validator';

export class CreateFoundPetDto {
  @IsString()
  @IsNotEmpty()
  species: string;

  @IsOptional()
  @IsString()
  breed?: string;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsString()
  @IsNotEmpty()
  size: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsString()
  photo_url?: string;

  @IsString()
  @IsNotEmpty()
  finder_name: string;

  @IsEmail()
  finder_email: string;

  @IsString()
  @IsNotEmpty()
  finder_phone: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsDateString()
  found_date: string;
}
