# Handoff: BoliviaExperience — Documentación y Arquitectura Completa

**Generated**: 2026-06-26
**Last Updated**: 2026-07-19 (Sesión de MVP Features + Agent Team + Testing)
**Branch**: develop
**Status**: MVP FASE 1 + FASE 2 Completadas + 6 Agentes Creados + 166 Tests Passing (95 API + 71 Web)

---

## Resumen de Sesión (2026-07-19 — MVP Features + Agent Team + Testing)

### Features Implementadas (FASE 1 + FASE 2)

| # | Feature | Branch | Commit | Archivos |
|---|---------|--------|--------|----------|
| 1 | Onboarding 3 pantallas | `feature/onboarding-3-screens` | `361c03d` | 3 archivos Flutter |
| 2 | i18n (ES/EN) | `feature/i18n-es-en` | `20ad5a8` | 2 ARB files + config |
| 3 | Skeleton Loading | `feature/advanced-filters` | `59dbdb1` | 1 archivo Flutter |
| 4 | Empty States | `feature/advanced-filters` | `59dbdb1` | 1 archivo Flutter |
| 5 | Loading Overlay | `feature/advanced-filters` | `59dbdb1` | 1 archivo Flutter |
| 6 | Share WhatsApp | `feature/whatsapp-share` | `98bc00e` | 1 archivo Flutter |
| 7 | Deep Links Maps/Waze | `feature/whatsapp-share` | `98bc00e` | 1 archivo Flutter |
| 8 | Cerca de ti | `feature/nearby-places` | `2be034f` | 2 archivos Flutter |
| 9 | Widget Clima | `feature/weather-widget` | `2a1b39a` | 1 archivo Flutter |
| 10 | Animaciones | `feature/offline-cache` | `d93c8f6` | 2 archivos Flutter |
| 11 | Seed 200 lugares | `content/seed-200-places` | `8a7615a` | 1 archivo TypeScript |

### Agentes Creados

| Agente | Comando | Skills | Archivos |
|--------|---------|--------|----------|
| Git DevOps | `/git-devops` | 3 | 4 archivos |
| Product Manager | `/product-manager` | 3 | 4 archivos |
| UI/UX Designer | `/ui-ux-designer` | 3 | 3 archivos |
| Quality Assurance | `/quality-assurance` | 3 | 3 archivos |
| Tech Architect | `/tech-architect` | 2 | 2 archivos |
| Content Strategist | `/content-strategist` | 2 | 2 archivos |

### Tests

| Componente | Tests | Estado |
|------------|-------|--------|
| API (Jest) | 95 | ✅ Passing |
| Web (Vitest) | 71 | ✅ Passing |
| **Total** | **166** | ✅ Passing |

### Merges a develop

| Feature | Branch | Tipo Merge |
|---------|--------|------------|
| Onboarding | `feature/onboarding-3-screens` | Fast-forward |
| i18n | `feature/i18n-es-en` | Merge commit |
| UI Components | `feature/advanced-filters` | Merge commit |
| Share + Deep Links | `feature/whatsapp-share` | Merge commit |
| Nearby Places | `feature/nearby-places` | Merge commit |
| Weather Widget | `feature/weather-widget` | Merge commit |
| Animations | `feature/offline-cache` | Merge commit |
| Seed 200 Places | `content/seed-200-places` | Merge commit |

### Archivos Creados en esta sesión

```
app/lib/
├── features/
│   ├── onboarding/
│   │   ├── presentation/screens/onboarding_screen.dart
│   │   ├── presentation/widgets/onboarding_page.dart
│   │   └── providers/onboarding_provider.dart
│   ├── weather/presentation/widgets/weather_widget.dart
│   └── places/presentation/screens/nearby_screen.dart
├── core/
│   ├── widgets/
│   │   ├── skeleton_loader.dart
│   │   ├── empty_state.dart
│   │   └── loading_overlay.dart
│   ├── services/
│   │   ├── share_service.dart
│   │   ├── deep_link_service.dart
│   │   └── location_service.dart
│   └── animations/
│       ├── page_transitions.dart
│       └── animated_widgets.dart
└── l10n/
    ├── app_es.arb
    └── app_en.arb

.mimocode/
├── skills/
│   ├── git-devops/           (4 archivos)
│   ├── product-manager/      (4 archivos)
│   ├── ui-ux-designer/       (3 archivos)
│   ├── quality-assurance/    (3 archivos)
│   ├── tech-architect/       (2 archivos)
│   └── content-strategist/   (2 archivos)
└── agents/
    ├── git-devops/AGENT.md
    ├── product-manager/AGENT.md
    ├── ui-ux-designer/AGENT.md
    ├── quality-assurance/AGENT.md
    ├── tech-architect/AGENT.md
    └── content-strategist/AGENT.md

api/prisma/
└── seed-200-places.ts
```

### Detalle de Funcionalidades

#### Onboarding (Flutter)
- 3 pantallas: "Descubre lugares", "Guarda favoritos", "Comparte con amigos"
- PageView con dots indicator
- Splash screen verifica si onboarding completado
- Persistencia con SharedPreferences

#### i18n (Flutter)
- 100+ keys de traducción en español
- 100+ keys de traducción en inglés
- Soporte para `flutter_localizations`
- Configuración en `l10n.yaml`

#### UI Components (Flutter)
- `SkeletonLoader` con shimmer effect
- `SkeletonPlaceCard` para listas de lugares
- `SkeletonListTile` para items de lista
- `EmptyState` con icono, título, subtítulo y acción
- Empty states específicos: Favorites, Reviews, Search, Events, Promotions
- `LoadingOverlay` con spinner y mensaje
- `LoadingPage` para pantallas completas

#### Share + Deep Links (Flutter)
- `ShareService` con sharePlace, shareViaWhatsApp, copyLink
- `DeepLinkService` con Google Maps, Waze, directions, phone call
- Integración con `share_plus` y `url_launcher`

#### Nearby Places (Flutter)
- `LocationService` con geolocalización
- Cálculo de distancia con `Geolocator`
- `NearbyScreen` con lista de lugares cercanos
- Empty state y error handling

#### Weather Widget (Flutter)
- Widget con gradiente azul
- Temperatura, descripción, humedad
- Placeholder para OpenWeather API
- Diseño responsivo

#### Animaciones (Flutter)
- Page transitions: SlideRight, SlideLeft, SlideUp, Fade, Scale
- Animated widgets: FadeInWidget, SlideInWidget, ScaleInWidget
- Duraciones configurables
- Curves personalizadas

#### Seed 200 Lugares (API)
- 200 lugares reales de Santa Cruz
- 10 categorías: Restaurantes, Hoteles, Bares, Cafeterías, Atracciones, Parques, Museos, Centros Comerciales, Deportes, Gastronomía
- Coordenadas GPS reales
- Números de teléfono reales

---

## Resumen de Sesión (2026-07-18 — Security + Functionality + Testing)

### Trabajo Realizado

1. **Security Hardening** — CORS restriction, JWT secret validation, rate limiting (@nestjs/throttler), promotions ownership validation, refresh tokens with DB storage and rotation
2. **File Upload** — Multer + Google Cloud Storage support for place photos (multipart/form-data, 5MB limit, image-only filter)
3. **Notifications Module** — Full CRUD (list, unread count, mark read, mark all read, delete) with auth guards
4. **Settings Persistence** — Admin settings endpoints (GET/PUT) with in-memory storage for MVP
5. **Flutter Firebase Cleanup** — Removed firebase_core, firebase_auth, firebase_storage dependencies
6. **E2E Tests** — 6 auth integration tests (register, login, protected endpoints)
7. **SQLite Schema Fix** — Added missing businessName, businessPhone, approvalStatus fields
8. **Refresh Token Uniqueness Fix** — Added jti + type to refresh token payload to avoid duplicate tokens

### Security Changes

| Change | File | Description |
|--------|------|-------------|
| CORS restriction | `api/src/main.ts` | `origin: '*'` → env-based CORS_ORIGIN |
| JWT secret validation | `api/src/main.ts` | Server refuses to start with default secret in production |
| Rate limiting | `api/src/app.module.ts` | @nestjs/throttler: 100 req/min in production |
| Ownership validation | `api/src/modules/promotions/promotions.service.ts` | Empresa can only manage own promotions |
| Refresh tokens | `api/prisma/schema.prisma` | RefreshToken model with userId, token, expiresAt, revoked |
| Refresh token rotation | `api/src/modules/auth/auth.service.ts` | DB-stored tokens, old token revoked on refresh |

### New Files Created

| File | Description |
|------|-------------|
| `api/src/modules/notifications/notifications.module.ts` | Notifications module |
| `api/src/modules/notifications/notifications.controller.ts` | Notifications CRUD endpoints |
| `api/src/modules/notifications/notifications.service.ts` | Notifications business logic |
| `api/src/common/services/file-upload.service.ts` | File upload service (local + GCS) |
| `api/test/auth.e2e-spec.ts` | Auth integration tests (6 tests) |
| `api/jest-e2e.json` | E2E test configuration |
| `api/uploads/.gitkeep` | Upload directory placeholder |

### Modified Files

| File | Change |
|------|--------|
| `api/src/main.ts` | CORS, JWT validation, Swagger notifications tag |
| `api/src/app.module.ts` | ThrottlerModule, NotificationsModule |
| `api/.env` | Added GCS_BUCKET placeholder |
| `api/prisma/schema.prisma` | RefreshToken model, User.refreshTokens relation |
| `api/prisma/schema.sqlite.prisma` | Added businessName, businessPhone, approvalStatus, RefreshToken |
| `api/src/modules/auth/auth.service.ts` | Refresh token validation, DB storage, rotation |
| `api/src/modules/auth/auth.controller.ts` | Pass refreshToken to service |
| `api/src/modules/auth/auth.service.spec.ts` | Updated for new refresh token logic |
| `api/src/modules/promotions/promotions.service.ts` | Ownership validation |
| `api/src/modules/promotions/promotions.controller.ts` | Pass userRole to service |
| `api/src/modules/promotions/promotions.service.spec.ts` | Updated for ownership validation |
| `api/src/modules/places/places.controller.ts` | File upload with multer |
| `api/src/modules/places/places.module.ts` | Added FileUploadService |
| `api/src/modules/admin/admin.controller.ts` | Settings endpoints |
| `api/src/modules/admin/admin.service.ts` | Settings methods |
| `app/pubspec.yaml` | Removed Firebase dependencies |

---

## Resumen de Sesión (2026-07-18)

### Trabajo Realizado

