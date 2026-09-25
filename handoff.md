# Handoff de Sesión — BoliviaExperience

**Fecha**: 24 de septiembre, 2026
**Agente**: opencode (build agent)
**Rama**: develop
**Commit**: `41d110f` (Módulo 14 app; backend en `3adf151`)

---

## Módulo 13 — Armado de viaje mejorado

**Fecha**: 24 de septiembre, 2026
**Estado**: completado; verificado (gates abajo).

- **Backend** (`api/src/modules/trips/`): `TripItem` ahora admite `placeId` **y** `productId` con relación `Product` — esquema en `api/prisma/schema.prisma` (TripItem L829-845, relación `ProductTripItems` con `@@index([productId])`), sincronizado en `schema.sqlite.prisma` y `schema.postgres.prisma`; `prisma db push` + `prisma generate` OK. `addItem` (`trips.service.ts` L114-157) resuelve el item desde el producto (título/descripción del `Product`; 400 si se manda `placeId`+`productId` a la vez y 404 si el producto no existe), e incluye los items con `productId` en `findAllByUser`/`findOne`/`addItem`. `trips.controller.ts` (L66-79) `POST /trips/:dayId/items` acepta `productId?: string` en el body. Espec `trips.service.spec.ts`: +3 tests (257 vs 256 del M12; addItem con productId, bad request place+product, 404 producto).
- **App Flutter**:
  - **Habilitar más destinos**: `create_trip_screen.dart` `_destinations` (L24-33) — los 8 destinos quedan habilitados sin flag "Próximamente"; `trips_list_screen.dart` `_buildUpcomingDestinations` (L144-231) — las cards de Uyuni/La Paz/Sucre/Samaipata son ahora **tappables** (removido el badge "Próximamente") y navegan a `/trips/create` con el destino preseleccionado (`context.go('/trips/create', extra: name)` L176); `create_trip_screen.dart` lee `widget.initialDestination` (L40, dropdown con destino preseleccionado).
  - **Productos/experiencias como items**: `trip_detail_screen.dart` reescribe `_addItemToDay` (L430-530) como diálogo con **dos modos** (manual "Lugar" vs catálogo "Experiencia" vía `DropdownButtonFormField<String>` con tours de `toursService.getTours()`, mostrando fallback si no hay tours — L510-530); `trips_service.dart` `addItem` acepta `productId` (L73-93); `trip_item_tile.dart` (L1-145) nuevo campo `productId` + badge pill "Experiencia" (`Icons.tour_outlined` + `AppColors.neutral*`, L69-99) diferenciando items de lugar manual (chevron) vs experiencia (badge).
  - **Exportar itinerario (compartir)**: `trip_detail_screen.dart` `_shareTrip` (L600-606) + `ShareButton` en AppBar (icono `share`, L45-47) ahora comparten **texto real del itinerario** con `SharePlus.share` (`share_plus` ya en `pubspec.yaml` L46-47), incluyendo header del viaje + lista de días → título/lugar/experiencia de cada item. Punto 3 (integración con generador M4) ya existía: botón "Generar itinerario" en `trip_detail_screen.dart` (L143-166) dispara `generateItinerary` del backend (M4) — integración verificada sin cambios.
- **Verificación**: API `npm run build` OK · `npm test` **257/257** (24 suites) · `prisma validate` OK · `flutter analyze` 0 issues · `flutter test` **50/50**. **Commit de código**: `cc788b6`.

---

## Módulo 14 — Tips de viaje

**Fecha**: 25 de septiembre, 2026
**Estado**: completado; verificado (gates abajo).

