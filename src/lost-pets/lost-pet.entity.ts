import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('lost_pets')
export class LostPet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  species: string;

  @Column({ type: 'varchar' })
  breed: string;

  @Column({ type: 'varchar' })
  color: string;

  @Column({ type: 'varchar' })
  size: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  photo_url: string;

  @Column({ type: 'varchar' })
  owner_name: string;

  @Column({ type: 'varchar' })
  owner_email: string;

  @Column({ type: 'varchar' })
  owner_phone: string;

  // PostGIS Point geometry almacenado como texto WKT/GeoJSON
  // TypeORM no soporta geometry nativamente, usamos query builder raw
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  location: string;

  @Column({ type: 'varchar' })
  address: string;

  @Column({ type: 'timestamp' })
  lost_date: Date;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Campos virtuales para lat/lng (no persistidos)
  latitude?: number;
  longitude?: number;
}