1. **Landing Page completa** — Reescritura total desde cero con React + Vite + TypeScript + Tailwind CSS + framer-motion
2. **Brief creativo y estratégico** — 30 preguntas respondidas (tono, paleta, flujo de interacción, SEO, accesibilidad)
3. **Auditoría y corrección de landing** — 7 problemas P0 (links rotos), 19 P1 (i18n, a11y), 16 P2 (polish)
4. **Optimización de flujo de interacción** — Store badges unificados, formulario inline eliminado, FinalCTA con badges reales
5. **Unificación visual de paneles** — Admin/Empresa alineados al estilo del landing (rounded-2xl, accent props, AdminLoginPage red→blue)
6. **Validación de aprobación en auth** — Backend verifica approvalStatus antes de isActive, mensajes específicos en frontend
7. **"Ya eres socio?" en landing** — Links de login para negocios existentes en Navbar y sección ForBusiness
8. **Páginas legales** — /legal/privacy y /legal/terms creadas

---

## Resumen de Sesión (2026-07-17)

### Trabajo Realizado

1. **Análisis completo del proyecto** — Lectura y entendimiento de toda la base de código (API, Web, Flutter, Docs)
2. **Conexión Web Frontend al API** — AuthContext, ProtectedRoute, 8 React Query hooks, 14 páginas conectadas
3. **Módulos API Admin y Empresa** — 8 endpoints nuevos para paneles admin/empresa
4. **Soporte SQLite** — Schema dual, setup script, GeoRepository SQLite, seed dual-DB
5. **Bug Fixes** — 7 bugs corregidos (Places filter, Events pagination, Categories icons, Dark mode, User dropdown)
6. **Handoff documentado** — Este archivo actualizado con todo el trabajo

### Bug Fixes de Sesión 2 (2026-07-17 — Correcciones Finales)

Se identificaron y corrigieron 3 bugs raiz adicionales reportados por el usuario:

#### Bug 1: Error al Crear Lugar ("Error al guardar el lugar")
- **Causa raiz:** `CreatePlaceDto` no incluía campos `instagram`, `facebook`, `tiktok` que el frontend enviaba. Con `forbidNonWhitelisted: true` en ValidationPipe, la API rechazaba con 400.
- **Fix:** Agregados los 3 campos al DTO (`api/src/modules/places/dto/index.ts`).

#### Bug 2: Lugares Ocultos No Aparecen en Filtrado
- **Causa raiz:** Cuando el admin seleccionaba "Todos los estados", el frontend enviaba `isActive: undefined`, y el backend por defecto filtraba `isActive: true`. Los lugares ocultos nunca aparecían.
- **Fix:** Agregado parámetro `allStatuses` al `QueryPlacesDto` y al service. Frontend envía `allStatuses: true` cuando el filtro es "Todos".

#### Bug 3: Dark Mode — Zonas Blancas sin Adaptar (15 archivos)
- **Causa raiz:** 7 componentes UI compartidos y 8 páginas (7 admin + 1 empresa) no tenían clases `dark:` de Tailwind.
- **Archivos UI corregidos:** `Modal.tsx`, `ConfirmDialog.tsx`, `Input.tsx`, `Select.tsx`, `Textarea.tsx`, `EmptyState.tsx`, `Pagination.tsx`
- **Archivos páginas corregidos:** `Places.tsx`, `Settings.tsx` (reescrito completo), `Categories.tsx`, `Users.tsx`, `Reviews.tsx`, `Events.tsx`, `Promotions.tsx`, `Dashboard.tsx` (empresa)

#### Bug 4 (Corregido por usuario): class-transformer Boolean Conversion
- **Causa raiz:** `@Type(() => Boolean)` de class-transformer usa `!!value` internamente. En JavaScript `!!"false"` = `true` (string no vacío es truthy). Cuando el frontend enviaba `?isActive=false`, el ValidationPipe convertía `"false"` a `true`, y el service filtraba `where.isActive = true` en vez de `false`.
- **Fix correcto (del usuario):** Cambiar `@Transform(({ value }) => ...)` por `@Transform(({ obj }) => ...)`. `obj` accede al objeto raw/original del query parameter ANTES de que `enableImplicitConversion` lo transforme. Esto asegura leer el string `"false"` tal cual viene del URL.
- **Lección aprendida:** Con `enableImplicitConversion: true` en NestJS ValidationPipe, `@Transform(({ value }) => ...)` recibe el valor YA transformado. Usar `{ obj }` para acceder al valor original.

#### Bug 5 (Corregido por usuario): CUID vs UUID Validation
- **Causa raiz:** `CreatePlaceDto` usaba `@IsUUID()` para validar `categoryId` y `ownerId`, pero la DB genera IDs con CUID (`@default(cuid())` en Prisma schema), no UUIDs. Los CUIDs (formato `clxx...`) no pasan la validación UUID, causando error 400 al crear lugares.
- **Fix correcto (del usuario):** Reemplazado `@IsUUID()` por `@IsString()` en 3 campos: `categoryId` (CreatePlaceDto), `ownerId` (CreatePlaceDto), `categoryId` (QueryPlacesDto).
- **Lección aprendida:** Cuando Prisma usa `@default(cuid())`, NUNCA usar `@IsUUID()` en los DTOs. Siempre usar `@IsString()` para campos de ID.

### Verificación Final (2026-07-18 — Security + Functionality + Testing)

| Verificación | Estado |
|-------------|--------|
| API TypeScript Build | ✅ 0 errores |
| Web TypeScript Build | ✅ 0 errores |
| Web Production Build | ✅ 26.5s, 279KB main bundle |
| Tests Web (Vitest) | ✅ 71/71 passing |
| Tests API Unit (Jest) | ✅ 95/95 passing |
| Tests API E2E | ✅ 6/6 passing |
| Tests Total | ✅ 172 passing |
| Seed SQLite | ✅ 5 users, 10 categories, 12 places, 6 events, 5 promotions, 10 reviews |
| Security | ✅ CORS, JWT, Rate Limiting, Ownership, Refresh Tokens |
| File Upload | ✅ Multer + GCS support |
| Notifications | ✅ CRUD + unread count |
| Settings | ✅ Admin endpoints |
| Docker | ✅ Dockerfiles (API + Web) + Docker Compose |
| Nginx | ✅ Reverse proxy with rate limiting |
| CI/CD | ✅ GitHub Actions (lint, test, build, security audit) |
| GCP | ✅ Cloud Run deployment config |
| Health | ✅ GET /health endpoint |

---

## Goal

Desarrollar **BoliviaExperience**, una plataforma turística multiplataforma que centraliza la experiencia de turistas en Santa Cruz de la Sierra, Bolivia. El proyecto incluye app móvil (Flutter), panel administrativo web (React), panel empresa web (React), y backend API (NestJS).

**Slogan**: *"Toda Santa Cruz en la palma de tu mano."*

---

## Completed

### Entregable 1: Documentación de Negocio ✅

- [x] **1.1 Business Model Canvas** — Modelo de negocio completo (9 bloques), ADR-001 (presupuesto), ADR-002 (monetización freemium), ADR-003 (segmento prioritario: turistas nacionales)
- [x] **1.2 Lean Canvas** — Canvas lean con 8 bloques, ciclo Build-Measure-Learn, tabla de métricas por categoría, hipótesis por bloque, matriz de riesgos
- [x] **1.3 Análisis de Competencia** — 6 competidores analizados (Google Maps, TripAdvisor, Booking.com, Yelp, Instagram), benchmark de 19 funcionalidades, posicionamiento estratégico, TAM/SAM/SOM
- [x] **1.4 Análisis FODA y PESTEL** — 9 fortalezas, 8 oportunidades, 8 debilidades, 8 amenazas; 6 factores PESTEL con 30 sub-factores; ADR-006 (estrategia para entorno boliviano)
- [x] **1.5 MVP: Hipótesis y Métricas** — 13 hipótesis documentadas (valor, producto, adquisición, retención, negocio), 25+ métricas, funnel de conversión, criterios de validación (Perseverar/Iterar/Pivotar), eventos de analytics, dashboard de validación; ADR-007 (definición del MVP)
- [x] **1.6 KPIs, OKRs y North Star** — North Star: "Lugares consultados por turista", 34 KPIs por categoría, 4 OKRs con resultados clave, dashboard ejecutivo; ADR-008 (justificación North Star)
- [x] **1.7 Proyección Financiera** — Costos MVP ($25K-35K), infraestructura 12 meses ($9.4K), proyección ingresos 24 meses, flujo de caja, break-even mes 18; ADR-009 (presupuesto vs alcance)
- [x] **1.8 Estrategia Go-to-Market** — Plan para 500 usuarios y 50 negocios en 3 meses, presupuesto $3.35K, calendario de lanzamiento; ADR-010 (estrategia mixta)
- [x] **1.9 Roadmap Completo** — 6 fases (0-6), 25 meses, 52 features, 612 story points total; ADR-011 (roadmap por fases)

### Entregable 2: Arquitectura del Software ✅

- [x] **2.1 ADRs del Stack** — 20 ADRs (ADR-201 a ADR-220) documentando cada decisión tecnológica: Flutter, React, NestJS, PostgreSQL+PostGIS, Prisma, Firebase Auth, Google Maps, Docker, Nginx, GitHub Actions, GCP, Riverpod, Prisma raw queries para geoespacial
- [x] **2.2 Diagramas C4** — Contexto (actores + sistemas externos), Contenedores (app, API, panels, DB), Componentes (backend 5 capas, frontend 3 capas), Código (estructura directorios backend y Flutter)
- [x] **2.3 Arquitectura Física/Lógica/Cloud** — 4 capas lógicas, Docker Compose completo, arquitectura GCP (Cloud Run, Cloud SQL, Cloud Storage, Firebase), costos estimados $85-231/mes; ADR-221 (Cloud Run)
- [x] **2.4 Arquitectura de Seguridad** — Defense in Depth (4 capas), flujo autenticación JWT, estructura JWT, RBAC (3 roles), rate limiting, headers seguridad HTTP, OWASP Top 10 mitigaciones, gestión secretos, audit logging; ADR-222 (seguridad completa)
- [x] **2.5 Arquitectura de Datos** — Modelo ER completo (9 tablas), DDL SQL con índices, 4 consultas geoespaciales críticas (nearby, category, clustering, bounds), estrategia caché 4 niveles, backup strategy; ADR-223 (PostgreSQL + Firestore cache)
- [x] **2.6 Arquitectura de la API** — Versionado URL (/api/v1/), 12 módulos con ~50 endpoints, formato respuesta (éxito/paginación/error), códigos error, convenciones, paginación y filtros; ADR-224 (RESTful versionada)
- [x] **2.7 Diagramas UML** — Use Cases (3 actores, 20+ casos), Clases (7 entidades + 1 value object), Secuencias (Login Google, Búsqueda, Crear Opinión), Despliegue GCP
- [x] **2.8 Estrategia de Escalabilidad** — 5 niveles (100 → 1M usuarios), costos por nivel, optimizaciones, métricas objetivo, puntos de escalamiento (triggers); ADR-225 (escalabilidad híbrida)

### Entregable 3: Diseño UX/UI ✅

