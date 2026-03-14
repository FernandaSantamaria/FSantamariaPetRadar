import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoundPet } from './found-pet.entity';
import { FoundPetsService } from './found-pets.service';
import { FoundPetsController } from './found-pets.controller';
import { LostPetsModule } from '../lost-pets/lost-pets.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FoundPet]),
    LostPetsModule, // para usar LostPetsService
    MailModule,     // para enviar correos
  ],
  controllers: [FoundPetsController],
  providers: [FoundPetsService],
})
export class FoundPetsModule {}
