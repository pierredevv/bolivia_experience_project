# BoliviaExperience

**Slogan:** *"Toda Santa Cruz en la palma de tu mano."*

Plataforma turística multiplataforma que centraliza la experiencia de turistas en Santa Cruz de la Sierra, Bolivia.

---

## Estado del Proyecto

| Entregable | Estado |
|------------|--------|
| 1. Documentación de Negocio | ✅ Completado |
| 2. Arquitectura del Software | ✅ Completado |
| 3. Diseño UX/UI | ✅ Completado |
| 4. Modelo de Base de Datos | ✅ Completado |
| 5. Backend API (NestJS) | ✅ Completado |
| 6. Frontend Flutter | ✅ Completado |
| 7. Frontend Web (React) | ✅ Completado |
| 8. Infraestructura DevOps | ✅ Completado |
| 9. Testing | ✅ Completado (195 tests) |
| 10. Documentación Técnica | ✅ Completado |
| 11. Documentación Funcional | ✅ Completado |
| 12. Despliegue y Go-Live | ✅ Completado |

**Tests:** 195 passing (95 API unit + 29 API e2e + 71 web)

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| App móvil | Flutter (Dart 3) | SDK >=3.2.0 |
| Web panels | React + Vite + TypeScript | React 18 |
| Backend API | NestJS + TypeScript | NestJS 10 |
| Base de datos | PostgreSQL + PostGIS / SQLite (dev) | PostgreSQL 15 |
| ORM | Prisma | 5.22.0 |
| Autenticación | JWT (email/password) | — |
| State (Flutter) | Riverpod | 2.4.9 |
| State (Web) | React Query | 5.17 |
| UI Components | Radix UI + Tailwind CSS | 3.4 |
| Animations | framer-motion | 12.42.2 |
| Charts | Recharts | 2.10.3 |
| Contenedores | Docker + Docker Compose | — |
| Reverse proxy | Nginx | — |
| CI/CD | GitHub Actions | — |
| Cloud | Google Cloud Platform | — |

---

## Estructura del Proyecto

```
bolivia_experience_project/
├── api/                    # Backend NestJS
│   ├── src/
│   │   ├── modules/        # 14 módulos (auth, places, admin, etc.)
│   │   ├── common/         # Guards, interceptors, filters, DTOs
│   │   └── prisma/         # Prisma service
│   ├── prisma/
│   │   ├── schema.prisma   # Schema PostgreSQL
│   │   └── seed.ts         # Datos iniciales
│   └── test/               # E2E tests
│
├── app/                    # Flutter mobile app
│   └── lib/
│       ├── config/         # Router, theme, colors
│       ├── core/           # Auth, network, shared widgets
│       └── features/       # 9 módulos (auth, home, map, etc.)
│
├── web/                    # React web panels
│   └── src/
│       ├── components/     # UI components + layouts
│       ├── contexts/       # Auth, Theme, Lang providers
│       ├── hooks/          # React Query hooks
│       ├── pages/          # Admin (10), Business (6), Landing
│       ├── sections/       # 12 landing page sections
│       ├── services/       # Axios API client
│       └── test/           # Vitest tests
│
├── docs/                   # 38 documentation files
│   ├── business/           # 9 docs (model, canvas, roadmap)
│   ├── architecture/       # 8 docs (ADRs, C4, security)
│   ├── design/             # 10 docs (tokens, wireframes)
│   └── database/           # 8 docs (ER, DDL, seeds)
│
├── nginx/                  # Nginx reverse proxy config
├── gcp/                    # GCP Cloud Build config
├── docker-compose.yml      # Docker services
└── handoff.md              # Session handoff document
```

---

## Quick Start

### Desarrollo Local (SQLite, sin Docker)

```bash
# 1. Setup API
cd api
npm install
node setup-db.js sqlite --seed
npm run start:dev
# API: http://localhost:3000
# Swagger: http://localhost:3000/docs

# 2. Setup Web
cd ../web
npm install
npm run dev
# Web: http://localhost:5173
```