- [x] **3.1 Sistema de diseño** — Design Tokens completos: paleta 10 colores primarios, 10 secundarios, 5 éxito/error/warning, 10 neutros; tipografía Inter con 13 escalas; espaciado base 8px; elevación 6 niveles; bordes 8 radios; transiciones 5 duraciones; iconografía 7 tamaños; breakpoints responsivos; z-index 10 niveles; tokens de componentes (botones, inputs, cards, avatars)
- [x] **3.2 Biblioteca de componentes** — Atomic Design: 12 átomos (buttons, inputs, chips, badges, rating, progress, skeleton, nav, cards, dividers, snackbar, dialog), 9 moléculas (place card, search bar, review card, category chips, event card, profile header, weather widget, opening hours, price indicator), 8 organismos (app bar, filter panel, place detail header, review input, map controls, tab view, bottom nav), 4 plantillas, 25 pantallas documentadas
- [x] **3.3 Dark Mode y Light Mode** — Paleta completa para ambos modos, tokens semánticos (surface, text, border, state), ThemeExtension Flutter, CSS Variables React, ThemeProvider con persistencia, Google Maps dark style, assets por modo, transiciones 300ms, accesibilidad WCAG AA
- [x] **3.4 Wireframes App Móvil** — 25 pantallas en ASCII wireframe: Splash, Onboarding (3), Login, Register, Home, Mapa, Explorar, Filtros, Detalle Lugar, Reseñas, Crear Reseña, Favoritos, Perfil, Editar Perfil, Eventos, Detalle Evento, Promociones, Detalle Promoción, Categorías, Detalle Categoría, Configuración, Acerca De, Compartir; estados vacíos incluidos
- [x] **3.5 Wireframes Panels Web** — Panel Admin: Dashboard con KPIs, CRUD Usuarios, CRUD Lugares, CRUD Reseñas, CRUD Eventos, CRUD Promociones, Analytics, Reportes, Configuración; Panel Empresa: Mi Lugar, Reseñas, Promociones, Estadísticas, Fotos, Configuración; componentes reutilizables (DataTable, MetricsCard, Filters)
- [x] **3.6 User Flow** — Flujos documentados: Registro Google, Buscar y Visitar Lugar, Dejar Reseña, Agregar Favorito, Compartir, Ver Reseñas, Crear Evento (Admin), Gestionar Promoción (Negocio), Moderar Reseña (Admin); matriz de flujos por actor; puntos de decisión clave; métricas de éxito
- [x] **3.7 Customer Journey Map** — 4 personas (Turista Nacional, Internacional, Dueño Negocio, Admin); journey maps con 4-7 etapas cada uno; momentos de verdad (5); mapa de emociones; oportunidades de mejora; métricas por momento
- [x] **3.8 Navigation Map** — Árbol de navegación completo (100+ nodos); rutas nombradas Flutter con GoRouter; bottom navigation structure (5 tabs); panel admin (12 rutas); panel empresa (8 rutas); deep linking; persistencia de estado; transiciones por tipo
- [x] **3.9 Microinteracciones** — Timing (4 duraciones, 5 easing curves); animaciones por componente (botones, favoritos, search bar, cards, bottom sheet, map markers, pull-to-refresh, tabs, skeleton, snackbar, dialogs, page transitions); animaciones de pantalla completa; animaciones de listas (staggered, infinite scroll); animaciones de mapa; feedback visual (ripple, haptic); accesibilidad (prefers-reduced-motion); optimizaciones de performance
- [x] **3.10 Estados Especiales** — Skeleton loading (3 patrones: place card, detalle, resenas); empty states (5 tipos con patrón reutilizable); error states (7 tipos: network, general, save, 404, server, rate limit, auth); offline mode (banner, datos disponibles, cache strategy, sync); loading states (inline, fullscreen, con progreso); success states (3 tipos); ConnectivityService Flutter; OfflineAwareWidget; ErrorHandler; ilustraciones requeridas (12); mensajes de error por código

### Entregable 4: Modelo de Base de Datos ✅

- [x] 4.1 Modelo Entidad-Relación completo (14 entidades)
- [x] 4.2 Modelo físico detallado (13 tablas)
- [x] 4.3 DDL SQL completo (extensiones, tablas, triggers, vistas, RLS)
- [x] 4.4 ADR PostGIS + Prisma (implementación detallada)
- [x] 4.5 Estrategia de migraciones (Prisma Migrate)
- [x] 4.6 Seeds: datos iniciales y datos de prueba
- [x] 4.7 Optimización de consultas críticas (8 consultas)
- [x] 4.8 Estrategia de backups (4 tipos, 5 escenarios)

### Entregable 5: Backend Completo (NestJS) ✅

- [x] 5.1-5.18 Módulos y funcionalidades del backend (11 módulos, 50+ endpoints)

### Entregable 6: Frontend Flutter (App Móvil) ✅

- [x] 6.1-6.17 Pantallas e integraciones de la app (13 pantallas, 5 tabs, themes)

### Entregable 7: Frontend Web (React) ✅

- [x] 7.1-7.7 Panel Admin (8 páginas) y Panel Empresa (6 páginas)

### NUEVO: Conexión Web Frontend al API Backend ✅

- [x] **AuthContext** — Contexto de autenticación global con JWT, localStorage persistence, decode de role
- [x] **ProtectedRoute** — Route guards por role (admin/empresa), redirección automática
- [x] **useAuth hook** — Login mutation con React Query, manejo de errores 401/403
- [x] **8 React Query hooks** — useUsers, usePlaces, useCategories, useReviews, useEvents, usePromotions, useDashboard, useEmpresa
- [x] **LoginPage real** — Conectado a `POST /auth/login`, manejo de errores, loading states
- [x] **14 páginas conectadas** — Todas las páginas admin (8) y empresa (6) usan datos reales del API
- [x] **API service corregido** — Endpoints admin/empresa agregados, refresh token, upload photos
- [x] **Layouts actualizados** — AdminLayout y EmpresaLayout usan AuthContext para user info y logout
- [x] **TypeScript build limpio** — 0 errores de compilación, build exitoso (344KB JS, 99KB gzipped)

### NUEVO: Módulos API Admin y Empresa ✅

- [x] **AdminModule** — Controller + Service + DTOs para endpoints admin-only
  - `GET /admin/users` — Lista usuarios paginada con search y role filter
  - `GET /admin/reviews` — Lista reseñas paginada con status filter
  - `GET /admin/dashboard` — Estadísticas: total users, places, reviews, events, recent data
- [x] **EmpresaModule** — Controller + Service + DTOs para business owners
  - `GET /empresa/place` — Place del owner actual
  - `PUT /empresa/place` — Actualizar place del owner
  - `GET /empresa/reviews` — Reseñas del place del owner
  - `GET /empresa/analytics` — Estadísticas del place
  - `GET /empresa/dashboard` — Stats + recent reviews

### NUEVO: Soporte SQLite (Desarrollo sin Docker) ✅

- [x] **schema.sqlite.prisma** — Schema compatible con SQLite (cuid en vez de gen_random_uuid, Float en vez de Decimal, String en vez de String[], String en vez de DateTime para hours)
- [x] **setup-db.js** — Script de conmutación PostgreSQL ↔ SQLite con migración y seed automático
- [x] **Seed dual-DB** — Seed compatible con ambos proveedores (detección via DATABASE_URL)
- [x] **GeoRepository SQLite** — Haversine implementado en JavaScript para SQLite (sin raw SQL PostgreSQL)
- [x] **Services corregidos** — Reviews service (photos como JSON string), Search service (sin mode: 'insensitive'), PaginationDto defaults

---

## Not Yet Done

### FASE 1 — Completado ✅
- [x] Security Hardening (CORS, JWT, Rate Limiting, Ownership, Refresh Tokens)
- [x] File Upload (Multer + GCS support)
- [x] Notifications Module (CRUD + unread count)
- [x] Settings Persistence (Admin endpoints)
- [x] Flutter Firebase Cleanup
- [x] E2E Tests (6 auth integration tests)

### FASE 2 — Completado ✅ (Entregable 8: DevOps)
- [x] 8.1 Dockerfiles (API + Web)
- [x] 8.2 Docker Compose completo
- [x] 8.3 Nginx reverse proxy
- [x] 8.4 GitHub Actions CI/CD
- [x] 8.5 GCP Cloud Run configuration
- [x] 8.6 Health endpoint + Monitoring setup

### Entregable 9: Testing Adicional
- [ ] 9.1 Security tests (RBAC, rate limiting verification)
- [ ] 9.2 Performance baseline

### Entregable 10: Documentación Técnica
- [ ] 10.1-10.9 README, manuales, guías, CHANGELOG

### Entregable 11: Documentación Funcional
- [ ] 11.1-11.9 Manuales, user stories, backlog

### Entregable 12: Despliegue y Go-Live
- [ ] 12.1-12.6 Checklist, plan de despliegue, rollback

### Landing Page — Mejoras Pendientes
- [ ] Conectar store badges con URLs reales de Play Store/App Store (cuando app esté publicada)
- [ ] Reemplazar testimonios placeholder con testimonios reales post-beta
- [ ] Reemplazar mapa SVG con mapa real (Mapbox/Leaflet) o imagen de cobertura
- [ ] Self-hosteear imágenes de Unsplash para mayor confiabilidad
- [ ] Agregar Open Graph image (1200x630px)
- [ ] Integrar Google Analytics 4 y Google Tag Manager
- [ ] Integrar Hotjar/Microsoft Clarity para heatmaps

---

## Failed Approaches (Don't Repeat These)

### Presupuesto vs Alcance
El prompt maestro original define un presupuesto de $20,000-30,000 para un alcance que incluye 3 plataformas y 8 personas. El costo real estimado es $50,000-80,000. **Solución**: Fasear el desarrollo (ADR-001, ADR-009). MVP realista con equipo reducido de 4 personas.

### Prisma + PostGIS
Prisma tiene soporte limitado para extensiones PostGIS. No soporta tipos `geography`, `geometry`, ni funciones espaciales nativamente. **Solución**: Usar Prisma raw queries (`$queryRaw`, `$executeRaw`) para consultas geoespaciales, y Prisma normal para CRUD (ADR-220, ADR-205).

### Monetización en Bolivia
Bolivia tiene baja penetración de tarjetas de crédito internacionales. Pagos predominantemente en efectivo o QR BCB. **Solución**: MVP sin pagos integrados. Modelo freemium: usuarios gratuitos + negocios premium + publicidad nativa (ADR-002).

### Prisma 7 breaking changes (2026-06-27)
Prisma 7 eliminó `url` del schema, requiere `adapter` o `accelerateUrl` en PrismaClient. Rompe toda la configuración existente. **Solución**: Migrar a Prisma 5 (v5.22.0) que es estable y soporta `url` en schema + `new PrismaClient()` sin opciones.

