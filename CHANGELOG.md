# Changelog

All notable changes to BoliviaExperience will be documented in this file.

## [1.0.0] - 2026-07-18

### Added

#### Security
- CORS restriction via `CORS_ORIGIN` environment variable
- JWT secret validation (server refuses default secret in production)
- Rate limiting with `@nestjs/throttler` (100 req/min in production)
- Refresh tokens with database storage and rotation
- Promotions ownership validation (empresa can only manage own places)

#### Backend API
- Notifications module (CRUD + unread count)
- Settings persistence (Admin GET/PUT endpoints)
- Health endpoint (`GET /health`)
- File upload with Multer + Google Cloud Storage support
- 14 modules, 55+ endpoints

#### Web Frontend
- Landing page (12 sections, framer-motion, i18n ES/EN)
- Admin panel (10 pages: Dashboard, Businesses, Users, Places, Reviews, Events, Promotions, Categories, Settings)
- Business portal (6 pages: Dashboard, Place, Reviews, Promotions, Stats, Photos)
- Dark mode with persistence
- Toast notifications (sonner)
- Lazy loading for all routes
- Error boundary with retry
- 71 tests (Vitest + React Testing Library)

#### Flutter App
- 9 feature modules (auth, home, map, search, favorites, profile, places, events, reviews)
- 13 screens with clean architecture
- Riverpod state management
- GoRouter navigation
- Material 3 themes (light/dark)

#### DevOps
- API Dockerfile (multi-stage build)
- Web Dockerfile (build + Nginx)
- Docker Compose (db + api + web + nginx)
- Nginx reverse proxy with rate limiting
- GitHub Actions CI (lint, typecheck, test, build, security audit)
- GitHub Actions CD (build → GCR → Cloud Run)
- GCP Cloud Build configuration

#### Testing
- 95 API unit tests (Jest)
- 29 API E2E tests (auth, security, performance)
- 71 web tests (Vitest)
- 195 total tests passing

#### Documentation
- 38 documentation files (business, architecture, design, database)
- 36 Architecture Decision Records (ADRs)
- Swagger/OpenAPI documentation
- README with quick start guide
- CHANGELOG

### Fixed
- 17 bugs fixed (pagination, filtering, validation, dark mode, class-transformer)
- CORS wide open → restricted to configured origins
- JWT secret hardcoded → validated on startup
- No rate limiting → throttler configured
- Promotions missing ownership validation
- Refresh tokens not verified server-side
- Firebase dependencies in Flutter without backend support

### Changed
- Admin panel visual unification (rounded-2xl, primary-700 color)
- Business panel visual unification
- Landing page complete rewrite (section-based architecture)
- Portal separation (Admin at `/admin-panel`, Business at `/business`)

---

## [0.1.0] - 2026-06-27

### Added
- Initial project setup
- Prisma schema with 13 models
- Basic NestJS modules (auth, places, categories, reviews, events, promotions)
- Flutter app structure with 9 feature modules
- React web panels (admin + business)
- Docker Compose for PostgreSQL
