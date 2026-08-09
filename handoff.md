# Handoff de Sesión — BoliviaExperience

**Fecha**: 8 de agosto, 2026
**Agente**: opencode (build agent)
**Rama**: develop
**Commit**: `09441ca`

---

## Resumen de la Sesión

Sesión de **implementación de verticales completas de descubrimiento y reserva** en la app Flutter BoliviaExperience. Se agregaron 7 features nuevas de extremo a extremo (Home con experiencias y detalle, Cosas que hacer, Hoteles, Restaurantes, Reservas con pago QR, Fotos de Viajeros, Notificaciones), 5 módulos nuevos en la API NestJS (products, tours, hotels, restaurants, reservations/payments con escrow, traveler-photos, firebase-messaging), y 2 páginas nuevas en el panel web del socio (Experiencias y Reservas). También se corrigieron 2 bugs de UI (empty state de Mis Reservas/Pagos y diseño de las cards de Imprescindibles).

---

## Cambios Realizados

### Vista Inicio — Experiencias y Detalle

| Elemento | Antes | Ahora |
|----------|-------|-------|
| Home | Solo eventos/promociones | Sección de experiencias con `GET /experiences/home` |
| Detalle de experiencia | No existía | Pantalla `experience_detail_screen.dart` con producto, slots y foto de portada |
| Servicios | Sin navegación | `home_service.dart` y `home_provider.dart` conectados |

**Archivos nuevos:**
- `features/home/data/home_experience.dart`, `data/experience_detail.dart` — Modelos de experiencia y detalle
- `features/home/presentation/screens/experience_detail_screen.dart` — Detalle con SliverAppBar, galería, botón "Reservar"

### Cosas que Hacer — Nueva feature

| Funcionalidad | Descripción |
|---------------|-------------|
| Vista principal | `things_to_do_screen.dart` con categorías y contenido destacado |
| Imprescindibles | `essential_screen.dart` con cards de lugares y productos esenciales |
| Todas las categorías | `all_categories_screen.dart` con grid completo |
| Cards | `essential_card.dart`, `experience_card.dart`, `place_card.dart`, `tour_card.dart`, `recommended_tour_card.dart` |
| Datos | `tours_service.dart` (tours recomendados) y `things_to_do_provider.dart` |

### Hoteles — Nueva feature

| Funcionalidad | Descripción |
|---------------|-------------|
| Catálogo | `hotels_screen.dart` con lista desde `GET /hotels` |
| Filtros | Barra de filtros + sheets de precio, distancia, huéspedes, amenities y más filtros |
| Motor de filtros | `hotels_filter_engine.dart` con tests (`hotels_filter_engine_test.dart`) |
| Cards | `hotel_card.dart` con precio, rating y amenities |

### Restaurantes — Nueva feature

| Funcionalidad | Descripción |
|---------------|-------------|
| Catálogo | `restaurants_screen.dart` con lista desde `GET /restaurants` |
| Filtros | Sheets de precio, distancia, cocina, comodidades, personas, fecha/hora |
| Motor de filtros | `restaurants_filter_engine.dart` |
| Cards | `restaurant_card.dart` con cocina, rating y precio promedio |

### Reservas con Pago QR — Nueva feature

| Elemento | Antes | Ahora |
|----------|-------|-------|
| Crear reserva | No existía | `create_reservation_screen.dart` con persona, fecha/hora y precio |
| Pago QR | No existía | `payment_screen.dart` con QR generado y confirmación |
| Mis reservas | No existía | `my_reservations_screen.dart` con tabs de Reservas y Pagos |
| Espera de confirmación | No existía | `reservation_waiting_screen.dart` |
| Precios | No existían | `pricing.dart` con cálculo de comisión y depósito |

### Fotos de Viajeros — Nueva feature

| Funcionalidad | Descripción |
|---------------|-------------|
| Grid | `traveler_photos_grid_screen.dart` con fotos del feed |
| Detalle | `traveler_photo_detail_screen.dart` con likes |
| Crear | `create_traveler_photo_screen.dart` con subida de foto |
| Carousel | `traveler_photos_carousel.dart` en pantallas de lugar |