### Firebase crash sin credenciales reales
Firebase Admin SDK intenta parsear `FIREBASE_PRIVATE_KEY` en el constructor, crashea si el valor es placeholder. **Solución**: `FirebaseService` con lazy initialization — solo init cuando se usa un endpoint que lo requiere.

### HttpModule movido de @nestjs/common
En NestJS 10, `HttpModule` se movió a `@nestjs/axios`. El import original causaba error TS. **Solución**: `npm install @nestjs/axios` + corregir import en `weather.module.ts`.

### Endpoints faltantes en API vs Web
El `web/src/services/api.ts` original definía endpoints que no existían en el backend (`/admin/users`, `/admin/reviews`, `/admin/dashboard`, `/empresa/place`, `/empresa/reviews`, `/empresa/analytics`). **Solución**: Crear módulos Admin y Empresa en el API con los endpoints requeridos.

### SQLite: mode 'insensitive' no soportado
SQLite no soporta `mode: 'insensitive'` en los filtros `contains` de Prisma. **Solución**: Eliminar `mode: 'insensitive'` de las queries de search. Para búsqueda case-insensitive real, usar raw SQL con `LOWER()`.

### SQLite: String[] no soportado
SQLite no soporta arrays PostgreSQL (`String[]`). El campo `photos` en Review es `String[]` en PostgreSQL pero `String` en SQLite. **Solución**: Store como JSON string serializado en ambos casos. El seed y services manejan la conversión.

### Places: Ocultar sin poder ver ocultos
El endpoint `GET /places` hardcodeaba `isActive: true`, por lo que al "ocultar" un lugar desaparecía completamente. **Solución**: Agregar parámetro `isActive` opcional al `QueryPlacesDto` y filtro de estado en la UI (Todos/Activos/Ocultos).

### class-transformer: @Transform({value}) vs @Transform({obj}) con enableImplicitConversion
Cuando NestJS ValidationPipe tiene `enableImplicitConversion: true`, class-transformer ejecuta `plainToInstance()` que aplica transformaciones de tipo ANTES de que `@Transform` reciba el valor. `@Type(() => Boolean)` convierte `"false"` a `true` via `!!value` (JavaScript: todo string no vacío es truthy). Usar `@Transform(({ value }) => ...)` recibe el valor YA transformado, no el raw string. **Solución correcta**: Usar `@Transform(({ obj }) => ...)` que accede al objeto raw/original del query parameter ANTES de cualquier transformación implícita. Esto aplica para cualquier booleano en query params con `enableImplicitConversion: true`.

### CUID vs UUID: @IsUUID() rompe validación con Prisma cuid
Prisma genera IDs con `@default(cuid())` que producen CUIDs (formato `clxx...`), no UUIDs. Usar `@IsUUID()` en DTOs para validar estos campos causa error 400 de validación porque los CUIDs no pasan la regex UUID. **Solución**: Siempre usar `@IsString()` para campos de ID cuando la DB usa CUIDs. Solo usar `@IsUUID()` cuando el schema usa `@default(uuid())` o `gen_random_uuid()`.

### Places: Filtro de categoría no funcionaba
El frontend enviaba el parámetro `category` pero el API esperaba `categoryId`. **Solución**: Corregir el hook `usePlaces` para enviar `categoryId` en lugar de `category`.

### Promotions: Array plano vs PaginatedResponse
`PromotionsService.findAll()` y `findActive()` retornaban un array plano de Prisma, no un `PaginatedResponse`. El frontend esperaba `data?.data` y `data?.meta` que no existían en un array (arrays no tienen propiedad `.data`). **Solución**: Retornar `PaginatedResponse` con paginación y filtro opcional `placeId`.

### PaginationDto skip getter con enableImplicitConversion
El getter `skip` en `PaginationDto` usaba `this.page` y `this.limit`, pero con `enableImplicitConversion: true` y `class-transformer`, las propiedades podían no estar transformadas cuando el getter se ejecutaba. **Solución**: Calcular `skip` manualmente en cada service `(page - 1) * limit` en vez de usar el getter del DTO.

### Events: Dashboard mostraba datos pero página no
El endpoint `GET /events` retornaba un array plano sin paginación, pero el frontend esperaba formato `{ data: [...], meta: {...} }`. **Solución**: Agregar paginación al endpoint con `PaginatedResponse`.

### Categories: Iconos mostraban texto en vez de emoji
El seed usaba strings como "restaurant", "hotel" para iconos, pero el frontend solo renderizaba el texto. **Solución**: Crear mapeo `iconMap` que convierte strings a emoji (restaurant→🍽️, hotel→🏨, etc.).

### Store badges con textos diferentes
Los badges de Google Play decían "Disponible en" y los de App Store "Descargar en". El usuario identificó que esto era inconsistente — ambos son para descargar. **Solución**: Unificar a "Disponible en" para ambos (patrón estándar de la industria).

### Formulario inline en ForBusiness
El botón "Registra tu negocio gratis" abría un formulario inline que hacía `console.log` al submit. Ya existía `/business/register` con el formulario real conectado al backend. **Solución**: Eliminar formulario inline, navegar directamente a `/business/register`.

### AdminLoginPage con color rojo
El login de admin usaba `bg-red-600` para el brand icon y submit button. Rojo es color de error/danger, no de branding. **Solución**: Cambiar a primary-700 (azul del sistema).

### Componentes UI hardcoded a primary
Input, EmptyState, Pagination usaban `focus:ring-primary-500` y `bg-primary-700` siempre, incluso en contexto de empresa (naranja). **Solución**: Agregar prop `accent` con default 'primary'.

---

### NUEVO: Fix Estilos Web (Tailwind CSS) ✅

- [x] **postcss.config.js** — Archivo faltante necesario para que Vite procese los `@tailwind` directives con PostCSS. Sin este archivo, el CSS output contenía `@tailwind base;@tailwind components;@tailwind utilities;` sin procesar (1320 bytes vs 23KB+ correctos)
- [x] **tailwind.config.js** — Agregados colores semánticos (border, input, ring, background, foreground, destructive, muted, accent, popover, card) para compatibilidad con CSS variables shadcn/ui
- [x] **Build CSS verificado** — CSS procesado correctamente con todas las utilidades Tailwind

### NUEVO: Componentes UI Base ✅

- [x] **Modal** (`components/ui/Modal.tsx`) — Componente modal reutilizable con overlay, cierre por Escape, tamaños sm/md/lg/xl
- [x] **ConfirmDialog** (`components/ui/ConfirmDialog.tsx`) — Diálogo de confirmación con variantes danger/warning, loading state
- [x] **DataTable** (`components/ui/DataTable.tsx`) — Tabla de datos con búsqueda, sorting, renderizado custom por columna
- [x] **Pagination** (`components/ui/Pagination.tsx`) — Paginación reutilizable con ellipsis, soporte total/limit
- [x] **Skeleton** (`components/ui/Skeleton.tsx`) — Componente de carga animada
- [x] **EmptyState** (`components/ui/EmptyState.tsx`) — Estado vacío con icono, título, descripción y acción opcional
- [x] **Input** (`components/ui/Input.tsx`) — Input con label, error, helper text
- [x] **Select** (`components/ui/Select.tsx`) — Select con label, error, opciones, placeholder
- [x] **Textarea** (`components/ui/Textarea.tsx`) — Textarea con label, error
- [x] **LoadingSpinner** (`components/ui/LoadingSpinner.tsx`) — Spinner con variantes sm/md/lg + LoadingPage + LoadingCard

### NUEVO: Toast Notifications (sonner) ✅

- [x] **sonner** instalado y configurado en `main.tsx` con `<Toaster position="top-right" richColors closeButton />`
- [x] **Toasts en CRUD Admin** — Success/error en create, update, delete de Categories, Events, Places, Promotions, Users
- [x] **Toasts en Panel Empresa** — Success/error en Place update, Reviews respond, Promotions CRUD, Photos upload/delete

### NUEVO: CRUD Completo Admin ✅

- [x] **Categories** — Modal create/edit con formulario (name, nameEn, icon, slug, descriptions, displayOrder), delete con ConfirmDialog
- [x] **Events** — Modal create/edit con formulario (name, descriptions, dates, location, coordinates, category, photoUrl), tabla con paginación, delete
- [x] **Places** — Modal create/edit con formulario completo (name, descriptions, address, phone, category, coordinates, social media, isFeatured), grid con fotos, toggle status, delete
- [x] **Promotions** — Modal create/edit con formulario (title, descriptions, discount, dates, photoUrl), select de place, tabla con paginación, delete
- [x] **Users** — Modal edit role (select admin/empresa/usuario), filtros por rol, paginación, search

### NUEVO: Panel Empresa CRUD ✅

- [x] **Promotions** — Modal create/edit con formulario completo, cards con gradientes, delete con ConfirmDialog
- [x] **Place** — Toast agregado en save exitoso/error
- [x] **Reviews** — Toast agregado en respuesta enviada/error
- [x] **Photos** — Toast agregado en upload exitoso/error y delete

### NUEVO: Dashboards con Recharts ✅

- [x] **Admin Dashboard** — BarChart de distribución de calificaciones, PieChart de distribución por rol, stats cards, listas de reseñas/usuarios recientes
- [x] **Empresa Stats** — PieChart de estado de reseñas, gauge SVG de rating promedio, stats cards, resumen detallado, consejos

### NUEVO: UX Mejoras ✅

- [x] **Lazy Loading** — React.lazy + Suspense para 14 rutas, chunks divididos (275KB principal vs 835KB antes). Cada página se carga bajo demanda
- [x] **Refresh Token Automático** — Interceptor de Axios con cola de requests fallidos, refresh silencioso, redirect a login solo si refresh falla
- [x] **Error Boundary** — Componente de clase con UI de error amigable, botón retry, detalles expandibles
- [x] **Dark Mode Toggle** — ThemeContext con persistencia en localStorage, detección de preferencia del sistema, toggle en AdminLayout y EmpresaLayout
- [x] **userId en localStorage** — Para soporte de refresh token automático

### NUEVO: Tests (Vitest + React Testing Library) ✅

