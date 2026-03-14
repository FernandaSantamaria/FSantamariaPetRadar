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

export class CreateLostPetDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  species: string;

  @IsString()
  @IsNotEmpty()
  breed: string;

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
  owner_name: string;

  @IsEmail()
  owner_email: string;

  @IsString()
  @IsNotEmpty()
  owner_phone: string;

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
  lost_date: string;
}