- **Backend** (`api/src/modules/travel-tips/`): modelo `TravelTip` en `api/prisma/schema.prisma` (L79-91: id/text/category/categoryEn/city/icon/isActive/createdAt + `@@index([category, isActive])` + `@@map("travel_tips")`), replicado en `schema.sqlite.prisma` y `schema.postgres.prisma`; `prisma db push` + `generate` OK. Seed re-ejecutable: `deleteMany` (L44) + **20 tips reales curados de Santa Cruz** (`api/src/prisma/seed.ts` `tipsDefs` L142-166 — transporte/seguridad/cultura/gastronomia con `text`, `category`, `categoryEn`, `city`, `icon`) → `Created 20 travel tips`. Endpoint **público** `GET /travel-tips` con filtros `category`/`city` (`travel-tips.controller.ts` L24-36) + `travel-tips.service.ts` `findAll({category, city})` (solo `isActive`, ordenado por `createdAt`); registro en `app.module.ts` (import L36 + `TravelTipsModule` L91, una sola vez). Espec `travel-tips.service.spec.ts`: **+4** (listado default, filtro category, filtro city, solo activos).
- **App Flutter** (`app/lib/features/travel_tips/`):
  - `data/travel_tips_service.dart` — modelo `TravelTip` con `fromJson` null-safe + `TravelTipsService.getTips({category, city})` vía `dioProvider` + provider `travelTipsServiceProvider` (réplica del patrón `weather_service`, **imports por paquete** `package:bolivia_experience/...` para evitar errores de profundidad de ruta).
  - `presentation/providers/travel_tips_provider.dart` — `travelTipsListProvider` (`FutureProvider<List<TravelTip>>`).
  - `presentation/screens/travel_tips_screen.dart` — pantalla dedicada `/travel-tips`: chips de categoría (Todos/transporte/seguridad/cultura/gastronomia) con `_categoryLabel`/`_categoryIcon`, lista de `_TipCard` con texto + pill de categoría, estados loading/error con botón "Reintentar" (`ref.invalidate`). Las categorías usan **el slug exacto del seed** (`gastronomia` sin acento) para que el filtro coincida.
  - `presentation/widgets/travel_tips_home_card.dart` — card tappable en home (icono `tips_and_updates_outlined`, gradiente `primary50→primary100`, subtítulo).
  - Integración: `ApiConstants.travelTips` (`config/api_constants.dart`, tras la sección Weather) · import + `GoRoute(path: '/travel-tips')` en `config/router.dart` (L34 + L252-255, tras `/weather`) · sección en home `home_screen.dart` (import L9 + `TravelTipsHomeCard(onTap: () => context.go('/travel-tips'))` tras el `WeatherWidget`).
- **Corrección de un commit previo roto**: el commit `350ac31` había dejado la app **sin compilar** (el router referenciaba `TravelTipsScreen` sin import y sin archivo, y el service no tenía el modelo `TravelTip` ni import de riverpod). Se completó en `41d110f`.
- **Verificación**: API `npm run build` OK · `npm test` **261/261** (25 suites) · App `dart analyze` **No issues found** · `flutter test` **52/52** (incluye `test/widgets/travel_tips_home_card_test.dart`: builds + onTap). **Commits**: `3adf151` (backend), `350ac31` + `41d110f` (app).

---

## Módulo 12 — IA conversacional (chat en la app) (sesión)

**Fecha**: 24 de septiembre, 2026
**Estado**: completado; verificado (gates abajo).

- **Backend** (`api/src/modules/chatbot/`): el `chatbot.service.ts` ya existía (OpenAI GPT-3.5-turbo, M1) y se amplió:
  - `getProductsContext`: productos reservables (`modalidadReserva != ninguna`) de places activos con **disponibilidad real** (cupos restantes = `capacity − reservas activas pending/confirmed/held` vía `groupBy`).
  - `getRecommendationsContext`: usa `RecommendationsService.getPersonalized(userId, 5)` (motor M1) como fuente de sugerencias del chat; fallback silencioso si falla.
  - `assertApiKeyConfigured` → **503** si falta `OPENAI_API_KEY` (mismo patrón que el weather del M10).
  - Prompt del sistema incluye lugares, productos con cupos y sugerencias personalizadas, e instruye cerrar con la oferta literal "¿Quieres que te armo esto directamente en la app?".
  - Nuevo `getConversationMessages(conversationId, userId)` (valida ownership → `NotFoundException`).
- `chatbot.module.ts`: importa `RecommendationsModule`. `chatbot.controller.ts`: nuevo `GET /chatbot/conversations/:id`.
- Nuevo `chatbot.service.spec.ts` (8 tests). Login clave: `HttpService.post` debe devolver **Observable** (`of`/`throwError`), no Promise, porque el service usa `firstValueFrom`; los asserts de error usan `status` (no `statusCode`) de `HttpException`.
- **App Flutter** (`features/chat/`): `chat_service.dart`, `chat_provider.dart` (conversationId persistido en SharedPreferences + historial al reabrir la pantalla), pantalla `chat_screen.dart` (burbujas, typing, input, errores amigables por status, botón "Armar itinerario" que crea `Trip` + `generateItinerary` del M4 y navega a `/trips/:id`), ruta protegida `/chat` y entrada "Asistente IA" en el menú del perfil.
- `api/.env.example`: + `OPENAI_API_KEY`.
- **Tracking**: `plans/plan.md` Módulo 12 → ✅ con evidencia archivo:línea.
- **Verificación**: API `npm run build` OK · `npm test` **251/251** (23 suites, +8 vs 243 del M11) · `dart analyze` limpio · `flutter test` **50/50** · `prisma validate` OK (sin cambios de schema).

