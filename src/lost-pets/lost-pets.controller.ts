import { Controller, Post, Get, Body } from '@nestjs/common';
import { LostPetsService } from './lost-pets.service';
import { CreateLostPetDto } from './dto/create-lost-pet.dto';

@Controller('lost-pets')
export class LostPetsController {
  constructor(private readonly lostPetsService: LostPetsService) {}

  /**
   * POST /lost-pets
   * Registrar una mascota perdida
   */
  @Post()
  create(@Body() createLostPetDto: CreateLostPetDto) {
    return this.lostPetsService.create(createLostPetDto);
  }

  /**
   * GET /lost-pets
   * Listar mascotas perdidas activas
   */
  @Get()
  findAll() {
    return this.lostPetsService.findAll();
  }
}