### Docker (PostgreSQL)

```bash
docker-compose up -d
# API: http://localhost:3000/docs
# Web: http://localhost:8080
# Nginx: http://localhost:80
```

### Credenciales del Seed

| Email | Password | Rol |
|-------|----------|-----|
| admin@boliviaexperience.com | password123 | admin |
| empresa@boliviaexperience.com | password123 | empresa |
| maria@gmail.com | password123 | usuario |

---

## API Endpoints

| Módulo | Endpoints | Auth |
|--------|-----------|------|
| Auth | POST /register, /login, /refresh, /register-business | No |
| Users | GET /me, PUT /me, GET /:id | JWT |
| Admin | GET /users, /reviews, /dashboard, /businesses, /settings | Admin |
| Empresa | GET/PUT /place, /reviews, /analytics, /dashboard | Empresa |
| Places | CRUD, /featured, /:id/photos | No/Admin |
| Categories | CRUD, /:slug | No/Admin |
| Reviews | CRUD, /approve, /respond | JWT/Admin |
| Favorites | GET, POST, DELETE | JWT |
| Map | /nearby, /cluster, /bounds | No |
| Search | /, /suggestions, /history | No/JWT |
| Events | CRUD, /today | No/Admin |
| Promotions | CRUD, /active | Empresa/Admin |
| Notifications | GET, /unread/count, /:id/read, /read-all | JWT |
| Weather | /current, /forecast | No |
| Health | /health | No |

**Documentación Swagger:** http://localhost:3000/docs

---

## Web Routes

```
/                           → Landing Page (pública)
/business/login             → Login empresas
/business/register          → Auto-registro empresas
/business/*                 → Portal Business (dashboard, lugar, fotos, reseñas, promos)
/admin-panel/login          → Login admin (URL secreta)
/admin-panel/*              → Panel Admin (dashboard, empresas, lugares, usuarios, etc.)
/legal/privacy              → Política de privacidad
/legal/terms                → Términos de servicio
```

---

## Variables de Entorno

```bash
# Database
DB_PROVIDER=sqlite|postgresql
DATABASE_URL="file:./dev.db" | "postgresql://..."

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=15m
REFRESH_TOKEN_EXPIRATION=7d

# App
PORT=3000
NODE_ENV=development|production
CORS_ORIGIN=http://localhost:5173

# Google Cloud Storage (opcional)
GCS_BUCKET=your-bucket-name

# APIs (opcional)
GOOGLE_MAPS_API_KEY=your-key
OPENWEATHER_API_KEY=your-key
```

---

## Testing

```bash
# API unit tests
cd api && npm test           # 95 tests

# API E2E tests
cd api && npx jest --config jest-e2e.json  # 29 tests

# Web tests
cd web && npm test           # 71 tests

# Total: 195 tests
```

---

## Documentación

| Tipo | Ubicación |
|------|-----------|
| Business docs | `docs/business/` (9 archivos) |
| Architecture | `docs/architecture/` (8 archivos, 36 ADRs) |
| Design | `docs/design/` (10 archivos, 25 wireframes) |
| Database | `docs/database/` (8 archivos) |
| Handoff | `handoff.md` (sesión actual) |
| API Docs | Swagger en `/docs` |

---

## Decisiones Clave (ADRs)

- **Flutter** sobre React Native (ADR-201)
- **NestJS** sobre Express (ADR-203)
- **PostgreSQL + PostGIS** (ADR-204)
- **Prisma 5** sobre Prisma 7 (ADR-205)
- **JWT auth** sobre Firebase Auth (ADR-206)
- **Cloud Run** sobre Compute Engine (ADR-221)
- **RESTful** sobre GraphQL (ADR-224)
- **Turistas nacionales** como segmento prioritario (ADR-003)
- **Sin pagos en MVP** (ADR-002)

---

## License

Por definir.

---

**Última actualización:** 2026-07-18