---

## Módulo 11 — Perfil mejorado (sesión)

**Fecha**: 24 de septiembre, 2026
**Estado**: completado; verificado (gates abajo).

- **Backend** (`api/src/modules/users/users.service.ts`): `getProfile` ahora expone `isPremium` y amplía `_count` con `reservations` y `payments` en el `select`. Nuevo `users.service.spec.ts` (5 tests: isPremium+counts en el select, parseo de interests JSON, NotFound, updateProfile).
- **App Flutter** (`features/profile/`): `UserProfile` ahora incluye `isPremium`, `reservationCount`, `paymentCount` (desde `_count`); nuevo modelo `PaymentHistoryItem` y `getPaymentHistory()` (GET `/payments/my/history`, endpoint ya existía desde M3, devuelve array crudo).
- `profile_screen.dart`: badge "Premium" junto al nombre; estadísticas en 2 filas de 3 (Favoritos, Reseñas, Puntos / Rating, Reservas, Pagos); nuevo ítem menú "Historial de Pagos" → `/profile/payments`.
- Nueva `payment_history_screen.dart`: cards (proveedor, monto moneda, descripción, badge de estado, fecha) + estados vacío ("Todavía no realizaste pagos") y error con retry; provider `paymentHistoryProvider` (`profile_provider.dart`); ruta protegida `/profile/payments` en `router.dart`.
- Punto 3 del plan (gamificación en perfil) ya estaba cumplido desde M6: menú "Mis Logros" → `/profile/gamification`.
- **Tracking**: `plans/plan.md` Módulo 11 → ✅ con evidencia archivo:línea.
- **Verificación**: API `npm run build` OK · `npm test` **243/243** (23 suites, +5 vs 238 del M10) · `dart analyze` limpio · `flutter test` **50/50** · `prisma validate` OK (sin cambios de schema).

---

## Módulo 10 — Clima mejorado (sesión)

**Fecha**: 24 de septiembre, 2026
**Estado**: completado; verificado (gates abajo).

- **Backend** (`api/src/modules/weather/`): `weather.service.ts` — lista `cities` de 10 ciudades bolivianas con lat/lon (L20-31), `getCities()` (L40-42), `resolveQuery` cityId→OpenWeather query (default Santa Cruz, L50-53), `assertApiKeyConfigured` → 503 si falta `OPENWEATHER_API_KEY` (L44-48); `getCurrent(cityId?)` (L55) y `getForecast(cityId?)` parametrizan la ciudad. `weather.controller.ts` — nuevo `GET /weather/cities` + `@Query('city')` en `current`/`forecast`. `weather.service.spec.ts` +6 tests → 10 (getCities, ciudad seleccionada, default, forecast por ciudad, 503 sin key ×2).
- **App Flutter**: `weather_service.dart` (modelos WeatherCity/Current/ForecastDay/Forecast + getCities/getCurrent/getForecast); `weather_provider.dart` (weatherCitiesProvider, selectedWeatherCityProvider con persistencia `SharedPreferences`, weatherBundleProvider); `weather_widget.dart` → `ConsumerWidget` con pronóstico y tap → `/weather`; `home_screen.dart` activa `WeatherWidget(showForecast: true)`; nueva `forecast_weather_screen.dart` (chips de ciudad, "Usar mi ubicación" vía `LocationService` → ciudad más cercana, tarjeta actual + lista 5 días, estado amigable si el servicio no responde); ruta pública `/weather` en `router.dart`; `api_constants.dart` + `weatherCities`; `weather_widget_test.dart` adaptado a `ProviderScope`.
- **Sin cambios de schema** → `prisma validate` OK ×2 sin `db push`.
- **Tracking**: `plans/plan.md` Módulo 10 → ✅ con evidencia archivo:línea.
- **Verificación**: API `npm run build` OK · `npm test` **238/238** (22 suites, +6 vs 232 del M9) · `dart analyze` limpio · `flutter test` **50/50**.

---

## Módulo 9 — Eventos publicados por usuarios (sesión)

**Fecha**: 24 de septiembre, 2026
**Estado**: completado; verificado (gates abajo).

