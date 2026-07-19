# Handoff: BoliviaExperience — Documentación y Arquitectura Completa

**Generated**: 2026-06-26
**Last Updated**: 2026-07-04
**Branch**: main
**Status**: Entregables 1-7 Completados + Seguridad Corregida + Módulos Admin/Empresa + Google Maps Integrado + Docker Configurado + Tests Unitarios

---

## Resumen de Sesión (2026-07-04)

### Trabajo Realizado en Esta Sesión

**Enfoque adoptado:** En vez de listar genéricamente qué falta al proyecto, se definieron los 3 bloqueadores reales para un lanzamiento (mapa, upload de fotos, auth en web) y se trabajó en el primero. Este enfoque de "bloqueadores primeros" es más efectivo que una lista infinita de pendientes porque genera progreso tangible y medible.

### Seguridad (Corregido)

| Vulnerabilidad | Severidad | Archivo | Solución |
|----------------|-----------|---------|----------|
| SQL Injection no autenticada | 🔴 CRÍTICO | `geo.repository.ts` | `$queryRaw` con tagged templates |
| Bypass de autenticación en refresh | 🔴 CRÍTICO | `auth.service.ts` | Verificación con JWT_REFRESH_SECRET + claim type |
| Tokens JWT intercambiables | 🔴 CRÍTICO | `auth.service.ts`, `jwt-auth.guard.ts` | Claim `type: 'access'|'refresh'` + secrets separados |
| CORS `origin: '*'` | 🟠 ALTO | `main.ts` | Usa `configService.get('cors.origin')` |
| Swagger sin protección | 🟠 ALTO | `main.ts` | Condicionado a `NODE_ENV !== 'production'` |
| Password admin hardcodeada | 🟠 ALTO | `seed-admin.ts` | Lee de env var `ADMIN_SEED_PASSWORD` |
| Autorización incompleta en reviews | 🟠 ALTO | `reviews.service.ts` | Verifica `place.ownerId === userId` |
| Hard delete en places | 🟡 MEDIO | `places.service.ts` | Soft delete (`isActive: false`) |
| Sin guard global | 🟡 MEDIO | `app.module.ts` | `APP_GUARD` con `JwtAuthGuard` + `@Public()` |

### Módulos Nuevos (Backend)

| Módulo | Endpoints | Descripción |
|--------|-----------|-------------|
| **Admin** | `GET /admin/dashboard`, `GET /admin/users`, `PATCH /admin/users/:id/ban`, `GET /admin/reviews` | Gestión administrativa |
| **Empresa** | `GET /empresa/dashboard`, `GET /empresa/place`, `PUT /empresa/place`, `GET /empresa/reviews`, `GET /empresa/analytics` | Gestión de negocio propio |

### Búsqueda Avanzada

- **Endpoint:** `GET /search/advanced`
- **Filtros:** categoryId, minRating, maxRating, lat/lng/radius, featured, sortBy, sortOrder, page, limit
- **Flutter:** Pantalla de filtros con categorías dinámicas, slider de rating, opciones de distancia

### Google Maps (Flutter)

- **MapService:** Servicio para obtener lugares cercanos, clusters, bounds
- **MapProvider:** State management con ubicación del usuario
- **MapScreen:** Google Maps real con marcadores, filtros, bottom sheet
- **PlaceMarker:** Marcadores programáticos con Canvas
- **PlaceBottomSheet:** Panel inferior con info del lugar

### Pantallas Flutter Completadas

| Pantalla | Estado | Funcionalidades |
|----------|--------|-----------------|
| **FavoritesScreen** | ✅ | Grid/lista, búsqueda, filtros, swipe eliminar, pull-to-refresh |
| **ProfileScreen** | ✅ | Header gradiente, stats, configuración, logout |
| **EditProfileScreen** | ✅ | Formulario validado, cambio de foto, eliminar cuenta |
| **SearchFiltersScreen** | ✅ | Categorías dinámicas, rating, distancia, destacados, ordenamiento |
| **PlaceDetailScreen** | ✅ | Galería fotos, descripción, horarios, contacto, redes sociales, reseñas |

