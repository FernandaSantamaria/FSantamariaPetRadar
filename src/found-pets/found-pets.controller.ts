import { Controller, Post, Get, Body } from '@nestjs/common';
import { FoundPetsService } from './found-pets.service';
import { CreateFoundPetDto } from './dto/create-found-pet.dto';

@Controller('found-pets')
export class FoundPetsController {
  constructor(private readonly foundPetsService: FoundPetsService) {}

  /**
   * POST /found-pets
   * Registrar una mascota encontrada.
   * Automáticamente busca mascotas perdidas en radio 500m
   * y envía correos de notificación.
   */
  @Post()
  create(@Body() createFoundPetDto: CreateFoundPetDto) {
    return this.foundPetsService.create(createFoundPetDto);
  }

  /**
   * GET /found-pets
   * Listar mascotas encontradas
   */
  @Get()
  findAll() {
    return this.foundPetsService.findAll();
  }
}