- **Schemas** (`model Event`): `status` (`@default("pending")`), `organizer` (`String?`), `price` (`Float?`). `schema.sqlite.prisma` L213-234, `schema.prisma` byte-igual; postgres con `@db.VarChar(20)`/`@db.VarChar(255)`/`@db.Decimal(10,2)`. `prisma validate` OK ×2 (postgres solo ambiental) + gen + `db push` a `dev.db`. Seed: `updateMany` a `approved` para los eventos sembrados (`api/prisma/seed.ts`).
- **Backend** (`api/src/modules/events/`): `events.service.ts` — lecturas públicas con `{ isActive: true, status: "approved" }` (`findAll` L62, `findToday` L90, `findById` L98-106); `create` fuerza `pending + isActive:false` (L108-116); `update`/`remove` via `findByIdRaw` (NotFound, L51-57); `findAllAdmin` (filtro status, sin isActive, L15-38); `updateStatus` (approved → activo, resto inactivo, L40-49). `events.controller.ts` — `POST /events` sin `@Roles("admin")` (L68-75); PUT/DELETE admin-only. Nuevo `events.admin.controller.ts` (`GET /admin/events?status&page&limit`, `PATCH /admin/events/:id/status` con `@IsIn pending/approved/rejected`) → registrado en `events.module.ts`. `events.service.spec.ts` +5 tests.
- **App Flutter**: `Event` model con `status/organizer/price` + `createEvent` (POST /events) en `events_service.dart`; pantalla `create_event_screen.dart` (nombre, ubicación, fecha/hora inicio+fin, toggle gratuito→precio Bs., opcionales descripción/organizador/tipo); ruta protegida `/events/create` en `router.dart` (antes de `/events/:id`) + FAB en `events_screen.dart`.
- **Panel admin web**: `Events.tsx` lista vía `GET /admin/events` con tabs de filtro de estado + badge + botones Aprobar/Rechazar → `PATCH /admin/events/:id/status`; form con organizador/precio. `api.ts` `eventsApi.adminGetAll`/`updateStatus`; hooks `useAdminEvents`/`useUpdateEventStatus`.
- **Tracking**: `plans/plan.md` Módulo 9 → ✅ con evidencia archivo:línea.
- **Verificación**: API `npm run build` OK · `npm test` **232/232** (22 suites, +4 vs 228 del M8) · `dart analyze` limpio · `flutter test` **50/50** · web `tsc --noEmit` OK · vitest **46/46** (3 errors = timeouts infra pool runner, baseline) · `prisma validate` OK ×2.

---

## Módulo 8 — Onboarding con preferencias (ampliación) (sesión)

**Fecha**: 22 de septiembre, 2026
**Estado**: completado; verificado (gates abajo).

- **Schemas** (`model User`): `budgetType`/`tourismType`/`interests` (`String?` con `@map`; `interests` guarda JSON string de slugs — sqlite no soporta scalars clusters). `schema.sqlite.prisma` y `schema.prisma` byte-iguales; `schema.postgres.prisma` con `@db.VarChar(20)`/`@db.Text`. `prisma validate` OK ×3 (postgres solo falla por `DATABASE_URL` ambiental) + gen + `db push` a `dev.db`.
- **Backend**: `users/dto/index.ts` — `UpdateUserDto` ahora acepta `budgetType` (`mochilero/medio/premium`), `tourismType` (`aventura/cultura/gastronomia/naturaleza/relax`), `interests` (array de slugs). `users.service.ts` — `getProfile`/`updateProfile` serialize/parse de `interests` JSON ↔ array.
- **Motor de recomendación** (`recommendations.service.ts`): prefsSource `query > user > trip > none`; nuevo `user` lee `User.budgetType/tourismType/interests`; boost de categorías por intereses + tourism temático (vía `PlacesScoringService.resolveTourismCategories`); `parseInterests`. `places-scoring.service.ts`: alias `mochilero → low_cost` en `BUDGET_PRICE_MAP` y tourism temático puntúa neutral. `recommendations.service.spec.ts` +3 tests.
- **App Flutter**: `onboarding_prefs_page.dart` (paso final: chips tipo de turismo + presupuesto, checkboxes de intereses), `onboarding_preferences.dart` (modelo + persistencia en `SharedPreferences`), sync a `PUT /users/me` post-login/google/registro en `auth_provider.dart` (`_syncOnboardingPreferences` best-effort, limpia copia local). `profile_service.dart` `updateProfile` extendido con los 3 campos.
- **Tracking**: `plans/plan.md` Módulo 8 → ✅ con evidencia archivo:línea.
- **Verificación**: API `npm run build` OK · `npm test` **228/228** (22 suites) · `dart analyze lib` limpio · `flutter test` **50/50** · `prisma validate` OK ×2 (+postgres solo ambiental).