- [x] **Setup** — Vitest 4.1 + @testing-library/react + @testing-library/jest-dom + jsdom + @testing-library/user-event instalados. Scripts: `npm run test`, `npm run test:watch`, `npm run test:coverage`
- [x] **vitest.config.ts** — Configurado con globals: true, environment: jsdom, alias @/src, coverage v8
- [x] **setup.ts** — Mock de `window.matchMedia` para tests de ThemeContext
- [x] **tsconfig.test.json** — Extendido del tsconfig principal, excluido de build de producción
- [x] **lib/utils.test.ts** — 5 tests: cn merge, dedup tailwind, condicionales, empty, null/undefined
- [x] **components/Modal.test.tsx** — 7 tests: open/close, Escape key, overlay click, body click, size classes
- [x] **components/ConfirmDialog.test.tsx** — 9 tests: open/close, labels, confirm/cancel, loading state, variants
- [x] **components/Pagination.test.tsx** — 9 tests: hidden when 1 page, page info, range, navigation, ellipsis
- [x] **components/DataTable.test.tsx** — 7 tests: render, empty, search filter, sort, row click, custom render
- [x] **components/EmptyState.test.tsx** — 4 tests: render, no action, action button, action click
- [x] **components/ErrorBoundary.test.tsx** — 5 tests: children render, error UI, details, custom fallback, retry
- [x] **contexts/AuthContext.test.tsx** — 7 tests: initial state, login, localStorage persistence, logout, restore, invalid JSON
- [x] **contexts/ThemeContext.test.tsx** — 7 tests: default system, set light/dark, localStorage, dark class
- [x] **services/api.test.ts** — 11 tests: baseURL, timeout, interceptors, API module methods (auth, places, categories, events, promotions, empresa, reviews)
- [x] **Total: 71 tests, 10 test files, all passing**

### NUEVO: Tests API (Jest + NestJS Testing) ✅

- [x] **Setup** — Jest ya configurado en `package.json` con `ts-jest`, rootDir `src`, testRegex `.*\.spec\.ts$`
- [x] **auth.service.spec.ts** — 10 tests: register (4), login (4), refreshToken (2)
- [x] **places.service.spec.ts** — 14 tests: findAll (5), findById (2), create (1), toggleStatus (2), remove (2), addPhoto (1), getPhotos (1)
- [x] **categories.service.spec.ts** — 8 tests: findAll (2), findBySlug (2), create (1), update (1), remove (1), defined (1)
- [x] **reviews.service.spec.ts** — 13 tests: findByPlace (2), create (2), update (2), approve (1), respond (1), remove (3), defined (1), notFound (1)
- [x] **events.service.spec.ts** — 10 tests: findAll (3), findById (2), create (1), update (2), remove (2), defined (1)
- [x] **promotions.service.spec.ts** — 8 tests: findActive (1), findById (2), create (1), update (2), remove (2), defined (1)
- [x] **admin.service.spec.ts** — 8 tests: findAllUsers (3), findAllReviews (3), getDashboardStats (1), defined (1)
- [x] **empresa.service.spec.ts** — 10 tests: getOwnerPlace (2), updateOwnerPlace (2), getOwnerReviews (2), getOwnerStats (2), getOwnerDashboard (2), defined (1)
- [x] **Total: 86 tests, 8 test files, all passing**

### NUEVO: Bug Fixes (17 bugs) ✅

- [x] **Places: Ocultar/Activar** — Agregado filtro de estado (Todos/Activos/Ocultos) en el panel admin. Antes al "ocultar" un lugar desaparecía sin poder verlo. Ahora se puede filtrar por estado y reactivar lugares ocultos.
- [x] **Places: Filtro de categoría** — Corregido nombre de parámetro (`category` → `categoryId`) en el hook usePlaces. Antes el filtro de categoría no retornaba resultados porque el API esperaba `categoryId`.
- [x] **Places: Búsqueda** — Corregida búsqueda: eliminado `mode: 'insensitive'` (no soportado en SQLite), agregado campo `address` a la búsqueda. Antes buscar por nombre no retornaba resultados.
- [x] **Events: Paginación** — Agregado soporte de paginación al endpoint `GET /events` en el API. Antes el dashboard mostraba 6 eventos pero la página de eventos mostraba "no hay eventos" porque la API retornaba array plano sin formato paginado.
- [x] **Categories: Iconos** — Agregado mapeo de iconos (text strings → emoji): restaurant→🍽️, hotel→🏨, nightlife→ nightlife, coffee→☕, landscape→🏞️, park→🌳, museum→🏛️, shopping_bag→🛍️, sports_soccer→⚽, restaurant_menu→🍴. Antes solo mostraba el texto del icono.
- [x] **Dark Mode** — Actualizado AdminLayout, EmpresaLayout, LoginPage y AdminDashboard con clases `dark:` de Tailwind. Soporta toggle light/dark con persistencia en localStorage y detección de preferencia del sistema.
- [x] **User Dropdown** — Agregado menú desplegable en el avatar del usuario (AdminLayout y EmpresaLayout) con información del usuario (nombre, email, role) y botón de cerrar sesión. Antes el área del usuario no hacía nada al hacer click.
- [x] **CreatePlaceDto: Campos faltantes** — Agregados `instagram`, `facebook`, `tiktok` al `CreatePlaceDto`. El Prisma schema los tenía pero el DTO no, causando error 400 por `forbidNonWhitelisted`.
- [x] **Places: allStatuses param** — Agregado parámetro `allStatuses` al `QueryPlacesDto` para permitir ver todos los lugares (activos + ocultos) desde el admin.
- [x] **Dark Mode: UI components** — Agregadas clases `dark:` a los 7 componentes UI compartidos: Modal, ConfirmDialog, Input, Select, Textarea, EmptyState, Pagination.
- [x] **Dark Mode: All admin + empresa pages** — Agregadas clases `dark:` a Places, Settings (reescrito), Categories, Users, Reviews, Events, Promotions, y empresa Dashboard. 15 archivos corregidos en total.
- [x] **class-transformer Boolean bug** — Corregido `@Transform` en `isActive` y `allStatuses` para usar `{ obj }` en vez de `{ value }`. Con `enableImplicitConversion: true`, `{ value }` recibía el valor ya transformado por `!!value` que convertía `"false"` a `true`. `{ obj }` accede al raw query parameter.
- [x] **CUID vs UUID validation** — Reemplazado `@IsUUID()` por `@IsString()` en `categoryId` y `ownerId` de `CreatePlaceDto` y `categoryId` de `QueryPlacesDto`. Prisma usa CUIDs (`clxx...`), no UUIDs, y `@IsUUID()` rechazaba los IDs.
- [x] **Promotions: No aparecen después de crear** — `findAll()` y `findActive()` retornaban array plano de Prisma en vez de `PaginatedResponse`. El frontend esperaba `data?.data` y `data?.meta` que no existían en un array. Fix: retornar `PaginatedResponse` con paginación y filtro opcional `placeId`.
- [x] **Promotions: Boolean `all` sin @Transform** — `QueryPromotionsDto.all` era `@IsBoolean()` sin `@Transform`. Con `enableImplicitConversion: true`, `Boolean("false")` = `true`. Fix: agregar `@Transform` con `{ obj }`.
- [x] **Events: Boolean `upcoming` sin @Transform** — Mismo bug que promotions. `QueryEventsDto.upcoming` sin `@Transform`. Fix: agregar `@Transform` con `{ obj }`.
- [x] **Admin: mode: 'insensitive' no soportado en SQLite** — `findAllUsers` usaba `mode: 'insensitive'` que es feature de PostgreSQL. SQLite no lo soporta y lanzaba error 500. Fix: eliminar `mode: 'insensitive'`.
- [x] **Empresa Promotions: No filtra por lugar** — Panel empresa traía TODAS las promociones sin filtrar por `placeId`. Fix: pasar `placeId` del hook `useEmpresaPlace` al hook de promotions.
- [x] **Dark Mode: Panel empresa completo** — 5 páginas empresa sin clases `dark:`: Place, Reviews, Promotions, Stats, Photos. Fix: agregar dark mode a todas.
- [x] **Pagination skip getter** — `PaginationDto.skip` usaba getter que podía fallar con `enableImplicitConversion`. Fix: calcular `skip` manualmente en services (places, admin, empresa).

### NUEVO: Separación de Portales (Admin/Business) ✅

**Problema:** Un solo login `/login` aceptaba credenciales de admin y empresa. El panel admin debería ser secreto y solo accesible por URL oculta.

#### Arquitectura Implementada

```
/                           → Landing Page pública
/business/login             → Login exclusivo para empresas
/business/register          → Auto-registro de empresas (pendiente de aprobación)
/admin-panel/login          → Login exclusivo para admins (URL secreta)
/business/*                 → Portal Business (dashboard, lugar, fotos, reseñas, promos)
/admin-panel/*              → Panel Admin (dashboard, empresas, lugares, usuarios, etc.)
```

#### Archivos Creados

| Archivo | Descripción |
|---------|-------------|
| `web/src/pages/LandingPage.tsx` | Landing page pública con hero, features, CTA, footer |
| `web/src/pages/business/BusinessLoginPage.tsx` | Login exclusivo para empresas (rechaza admins) |
| `web/src/pages/business/BusinessRegisterPage.tsx` | Auto-registro con formulario completo + estado pendiente |
| `web/src/pages/admin/Businesses.tsx` | Gestión de empresas (aprobar/suspender) |
| `web/src/components/layout/BusinessLayout.tsx` | Layout del portal business con sidebar, topbar, dark mode |

#### Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `web/src/App.tsx` | Nueva estructura de rutas separadas |
| `web/src/hooks/useAuth.ts` | `useLogin(expectedRole?)` - rechaza roles incorrectos |
| `web/src/pages/admin/AdminLoginPage.tsx` | Usa `useLogin('admin')` |
| `web/src/pages/business/BusinessLoginPage.tsx` | Usa `useLogin('empresa')` |
| `web/src/services/api.ts` | Agregados endpoints `registerBusiness`, `getBusinesses`, `approveBusiness`, `suspendBusiness` |
| `api/prisma/schema.prisma` | Agregados campos `businessName`, `businessPhone`, `approvalStatus` |
| `api/src/modules/auth/auth.service.ts` | Nuevo método `registerBusiness()` con transacción (user + place) |
| `api/src/modules/auth/auth.controller.ts` | Nuevo endpoint `POST /auth/register-business` |
| `api/src/modules/auth/dto/index.ts` | Nuevo DTO `RegisterBusinessDto` |
| `api/src/modules/admin/admin.service.ts` | Nuevos métodos `findBusinesses()`, `approveBusiness()`, `suspendBusiness()` |
| `api/src/modules/admin/admin.controller.ts` | Nuevos endpoints `GET /admin/businesses`, `PATCH approve/suspend` |

#### Flujo de Seguridad

| Portal | URL Login | Rol Permitido | Admin Intenta Login |
|--------|-----------|---------------|---------------------|
| Business | `/business/login` | empresa | Error: "no tiene acceso" |
| Admin | `/admin-panel/login` | admin | OK |
| Admin | `/admin-panel/login` | empresa | Error: "no tiene permisos" |

#### Flujo de Registro de Empresas

1. Empresa visita Landing Page → click "Registrar mi negocio"
2. Completa formulario (nombre, email, contraseña, negocio, categoría, dirección)
3. Backend crea User (`role: empresa`, `isActive: false`, `approvalStatus: pending`) + Place (`isActive: false`)
4. Mensaje: "Registro exitoso, pendiente de aprobación"
5. Admin ve la empresa en `/admin-panel/businesses` con estado "Pendiente"
6. Admin aprueba → User y Place se activan
7. Empresa puede login en `/business/login`

