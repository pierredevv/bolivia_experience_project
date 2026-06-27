# 5. Backend Completo (NestJS) — BoliviaExperience

**Proyecto:** BoliviaExperience
**Versión:** 1.0
**Fecha:** 2026-06-26
**Responsables:** Tech Lead, Backend Developer

---

## 1. Estructura del Proyecto

```
api/
├── package.json
├── tsconfig.json
├── nest-cli.json
├── .env.example
├── prisma/
│   ├── schema.prisma          # Schema de Prisma (13 modelos)
│   ├── seed.ts                # Script de seeding
│   └── migrations/            # Migraciones Prisma
└── src/
    ├── main.ts                # Entry point (Bootstrap)
    ├── app.module.ts          # Módulo raíz
    ├── config/
    │   └── configuration.ts   # Configuración centralizada
    ├── prisma/
    │   ├── prisma.module.ts   # Módulo global de Prisma
    │   └── prisma.service.ts  # Servicio de conexión
    ├── common/
    │   ├── guards/
    │   │   ├── firebase-auth.guard.ts
    │   │   └── roles.guard.ts
    │   ├── interceptors/
    │   │   └── transform.interceptor.ts
    │   ├── filters/
    │   │   └── all-exceptions.filter.ts
    │   ├── decorators/
    │   │   ├── current-user.decorator.ts
    │   │   └── roles.decorator.ts
    │   └── dto/
    │       └── pagination.dto.ts
    └── modules/
        ├── auth/              # Autenticación
        │   ├── auth.module.ts
        │   ├── auth.service.ts
        │   ├── auth.controller.ts
        │   └── dto/
        ├── users/             # Usuarios
        │   ├── users.module.ts
        │   ├── users.service.ts
        │   ├── users.controller.ts
        │   └── dto/
        ├── places/            # Lugares (core)
        │   ├── places.module.ts
        │   ├── places.service.ts
        │   ├── places.controller.ts
        │   ├── dto/
        │   └── repositories/
        │       └── geo.repository.ts  # PostGIS queries
        ├── categories/        # Categorías
        │   ├── categories.module.ts
        │   ├── categories.service.ts
        │   └── categories.controller.ts
        ├── reviews/           # Reseñas
        │   ├── reviews.module.ts
        │   ├── reviews.service.ts
        │   ├── reviews.controller.ts
        │   └── dto/
        ├── favorites/         # Favoritos
        │   ├── favorites.module.ts
        │   ├── favorites.service.ts
        │   └── favorites.controller.ts
        ├── map/               # Geolocalización
        │   ├── map.module.ts
        │   ├── map.service.ts
        │   └── map.controller.ts
        ├── search/            # Búsqueda
        │   ├── search.module.ts
        │   ├── search.service.ts
        │   └── search.controller.ts
        ├── events/            # Eventos
        │   ├── events.module.ts
        │   ├── events.service.ts
        │   └── events.controller.ts
        ├── promotions/        # Promociones
        │   ├── promotions.module.ts
        │   ├── promotions.service.ts
        │   └── promotions.controller.ts
        └── weather/           # Clima
            ├── weather.module.ts
            ├── weather.service.ts
            └── weather.controller.ts
```

---

## 2. Stack Tecnológico

| Componente | Tecnología | Versión |
|------------|-----------|---------|
| Framework | NestJS | 10.x |
| Lenguaje | TypeScript | 5.3 |
| ORM | Prisma | 5.x |
| Base de datos | PostgreSQL + PostGIS | 15 |
| Autenticación | Firebase Auth + JWT | - |
| Documentación | Swagger/OpenAPI | 3.0 |
| Validación | class-validator + class-transformer | - |
| Seguridad | Helmet + CORS | - |
| Compresión | compression | - |

---

## 3. Módulos Implementados

### 3.1 Auth Module

**Endpoints:**
- `POST /auth/register` - Registro con email/password
- `POST /auth/login` - Login con email/password
- `POST /auth/google` - Login con Google OAuth
- `POST /auth/refresh` - Refrescar access token

**Servicios:**
- Registro de usuarios con Firebase Admin SDK
- Login con verificación de Firebase UID
- Generación de JWT (access + refresh tokens)
- Autenticación Google OAuth

### 3.2 Users Module

**Endpoints:**
- `GET /users/me` - Obtener perfil actual
- `PUT /users/me` - Actualizar perfil
- `GET /users/:id` - Obtener usuario por ID

**Servicios:**
- CRUD de perfil de usuario
- Conteo de reseñas y favoritos

### 3.3 Places Module

**Endpoints:**
- `GET /places` - Listar lugares (paginado, filtros)
- `GET /places/featured` - Lugares destacados
- `GET /places/:id` - Detalle de lugar
- `POST /places` - Crear lugar (Admin)
- `PUT /places/:id` - Actualizar lugar (Admin)
- `PATCH /places/:id/status` - Activar/desactivar (Admin)
- `DELETE /places/:id` - Eliminar lugar (Admin)
- `GET /places/:id/photos` - Obtener fotos
- `POST /places/:id/photos` - Agregar foto (Admin)