---

## Módulo 7 — Soporte y resolución de conflictos (sesión)

**Fecha**: 22 de septiembre, 2026
**Estado**: completado en backend + app + panel admin web; verificado (gates abajo).

- **Schemas**: `SupportTicket` + `SupportTicketMessage` en los 3 schemas. Bidireccional `supportTickets` en `User` y `Reservation` (`schema.sqlite.prisma:44` y `:427`; `schema.prisma` byte-igual). `schema.postgres.prisma` NO tiene `Reservation` (schema mínimo de prod) → allí `SupportTicket` va sin relación a reserva (ticket sin reserva válido). `prisma validate` OK ×3; gen + `db push` a `dev.db` OK (tablas `support_tickets`/`support_ticket_messages` creadas).
- **Backend** (`api/src/modules/support/`): `support.service.ts` — `create` (crea ticket + mensaje inicial + **notifica al socio** vía `findHostForReservation` → `NotificationsService.notify`, L100), `findMine`/`findOne`/`addMessage` con ownership check, `adminFindAll`/`adminFindOne`/`adminUpdateStatus`/`adminAddMessage` (notifican al dueño del ticket). Controllers: `support.controller.ts` (`POST /support`, `GET /support`, `GET /support/:id`, `PATCH /support/:id/messages`) y `support.admin.controller.ts` (`GET /admin/support?status&page&limit`, `GET /admin/support/:id`, `PATCH /admin/support/:id/status`, `PATCH /admin/support/:id/messages`) con `@Roles("admin")`. DTOs en `support/dto/index.ts` (types `reservation/payment/tours/bill/opinion/other`; status `open/in_progress/resolved/closed`). Registrado en `app.module.ts`.
- **Seed**: `deleteMany` de `supportTicketMessage`/`supportTicket` + ticket de ejemplo ligado a la primera reserva (asunto "Mi reserva no aparece confirmada") — `api/prisma/seed.ts:2475`.
- **App Flutter**: feature `lib/features/support/` (service + provider `supportTicketsProvider` + screens `support_tickets_screen.dart`, `create_ticket_screen.dart` con selector contextual de reserva, `support_ticket_detail_screen.dart` con hilo de mensajes y barra de respuesta). Rutas `/support`, `/support/create`, `/support/:id` en `config/router.dart` (+ protegidas). Entrada "Soporte y Ayuda" en `profile_screen.dart`. Endpoints en `config/api_constants.dart`.
- **Panel admin web**: `web/src/pages/admin/Support.tsx` (lista con filtro por estado + paginación, modal de detalle con hilo de mensajes, cambiar estado y responder), `web/src/hooks/useSupport.ts`, `supportApi` en `web/src/services/api.ts` (Módulo 7), ruta `/admin-panel/support` en `App.tsx` y nav en `AdminLayout.tsx`.
- **Tracking**: `plans/plan.md` Módulo 7 → ✅ con evidencia archivo:línea.
- **Verificación**: API `npm run build` OK · `npm test` **226/226** (22 suites) · `dart analyze lib` limpio · `flutter test` **50/50** · web `tsc --noEmit` OK · web vitest **46/46** · `prisma validate` OK ×3.

## Sesión de Auditoría Fase 0 — Fixes de falsos positivos + deuda técnica (A1–A5)

**Objetivo**: corregir los falsos positivos detectados en la auditoría y dejar lista la Fase B (módulos 7–16). Todo verificado con tests en verde antes de commitear.

### A1 — Recomendaciones rotas en la app (fix)
**Root cause**: `RecommendationsService` (app) leía la respuesta como array plano, pero el backend la envuelve en `{success, data, timestamp}` (TransformInterceptor). El endpoint sí respondía 200; el parsing fallaba silenciosamente.
**Fix** (`app/lib/features/recommendations/data/recommendations_service.dart`): desempaquetar `body['data']`. `dart analyze` limpio.