### Panel Web Conectado

| Página | Estado | Datos |
|--------|--------|-------|
| Admin Dashboard | ✅ Conectado | Estadísticas reales |
| Admin Users | ✅ Conectado | Listado paginado, ban |
| Admin Places | ✅ Conectado | Grid con fotos, toggle |
| Admin Reviews | ✅ Conectado | Aprobación, eliminación |
| Admin Events | ✅ Conectado | Listado con fechas |
| Admin Promotions | ✅ Conectado | Listado con descuentos |
| Admin Categories | ✅ Conectado | Grid con conteo |
| Empresa Dashboard | ✅ Conectado | Stats del negocio |
| Empresa Place | ✅ Conectado | Edición de información |
| Empresa Reviews | ✅ Conectado | Reseñas con respuesta |

### Testing

- **Unit tests:** 28 tests pasando (auth, geo, reviews)
- **E2E tests:** 18 tests creados (requieren DB en ejecución)

### Docker

- **api/Dockerfile:** Multi-stage build para NestJS
- **web/Dockerfile:** Multi-stage build con Nginx para SPA
- **docker-compose.yml:** Stack completo (PostgreSQL + API + Web)

### Mejoras de Calidad

- **Role enum:** `Role.Admin`, `Role.Empresa`, `Role.Usuario` en todos los controllers
- **Logging interceptor:** Estructurado con method, url, status, tiempo, user
- **Weather cache:** TTL de 15 minutos para OpenWeather API
- **Código muerto eliminado:** firebase-auth.guard.ts, firebase.service.ts, firebase.module.ts

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

---

## Not Yet Done

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

### Entregable 8: Infraestructura DevOps
- [x] 8.1-8.3 Docker (Dockerfiles API/Web, docker-compose.yml) ✅
- [ ] 8.4-8.10 CI/CD, GCP, monitoreo

### Entregable 9: Testing
- [x] 9.1-9.2 Unit tests (28 tests pasando) ✅
- [x] 9.3 E2E tests (18 tests creados, requieren DB) ✅
- [ ] 9.4-9.8 Integration, seguridad, rendimiento

### Entregable 10: Documentación Técnica
- [ ] 10.1-10.9 README, manuales, guías, CHANGELOG

### Entregable 11: Documentación Funcional
- [ ] 11.1-11.9 Manuales, user stories, backlog

### Entregable 12: Despliegue y Go-Live
- [ ] 12.1-12.6 Checklist, plan de despliegue, rollback

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

---

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
| **SEGURIDAD (2026-07-04)** |
| $queryRaw sobre $queryRawUnsafe | SQL Injection en GeoRepository. Tagged templates parametrizan queries automáticamente | - |
| JWT dual con secrets separados | Access y refresh tokens usan secrets diferentes y claim `type` para diferenciarlos | - |
| APP_GUARD global | Todas las rutas requieren auth por defecto, @Public() para excepciones | - |
| Role enum | Evita typos en strings de roles, detecta errores en compilación | - |
| **ARQUITECTURA (2026-07-04)** |
| Módulos Admin/Empresa | Separación de responsabilidades: admin gestiona todo, empresa solo su negocio | - |
| Búsqueda avanzada | Endpoint con filtros múltiples (rating, categoría, distancia, destacados) | - |
| Programmatic markers | Marcadores generados con Canvas en vez de assets PNG, más flexibles | - |

---

## Current State

### Estado de Implementación (2026-07-04)

| Capa | Progreso | Estado |
|------|----------|--------|
| Backend API | 95% | 15 módulos, ~60 endpoints, auth JWT dual, RBAC |
| Base de Datos | 100% | PostgreSQL + PostGIS, migraciones, seed |
| Flutter App | 90% | Todas las pantallas principales, Google Maps integrado |
| Panel Web Admin | 90% | Todas las páginas conectadas a API real |
| Panel Web Empresa | 85% | Dashboard, Place, Reviews conectados |
| Tests Backend | 35% | Unit tests pasando, E2E creados |
| Docker | 75% | Dockerfiles + docker-compose funcional |

### Archivos Creados/Modificados en Sesión 2026-07-04

