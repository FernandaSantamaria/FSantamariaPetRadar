import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LostPetsModule } from './lost-pets/lost-pets.module';
import { FoundPetsModule } from './found-pets/found-pets.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    // Variables de entorno globales
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Conexión a PostgreSQL + PostGIS
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USERNAME', 'postgres'),
        password: config.get('DB_PASSWORD', 'postgres'),
        database: config.get('DB_NAME', 'petradar'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // Solo para desarrollo - en prod usar migraciones
        logging: false,
      }),
    }),

    LostPetsModule,
    FoundPetsModule,
    MailModule,
  ],
})
export class AppModule {}
