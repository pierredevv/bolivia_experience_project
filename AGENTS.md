# AGENTS.md

Multi-platform tourism app for Santa Cruz, Bolivia. Three codebases in one repo.

## Structure

```
bolivia_experience_project/
├── app/          # Flutter mobile (Dart) — tourists
├── api/          # NestJS backend (TypeScript)
├── web/          # React admin + empresa panels (Vite + TypeScript)
├── docs/         # Business, architecture, design, database docs
└── docker-compose.yml
```

## Dev Commands

### API (NestJS) — `api/`

```bash
cd api
npm install
npx prisma generate
npx prisma db push            # sync schema to DB
npx prisma db seed            # seed admin user + categories
npm run start:dev             # localhost:3000, Swagger at /docs
npm run build                 # tsc + nest build
npm run lint                  # eslint --fix
npx tsc --noEmit              # typecheck (must be 0 errors)
npm test                      # jest unit tests
```

### Web (React) — `web/`

```bash
cd web
npm install
npm run dev                   # localhost:5173, proxies /api → localhost:3000
npm run build                 # tsc && vite build
npm run lint                  # eslint, max-warnings 0
```

### Flutter — `app/`

```bash
cd app
flutter pub get
flutter analyze               # uses flutter_lints
flutter test
flutter run
```

### Database

```bash
docker compose up -d          # PostgreSQL on port 5433 (NOT 5432)
```

DB credentials: `postgres:postgres@localhost:5433/bolivia_experience`

## Gotchas

- **PostgreSQL runs on port 5433**, not the default 5432. The docker-compose maps 5433→5432.
- **Prisma 5.x only.** Prisma 7 broke schema `url` field and PrismaClient constructor. Do not upgrade.
- **Geospatial queries use Haversine via `$queryRaw`**, not PostGIS functions. PostGIS extension is not active in the current schema. See `api/src/modules/places/repositories/geo.repository.ts`.
- **Firebase is lazy-initialized.** It crashes with placeholder credentials. The `FirebaseService` only inits when an endpoint needs it. Don't call Firebase methods at module load time.
- **API path aliases**: `@/*` → `src/*`, `@common/*`, `@config/*`, `@modules/*`, `@prisma/*`. Configured in `api/tsconfig.json`.
- **Web proxy**: Vite dev server proxies `/api` to `http://localhost:3000`. The API client (`web/src/services/api.ts`) uses `baseURL: '/api/v1'`.
- **API global prefix**: All routes are under `/api/v1` (set in `main.ts`).
- **Flutter uses Riverpod** for state, **GoRouter** for navigation, **Dio** for HTTP, **Hive** for local storage.
- **Web uses React Query** (@tanstack/react-query) for server state, **React Hook Form + Zod** for forms, **Radix UI** for components, **Tailwind** for styling.
- **Tailwind dark mode** uses `class` strategy, not `media`.
- **Flutter i18n**: Default locale is `es_BO`. Supported: es, en, pt.
- **Roles**: `admin`, `empresa`, `usuario` — enforced via `RolesGuard` + `@Roles()` decorator.
- **Swagger docs** available at `http://localhost:3000/docs` when API is running.

## Key Files

| What | Where |
|------|-------|
| API entry point | `api/src/main.ts` |
| Prisma schema (13 models) | `api/prisma/schema.prisma` |
| DB seed | `api/prisma/seed.ts` |
| Geo queries (Haversine) | `api/src/modules/places/repositories/geo.repository.ts` |
| Firebase lazy init | `api/src/firebase/firebase.service.ts` |
| Auth guards | `api/src/common/guards/` |
| Flutter entry | `app/lib/main.dart` |
| Flutter router | `app/lib/config/router.dart` |
| Flutter theme | `app/lib/config/theme.dart` |
| React entry | `web/src/main.tsx` |
| React router | `web/src/App.tsx` |
| API client (web) | `web/src/services/api.ts` |
| Architecture docs | `docs/architecture/` |
| API endpoint spec | `docs/architecture/2.6-arquitectura-api.md` |
| Data model docs | `docs/architecture/2.5-arquitectura-datos.md` |
| All ADRs | `docs/architecture/2.1-ads-stack-tecnologico.md` |
| Handoff / status | `handoff.md` |

## Current Status

Entregables 1-7 complete (docs, DB, backend, Flutter, React). Next: Entregable 8 (DevOps). API is stable with 0 TS errors, DB seeded, Swagger functional.