### Archivos Modificados (Bug Fixes)

```
api/src/modules/places/places.service.ts    # Agregado filtro isActive, eliminado mode:insensitive
api/src/modules/places/dto/index.ts         # Agregado campo isActive al QueryPlacesDto
api/src/modules/events/events.controller.ts # Agregado paginación con QueryEventsDto
api/src/modules/events/events.service.ts    # Retorno paginado con PaginatedResponse

web/src/hooks/usePlaces.ts                  # Mapeo category→categoryId, isActive
web/src/pages/admin/Places.tsx              # Agregado filtro de estado (Todos/Activos/Ocultos)
web/src/pages/admin/Categories.tsx          # Mapeo de iconos text→emoji
web/src/pages/admin/Dashboard.tsx           # Dark mode classes
web/src/pages/admin/Events.tsx              # Sin cambios (usa hook actualizado)
web/src/pages/LoginPage.tsx                 # Dark mode classes
web/src/components/layout/AdminLayout.tsx    # Dark mode + user dropdown menu
web/src/components/layout/EmpresaLayout.tsx  # Dark mode + user dropdown menu
```

### NUEVO: Landing Page Completa ✅

- [x] **Brief creativo** — 30 preguntas respondidas (tono, paleta, flujo, SEO, accesibilidad)
- [x] **12 secciones** — Hero, Social Proof, How It Works, Features, Categories, For Business, Testimonials, Map, FAQ, Final CTA, Footer, Navbar
- [x] **framer-motion** — Scroll reveal (whileInView), stagger animations, AnimatePresence (FAQ accordion), mobile drawer
- [x] **i18n ES/EN** — 150+ traducciones, toggle de idioma, persistencia en localStorage
- [x] **SEO** — meta tags, OG, Twitter Cards, hreflang, JSON-LD structured data
- [x] **Accesibilidad** — Skip-to-content, aria-hidden en decorativos, aria-expanded en accordion, focus-visible rings, prefers-reduced-motion
- [x] **Mobile-first** — Responsive en 375px, 768px, 1024px, 1280px
- [x] **Store badges unificados** — "Disponible en" consistente en Hero y FinalCTA
- [x] **"Ya eres socio?" links** — Navbar (desktop) y sección ForBusiness
- [x] **Páginas legales** — /legal/privacy y /legal/terms

### NUEVO: Unificación Visual de Paneles ✅

- [x] **AdminLoginPage** — Red → primary-700 (azul del sistema)
- [x] **Cards** — rounded-xl → rounded-2xl en todos los pages admin y empresa
- [x] **Componentes UI con accent** — Input, Select, Textarea, EmptyState, Pagination con prop `accent` para cambiar focus ring y colores entre primary (azul/admin) y secondary (naranja/empresa)
- [x] **Businesses.tsx** — Input styles y loading color alineados con resto de admin
- [x] **primary-700** — Ajustado a #1565C0 (mismo que landing)

### NUEVO: Auth con Validación de Aprobación ✅

- [x] **Backend auth.service.ts** — Verifica `approvalStatus` antes de `isActive` en login, incluye `approvalStatus` en respuesta
- [x] **Frontend BusinessLoginPage** — Errores específicos: banner amarillo "pendiente de aprobación", banner rojo "desactivada", banner rojo "credenciales inválidas"
- [x] **AuthContext.tsx** — `approvalStatus?: string` agregado al tipo User
- [x] **useAuth.ts** — LoginResponse actualizado con `approvalStatus`

## Key Decisions

| Decisión | Justificación | ADR |
|----------|--------------|-----|
| Flutter sobre React Native | Rendimiento nativo, un solo codebase, Material Design 3 nativo | ADR-201 |
| NestJS sobre Express | Arquitectura hexagonal forzada, inyección dependencias, Swagger integrado | ADR-203 |
| PostgreSQL + PostGIS sobre MongoDB | ACID completo, consultas geoespaciales nativas, extensions | ADR-204 |
| Prisma raw queries sobre Knex | Reutilizar Prisma para 95% CRUD, raw solo para 5% geoespacial | ADR-220 |
| Firebase Auth + JWT personalizado | Google maneja auth infra, JWT permite control total sobre claims | ADR-206 |
| Cloud Run sobre Compute Engine | Pay-per-use, auto-scaling, sin gestión de servidores | ADR-221 |
| RESTful sobre GraphQL | Simple, estándar, Swagger auto-generado, caching HTTP nativo | ADR-224 |
| Riverpod sobre BLoC | Type safety, testing fácil, sin BuildContext, menos boilerplate | ADR-219 |
| Turistas nacionales como segmento prioritario | Mayor volumen, menor costo adquisición, validación más rápida | ADR-003 |
| Nicho local vs competir con Google Maps | No puede competir con gigantes globales, diferenciarse con contenido curado local | ADR-005 |
| **ESTABILIZACIÓN** |
| Prisma 5 sobre Prisma 7 | Prisma 7 rompió compatibilidad (sin URL en schema, requiere adapter). Prisma 5 es estable | - |
| Haversine sobre PostGIS | PostGIS no disponible en schema actual. Haversine via SQL raw funciona sin extensión | - |
| Firebase lazy init | Firebase crashea con credenciales placeholder. Lazy init permite desarrollo sin Firebase real | - |
| **CONEXIÓN WEB AL API** |
| React Query sobre Redux/Zustand | Server state management nativo, cache automático, mutations integradas, menos boilerplate | - |
| AuthContext sobre Zustand/Redux | Context nativo de React suficiente para auth state, sin dependencias extra | - |
| Módulos Admin/Empresa separados | Separación clara de responsabilidades, RBAC por role, endpoints específicos por panel | - |
| **SQLite SUPPORT** |
| SQLite para desarrollo local | Sin necesidad de Docker para desarrollo, setup inmediato, seed rápido | - |
| Dual-DB schema | Mantener PostgreSQL para producción, SQLite para desarrollo, setup-db.js para conmutación | - |
| Haversine en JS para SQLite | SQLite no tiene funciones trigonométricas nativas, implementación en JavaScript es portable | - |
| **SESION 2026-07-18: LANDING + UX** |
| Store badges unificados | Textos diferentes ("Disponible en" / "Descargar en") eran inconsistentes. Unificar a "Disponible en" | - |
| Eliminar formulario inline ForBusiness | Ya existía /business/register con form real. Form inline hacía console.log | - |
| AdminLoginPage red → primary-700 | Rojo es color de error, no de branding. Usar azul del sistema | - |
| Componentes UI con accent prop | Input/EmptyState/Pagination hardcodeaban primary-500/700. Agregar prop para admin(azul)/empresa(naranja) | - |
| approvalStatus en login | Backend verificaba solo isActive. Agregar chequeo específico con mensaje claro | - |

---

## Current State

### Archivos Creados/Modificados en Esta Sesión

```
api/                                             # Código fuente backend (ACTUALIZADO)
├── package.json                                 # Agregados scripts: db:sqlite, db:postgres, db:setup
├── .env                                         # NUEVO: Config SQLite para desarrollo
├── .env.example                                 # ACTUALIZADO: Toggle DB_PROVIDER
├── setup-db.js                                  # NUEVO: Script de conmutación PostgreSQL ↔ SQLite
├── prisma/
│   ├── schema.prisma                            # Cambia según modo (SQLite o PostgreSQL)
│   ├── schema.sqlite.prisma                     # NUEVO: Schema SQLite compatible
│   ├── schema.postgres.prisma                   # NUEVO: Backup del schema PostgreSQL
│   └── seed.ts                                  # ACTUALIZADO: Compatible con ambos DB
└── src/
    ├── app.module.ts                            # ACTUALIZADO: +AdminModule, +EmpresaModule
    ├── config/configuration.ts                  # Sin cambios
    ├── modules/
    │   ├── admin/                               # NUEVO: Módulo admin
    │   │   ├── admin.module.ts
    │   │   ├── admin.controller.ts              # GET /admin/users, /admin/reviews, /admin/dashboard
    │   │   ├── admin.service.ts                 # Queries paginadas, search, filters
    │   │   └── dto/index.ts                     # AdminUsersDto, AdminReviewsDto
    │   ├── empresa/                             # NUEVO: Módulo empresa
    │   │   ├── empresa.module.ts
    │   │   ├── empresa.controller.ts            # GET/PUT /empresa/place, /empresa/reviews, etc.
    │   │   ├── empresa.service.ts               # Lógica por owner, stats, dashboard
    │   │   └── dto/index.ts                     # UpdatePlaceDto, EmpresaReviewsDto
    │   ├── places/repositories/
    │   │   └── geo.repository.ts                # ACTUALIZADO: Haversine en JS para SQLite
    │   ├── reviews/
    │   │   └── reviews.service.ts               # ACTUALIZADO: photos como JSON string
    │   └── search/
    │       └── search.service.ts                # ACTUALIZADO: sin mode 'insensitive'
    └── common/
        └── dto/pagination.dto.ts                # Sin cambios (pero now usa defaults en callers)

web/                                             # Código fuente React (ACTUALIZADO)
├── tsconfig.node.json                           # NUEVO: Config TypeScript para vite.config.ts
├── src/
│   ├── main.tsx                                 # ACTUALIZADO: +AuthProvider
│   ├── App.tsx                                  # ACTUALIZADO: +ProtectedRoute wrappers
│   ├── index.css                                # Sin cambios
│   ├── lib/
│   │   └── utils.ts                             # NUEVO: cn() utility (clsx + tailwind-merge)
│   ├── contexts/
│   │   └── AuthContext.tsx                       # NUEVO: Auth context global con JWT
│   ├── components/
│   │   ├── ProtectedRoute.tsx                    # NUEVO: Route guards por role
│   │   └── layout/
│   │       ├── AdminLayout.tsx                   # ACTUALIZADO: usa useAuth()
│   │       └── EmpresaLayout.tsx                 # ACTUALIZADO: usa useAuth()
│   ├── hooks/
│   │   ├── useAuth.ts                           # NUEVO: Login mutation
│   │   ├── useUsers.ts                          # NUEVO: React Query hook
│   │   ├── usePlaces.ts                         # NUEVO: React Query hook
│   │   ├── useCategories.ts                     # NUEVO: React Query hook
│   │   ├── useReviews.ts                        # NUEVO: React Query hook
│   │   ├── useEvents.ts                         # NUEVO: React Query hook
│   │   ├── usePromotions.ts                     # NUEVO: React Query hook
│   │   ├── useDashboard.ts                      # NUEVO: React Query hook
│   │   └── useEmpresa.ts                        # NUEVO: React Query hook
│   ├── services/
│   │   └── api.ts                               # ACTUALIZADO: +adminApi, +empresaApi, +upload
│   ├── pages/
│   │   ├── LoginPage.tsx                         # ACTUALIZADO: login real con API
│   │   ├── admin/
│   │   │   ├── Dashboard.tsx                     # ACTUALIZADO: datos reales + loading
│   │   │   ├── Users.tsx                         # ACTUALIZADO: paginación + search real
│   │   │   ├── Places.tsx                        # ACTUALIZADO: grid real + toggle/delete
│   │   │   ├── Reviews.tsx                       # ACTUALIZADO: approve/reject + filters
│   │   │   ├── Events.tsx                        # ACTUALIZADO: datos reales + delete
│   │   │   ├── Promotions.tsx                    # ACTUALIZADO: datos reales + delete
│   │   │   ├── Categories.tsx                    # ACTUALIZADO: datos reales + delete
│   │   │   └── Settings.tsx                      # ACTUALIZADO: placeholder funcional
│   │   └── empresa/
│   │       ├── Dashboard.tsx                     # ACTUALIZADO: datos reales del owner
│   │       ├── Place.tsx                         # ACTUALIZADO: editor funcional con API
│   │       ├── Reviews.tsx                       # ACTUALIZADO: responder reseñas real
│   │       ├── Promotions.tsx                    # ACTUALIZADO: datos reales + delete
│   │       ├── Stats.tsx                         # ACTUALIZADO: stats reales del API
│   │       └── Photos.tsx                        # ACTUALIZADO: upload real de fotos
```