**Repositorios:**
- `GeoRepository` - Consultas PostGIS raw queries:
  - `findNearby()` - Lugares cercanos
  - `findClusters()` - Clustering para mapa
  - `findByBounds()` - Bounding box

### 3.4 Categories Module

**Endpoints:**
- `GET /categories` - Listar categorías
- `GET /categories/:slug` - Categoría por slug con lugares
- `POST /categories` - Crear (Admin)
- `PUT /categories/:id` - Actualizar (Admin)
- `DELETE /categories/:id` - Eliminar (Admin)

### 3.5 Reviews Module

**Endpoints:**
- `GET /places/:id/reviews` - Reseñas de un lugar
- `POST /places/:id/reviews` - Crear reseña
- `PUT /reviews/:id` - Actualizar reseña (propia)
- `DELETE /reviews/:id` - Eliminar reseña (propia o admin)
- `PATCH /reviews/:id/approve` - Aprobar reseña (Admin)
- `POST /reviews/:id/respond` - Responder reseña (Empresa)

### 3.6 Favorites Module

**Endpoints:**
- `GET /favorites` - Favoritos del usuario
- `POST /favorites/:placeId` - Agregar favorito
- `DELETE /favorites/:placeId` - Eliminar favorito
- `GET /favorites/check/:placeId` - Verificar si es favorito

### 3.7 Map Module

**Endpoints:**
- `GET /map/nearby` - Lugares cercanos
- `GET /map/cluster` - Clusters para el mapa
- `GET /map/bounds` - Lugares en bounds

### 3.8 Search Module

**Endpoints:**
- `GET /search` - Búsqueda de lugares
- `GET /search/suggestions` - Autocompletado
- `GET /search/history` - Historial de búsqueda

### 3.9 Events Module

**Endpoints:**
- `GET /events` - Listar eventos próximos
- `GET /events/today` - Eventos de hoy
- `GET /events/:id` - Detalle de evento
- `POST /events` - Crear evento (Admin)
- `PUT /events/:id` - Actualizar evento (Admin)
- `DELETE /events/:id` - Eliminar evento (Admin)

### 3.10 Promotions Module

**Endpoints:**
- `GET /promotions` - Promociones activas
- `GET /promotions/:id` - Detalle de promoción
- `POST /places/:id/promotions` - Crear promoción (Empresa)
- `PUT /promotions/:id` - Actualizar promoción (Empresa)
- `DELETE /promotions/:id` - Eliminar promoción (Empresa)

### 3.11 Weather Module

**Endpoints:**
- `GET /weather/current` - Clima actual en Santa Cruz
- `GET /weather/forecast` - Pronóstico 5 días

**Integración:** OpenWeatherMap API

---

## 4. Guards y Seguridad

| Guard | Propósito | Uso |
|-------|-----------|-----|
| `FirebaseAuthGuard` | Verifica Firebase ID Token | Todas las rutas autenticadas |
| `RolesGuard` | Verifica roles del usuario | Rutas de admin/empresa |

**Decoradores:**
- `@CurrentUser()` - Obtiene usuario del request
- `@Roles()` - Define roles permitidos

---

## 5. Formato de Respuesta

### Respuesta Exitosa

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-06-26T12:00:00.000Z"
}
```

### Respuesta con Paginación

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  },
  "timestamp": "2026-06-26T12:00:00.000Z"
}
```

### Respuesta de Error

```json
{
  "success": false,
  "error": {
    "code": 400,
    "message": "Validation error",
    "details": ["email must be an email", "name should not be empty"]
  },
  "timestamp": "2026-06-26T12:00:00.000Z"
}
```

---

## 6. Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Generar Prisma Client
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# Seed de datos
npm run prisma:seed

# Iniciar en desarrollo
npm run start:dev

# Build para producción
npm run build

# Ejecutar tests
npm run test

# Documentación Swagger
http://localhost:3000/docs
```

---

## 7. Checklist de Completitud — Entregable 5

- [x] Estructura del proyecto NestJS
- [x] Configuración (package.json, tsconfig, nest-cli)
- [x] Archivos de configuración (.env.example)
- [x] Módulo raíz (AppModule)
- [x] Entry point (main.ts) con Swagger
- [x] PrismaModule global
- [x] Common: Guards, Interceptors, Filters, Decorators, DTOs
- [x] 11 módulos implementados:
  - [x] Auth (register, login, Google OAuth, refresh)
  - [x] Users (profile CRUD)
  - [x] Places (CRUD + GeoRepository)
  - [x] Categories (CRUD)
  - [x] Reviews (CRUD + approve + respond)
  - [x] Favorites (add/remove/check)
  - [x] Map (nearby, cluster, bounds)
  - [x] Search (search, suggestions, history)
  - [x] Events (CRUD)
  - [x] Promotions (CRUD)
  - [x] Weather (current, forecast)
- [x] Schema Prisma (13 modelos)
- [x] Documentación de la API

---

**Próximo entregable:** 6 — Frontend Flutter (App Móvil)
