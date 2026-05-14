import { Controller, Post, Get, Body } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { LostPetsService } from './lost-pets.service';
import { CreateLostPetDto } from './dto/create-lost-pet.dto';

@Controller('lost-pets')
export class LostPetsController {
  constructor(
    private readonly lostPetsService: LostPetsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * POST /lost-pets
   * Registrar una mascota perdida e invalidar caché
   */
  @Post()
  async create(@Body() createLostPetDto: CreateLostPetDto) {
    const result = await this.lostPetsService.create(createLostPetDto);
    // Invalidar caché al crear nuevo registro
    await this.cacheManager.del('lost_pets_all');
    return result;
  }

  /**
   * GET /lost-pets
   * Listar mascotas perdidas activas (con caché Redis 60s)
   */
  @Get()
  async findAll() {
    const cacheKey = 'lost_pets_all';

    // Intentar obtener de caché
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      console.log('📦 [Redis] GET /lost-pets → desde caché');
      return cached;
    }

    // Si no hay caché, consultar BD y guardar en caché
    console.log('🗄️  [Redis] GET /lost-pets → desde base de datos');
    const data = await this.lostPetsService.findAll();
    await this.cacheManager.set(cacheKey, data, 60000); // 60 segundos
    return data;
  }
}