**Backend (api/):**
- `src/common/enums/role.enum.ts` - Enum de roles
- `src/common/decorators/public.decorator.ts` - Decorador @Public
- `src/common/interceptors/logging.interceptor.ts` - Logging estructurado
- `src/modules/admin/` - Módulo Admin (module, controller, service, dto)
- `src/modules/empresa/` - Módulo Empresa (module, controller, service, dto)
- `src/modules/map/dto/map-query.dto.ts` - DTOs de validación geográfica
- `src/modules/search/dto/advanced-search.dto.ts` - DTO de búsqueda avanzada
- `src/modules/reviews/dto/respond-review.dto.ts` - DTO para responder reseñas
- `src/modules/auth/auth.service.spec.ts` - Tests unitarios de auth
- `src/modules/places/repositories/geo.repository.spec.ts` - Tests de geo
- `src/modules/reviews/reviews.service.spec.ts` - Tests de reviews
- `test/auth.e2e-spec.ts` - Tests E2E de auth
- `test/map.e2e-spec.ts` - Tests E2E de mapa
- `test/jest-e2e.json` - Configuración E2E
- `Dockerfile` - Multi-stage build para API
- `.dockerignore` - Exclusiones Docker
- `prisma/migrations/20250704000000_add_postgis_location/` - Migración PostGIS

**Flutter (app/):**
- `lib/features/map/data/map_service.dart` - Servicio de mapa
- `lib/features/map/presentation/providers/map_provider.dart` - State del mapa
- `lib/features/map/presentation/widgets/place_marker.dart` - Marcadores
- `lib/features/map/presentation/widgets/place_bottom_sheet.dart` - Panel inferior
- `lib/features/search/presentation/screens/search_filters_screen.dart` - Filtros

**Web (web/):**
- `src/hooks/useAuth.ts` - Hook de autenticación
- `src/pages/admin/*.tsx` - Todas las páginas conectadas a API
- `src/pages/empresa/*.tsx` - Páginas conectadas a API
- `Dockerfile` - Multi-stage build con Nginx
- `.dockerignore` - Exclusiones Docker
- `tsconfig.node.json` - Configuración TypeScript

**Documentación:**
- `docs/handoffs/HANDOFF_INTEGRATION_MAP_07_04.md` - Handoff de sesión
- `docs/handoffs/HANDOFF_CONTINUE_MAP_07_04.md` - Guía de continuación

### Archivos Creados

