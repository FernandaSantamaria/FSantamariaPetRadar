# 🐾 PetRadar API

API REST desarrollada con **NestJS** + **PostgreSQL** + **PostGIS** para registrar mascotas perdidas y encontradas, con búsqueda geoespacial y notificaciones por correo.

## ✨ Funcionalidades

- 📋 Registrar mascotas **perdidas** con coordenadas GPS
- 📋 Registrar mascotas **encontradas** con coordenadas GPS
- 🗺️ Búsqueda automática por radio de **500 metros** con PostGIS (`ST_DWithin`)
- 📧 Envío automático de **correo de notificación** al registrar mascota encontrada
- 🗺️ Correo incluye **mapa estático de Mapbox** con ambas ubicaciones

## 🛠️ Tecnologías

| Tecnología | Uso |
|---|---|
| NestJS | Framework backend |
| TypeORM | ORM para PostgreSQL |
| PostgreSQL + PostGIS | Base de datos con soporte geoespacial |
| Nodemailer | Envío de correos |
| Mapbox Static API | Mapa en el correo |
| Docker | Levantar la BD |

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/TuApellidoPetRadar.git
cd TuApellidoPetRadar
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env`:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=petradar

# Mail (Gmail SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=tu-correo@gmail.com
MAIL_PASSWORD=tu-app-password-de-gmail
MAIL_FROM=PetRadar <tu-correo@gmail.com>
MAIL_TO=notificaciones@petradar.com

# Mapbox
MAPBOX_TOKEN=pk.eyJ1...

# App
PORT=3000
```

> **Nota Gmail:** Activa "Contraseñas de aplicación" en tu cuenta Google para obtener `MAIL_PASSWORD`.

### 4. Levantar PostgreSQL con PostGIS

```bash
docker-compose up -d
```

### 5. Iniciar la aplicación

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

La API estará disponible en: `http://localhost:3000`

---

## 📡 Endpoints

### Mascotas Perdidas

#### `POST /lost-pets`
Registrar una mascota perdida.

**Body:**
```json
{
  "name": "Firulais",
  "species": "perro",
  "breed": "Labrador",
  "color": "amarillo",
  "size": "grande",
  "description": "Collar azul, muy amigable",
  "photo_url": "https://example.com/firulais.jpg",
  "owner_name": "Juan Pérez",
  "owner_email": "juan@example.com",
  "owner_phone": "+52 477 123 4567",
  "latitude": 21.1218,
  "longitude": -101.6826,
  "address": "Av. Insurgentes 123, León, Gto.",
  "lost_date": "2026-03-10T15:00:00Z"
}
```

#### `GET /lost-pets`
Listar todas las mascotas perdidas activas.

---

### Mascotas Encontradas

#### `POST /found-pets`
Registrar una mascota encontrada.

> Al crear el registro, automáticamente:
> 1. Busca mascotas perdidas en radio de 500m con PostGIS
> 2. Envía correo de notificación por cada coincidencia

**Body:**
```json
{
  "species": "perro",
  "breed": "Labrador",
  "color": "amarillo",
  "size": "grande",
  "description": "Encontrado en la calle, parece asustado pero saludable",
  "photo_url": "https://example.com/found.jpg",
  "finder_name": "María García",
  "finder_email": "maria@example.com",
  "finder_phone": "+52 477 987 6543",
  "latitude": 21.1220,
  "longitude": -101.6830,
  "address": "Blvd. López Mateos 456, León, Gto.",
  "found_date": "2026-03-11T10:00:00Z"
}
```

**Respuesta:**
```json
{
  "id": 1,
  "species": "perro",
  "latitude": 21.1220,
  "longitude": -101.6830,
  "nearbyLostPetsFound": 1,
  "notificationsSent": [
    {
      "id": 1,
      "name": "Firulais",
      "owner_email": "juan@example.com",
      "distance_meters": 47
    }
  ]
}
```

#### `GET /found-pets`
Listar todas las mascotas encontradas.

---

## 🗺️ Búsqueda Geoespacial

La búsqueda usa PostGIS con `ST_DWithin` y cast a `::geography` para que la distancia sea en **metros reales**:

```sql
SELECT *,
  ST_Distance(
    location::geography,
    ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography
  ) AS distance
FROM lost_pets
WHERE is_active = true
  AND ST_DWithin(
    location::geography,
    ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
    500
  )
ORDER BY distance ASC;
```

## 📧 Correo de Notificación

El correo incluye:
- Datos de la mascota encontrada (especie, raza, color, descripción, dirección)
- Datos de contacto de quien la encontró
- Datos de tu mascota perdida
- **Mapa estático de Mapbox** con 🔴 punto rojo (donde se perdió) y 🟢 punto verde (donde fue encontrada)

## 📁 Estructura del Proyecto

```
src/
├── app.module.ts           # Módulo raíz
├── main.ts                 # Entrada de la app
├── lost-pets/
│   ├── lost-pet.entity.ts
│   ├── lost-pets.service.ts
│   ├── lost-pets.controller.ts
│   ├── lost-pets.module.ts
│   └── dto/
│       └── create-lost-pet.dto.ts
├── found-pets/
│   ├── found-pet.entity.ts
│   ├── found-pets.service.ts
│   ├── found-pets.controller.ts
│   ├── found-pets.module.ts
│   └── dto/
│       └── create-found-pet.dto.ts
└── mail/
    ├── mail.service.ts
    └── mail.module.ts
docker-compose.yml
.env.example
```