### Notificaciones — Funcionalidad

| Elemento | Antes | Ahora |
|----------|-------|-------|
| Servicio | Sin registro de dispositivo | `notifications_service.dart` con registro de token FCM |
| Provider | Sin estado | `notifications_provider.dart` con conteo de no leídas |
| Pantalla | Lista básica con Hive | `notifications_screen.dart` con marcar leídas desde API |

### Panel Web del Socio — Experiencias y Reservas

| Elemento | Antes | Ahora |
|----------|-------|-------|
| Página Experiencias | No existía | `web/src/pages/empresa/Experiences.tsx` con CRUD de productos |
| Página Reservas | No existía | `web/src/pages/empresa/Reservations.tsx` con confirmar/rechazar |
| Hook de reservas | No existía | `web/src/hooks/useReservations.ts` |
| Layout | Sin acceso a las nuevas páginas | `BusinessLayout.tsx` con tabs de Experiencias y Reservas |

### Backend — Nuevos módulos

| Módulo | Descripción |
|--------|-------------|
| `products` | CRUD de productos, experiencias (`/experiences/home`, `/essential`), slots, reviews, fotos |
| `tours` | Tours y tours recomendados |
| `hotels` | Catálogo de hoteles |
| `restaurants` | Catálogo de restaurantes |
| `reservations` | Ciclo de vida completo (crear, confirmar, rechazar, completar, no-show, cancelar, expirar) |
| `payments` | Pagos con confirmación y escrow |
| `platform-config` | Configuración de plataforma (comisiones, tiempos) |
| `traveler-photos` | Fotos de viajeros con likes |
| `firebase-messaging` | Envío de notificaciones push FCM |
| `optional-jwt-auth` | Guard opcional para autenticación condicional en feed |
| `places` | `GET /places/feed` y `GET /places/scored` con scoring y `canReserve` |
| `auth` | `POST /auth/google` — login con Google |
| `admin` | Premium, cashback, premiado, settings |
| `users` | `GET /users/:id` — perfil público |

### Bugs Corregidos

#### 1. Empty state de Mis Reservas/Pagos nunca se mostraba
- **Causa**: `MyReservationsScreen` usaba `ref.listen` que no dispara la carga al montar la pantalla, dejando spinner infinito aunque el provider llegara vacío
- **Fix**: Convertir a `ConsumerStatefulWidget` y cargar en `initState` con `Future.microtask(() => ref.read(reservationsProvider.notifier).loadAll())`
- **Archivo**: `my_reservations_screen.dart`

#### 2. Cards de "Experiencias imprescindibles" con diseño inconsistente
- **Causa**: `EssentialCard` usaba un layout horizontal poco consistente con el resto de cards (foto a la izquierda), sin badge de score ni de verificación
- **Fix**: Rediseño a patrón vertical como `ExperienceCard`/`PlaceCard`: foto arriba con score dorado, badge Verificado/Recomendado (solo productos, con tooltip), nombre, categoría y precio "por persona"
- **Archivo**: `essential_card.dart`