```
bolivia-experience/
├── README.md                                    # Actualizado con entregables 1-3
├── handoff.md                                   # Este archivo
├── docs/
│   ├── business/                                # 9 archivos (~208 KB)
│   │   ├── 1.1-business-model-canvas.md
│   │   ├── 1.2-lean-canvas.md
│   │   ├── 1.3-analisis-competencia-benchmark.md
│   │   ├── 1.4-analisis-foda-pestel.md
│   │   ├── 1.5-mvp-hipotesis-metricas-validacion.md
│   │   ├── 1.6-kpis-okrs-north-star.md
│   │   ├── 1.7-proyeccion-financiera.md
│   │   ├── 1.8-estrategia-go-to-market.md
│   │   └── 1.9-roadmap-completo.md
│   │
│   ├── architecture/                            # 8 archivos (~245 KB)
│   │   ├── 2.1-ads-stack-tecnologico.md         # 20 ADRs del stack
│   │   ├── 2.2-diagramas-c4.md                  # C4 Level 1-4
│   │   ├── 2.3-arquitectura-fislogica-cloud.md  # Lógica, Física, GCP
│   │   ├── 2.4-arquitectura-seguridad.md        # OWASP, JWT, RBAC
│   │   ├── 2.5-arquitectura-datos.md            # Modelo ER, SQL, PostGIS
│   │   ├── 2.6-arquitectura-api.md              # Endpoints, convenciones
│   │   ├── 2.7-diagramas-uml.md                 # Use Case, Classes, Sequence
│   │   └── 2.8-estrategia-escalabilidad.md      # 5 niveles de escala
│   │
│   ├── design/                                  # 10 archivos (~180 KB)
│   │   ├── 3.1-design-tokens.md                 # Paleta, tipografía, espaciado
│   │   ├── 3.2-component-library.md             # Atomic Design: atoms-molecules-organisms
│   │   ├── 3.3-dark-light-mode.md               # Dark/Light Mode completo
│   │   ├── 3.4-wireframes-app-movil.md          # 25 pantallas en ASCII wireframe
│   │   ├── 3.5-wireframes-panels-web.md         # Panel Admin + Panel Empresa
│   │   ├── 3.6-user-flow.md                     # Flujos por actor
│   │   ├── 3.7-customer-journey-map.md          # Journey maps por persona
│   │   ├── 3.8-navigation-map.md                # Site map + rutas Flutter
│   │   ├── 3.9-microinteracciones.md            # Animaciones y transiciones
│   │   └── 3.10-estados-especiales.md           # Error, vacío, offline, skeleton
│   │
│   ├── database/                                # 8 archivos (~120 KB)
│   │   ├── 4.1-modelo-er-completo.md            # 14 entidades, relaciones, restricciones
│   │   ├── 4.2-modelo-fisico-detallado.md       # 13 tablas con tipos y volúmenes
│   │   ├── 4.3-ddl-sql-completo.md              # DDL completo, triggers, vistas, RLS
│   │   ├── 4.4-adr-postgis-prisma.md            # Schema Prisma + GeoRepository
│   │   ├── 4.5-estrategia-migraciones.md        # Prisma Migrate + rollback
│   │   ├── 4.6-seeds-datos.md                   # Seeds producción/desarrollo/testing
│   │   ├── 4.7-optimizacion-consultas.md        # 8 consultas críticas optimizadas
│   │   └── 4.8-estrategia-backups.md            # 4 tipos, 5 escenarios recuperación
│   │
│   ├── backend/                                 # 1 archivo (~50 KB)
│   │   └── 5-backend-completo.md                # Documentación completa del backend
│   │
│   ├── frontend/                                # 2 archivos (~50 KB)
│   │   ├── 6-frontend-flutter.md                # Documentación completa del frontend Flutter
│   │   └── 7-frontend-web.md                    # Documentación completa del frontend Web
│
api/                                             # Código fuente backend
├── package.json                                 # Dependencias y scripts
├── tsconfig.json                                # Configuración TypeScript
├── nest-cli.json                                # Configuración NestJS
├── .env.example                                 # Variables de entorno
├── .dockerignore                                # Exclusiones Docker
├── Dockerfile                                   # Multi-stage build
├── prisma/
│   ├── schema.prisma                            # 13 modelos + location geography
│   └── migrations/                              # Migraciones Prisma
└── src/
    ├── main.ts                                  # Entry point + Swagger + CORS
    ├── app.module.ts                            # Módulo raíz + APP_GUARD
    ├── config/configuration.ts                  # Config centralizada
    ├── prisma/                                  # PrismaModule global
    ├── common/
    │   ├── guards/                              # JwtAuthGuard, RolesGuard
    │   ├── decorators/                          # @Public, @CurrentUser, @Roles
    │   ├── enums/                               # Role enum
    │   ├── interceptors/                        # Logging, Transform
    │   ├── filters/                             # AllExceptionsFilter
    │   └── dto/                                 # PaginationDto
    └── modules/                                 # 15 módulos
        ├── auth/                                # JWT dual (access/refresh)
        ├── users/                               # Users CRUD + ban
        ├── places/                              # Places + GeoRepository (PostGIS)
        ├── categories/                          # Categories CRUD
        ├── reviews/                             # Reviews + approve/respond + ownership
        ├── favorites/                           # Favorites toggle
        ├── map/                                 # Map + DTOs geográficos
        ├── search/                              # Search + advanced + suggestions
        ├── events/                              # Events CRUD
        ├── promotions/                          # Promotions CRUD
        ├── weather/                             # Weather + cache
        ├── admin/                               # Admin dashboard, users, reviews
        └── empresa/                             # Empresa dashboard, place, reviews, analytics
│
app/                                             # Código fuente Flutter
├── pubspec.yaml                                 # Dependencias
└── lib/
    ├── main.dart                                # Entry point
    ├── app.dart                                 # MaterialApp.router
    ├── config/                                  # Colors, Theme, Router, API
    ├── core/                                    # Network, Widgets, Error
    └── features/                                # 9 features
        ├── auth/                                # Splash, Login
        ├── home/                                # MainShell, HomeScreen
        ├── map/
        │   ├── data/map_service.dart             # Servicio de mapa + modelos
        │   └── presentation/
        │       ├── providers/map_provider.dart   # State management
        │       ├── screens/map_screen.dart       # Google Maps real
        │       └── widgets/
        │           ├── place_marker.dart         # Marcadores programáticos
        │           └── place_bottom_sheet.dart   # Panel inferior
        ├── search/
        │   ├── data/search_service.dart          # Búsqueda avanzada
        │   └── presentation/
        │       ├── providers/search_provider.dart
        │       └── screens/
        │           ├── search_screen.dart
        │           └── search_filters_screen.dart # Filtros avanzados
        ├── favorites/
        │   └── presentation/screens/favorites_screen.dart # Grid/lista, búsqueda
        ├── profile/
        │   └── presentation/screens/
        │       ├── profile_screen.dart           # Perfil completo
        │       ├── edit_profile_screen.dart      # Edición validada
        │       └── settings_screen.dart          # Configuración
        ├── places/
        │   ├── data/places_service.dart          # Servicio de lugares
        │   └── presentation/
        │       ├── providers/place_detail_provider.dart
        │       └── screens/place_detail_screen.dart # Detalle completo
        ├── events/                              # EventDetailScreen
        └── reviews/                             # CreateReviewScreen
│
web/                                             # Código fuente React
├── package.json                                 # Dependencias
├── vite.config.ts                               # Configuración Vite
├── tailwind.config.js                           # Configuración Tailwind
├── tsconfig.node.json                           # Config TypeScript adicional
├── .dockerignore                                # Exclusiones Docker
├── Dockerfile                                   # Multi-stage con Nginx
└── src/
    ├── main.tsx                                 # Entry point
    ├── App.tsx                                  # Router + ProtectedRoute
    ├── hooks/useAuth.ts                         # Hook de autenticación
    ├── services/api.ts                          # Cliente Axios + endpoints
    ├── types/index.ts                           # TypeScript interfaces
    ├── components/layout/                       # AdminLayout, EmpresaLayout
    └── pages/
        ├── LoginPage.tsx                        # Login real con useAuth
        ├── admin/                               # 8 páginas Admin (conectadas)
        │   ├── Dashboard.tsx                    # Stats reales de API
        │   ├── Users.tsx                        # Listado paginado real
        │   ├── Places.tsx                       # Grid con fotos reales
        │   ├── Reviews.tsx                      # Reseñas reales
        │   ├── Events.tsx                       # Eventos reales
        │   ├── Promotions.tsx                   # Promociones reales
        │   ├── Categories.tsx                   # Categorías reales
        │   └── Settings.tsx                     # Configuración
        └── empresa/                             # 6 páginas Empresa (conectadas)
            ├── Dashboard.tsx                    # Stats reales
            ├── Place.tsx                        # Edición real
            ├── Reviews.tsx                      # Reseñas con respuesta
            ├── Promotions.tsx                   # Promociones reales
            ├── Stats.tsx                        # Estadísticas
            └── Photos.tsx                       # Gestión fotos
```