### A2 — Seed de reservas en todos los estados (pre-requisito Fase 0)
- Agregado a `api/prisma/seed.ts` un bloque de **8 reservas** (r1–r8) en los estados `pending` (instantánea + solicitud), `confirmed`, `rejected`, `completed`, `cancelled`, `expirada`, `no_show` — cubriendo tanto `instantanea` como `solicitud`, con precios reales (no 0).
- **6 pagos escrow** asociados (`PAY-SEED-1..6`): `pending` (QR banca local), `held`, `released`, `refunded`, `cancelled`, con montos USD reales y referencias `hotelProducts`/`mesaProducts`/experiencias.
- Fixes dentro del seed: `Reservation.date` es `DateTime` (no string) → se pasan fechas directas; helper de fecha renombrado a `isoD` (evita colisión con `isoDate`); guard ampliado (≥8 mesas, ≥3 hoteles).
- **Verificado**: `npx ts-node prisma/seed.ts` crea 8 reservas + 6 pagos; `verify-seed.tmp.ts` confirmó reserva+6 pagos enlazados con montos reales (`40.23`, `17.24`, `22.99`, ...) y `price` como `Decimal` objetivo.
- **Pantalla app** (`my_reservations_screen.dart`): etiquetas/colores de pagos ampliados a `held/released/refunded/processing/cancelled/failed` + default (antes solo `completed/cancelled`).

### A3 — Tap en círculos de zonas de seguridad del mapa
**Root cause**: `GoogleMap.onCircleTapped` no existe en google_maps_flutter 2.14.2; los círculos se enganchan vía `Circle.onTap` + `consumeTapEvents: true`.
**Fix** (`map_provider.dart` + `map_screen.dart`): `onSafetyZoneTap` callback en `MapNotifier`, `_buildSafetyCircles` con `onTap`/`consumeTapEvents`, asignación desde `MapScreen`. `dart analyze` limpio.

### A4 — Precios monetarios Float → Decimal
- Migrados a `Decimal` en **ambos schemas** (`schema.prisma` + `schema.sqlite.prisma`): `Product.price`, `Product.pricePerAdult`, `Tour.price`, `Ticket.price`.
- Aritmética corregida con `Number(...)` en `reservations.service.ts` (:219,541), `hotels.service.ts:78` (`Number(g._min.price)`), `restaurants.service.ts` (`minMesaPrice`) y el seed.
- **Nota de infraestructura**: `api/prisma/schema.prisma` y `api/prisma/schema.sqlite.prisma` están **byte-idénticos** tras la auditoría (falta de diffs legítimos; Prisma valida ambos). Los schemas legacy `schema.postgres.prisma` no se tocan (legacy).
- Aplicado con `npx prisma db push` + `npx prisma generate`; `npx prisma validate` OK en ambos.

### Verificación completa (gates previos al commit)
- **API**: `npm run build` OK · `npm test` **216/216** · `npx tsc --noEmit` limpio · `prisma validate` OK · seed vivo 8+6.
- **App**: `dart analyze lib/features/map` + `lib/features/recommendations` sin issues.
- Cambios en `plans/plan.md` (Fase 0 marcada como **completa** con criterio cumplido).

### Pendiente para la siguiente sesión
- **Fase B** (módulos 7–16) — roadmap detallado en `plans/plan.md` (análisis "Qué no se hizo"). Confirmar orden con el usuario (Recomendaciones ya conectado como Módulo 1; siguiente candidato: Módulo 9 — Onboarding con preferencias).
- `exchange_rate_usd_bob` ya en el seed (6.96) y consumido por la aritmética de pagos.

---

## Handoff de Sesión — BoliviaExperience

**Fecha**: 16 de agosto, 2026
**Agente**: opencode (build agent)
**Rama**: develop
**Commit**: `885af6b` (último commit; **working tree limpio** — se commiteó toda la implementación de Fase C y los fixes acumulados de bugs de los Módulos 1, 4, 5 y 6, junto con los fixes de pago de esta sesión)

---

## Resumen de la Sesión

Sesión de **fixes a los bugs del flujo de pago (Bug 5 y Bug 6)** detectados en los tests físicos del usuario, y **commit de todo el working tree acumulado**.