### Backend — Nuevos Endpoints

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `GET /experiences/home` | GET | Experiencias destacadas para el Home |
| `GET /experiences/essential` | GET | Imprescindibles mixtos (places + products) |
| `GET /products` / `GET /products/my` / `POST /products` | GET/POST | CRUD de productos |
| `GET /products/:id/slots` / `POST /products/:id/slots` | GET/POST | Slots de disponibilidad |
| `GET /tours` / `GET /tours/recommended` | GET | Tours y recomendados |
| `GET /hotels` | GET | Catálogo de hoteles |
| `GET /restaurants` | GET | Catálogo de restaurantes |
| `POST /reservations` / `GET /reservations/my` | POST/GET | Crear y listar reservas |
| `POST /reservations/:id/confirm` / `:id/reject` / `:id/complete` / `:id/no-show` | POST | Ciclo de vida por socio |
| `PATCH /reservations/:id/cancel` | PATCH | Cancelación |
| `GET /reservations/socio` / `GET /reservations/place/:placeId` | GET | Reservas del socio |
| `POST /payments` / `POST /payments/:id/confirm` | POST | Crear y confirmar pago QR |
| `GET /payments/my/history` | GET | Historial de pagos |
| `GET /traveler-photos` / `POST /traveler-photos` | GET/POST | Feed de fotos de viajeros |
| `POST /traveler-photos/:id/like` | POST | Like a foto |
| `GET /notifications` / `GET /notifications/unread/count` | GET | Notificaciones y contador |
| `POST /notifications/register-token` | POST | Registro de token FCM |
| `GET /places/feed` / `GET /places/scored` | GET | Feed y lugares con scoring |
| `POST /auth/google` | POST | Login con Google |
| `PATCH /admin/businesses/:id/premium` | PATCH | Premium de negocio |
| `PATCH /admin/products/:id/cashback` / `:id/premiado` | PATCH | Cashback y premiado |
| `GET /admin/settings` / `PUT /admin/settings` | GET/PUT | Configuración de plataforma |
| `GET /users/:id` | GET | Perfil público de usuario |

---

## Archivos Modificados (132)

### Backend (111)
1. `api/prisma/schema.prisma` (+ `schema.postgres.prisma`, `schema.sqlite.prisma`) — Modelos products, tours, hotels, restaurants, reservations, payments, traveler_photos, platform_config
2. `api/prisma/seed.ts` — Seed de productos, hoteles, restaurantes, tours y experiencias
3. `api/src/app.module.ts` — Registro de nuevos módulos
4. `api/src/main.ts` — Arranque con configuración de plataforma
5. `api/src/modules/admin/*` — Premium, cashback, premiado, settings
6. `api/src/modules/auth/*` — Login con Google
7. `api/src/modules/notifications/*` — Registro de token FCM y envío push
8. `api/src/modules/payments/*` — Pagos con confirmación y escrow
9. `api/src/modules/places/*` — `canReserve`, feed y scoring
10. `api/src/modules/reservations/*` — Ciclo de vida completo de reservas
11. `api/src/modules/reviews/*` — Status de reseñas y sentiment
12. `api/src/modules/search/*` — Búsqueda integrada con nuevos tipos
13. `api/src/modules/users/*` — Perfil público
14. `api/src/modules/{categories,events,favorites,map,promotions,recommendations,referrals,trips,weather,chatbot,empresa}/*` — Formateo y ajustes menores
15. `api/src/common/*` — Guards, decorators, interceptors y config actualizados

### Flutter (14)
16. `app/lib/config/api_constants.dart` — Nuevos endpoints de experiencias, reservas y fotos
17. `app/lib/config/router.dart` — Rutas de cosas que hacer, experiencias y reservas
18. `app/lib/features/home/data/home_service.dart` — Experiencias del Home
19. `app/lib/features/home/presentation/providers/home_provider.dart` — Estado de experiencias
20. `app/lib/features/home/presentation/screens/home_screen.dart` — Sección de experiencias
21. `app/lib/features/map/data/map_service.dart` — `canReserve` y foto en preview
22. `app/lib/features/map/presentation/widgets/place_preview_sheet.dart` — Botón "Reservar" si `canReserve`
23. `app/lib/features/notifications/presentation/screens/notifications_screen.dart` — Marcar leídas vía API
24. `app/lib/features/places/data/places_service.dart` — Feed y fotos
25. `app/lib/features/places/presentation/providers/place_detail_provider.dart` — Fotos de viajeros
26. `app/lib/features/places/presentation/screens/place_detail_screen.dart` — Carousel de fotos
27. `app/lib/features/profile/presentation/screens/profile_screen.dart` — Acceso a Mis Reservas
28. `app/lib/main.dart` — Inicialización de providers globales
29. `app/pubspec.yaml` — Dependencias nuevas (QR, geolocalización)