**Total**: 38 docs + 55 backend + 30 Flutter + 25 React + 3 Docker + 5 tests = **~156 archivos**

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
| ORM | Prisma | 5.x |
| Autenticación | Firebase Auth + JWT | — |
| Almacenamiento | Firebase Storage | — |
| Mapas | Google Maps SDK | — |
| Contenedores | Docker + Docker Compose | Docker 24 |
| CI/CD | GitHub Actions | — |
| Cloud | Google Cloud Platform | — |
| Estado Flutter | Riverpod | — |

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

### Estructura del Backend (NestJS) — Definida en 2.2 y 2.6

```
api/src/
├── main.ts
├── app.module.ts
├── common/              # Guards, interceptors, pipes, filters
├── config/              # App, database, Firebase config
├── modules/
│   ├── auth/            # Login, register, JWT, Google OAuth
│   ├── users/           # CRUD usuarios
│   ├── places/          # CRUD lugares (core)
│   ├── categories/      # CRUD categorías
│   ├── reviews/         # Opiniones y calificaciones
│   ├── favorites/       # Favoritos del usuario
│   ├── map/             # Geolocalización (PostGIS)
│   ├── search/          # Búsqueda full-text
│   ├── events/          # Eventos turísticos
│   ├── promotions/      # Promociones de negocios
│   └── weather/         # OpenWeatherMap integration
└── prisma/              # Schema y migrations
```

