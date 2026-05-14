import { Controller, Post, Get, Body, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { FoundPetsService } from './found-pets.service';
import { CreateFoundPetDto } from './dto/create-found-pet.dto';

@Controller('found-pets')
export class FoundPetsController {
  constructor(private readonly foundPetsService: FoundPetsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * POST /found-pets
   * Registrar una mascota encontrada.
   * Automáticamente busca mascotas perdidas en radio 500m
   * y envía correos de notificación.
   */
  @Post()
  async create(@Body() createFoundPetDto: CreateFoundPetDto) {
    const result = await this.foundPetsService.create(createFoundPetDto);
    await this.cacheManager.del('found_pets_all');
    return result
  }

  /**
   * GET /found-pets
   * Listar mascotas encontradas
   */
  @Get()
  async findAll() {
    const cacheKey = 'found_pets_all';

    // Intentar obtener de caché
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      console.log('📦 [Redis] GET /found-pets → desde caché');
      return cached;
    }

    // Si no hay caché, consultar BD y guardar en caché
    console.log('🗄️  [Redis] GET /found-pets → desde base de datos');
    const data = await this.foundPetsService.findAll();
    await this.cacheManager.set(cacheKey, data, 60000); // 60 segundos
    return data;
  }
}