### Web (7)
30. `web/src/App.tsx` — Rutas de Experiencias y Reservas del socio
31. `web/src/components/layout/BusinessLayout.tsx` — Tabs nuevas
32. `web/src/hooks/useBusinesses.ts` / `useEmpresa.ts` — Soporte de reservas
33. `web/src/pages/admin/Businesses.tsx` — Premium y estados
34. `web/src/pages/empresa/Place.tsx` — Slots y reservas
35. `web/src/services/api.ts` — Endpoints de reservas

---

## Archivos Nuevos (97)

### Backend (26)
1. `api/src/modules/products/{products,experiences,module,service,dto}.ts` — Módulo de productos y experiencias
2. `api/src/modules/tours/tours.*.ts` — Módulo de tours
3. `api/src/modules/hotels/hotels.*.ts` — Módulo de hoteles
4. `api/src/modules/restaurants/restaurants.*.ts` — Módulo de restaurantes
5. `api/src/modules/reservations/dto/index.ts` — DTOs de reservas
6. `api/src/modules/payments/dto/index.ts` — DTOs de pagos
7. `api/src/modules/platform-config/*` — Configuración de plataforma
8. `api/src/modules/traveler-photos/*` — Módulo de fotos de viajeros
9. `api/src/modules/notifications/dto/register-token.dto.ts` y `firebase-messaging.service.ts` — Push FCM
10. `api/src/common/guards/optional-jwt-auth.guard.ts` — Auth opcional
11. `api/_backfill.js` — Script one-off de backfill de datos

### Flutter (68)
12. `features/things_to_do/` (17 archivos) — Vista completa de cosas que hacer
13. `features/hotels/` (17 archivos) — Catálogo de hoteles con filtros
14. `features/restaurants/` (16 archivos) — Catálogo de restaurantes con filtros
15. `features/reservations/` (7 archivos) — Reservas con pago QR y Mis Reservas
16. `features/traveler_photos/` (8 archivos) — Fotos de viajeros
17. `features/home/data/{home_experience,experience_detail}.dart` + detail screen + provider (4 archivos)
18. `features/notifications/data/notifications_service.dart` + provider (2 archivos)
19. `test/data/` (4 archivos) — Tests de parseo y motor de filtros

### Web (3)
20. `web/src/pages/empresa/Experiences.tsx` — CRUD de experiencias del socio
21. `web/src/pages/empresa/Reservations.tsx` — Gestión de reservas del socio
22. `web/src/hooks/useReservations.ts` — Hook de reservas

---

## Verificación

1. `flutter analyze` sobre los archivos rediseñados y las features de things_to_do + reservations — **0 errores**
2. 11 commits creados en `develop`, cada uno agrupado por feature y verificado con `git status`
3. Working tree limpio (solo `api/server_log.txt` excluido deliberadamente de git)

---

## Pendiente para el Usuario

1. **Regenerar Prisma Client**: `cd api && npx prisma generate`
2. **Reconstruir BD**: `cd api && npx prisma db push --force-reset && npx prisma db seed`
3. **Revisar `api/_backfill.js`** — script one-off de backfill, evaluar si conservarlo
4. **Probar funcionalidad completa** en dispositivo/emulador (home, cosas que hacer, hoteles, restaurantes, reservas QR)
5. **Push a remoto**: `git push origin develop` (los 11 commits están solo en local)

---

## Próximos Entregables

1. **Integración de pago real** — El QR hoy genera el código; falta conectar pasarela de pago
2. **Verificación de identidad** del socio con QR de reserva
3. **Internacionalización completa** — Idiomas EN/PT funcionales
4. **Sistema de reseñas mejorado** — Editar/eliminar reseñas desde Mis Reseñas
5. **Mapa de cobertura** — Calcular comisiones por zona geográfica

---

## Estadísticas de la Sesión

| Métrica | Valor |
|---------|-------|
| Commits realizados | 11 |
| Archivos modificados | 132 |
| Archivos nuevos | 97 |
| Bugs corregidos | 2 |
| Features nuevas | 7 |
| Módulos backend nuevos | 9 |
| Endpoints nuevos | 24 |
| Líneas agregadas | 26285 |
| Líneas eliminadas | 2516 |