### Estructura de la App (Flutter) — Definida en 2.2

```
app/lib/
├── main.dart
├── app.dart
├── config/              # Routes, themes, constants
├── core/                # Error handling, network, usecases
├── features/
│   ├── auth/            # Login, register, onboarding
│   ├── home/            # Home screen
│   ├── places/          # Ficha del establecimiento
│   ├── map/             # Mapa interactivo
│   ├── search/          # Búsqueda y filtros
│   ├── favorites/       # Favoritos
│   ├── reviews/         # Opiniones
│   └── profile/         # Perfil del usuario
├── injection_container.dart
└── l10n/                # i18n (es, en)
```

### Endpoints Principales — Definidos en 2.6

| Módulo | Endpoints | Auth |
|--------|-----------|------|
| Auth | POST /auth/register, /auth/login, /auth/google, /auth/refresh | No/Sí |
| Places | GET /places, /places/:id, POST, PUT, DELETE | No/Admin |
| Map | GET /map/nearby, /map/cluster, /map/bounds | No |
| Search | GET /search, /search/suggestions | No |
| Reviews | GET /places/:id/reviews, POST, PUT, DELETE | Sí |
| Favorites | GET /favorites, POST /favorites/:placeId, DELETE | Sí |
| Events | GET /events, /events/today | No |
| Weather | GET /weather/current, /weather/forecast | No |

### Modelo de Datos Principal — Definido en 2.5

```sql
-- Users
id (UUID PK), email, name, photo_url, country, language, role, firebase_uid, is_active

-- Places
id (UUID PK), name, description, address, phone, website, 
latitude, longitude, location (GEOGRAPHY PostGIS), 
rating_avg, rating_count, category_id (FK), owner_id (FK), is_featured, is_active

-- Categories
id (UUID PK), name, name_en, icon, slug, description, display_order

-- Reviews
id (UUID PK), user_id (FK), place_id (FK), rating (1-5), comment, photos[], visit_date, is_approved

-- Favorites
id (UUID PK), user_id (FK), place_id (FK), UNIQUE(user_id, place_id)

-- Events
id (UUID PK), name, description, date_start, date_end, location, photo_url, category

-- Promotions
id (UUID PK), place_id (FK), title, description, discount_percentage, start_date, end_date
```

---

## Resume Instructions

### Estado de Estabilización (2026-06-27)

| Componente | Estado | Detalle |
|------------|--------|---------|
| API TypeScript | ✅ 0 errores | `npx tsc --noEmit` limpio, `npm run build` exitoso |
| API Runtime | ✅ Arranca | Todos los módulos inicializan, Swagger en `/docs` |
| Prisma Client | ✅ v5.22.0 | `prisma generate` + `prisma db push` funcionan |
| DB Schema | ✅ Sincronizado | 13 tablas creadas, relaciones OK |
| Seed | ✅ Ejecutado | 12 categorías + 1 admin user en DB |
| Firebase | ✅ Lazy init | No crashea sin credenciales reales |
| GeoRepository | ✅ Haversine | Queries geoespaciales sin PostGIS |

### Para Continuar el Proyecto

1. **Siguiente paso**: Entregable 8 — Infraestructura DevOps
   - Crear Dockerfiles (API, Web Admin, Web Empresa)
   - Crear docker-compose.yml para desarrollo local
   - Configurar Nginx como reverse proxy
   - Crear GitHub Actions para CI/CD
   - Configurar despliegue en GCP (Cloud Run, Cloud SQL, Cloud Storage)
   - Configurar monitoreo (Cloud Monitoring, Cloud Logging)

