import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { FoundPet } from './found-pet.entity';
import { CreateFoundPetDto } from './dto/create-found-pet.dto';
import { LostPetsService } from '../lost-pets/lost-pets.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class FoundPetsService {
  private readonly logger = new Logger(FoundPetsService.name);

  constructor(
    @InjectRepository(FoundPet)
    private readonly foundPetRepo: Repository<FoundPet>,
    private readonly dataSource: DataSource,
    private readonly lostPetsService: LostPetsService,
    private readonly mailService: MailService,
  ) {}

  async create(dto: CreateFoundPetDto): Promise<any> {
    // 1. Insertar la mascota encontrada con PostGIS
    const result = await this.dataSource.query(
      `INSERT INTO found_pets
        (species, breed, color, size, description, photo_url,
         finder_name, finder_email, finder_phone,
         location, address, found_date)
       VALUES
        ($1, $2, $3, $4, $5, $6,
         $7, $8, $9,
         ST_SetSRID(ST_MakePoint($10, $11), 4326),
         $12, $13)
       RETURNING id, species, breed, color, size, description,
                 photo_url, finder_name, finder_email, finder_phone,
                 ST_AsGeoJSON(location) as location_json,
                 address, found_date, created_at, updated_at`,
      [
        dto.species,
        dto.breed || null,
        dto.color,
        dto.size,
        dto.description,
        dto.photo_url || null,
        dto.finder_name,
        dto.finder_email,
        dto.finder_phone,
        dto.longitude,
        dto.latitude,
        dto.address,
        dto.found_date,
      ],
    );

    const row = result[0];
    const locationJson = row.location_json ? JSON.parse(row.location_json) : null;

    const foundPet = {
      ...row,
      latitude: locationJson?.coordinates?.[1],
      longitude: locationJson?.coordinates?.[0],
    };

    // 2. Buscar mascotas perdidas en radio de 500 metros
    this.logger.log(
      `Buscando mascotas perdidas cerca de [${dto.latitude}, ${dto.longitude}]...`,
    );

    const nearbyLostPets = await this.lostPetsService.findNearby(
      dto.latitude,
      dto.longitude,
      500,
    );

    this.logger.log(
      `Se encontraron ${nearbyLostPets.length} mascotas perdidas en el área`,
    );

    // 3. Enviar correo por cada mascota perdida cercana
    for (const lostPet of nearbyLostPets) {
      try {
        await this.mailService.sendFoundPetNotification(foundPet, lostPet);
        this.logger.log(
          `Correo enviado al dueño de ${lostPet.name} (${lostPet.owner_email})`,
        );
      } catch (error) {
        this.logger.error(
          `Error al enviar correo a ${lostPet.owner_email}: ${error.message}`,
        );
      }
    }

    return {
      ...foundPet,
      nearbyLostPetsFound: nearbyLostPets.length,
      notificationsSent: nearbyLostPets.map((p) => ({
        id: p.id,
        name: p.name,
        owner_email: p.owner_email,
        distance_meters: Math.round(p['distance']),
      })),
    };
  }

  async findAll(): Promise<FoundPet[]> {
    const rows = await this.dataSource.query(
      `SELECT id, species, breed, color, size, description,
              photo_url, finder_name, finder_email, finder_phone,
              ST_AsGeoJSON(location) as location_json,
              address, found_date, created_at, updated_at
       FROM found_pets
       ORDER BY created_at DESC`,
    );

    return rows.map((row) => {
      const loc = row.location_json ? JSON.parse(row.location_json) : null;
      return {
        ...row,
        latitude: loc?.coordinates?.[1],
        longitude: loc?.coordinates?.[0],
      };
    });
  }
}