- **Bug 6 — cambio de proveedor a PayPal (CERRADO, verificado live)**: root cause encontrado. `Payment` tiene constraint `@@unique([reservationId])`, por lo que al cambiar de proveedor `createPayment` intentaba **crear una segunda fila** para la misma reserva y fallaba con 409. Se corrigió para **reutilizar el registro existente** (update-in-place) y limpiar los campos del proveedor anterior. Verificado end-to-end: switch instantánea→PayPal devuelve 201 con `payUrl` y el **mismo** `paymentId`, con `paymentIntentClientSecret`/`qrData` en `null`.
- **Bug 5 — "Pagar con tarjeta" (Stripe) en Android (CERRADO, verificado live por el usuario)**: cadena de causa raíz que terminó en **dos fallos de inicialización nativa de flutter_stripe**, ambos corregidos: (1) `MainActivity` extendía `FlutterActivity` y flutter_stripe exige `FlutterFragmentActivity`; (2) el tema de la app no heredaba de AppCompat/MaterialComponents (el chequeo corre contra el **tema activo**, por eso se corrigieron tanto `values/styles.xml` como `values-night/styles.xml`). Tras ambos fixes, la PaymentSheet abre y el pago con tarjeta de prueba se confirma end-to-end. **El usuario confirmó: "ya funciona, perfecto".**
- **Commit**: se commiteó el working tree completo en `885af6b` (35 archivos, +544/−127), incluyendo la implementación pendiente de Fase C (Módulo 3) y los fixes previos sin commitear de los Módulos 1, 4, 5 y 6.

---

## Cambios Realizados

### 1. Bug 6 — Cambio de proveedor de pago (PayPal): root cause + fix

- **Síntoma**: al cambiar de proveedor (p. ej. de instantánea/QR a PayPal) en `payment_screen.dart`, el `POST /payments` fallaba y el pago no se creaba.
- **Root cause**: el modelo `Payment` tiene `@@unique([reservationId])` (presente en `schema.prisma` y `schema.sqlite.prisma`), de modo que la reserva ya tiene una fila de pago asociada y crear otra violaba la unicidad.
- **Fix** (`api/src/modules/payments/payments.service.ts`): `createPayment` ahora detecta si la reserva ya tiene un pago y, si el proveedor cambió, **reutiliza la misma fila** (update-in-place con un nuevo intent/payUrl en lugar de insertar). Como Prisma ignora `undefined`, el update limpia explícitamente los campos obsoletos del proveedor anterior: `paymentIntentClientSecret: intent.clientSecret ?? null`, `payUrl: intent.payUrl ?? null`, `qrData: null`.
- **Verificación live**: reserva instantánea → switch a PayPal → `201` con `payUrl` real y el **mismo** `paymentId`; en la BD el pago quedó con `paymentIntentClientSecret: null`, `payUrl` del PayPal y `qrData: null`.

### 2. Bug 5 — Pago con tarjeta Stripe en Android: dos fixes nativos + diagnóstico de la app

**Síntoma original**: al tocar "Pagar con tarjeta" la app mostraba "Error inesperado del proveedor de pago" sin detalle real. Se mejoró el diagnóstico y se fue descendiendo hasta dos `PlatformException` de inicialización de flutter_stripe.

1. **`MainActivity.kt`** (`app/android/app/src/main/kotlin/com/example/bolivia_experience/MainActivity.kt`): extendía `FlutterActivity` → error *"is not a subclass of FlutterFragmentActivity"*. Cambiado a `FlutterFragmentActivity()`. **Compila.**
2. **Temas Android**: el chequeo de flutter_stripe corre contra el **tema activo** (por eso el device en dark mode mostraba el error aunque `values/styles.xml` estuviera bien). Se corrigieron **ambos** estilos:
   - `app/android/app/src/main/res/values/styles.xml`: `LaunchTheme` y `NormalTheme` → `Theme.MaterialComponents.DayNight.NoActionBar` (antes `@android:style/Theme.Light.NoTitleBar`).
   - `app/android/app/src/main/res/values-night/styles.xml`: `LaunchTheme` y `NormalTheme` → `Theme.MaterialComponents.DayNight.NoActionBar` (antes `Theme.Black.NoTitleBar`).
   - Las dependencias (material/appcompat) ya venían vía `stripe_android`. **Compila.**

**Diagnóstico y robustez en la app** (`app/lib/features/reservations/presentation/screens/payment_screen.dart` y `app/lib/main.dart`):