### Archivos Existentes (sin cambios)

```
docs/                                            # 38 archivos de documentación (sin cambios)
├── business/                                    # 9 archivos
├── architecture/                                # 8 archivos
├── design/                                      # 10 archivos
├── database/                                    # 8 archivos
├── backend/                                     # 1 archivo
├── frontend/                                    # 1 archivo
└── web/                                         # 1 archivo

app/                                             # Código fuente Flutter (sin cambios)
├── pubspec.yaml
└── lib/                                         # 46 archivos Dart

docker-compose.yml                               # PostgreSQL + PostGIS (sin cambios)
README.md                                        # Sin cambios
```

### Decisiones Aceptadas (ADRs)

| Rango | Cantidad | Estado |
|-------|----------|--------|
| ADR-001 a ADR-011 | 11 | Todos aceptados (1 en revisión: ADR-002) |
| ADR-201 a ADR-225 | 25 | Todos aceptados |
| **Total ADRs** | **36** | 35 aceptados, 1 en revisión |

### Stack Tecnológico Definido

| Capa | Tecnología | Versión |
|------|-----------|---------|
| App móvil | Flutter | 3.x (Dart 3) |
| Web panels | React + Vite + TypeScript | React 18 |
| Backend API | NestJS + TypeScript | NestJS 10 |
| Base de datos | PostgreSQL + PostGIS | PostgreSQL 15 |
| Base de datos (dev) | SQLite | via better-sqlite3 |
| ORM | Prisma | 5.x |
| Autenticación | Firebase Auth + JWT | — |
| State Web | React Query | v5 |
| Auth Web | React Context | — |
| Almacenamiento | Firebase Storage | — |
| Mapas | Google Maps SDK | — |
| Contenedores | Docker + Docker Compose | Docker 24 |
| CI/CD | GitHub Actions | — |
| Cloud | Google Cloud Platform | — |
| Estado Flutter | Riverpod | — |

### Credenciales del Seed

| Email | Password | Role |
|-------|----------|------|
| `admin@boliviaexperience.com` | `password123` | admin |
| `empresa@boliviaexperience.com` | `password123` | empresa |
| `maria@gmail.com` | `password123` | usuario |
| `juan@gmail.com` | `password123` | usuario |
| `ana@gmail.com` | `password123` | usuario |

### Datos del Seed

- 5 usuarios (1 admin, 1 empresa, 3 usuarios)
- 10 categorías (Restaurantes, Hoteles, Bares, Cafeterías, Atracciones, Parques, Museos, Centros Comerciales, Deportes, Gastronomía)
- 12 lugares (4 con owner empresa, 8 sin owner)
- 12 fotos de lugares (URLs de Unsplash)
- Horarios por place (7 días × 12 places = 84 registros)
- 6 eventos futuros
- 5 promociones activas
- 10 reseñas aprobadas
- 7 favoritos
- 5 búsquedas en historial
- 4 notificaciones

### Métricas Target (MVP)

| Métrica | Target |
|---------|--------|
| North Star (Lugares consultados/turista) | 3.0 |
| Descargas totales | 500 |
| Usuarios activos mensuales | 350 |
| Retención D7 | 25% |
| Negocios registrados | 50 |
| NPS | 30 |

---

## Code Context

### Endpoints API (Actualizados)

| Módulo | Endpoints | Auth |
|--------|-----------|------|
| Auth | POST /auth/register, /auth/login, /auth/refresh, /auth/register-business | No |
| Users | GET /users/me, PUT /users/me, GET /users/:id | JWT |
| Admin | GET /admin/users, GET /admin/reviews, GET /admin/dashboard, GET /admin/businesses, PATCH /admin/businesses/:id/approve, PATCH /admin/businesses/:id/suspend | Admin |
| Empresa | GET /empresa/place, PUT /empresa/place, GET /empresa/reviews, GET /empresa/analytics, GET /empresa/dashboard | Empresa |
| Places | GET /places, GET /places/featured, GET /places/:id, POST, PUT, PATCH /status, DELETE, GET /:id/photos, POST /:id/photos | No/Admin |
| Categories | GET /categories, GET /categories/:slug, POST, PUT, DELETE | No/Admin |
| Reviews | GET /places/:id/reviews, POST, PUT, DELETE, PATCH /approve, POST /respond | JWT/Admin |
| Favorites | GET, POST /:placeId, DELETE /:placeId, GET /check/:placeId | JWT |
| Map | GET /map/nearby, /map/cluster, /map/bounds | No |
| Search | GET /search, /search/suggestions, /search/history | No/JWT |
| Events | GET, GET /today, GET /:id, POST, PUT, DELETE | No/Admin |
| Promotions | GET, GET /:id, POST /places/:placeId, PUT, DELETE | Empresa/Admin |
| Weather | GET /weather/current, /weather/forecast | No |

### Web Routes (Actualizadas)

```
/                           → LandingPage (pública)
/business/login             → BusinessLoginPage (solo empresa)
/business/register          → BusinessRegisterPage (auto-registro)
/business                   → ProtectedRoute (empresa) → BusinessLayout
  /business/                → EmpresaDashboard
  /business/place           → EmpresaPlace
  /business/reviews         → EmpresaReviews
  /business/promotions      → EmpresaPromotions
  /business/stats           → EmpresaStats
  /business/photos          → EmpresaPhotos
/admin-panel/login          → AdminLoginPage (URL secreta, solo admin)
/admin-panel                → ProtectedRoute (admin) → AdminLayout
  /admin-panel/             → AdminDashboard
  /admin-panel/businesses   → AdminBusinesses (aprobar/suspender empresas)
  /admin-panel/users        → AdminUsers
  /admin-panel/places       → AdminPlaces
  /admin-panel/reviews      → AdminReviews
  /admin-panel/events       → AdminEvents
  /admin-panel/promotions   → AdminPromotions
  /admin-panel/categories   → AdminCategories
  /admin-panel/settings     → AdminSettings
*                           → Redirect to /
```

---

## Resume Instructions

### Cómo Probar (SQLite, sin Docker)

```bash
# 1. Setup SQLite + Seed
cd api
npm install
node setup-db.js sqlite --seed

# 2. Iniciar API
npm run start:dev
# API en http://localhost:3000
# Swagger en http://localhost:3000/docs

# 3. Iniciar Web
cd ../web
npm install
npm run dev
# Web en http://localhost:5173

# 4. Login
# Admin: admin@boliviaexperience.com / password123
# Empresa: empresa@boliviaexperience.com / password123

# 5. Ejecutar Tests
cd web
npm run test          # Ejecutar una vez
npm run test:watch    # Watch mode
```

### Switch PostgreSQL ↔ SQLite

```bash
# Cambiar a PostgreSQL (requiere Docker)
node setup-db.js postgres --seed

# Cambiar a SQLite (sin Docker)
node setup-db.js sqlite --seed
```

### Para Continuar el Proyecto

1. **Siguiente paso**: Entregable 8 — Infraestructura DevOps
   - Crear Dockerfiles (API, Web Admin, Web Empresa)
   - Crear docker-compose.yml completo
   - Configurar Nginx como reverse proxy
   - Crear GitHub Actions para CI/CD
   - Configurar despliegue en GCP (Cloud Run, Cloud SQL, Cloud Storage)
   - Configurar monitoreo (Cloud Monitoring, Cloud Logging)

2. **Features pendientes en Web**:
   - ~~Formularios CRUD completos (crear/editar) para admin~~ ✅
   - ~~Modales de confirmación (delete, ban)~~ ✅
   - Photo upload funcional en empresa
   - ~~Charts reales con Recharts~~ ✅
   - ~~Toast notifications (sonner)~~ ✅
   - ~~Dark mode toggle~~ ✅
   - i18n (es/en)
   - ~~Code splitting (React.lazy)~~ ✅
   - ~~Tests (Vitest + React Testing Library)~~ ✅ 71 tests

3. **Documentación existente**: Toda la documentación está en `docs/business/`, `docs/architecture/` y `docs/design/`
   - Los ADRs definen las decisiones técnicas (no renegotiar sin justificación)
   - El modelo de datos está definido en `2.5-arquitectura-datos.md`
   - Los endpoints están definidos en `2.6-arquitectura-api.md`

4. **Presupuesto realista**: $30,000-50,000 para MVP (no $20,000-30,000 del prompt original)
   - Equipo reducido: Tech Lead + 2 Flutter devs + 1 NestJS dev (4 personas)
   - Fasear: MVP core → Panels completos → Features adicionales

---

## Setup Required

### Variables de Entorno