2. **Documentación existente**: Toda la documentación está en `docs/business/`, `docs/architecture/` y `docs/design/`
   - Los ADRs definen las decisiones técnicas (no renegotiar sin justificación)
   - El modelo de datos está definido en `2.5-arquitectura-datos.md`
   - Los endpoints están definidos en `2.6-arquitectura-api.md`

3. **Presupuesto realista**: $30,000-50,000 para MVP (no $20,000-30,000 del prompt original)
   - Equipo reducido: Tech Lead + 2 Flutter devs + 1 NestJS dev (4 personas)
   - Fasear: MVP core → Panels completos → Features adicionales

4. **Decisiones pendientes de validación**:
   - ADR-002 (Monetización): Modelo freemium aceptado pero pendiente de validar con negocios
   - Precios de suscripción ($29-99/mes): Validar con encuestas a 50 negocios

---

## Setup Required

### Variables de Entorno (Definidas en 2.4)

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/bolivia_experience

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# APIs
GOOGLE_MAPS_API_KEY=your-google-maps-key
OPENWEATHER_API_KEY=your-openweather-key

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRATION=15m
REFRESH_TOKEN_EXPIRATION=7d
```

### Dependencias Principales

**Backend (NestJS)**:
- @nestjs/core, @nestjs/common, @nestjs/platform-express
- @nestjs/jwt, @nestjs/passport, passport-jwt
- @nestjs/prisma, prisma
- @nestjs/swagger
- firebase-admin
- helmet, compression, cors

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
- @radix-ui/react-* (components)

---

## Warnings

1. **Presupuesto insuficiente**: El prompt original dice $20K-30K pero el alcance requiere $50K+. Ver ADR-001 y ADR-009. Se recomienda fasear o buscar inversión adicional.

2. **Prisma + PostGIS**: Las consultas geoespaciales REQUIEREN raw queries ($queryRaw). No usar findMany con location directamente. Ver ADR-220.

3. **Mercado boliviano**: 80% Android, dispositivos gama media-baja (2-4GB RAM), conectividad 4G inestable. La app debe ser liviana y funcionar offline básico. Ver ADR-006.

4. **Segmento prioritario**: Turistas NACIONALES primero (80% esfuerzo), internacionales después (20%). No confundir con turistas internacionales como prioridad. Ver ADR-003.

5. **Sin pagos en MVP**: El mercado boliviano usa efectivo y QR BCB. No implementar pasarela de pagos hasta Fase 4. Ver ADR-002.

6. **Contenido inicial**: 200 lugares curados por el equipo ANTES del launch. No depender solo de contenido generado por usuarios. Ver 1.8 Go-to-Market.

7. **Google Maps costos**: Free tier $200/mes. Monitorear uso y configurar límites. Ver ADR-212.

8. **Firebase Auth**: Requiere configuración de OAuth consent screen en Google Cloud Console. Ver ADR-207.

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
| Ver entry point API | `api/src/main.ts` |
| Ver módulo raíz | `api/src/app.module.ts` |
| Ver documentación Flutter | `docs/frontend/6-frontend-flutter.md` |
| Ver entry point Flutter | `app/lib/main.dart` |
| Ver themes Flutter | `app/lib/config/theme.dart` |
| Ver router Flutter | `app/lib/config/router.dart` |
| Ver documentación Web | `docs/web/7-frontend-web.md` |
| Ver entry point React | `web/src/main.tsx` |
| Ver router React | `web/src/App.tsx` |
| Ver API service | `web/src/services/api.ts` |
| Ver Panel Admin | `web/src/pages/admin/` |
| Ver Panel Empresa | `web/src/pages/empresa/` |

---

**Última actualización**: 2026-07-04
**Próximo entregable**: 8.4 — CI/CD (GitHub Actions)
**Entregables completados**: 7 de 12 + Seguridad + Módulos Admin/Empresa + Google Maps + Docker + Tests