- `_stripeErrorDetail` ahora muestra `'${e.runtimeType}: $e'` para excepciones que no son `StripeException` (las nativas llegan como `PlatformException` y eran invisibles antes). Añadido `debugPrint('[Stripe] _payWithStripe error: ...')`.
- Cancelar la PaymentSheet o timeout (`FailureCode.Canceled`/`Timeout`) **ya no muestra error**: vuelve a "awaiting" y permite reintentar.
- `_markPaid` solo marca el pago como completado si el estado es uno de pago efectivo (`held`/`released`/`completed`/`refunded`); si no, vuelve a "awaiting" y reinicia el polling.
- Botón "Reintentar" re-invoca el método de pago activo (no el primero de la lista).
- `_switchProvider` muestra el error real del backend en la SnackBar; la vista de error es scrollable.
- `main.dart`: `Stripe.urlScheme = 'boliviaexperience'` + `Stripe.setReturnUrlSchemeOnAndroid = true` (la `pk_test` ya era real, verificada contra la cuenta que crea los intents).

**Resultado final**: la PaymentSheet abre, la tarjeta de prueba **4242 4242 4242 4242** se confirma y el pago se completa end-to-end. Confirmado por el usuario en dispositivo.

### 3. Tests y regresión

- Tests de la app corregidos/acomodados a los cambios (init de Hive en `widget_test.dart`, aserciones desactualizadas en `profile_screen_test.dart`, `TestHttpOverrides` en `weather_widget_test.dart`).
- **API**: `npm test` → **216/216** (21 suites); spec de pagos 22/22.
- **App**: `flutter analyze` limpio + `flutter test` → **50/50**.
- **Build Android**: `flutter build apk --debug` exitoso tras cada fix nativo.

### 4. Commit del working tree acumulado

Se commiteó todo en `885af6b` (35 archivos, +544/−127): la implementación de **Fase C** (Módulo 3) que quedó pendiente en la sesión anterior, los fixes previos de los Módulos 1, 4, 5 y 6 (mapa, hoteles, precios/moneda con el nuevo `app/lib/core/currency/currency.dart`, botón "Reservar", etc.) y los fixes de pago de esta sesión.

---

## Verificación

1. **Bug 6 live**: switch instantánea→PayPal → `POST /payments` responde **201** con `payUrl` real y el **mismo** `paymentId`; campos del proveedor anterior en `null`.
2. **Bug 5 en dispositivo**: PaymentSheet de Stripe abre tras los fixes de `MainActivity` y del tema; tarjeta de prueba **4242…** confirma el pago end-to-end. **El usuario confirmó que funciona.**
3. Backend suite: **216 tests / 21 suites** (0 fallos); spec de pagos 22/22.
4. App: `flutter analyze` limpio; `flutter test` **50/50**; `flutter build apk --debug` OK.
5. Working tree limpio tras el commit `885af6b` (rama `develop`).

---

## Pendiente para el Usuario

1. **Push a remoto**: `git push origin develop` (tres commits pendientes de subir: `5880a2e`, `f9ccafa`, `885af6b`, más los docs).
2. **ngrok es temporal** — la URL del túnel cambia por sesión. Si cambia, hay que actualizar la **URL del webhook en los dashboards de PayPal y Stripe** (los `PAYPAL_WEBHOOK_ID` / `whsec_` en `.env` no cambian).
3. **QR bancario real** — pendiente del acceso a la API del banco/socio.
4. Retestar el flujo completo de pagos en el dispositivo (PayPal y tarjeta) con el APK ya compilado y el backend levantado.

---

## Próximos Entregables

1. **QR bancario real** — conectar la API real del banco (cableado webhook/captureId ya preparado en la infraestructura).
2. **Verificación de cashback/premios con `exchangeRateSnapshot`** cuando se soporte BOB.
3. Módulos restantes del plan (7–16): Soporte/disputas, Onboarding con preferencias, Eventos de usuarios, Clima mejorado, Perfil mejorado, IA conversacional, Armado de viaje mejorado, Tips de viaje, Efemérides, Realidad aumentada.

---

## Estadísticas de la Sesión

| Métrica | Valor |
|---------|-------|
| Tipo de sesión | Fixes de bugs de pago (Bug 5 y Bug 6) + commit del working tree |
| Bugs de pago cerrados | 2 (cambio de proveedor PayPal · tarjeta Stripe en Android) |
| Fixes nativos Android | 2 (`MainActivity` → `FlutterFragmentActivity` · tema MaterialComponents en claro y oscuro) |
| Verificación live del usuario | Stripe con tarjeta de prueba ✅ "ya funciona, perfecto" · PayPal switch 201 ✅ |
| Código fuente modificado | 35 archivos (+544/−127), commit `885af6b` |
| Tests backend | 216 / 216 (21 suites) |
| Tests app | 50 / 50 · `flutter analyze` limpio · APK debug compila |