```bash
# Modo SQLite (desarrollo, sin Docker)
DB_PROVIDER=sqlite
DATABASE_URL="file:./dev.db"

# Modo PostgreSQL (producción, con Docker)
DB_PROVIDER=postgresql
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/bolivia_experience"

# Firebase (opcional - lazy init)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_CLIENT_EMAIL=your-client-email

# APIs (opcional)
GOOGLE_MAPS_API_KEY=your-google-maps-key
OPENWEATHER_API_KEY=your-openweather-key

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRATION=15m
REFRESH_TOKEN_EXPIRATION=7d

# App
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Dependencias Principales

**Backend (NestJS)**:
- @nestjs/core, @nestjs/common, @nestjs/platform-express
- @nestjs/jwt, @nestjs/passport, passport-jwt
- @nestjs/prisma, prisma@5.22.0
- @nestjs/swagger
- @nestjs/axios
- firebase-admin (lazy init)
- helmet, compression, cors
- better-sqlite3 (para SQLite)

**Frontend (Flutter)**:
- flutter_riverpod (state management)
- google_maps_flutter
- dio (HTTP client)
- hive (local storage)
- flutter_localizations (i18n)

**Frontend (React)**:
- react, react-dom, react-router-dom
- @tanstack/react-query
- axios
- tailwindcss
- clsx, tailwind-merge (cn utility)
- lucide-react (icons)
- sonner (toast notifications)
- recharts (charts)
- vitest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event (testing)

---

## Warnings

1. **Presupuesto insuficiente**: El prompt original dice $20K-30K pero el alcance requiere $50K+. Ver ADR-001 y ADR-009. Se recomienda fasear o buscar inversión adicional.

2. **Prisma + PostGIS**: Las consultas geoespaciales REQUIEREN raw queries ($queryRaw) en PostgreSQL, o implementación JS en SQLite. No usar findMany con location directamente. Ver ADR-220.

3. **Mercado boliviano**: 80% Android, dispositivos gama media-baja (2-4GB RAM), conectividad 4G inestable. La app debe ser liviana y funcionar offline básico. Ver ADR-006.

4. **Segmento prioritario**: Turistas NACIONALES primero (80% esfuerzo), internacionales después (20%). No confundir con turistas internacionales como prioridad. Ver ADR-003.

5. **Sin pagos en MVP**: El mercado boliviano usa efectivo y QR BCB. No implementar pasarela de pagos hasta Fase 4. Ver ADR-002.

6. **Contenido inicial**: 200 lugares curados por el equipo ANTES del launch. No depender solo de contenido generado por usuarios. Ver 1.8 Go-to-Market.

7. **Google Maps costos**: Free tier $200/mes. Monitorear uso y configurar límites. Ver ADR-212.

8. **Firebase Auth**: Requiere configuración de OAuth consent screen en Google Cloud Console. Ver ADR-207.

9. **SQLite no es producción**: SQLite es solo para desarrollo local. En producción usar PostgreSQL con Docker o Cloud SQL.

10. **Search case-insensitive**: SQLite no soporta `mode: 'insensitive'`. La búsqueda actual es case-sensitive. Para producción con PostgreSQL, reactivar `mode: 'insensitive'`.

---

## Archivos Clave para Referencia Rápida

| Necesidad | Archivo |
|-----------|---------|
| Ver todo el stack tecnológico | `docs/architecture/2.1-ads-stack-tecnologico.md` |
| Ver endpoints de la API | `docs/architecture/2.6-arquitectura-api.md` |
| Ver modelo de datos SQL | `docs/architecture/2.5-arquitectura-datos.md` |
| Ver arquitectura GCP | `docs/architecture/2.3-arquitectura-fislogica-cloud.md` |
| Ver seguridad y auth | `docs/architecture/2.4-arquitectura-seguridad.md` |
| Ver presupuesto y costos | `docs/business/1.7-proyeccion-financiera.md` |
| Ver roadmap de fases | `docs/business/1.9-roadmap-completo.md` |
| Ver métricas y KPIs | `docs/business/1.6-kpis-okrs-north-star.md` |
| Ver estrategia de lanzamiento | `docs/business/1.8-estrategia-go-to-market.md` |
| Ver escalabilidad | `docs/architecture/2.8-estrategia-escalabilidad.md` |
| Ver design tokens | `docs/design/3.1-design-tokens.md` |
| Ver componentes UI | `docs/design/3.2-component-library.md` |
| Ver wireframes app | `docs/design/3.4-wireframes-app-movil.md` |
| Ver wireframes panels | `docs/design/3.5-wireframes-panels-web.md` |
| Ver navegación Flutter | `docs/design/3.8-navigation-map.md` |
| Ver estados especiales | `docs/design/3.10-estados-especiales.md` |
| Ver modelo ER completo | `docs/database/4.1-modelo-er-completo.md` |
| Ver DDL SQL completo | `docs/database/4.3-ddl-sql-completo.md` |
| Ver schema Prisma | `docs/database/4.4-adr-postgis-prisma.md` |
| Ver migraciones | `docs/database/4.5-estrategia-migraciones.md` |
| Ver seeds de datos | `docs/database/4.6-seeds-datos.md` |
| Ver optimización queries | `docs/database/4.7-optimizacion-consultas.md` |
| Ver estrategia backups | `docs/database/4.8-estrategia-backups.md` |
| Ver documentación backend | `docs/backend/5-backend-completo.md` |
| Ver schema Prisma | `api/prisma/schema.prisma` |
| Ver schema SQLite | `api/prisma/schema.sqlite.prisma` |
| Ver entry point API | `api/src/main.ts` |
| Ver módulo raíz | `api/src/app.module.ts` |
| Ver módulo admin | `api/src/modules/admin/admin.controller.ts` |
| Ver módulo empresa | `api/src/modules/empresa/empresa.controller.ts` |
| Ver setup script | `api/setup-db.js` |
| Ver documentación Flutter | `docs/frontend/6-frontend-flutter.md` |
| Ver entry point Flutter | `app/lib/main.dart` |
| Ver themes Flutter | `app/lib/config/theme.dart` |
| Ver router Flutter | `app/lib/config/router.dart` |
| Ver documentación Web | `docs/web/7-frontend-web.md` |
| Ver entry point React | `web/src/main.tsx` |
| Ver router React | `web/src/App.tsx` |
| Ver auth context | `web/src/contexts/AuthContext.tsx` |
| Ver protected route | `web/src/components/ProtectedRoute.tsx` |
| Ver API service | `web/src/services/api.ts` |
| Ver hooks React Query | `web/src/hooks/` |
| Ver Panel Admin | `web/src/pages/admin/` |
| Ver Panel Empresa | `web/src/pages/empresa/` |

---

## Git DevOps Agent

### Available Agent
- **git-devops**: Senior DevOps Engineer especializado en Git workflows, CI/CD y repository hygiene
  - Location: `.mimocode/skills/git-devops/SKILL.md`
  - Invocation: `/git-devops`
  - Skills: workflow automation, conflict resolution, environment guard

### How to Use
- Invocar con `/git-devops` para iniciar el agente
- El agente lee este handoff.md al inicio para contexto
- Preguntar directamente o usar skills específicas:
  - `/git-workflow` → Guiar crear rama → desarrollar → PR
  - `/git-conflict-resolution` → Resolver conflictos de merge
  - `/git-environment-guard` → Detectar secretos, validar .gitignore

### Branch Strategy (Current)
- **main**: Production-ready, rama protegida
- **develop**: Integración, todas las features mergean aquí primero
- **Naming convention**: `feature/`, `fix/`, `hotfix/`, `release/`, `chore/`
- **Workflow**: Feature branch → PR to develop → PR to main

### Workflow Convention
1. **Iniciar**: `git checkout -b feature/{name} develop`
2. **Desarrollar**: Commits pequeños con conventional commits
3. **Completar**: `git push origin feature/{name}` + crear PR
4. **Merge**: PR review → merge a develop → deploy a main

### Rebase vs Merge
- **Rebase**: Solo si la rama es tuya y nadie más la tocó
- **Merge**: Si es compartida o no sabés

---

## Product Manager Agent

### Available Agent
- **product-manager**: Senior Product Manager especializado en definición de features, priorización y validación de MVP
  - Location: `.mimocode/skills/product-manager/SKILL.md`
  - Invocation: `/product-manager`
  - Skills: define feature, prioritize, validate MVP, review sprint, user story

### How to Use
- `/pm-define-feature` → Definir nueva feature con user story
- `/pm-prioritize` → Priorizar backlog con MoSCoW o RICE
- `/pm-validate-mvp` → Validar si es crítico para MVP
- `/pm-review-sprint` → Revisar progreso del sprint
- `/pm-user-story` → Crear user story formateada

---

## UI/UX Designer Agent

### Available Agent
- **ui-ux-designer**: Senior UI/UX Designer especializado en usabilidad, consistencia y accesibilidad
  - Location: `.mimocode/skills/ui-ux-designer/SKILL.md`
  - Invocation: `/ui-ux-designer`
  - Skills: audit, review component, suggest improvement, check consistency, accessibility

### How to Use
- `/ux-audit` → Auditoría de usabilidad completa
- `/ux-review-component` → Revisar componente UI específico
- `/ux-suggest-improvement` → Sugerir mejoras de diseño
- `/ux-check-consistency` → Verificar consistencia con design system
- `/ux-accessibility` → Revisar accesibilidad WCAG

---

## Quality Assurance Agent

### Available Agent
- **quality-assurance**: Senior QA Engineer especializado en calidad, gaps y releases
  - Location: `.mimocode/skills/quality-assurance/SKILL.md`
  - Invocation: `/quality-assurance`
  - Skills: review feature, gap analysis, test plan, release checklist, bug report

### How to Use
- `/qa-review-feature` → Revisar si feature está completa
- `/qa-gap-analysis` → Identificar gaps MVP
- `/qa-test-plan` → Crear plan de prueba
- `/qa-release-checklist` → Checklist antes de release
- `/qa-bug-report` → Formatear bug report

---

## Tech Architect Agent

### Available Agent
- **tech-architect**: Senior Software Architect especializado en arquitectura, seguridad y performance
  - Location: `.mimocode/skills/tech-architect/SKILL.md`
  - Invocation: `/tech-architect`
  - Skills: review module, suggest improvement, scalability, security audit, performance

### How to Use
- `/arch-review-module` → Revisar arquitectura de módulo
- `/arch-suggest-improvement` → Sugerir mejoras técnicas
- `/arch-check-scalability` → Evaluar escalabilidad
- `/arch-security-audit` → Auditoría de seguridad
- `/arch-performance` → Analizar rendimiento

---

## Content Strategist Agent

### Available Agent
- **content-strategist**: Senior Content Strategist especializado en copy, SEO e i18n
  - Location: `.mimocode/skills/content-strategist/SKILL.md`
  - Invocation: `/content-strategist`
  - Skills: audit, plan, copy, SEO, i18n

### How to Use
- `/content-audit` → Revisar contenido existente
- `/content-plan` → Planificar contenido faltante
- `/content-copy` → Escribir copy para pantallas
- `/content-seo` → Optimizar SEO
- `/content-i18n` → Planificar traducciones

---

## Agent Team Workflow

### Flujo de una Feature
```
1. Product Manager define → /pm-define-feature
2. UI/UX Designer revisa → /ux-audit
3. Tech Architect revisa → /arch-review-module
4. Quality Assurance valida → /qa-review-feature
5. Content Strategist agrega → /content-plan
6. Git DevOps gestiona → /git-devops
```

---

**Última actualización**: 2026-07-19 (MVP FASE 1 + FASE 2 completadas + 6 Agentes)
**Próximo entregable**: Entregable 9 — Testing Adicional (security tests, performance baseline)
**Entregables completados**: MVP FASE 1 + FASE 2 (Onboarding, i18n, UI Components, Share, Deep Links, Nearby, Weather, Animations, 200 Places) + 6 Agentes + 166 tests passing
