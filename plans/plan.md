# Plan de ejecución completo — BoliviaExperience

> **Fuente**: plan definitivo, ya auditado y acordado (sesión previa).
> **Regla de ejecución**: seguir **este orden exacto**, un ítem a la vez. No saltarse pasos ni cambiar el orden — las dependencias entre ítems ya fueron verificadas. Al terminar cada ítem, confirmar explícitamente qué se hizo, con evidencia (archivo:línea), antes de pasar al siguiente.

**Total**: 2 pre-requisitos + 17 filas de trabajo, que cubren los 16 módulos de producto identificados en la auditoría previa (el módulo "Mapa" y "Zonas de seguridad" se ejecutan juntos en una sola fila; el módulo "Sistema de reservas" y el módulo "Recomendación + onboarding" se dividen en varias filas cada uno por fases).

---

## Fase 0 — Seed de reservas en todos los estados (pre-requisito)

**Por qué va primero**: sin datos de prueba en cada estado, no se puede verificar visualmente que la app y el panel del socio manejan bien los casos límite.

Agregar a `seed.ts` reservas de ejemplo cubriendo los estados: `pending`, `confirmed`, `rejected`, `cancelled`, `completed`, `no_show`, `expirada`, con sus pagos asociados en los estados correspondientes de escrow (`pending`, `held`, `released`, `refunded`). Cubrir tanto modalidad `instantanea` como `solicitud`.

**Criterio de aceptación**: `my_reservations_screen.dart` (app) y `Reservations.tsx` (panel socio) deben poder mostrar al menos un caso de cada estado sin errores.

---

## Fase 0.5 — Corrección de deuda técnica en dominio pagos/reservas (pre-requisito)

**Por qué va antes de tocar pagos reales**: estos bugs están en el camino directo de la integración de pasarela real; construir sobre ellos propaga errores a transacciones con dinero real.

Corregir:

1. `capacity: 0` se interpreta como "sin límite" y bloquea bookings silenciosamente — corregir en `reservations.service.ts:161-172`.
2. Race condition en `createInstantanea()` — es un read-then-write sin locking (`reservations.service.ts:160-170`). Agregar transacción atómica o lock optimista sobre el cupo.
3. `createSolicitud()` no valida capacidad al momento de confirmar (`reservations.service.ts:238-258`) — debe revalidar antes de confirmar, no solo al crear la solicitud.
4. Todos los campos monetarios usan `Float` en vez de `Decimal` (`schema.prisma:614,620,622,547-549,359`) — migrar a `Decimal` para evitar errores de redondeo.
5. Sin constraint de unicidad en pagos por reserva — agregar constraint único para que no se puedan crear dos pagos activos para la misma reserva.

**Criterio de aceptación**: los 5 puntos corregidos y verificables en el código, con tests o al menos una prueba manual documentada de cada corrección.

---

## Módulo 1 — Conexión del motor de recomendación a la app

El backend (`recommendations.service.ts`, `places-scoring.service.ts`) ya funciona; la app nunca lo llama.

1. Agregar `/recommendations/personalized` a `api_constants.dart`.
2. Crear `features/recommendations/` con service + provider que consuma ese endpoint.
3. Crear pantalla "Recomendado para ti" accesible desde home.
4. **Fallback sin onboarding**: usar las preferencias (`budgetType`, `tourismType`) del `Trip` más reciente del usuario como input al endpoint, para no depender de que el onboarding (módulo 8, más adelante) ya esté ampliado.
5. Agregar botón/entrada "Ver recomendados" en home.

**Sin dependencias.** Es el desbloqueador de los módulos 4 y 12 más adelante.

---

## Módulo 2 — Promociones de socios

✅ Ya implementado y conectado end-to-end. **No requiere acción.** Confirmar que sigue funcionando antes de continuar (regresión rápida), nada más.

---

## Módulo 3 — Integración de pasarela de pago real

**Depende de**: Fase 0 (seed) y Fase 0.5 (deuda técnica corregida) — no empezar sin esos dos completos.

**Enfoque decidido (Fases)**: pasarela multi-proveedor con capa de abstracción. No depender de un único banco.

### Fase A (✅ completa) — Abstraction layer + modelo de datos
1. ✅ Interface `PaymentProvider` (backend) con `createPaymentIntent`, `retrievePaymentIntent`, `refund`, `verifyWebhookSignature`, `isEnabled`.
2. ✅ `PaymentProviderRegistry` con feature flags por proveedor (`payments_provider_<name>_enabled`) + `isEnabled` (config/keys reales).
3. ✅ Modelos: `Payment` extendido (`provider`, `idempotencyKey`, `providerTransactionId`, `paymentIntentClientSecret`, `paymentMethodType`, `exchangeRateSnapshot`) y `PaymentWebhookEvent` (auditoría, en 3 schemas + `db push`).
4. ✅ Providers: `StripeProvider` (USD, sandbox), `PayPalProvider` (USD, sandbox, Fase C), `BancoQrProvider` (stub, deshabilitado hasta acceso real al banco).
5. ✅ `POST /payments` con idempotencia por reserva (devuelve el pago activo existente si lo hay) + escrow/commission + `clientSecret` para PaymentSheet.

### Fase B (✅ completa) — Stripe real: confirmación + webhook
1. ✅ `POST /payments/:id/confirm`: el servidor SIEMPRE valida contra Stripe vía `retrievePaymentIntent` antes de marcar `held` (el aviso del cliente nunca es fuente de verdad).
2. ✅ Webhook `POST /payments/webhook/:provider` (fuente de verdad en prod): valida firma con `constructEvent`, registra en `PaymentWebhookEvent`, marca `held` y confirma la reserva de forma idempotente (guard terminal).
3. ✅ `createReservation` (instantánea) provisiona PaymentIntent real en Stripe y asocia clientSecret; fallback QR simulado si Stripe está deshabilitado.
4. ✅ Flutter: `flutter_stripe` + PaymentSheet cuando `provider==stripe`; QR como fallback (pasar `provider` + `clientSecret` por el router).
5. ✅ **Sandbox B5 verificado live contra API de test de Stripe**: PaymentIntent real creado por el backend → confirmado con tarjeta test → `payment_intent.succeeded` firmado aceptado → payment `held`, reserva `confirmed`, re-envío idempotente. Stripe CLI forward a `/api/v1/payments/webhook/stripe` recibido con `sigValid:true`. Firma inválida rechazada con 400 (correcto).

### Fase C (✅ completa y verificada live — pasarela multi-proveedor: Stripe + PayPal + QR en infraestructura)
1. ✅ **Conversión de moneda (C.1)**: `PlatformConfigService.getFloat("exchange_rate_usd_bob")`; endpoints admin `GET/PUT /admin/config/exchange-rate-usd-bob`; los proveedores USD (`stripe`/`paypal`) cobran en USD convirtiendo el total BOB con la tasa; se persiste `exchangeRateSnapshot` en el pago. Test unitario.
2. ✅ **PayPalProvider real (C.2)**: `PayPalProvider` (Checkout Orders v2 vía REST/fetch, sin SDK) con OAuth2 token cacheado, `createPaymentIntent` (crea orden → `payUrl` approve), `retrievePaymentIntent`, `capture` (devuelve `captureId` → `payment.transactionId` para refunds), `refund` (por captureId) y `verifyWebhookSignature`. Registrado en `PaymentProviderRegistry` (flag `payments_provider_paypal_enabled`, default false). Webhook: `CHECKOUT.ORDER.APPROVED` captura + marca `held`; `PAYMENT.CAPTURE.COMPLETED` refuerza y guarda el captureId. `.env`: `PAYPAL_MODE`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`. Tests unitarios.
3. ✅ **Idempotencia por proveedor + selector en app (C.4)**: `createPayment` cancela el pago activo anterior si cambia de proveedor y crea uno nuevo (idempotencia POR PROVEEDOR, no solo por reserva). App: selector de método de pago en `payment_screen.dart` (Tarjeta/Stripe · PayPal · QR bancario [próximamente]) que recrea el pago vía `POST /payments` con el `provider` elegido y re-renderiza (PaymentSheet / lanzar payUrl con `url_launcher` / QR). `createPayment` de la app acepta `provider`; `serializePayment` devuelve `qrData`.
4. ✅ **Infraestructura QR banco (C.3)**: `BancoQrProvider` (adapter genérico) deshabilitado mientras el banco/socio no dé acceso a su API; `.env` con keys `QR_BANCO_*` de plantilla; UI con QR "Próximamente". El cableado webhook/captureId se completará con la API real.
5. ✅ **Verificación live en sandbox (sesión 16/08/2026)**: compra real end-to-end verificada — `POST /payments` con `provider=paypal` crea el pago USD con `payUrl`; aprobado con cuenta sandbox → webhooks reales `CHECKOUT.ORDER.APPROVED` + `PAYMENT.CAPTURE.COMPLETED` recibidos por ngrok con `sigValid=true` → pago `held` con `transactionId`=captureId real `6TC46704SN4546024`. El simulador del dashboard también genera eventos con firma válida, pero su orden ficticia falla al capturar (404 esperado, la orden no existe en sandbox).
6. ✅ **Fixes de bugs de pago verificados live en dispositivo (16/08, 2ª sesión)**: **cambio de proveedor a PayPal** — `createPayment` reutiliza la fila de pago existente (constraint `@@unique([reservationId])`) en vez de crear una segunda (switch instantánea→PayPal devuelve 201 con `payUrl` y el mismo `paymentId`, limpiando `paymentIntentClientSecret`/`payUrl`/`qrData`); **tarjeta Stripe en Android** — `MainActivity` → `FlutterFragmentActivity` y tema `Theme.MaterialComponents.DayNight.NoActionBar` en `values` y `values-night` (flutter_stripe valida contra el tema activo). La PaymentSheet abre y el pago con tarjeta de prueba se confirma end-to-end. Todo commiteado en `885af6b`.
7. Pendiente (requiere acceso externo): integración de QR bancario real y verificación de cashback/premios con `exchangeRateSnapshot` cuando se soporte BOB.

**Nota**: para correr las keys de Stripe TEST usadas: `sk_test`/`pk_test`/`whsec_` en `api/.env`; la `pk_test` va a la app con `--dart-define=STRIPE_PUBLISHABLE_KEY=...`.

---

## Módulo 4 — Itinerario automático por reglas

**Depende de**: Módulo 1 (motor de recomendación conectado). **No depende de IA conversacional (módulo 12)** — es lógica de reglas, no un LLM.

1. Crear endpoint `POST /trips/:id/generate` que use `recommendations.service.ts` + `places-scoring.service.ts`.
2. Lógica: dado destino + fechas + preferencias del usuario, seleccionar places/productos relevantes, distribuirlos por día, ordenar por proximidad geográfica.
3. Botón "Generar itinerario" en `create_trip_screen.dart` o `trip_detail_screen.dart`.
4. El borrador debe ser editable (los `TripItem` ya existen en el modelo, reutilizar esa estructura).

---

## Módulo 5 — Mapa mejorado + Zonas de seguridad (una sola pasada sobre `map_screen.dart`)

**Sin dependencias.**

1. Markers diferenciados por categoría (colores/íconos distintos por tipo de lugar/producto en el mapa).
2. Agregar capa de eventos en el mapa (markers de eventos con fecha/hora).
3. Modelo `SafetyZone`: nombre, latitud, longitud, `radioKm`, `nivelRiesgo` (bajo/medio/alto), descripción, ciudad.
   - **MVP explícito: punto + radio (círculo), NO polígonos.** Usar distancia Haversine para determinar si un punto cae dentro de la zona. No implementar point-in-polygon.
4. Seed con ~5 zonas de Santa Cruz.
5. Endpoint admin CRUD (`/admin/safety-zones`) + endpoint público (`GET /map/safety-zones?...bounds`).
6. Capa de círculos coloreados por nivel de riesgo en `map_screen.dart`.

Hacer los 3 sub-trabajos (íconos, eventos, zonas) en una sola pasada sobre el archivo del mapa, no en momentos separados.

---

## Módulo 6 — Gamificación

**Sin dependencias** (decisión de producto confirmada: Opción A, lanzar con datos simulados).

1. ✅ Otorgar puntos por reserva completada en `reservations.service.ts:complete()` usando `totalAmount` (dato simulado hoy, se recalibrará cuando el pago real del módulo 3 esté integrado). Evidencia: `reservations.service.ts` (puntos:577-585) llama `gamification.grantReservationPoints(userId, Number(totalAmount))` y devuelve `pointsEarned`/`badgesEarned` (línea 606). Smoke test E2E: completar reserva de 160 BOB → +160 pts (350→510).
2. ✅ Crear modelo `Badge` (nombre, descripción, ícono, condición de obtención). Modelos `Badge` y `UserBadge` (relación N:M con `User`, unique `[userId, badgeId]`) en `schema.prisma`, `schema.sqlite.prisma`, `schema.postgres.prisma` + `db push`. Seed: 5 badges (`seed.ts`).
3. ✅ Lógica de asignación de badges. `gamification.service.ts` (evaluateBadges: cuenta reservas completadas / reseñas / favoritos y asigna badges no ganados; grantReservationPoints con mínimo 1). Endpoints `GET /gamification/me` y `GET /gamification/badges` en `gamification.controller.ts`; `points` + `userBadges` en `users.service.ts:getProfile`.
4. ✅ Pantalla de gamificación en el perfil (puntos + insignias). `gamification_screen.dart` (hero de puntos + grid de insignias ganadas + catálogo de próximos logros), ruta `/profile/gamification`, menú "Mis Logros" en `profile_screen.dart`.
5. ✅ Mostrar `points` en `profile_screen.dart` (el campo existía en DB pero no se mostraba). Stats row ahora incluye "Puntos"; menú "Mis Logros" muestra `pts · insignias` desde `UserProfile.points/badgeCount`.

**Reglas de UI obligatorias** (para no romper confianza cuando se recalibre con pago real):
- **No mostrar un ratio fijo tipo "1 dólar = 1 punto"** como promesa permanente en la interfaz. Usar lenguaje como "gana puntos por tus reservas", sin comprometer el ratio exacto en pantalla. ✅ Cumplido: la UI dice "Gana puntos por tus reservas completadas", sin exponer ratio.
- **Los puntos ya otorgados a un usuario nunca se reducen** al recalibrar la tasa de acumulación — solo cambia la tasa para reservas futuras. ✅ El `increment` en `grantReservationPoints` nunca decrementa.

---

## Módulo 7 — Soporte y resolución de conflictos

**Depende de**: Módulo 3 (pago real integrado) — en el momento en que el dinero se mueve de verdad, el canal de disputas deja de ser opcional.

1. Modelo `SupportTicket`: `userId`, tipo (reserva/pago/error/reclamo), status (open/answered/closed), mensajes.
2. Endpoint CRUD + endpoint admin para gestionar tickets.
3. Pantalla en la app: crear ticket de forma contextual desde el detalle de una reserva, listar tickets propios, ver respuestas.
4. Panel admin: lista de tickets, filtro por estado, responder.
5. Notificación al socio cuando se abre un ticket relacionado con una reserva suya.

---

## Módulo 8 — Onboarding con preferencias (ampliación)

**Depende de**: Módulo 1 (motor conectado). Es una mejora de precisión sobre el fallback de `Trip` que ya funciona desde el módulo 1 — no bloqueante, pero mejora la calidad de las recomendaciones.

1. Agregar paso de preferencias al onboarding: tipo de turismo (aventura/cultura/gastronomía/naturaleza/relax), rango de presupuesto (mochilero/medio/premium), intereses (checkboxes).
2. Guardar respuestas en `/users/me` (nuevos campos `budgetType`, `tourismType` si no existen ya en `User`).
3. Conectar esas preferencias como input directo al motor de recomendación (reemplazando o complementando el fallback de `Trip`).

---

## Módulo 9 — Eventos publicados por usuarios

**Sin dependencias.**

1. Endpoint `POST /events` para usuarios regulares (hoy solo `@Roles("admin")` puede crear eventos).
2. Agregar campo `status` al modelo `Event`: `pending` → `approved` / `rejected`.
3. Flujo de moderación: el admin aprueba/rechaza desde su panel antes de que el evento sea visible públicamente.
4. Pantalla "Crear evento" en la app (nombre, ubicación, hora, gratuito o de pago, y campos opcionales: descripción, organizador, tipo de evento).
5. Los eventos en estado `pending` no deben ser visibles para otros usuarios.

---

## Módulo 10 — Clima mejorado

**Sin dependencias.** El backend ya usa la API real de OpenWeatherMap; falta pulir la app.

1. Agregar selección de ciudad (basada en ubicación del usuario o preferencia manual) — hoy está hardcodeado a Santa Cruz.
2. Mostrar el pronóstico de 5 días (hoy el widget lo soporta pero `showForecast` está en `false` por defecto — activarlo).
3. Crear pantalla dedicada "Pronóstico de Clima".
4. Manejar de forma robusta el caso en que la API key de OpenWeatherMap no esté configurada (no debe romper la app).

---

## Módulo 11 — Perfil mejorado

**Depende de**: Módulo 6 (gamificación, para mostrar puntos/badges) y Módulo 3 (pagos, para el historial).

1. Agregar `points` e `isPremium` al modelo `UserProfile` de la app (existen en DB pero no se exponen en el perfil hoy).
2. Agregar contador de reservas y contador de pagos en las estadísticas del perfil.
3. Integrar la pantalla de gamificación (del módulo 6) dentro del perfil.
4. Agregar historial de pagos en el perfil.

---

## Módulo 12 — IA conversacional (chat en la app)

**Depende de**: Módulo 1 (recomendación conectada), Módulo 4 (itinerario automático como base), Módulo 3 (pagos, para poder ofrecer reservar desde el chat). Es una interfaz alternativa sobre funcionalidad que ya existe en los módulos anteriores — no es un módulo nuevo de lógica, es una capa de UX conversacional.

1. Crear pantalla de chat en la app (el backend, `chatbot.service.ts`, ya está completo con OpenAI GPT-3.5-turbo — falta la interfaz).
2. Integrar el catálogo de productos y su disponibilidad real en el contexto del chat (hoy el chatbot solo consulta `places`, no `products` ni `reservations`).
3. Integrar el motor de recomendación (módulo 1) como fuente de las sugerencias del chat.
4. Ofrecer explícitamente "¿Quieres que te arme esto directamente en la app?" al final de la respuesta del chat, generando un itinerario (módulo 4) que el usuario pueda revisar y reservar.
5. Requiere `OPENAI_API_KEY` configurada en `.env`.

---

## Módulo 13 — Armado de viaje mejorado

**Depende de**: Módulo 4 (generador automático).

1. Habilitar más destinos (hoy solo Santa Cruz está habilitado; el resto tiene badge "Próximamente").
2. Permitir agregar productos/experiencias como items del itinerario, no solo `places` (hoy `TripItem` solo admite lugares).
3. Integrar con el generador automático del módulo 4.
4. Exportar itinerario (PDF o compartir).

---

## Módulo 14 — Tips de viaje

**Sin dependencias.**

1. Modelo `TravelTip`: texto, categoría (transporte/seguridad/cultura/gastronomía), ciudad, activo.
2. Seed con ~20 tips reales para Santa Cruz.
3. Endpoint público.
4. Sección en home o pantalla dedicada.

---

## Módulo 15 — Efemérides ("El día de hoy")

**Sin dependencias.**

1. Modelo `Efemeride`: fecha, título, descripción, ciudad/departamento (para que sea escalable a otras regiones más adelante, no hardcodeado solo a Santa Cruz).
2. Seed con datos históricos reales de Bolivia (empezar con los de Santa Cruz).
3. Endpoint público.
4. Widget en home o notificación diaria mostrando la efeméride del día correspondiente a la ciudad del usuario.

---

## Módulo 16 — Realidad aumentada

**Sin dependencias. Última prioridad — mayor esfuerzo, funcionalidad más experimental.**

1. Modelo `ARPlace` (referencia a `Place` o ubicación propia, info histórica/turística asociada).
2. Endpoint admin CRUD para que el equipo administrativo cargue y edite esta información (la IA puede asistir en la redacción, pero la carga final la controla el equipo admin para evitar confusiones).
3. Integrar cámara con reconocimiento/AR en la app (evaluar plugin `ar_flutter` o equivalente).

---

## Módulo 17 — Catálogo de lugares

✅ Ya implementado y conectado end-to-end (28 lugares, 18 categorías en seed, API funcional, UI conectada). **No requiere acción.** Nota menor no bloqueante: el campo `categoriaPlace` existe pero no se usa activamente como filtro en la UI — evaluar en el futuro si vale la pena exponerlo como filtro adicional en "Cosas que hacer" o "Explorar".

---

## Reglas generales para toda la ejecución

- No empezar el Módulo 3 (pago real) sin que la Fase 0 y la Fase 0.5 estén 100% completas y verificadas.
- No implementar zonas de seguridad con polígonos — es punto + radio (círculo) explícitamente, para mantener el esfuerzo bajo.
- No mostrar un ratio fijo de puntos por dólar en ninguna pantalla de la app (Módulo 6).
- Al completar cada ítem, reportar evidencia concreta (archivo:línea) de lo que se hizo, igual que en las auditorías previas — no reportar "completado" sin evidencia verificable.
- Si se encuentra un motivo real para desviarse del orden (por ejemplo, un bloqueante técnico inesperado), decirlo explícitamente y esperar confirmación antes de saltarse un paso — no reordenar el plan por cuenta propia.

---

## Estado de avance (tracking)

| Ítem | Estado | Evidencia |
|------|--------|-----------|
| Fase 0 — Seed de reservas en todos los estados | ✅ Completado (sesión previa) | `api/prisma/seed.ts` |
| Fase 0.5 — Deuda técnica pagos/reservas (5 puntos) | ✅ Completado (sesión previa) | `reservations.service.ts`, `schema.prisma` |
| Módulo 1 — Motor de recomendación conectado a la app | ✅ Completado (sesión previa) | `features/recommendations/*`, `recommendations.service.ts` |
| Módulo 2 — Promociones de socios | ✅ Ya implementado (regresión OK) | `promotions_screen.dart` conectado; 174→178 tests backend |
| Módulo 3 — Pasarela de pago real | ✅ Fases A+B+C (Stripe, PayPal, QR-soft) | **Pasarela multi-proveedor**: `PaymentProvider` interface + `PaymentProviderRegistry` (stripe habilitado, `qr_banco_local` stub deshabilitado, paypal placeholder). Modelos `Payment` (provider, idempotencyKey, providerTransactionId, paymentIntentClientSecret, paymentMethodType, exchangeRateSnapshot) y `PaymentWebhookEvent` (3 schemas + db push). `POST /payments` crea PaymentIntent real y persiste payment (idempotente por reserva); `POST /payments/:id/confirm` valida contra Stripe vía `retrieve` antes de marcar held (híbrido+retrieve); webhook `POST /payments/webhook/:provider` es fuente de verdad (firma `constructEvent`), marca held y confirma reserva idempotentemente (guard terminal). App: `flutter_stripe` + PaymentSheet cuando provider==stripe (clientSecret), QR como fallback. **Sandbox B5 (Stripe test API) verificado live**: PaymentIntent creado por el backend, confirmado con tarjeta de test → succeeded, webhook firmado aceptado → payment `held` + reserva `confirmed`, re-envío idempotente. 197 tests backend OK; flutter analyze OK; APK debug compila. Fix `import Stripe = require("stripe")` (interop CJS). **Fase C (✅)**: `PayPalProvider` real (Orders v2 + webhook + captureId/refund), conversión BOB→USD con `exchange_rate_usd_bob` (+ admin), idempotencia por proveedor + selector de método en la app, y `.env`/infra QR. 216 tests backend OK; flutter analyze OK. QR real pendiente del acceso a la API del banco. **Verificado live (16/08, 1ª)**: compra sandbox PayPal end-to-end → webhooks `CHECKOUT.ORDER.APPROVED` + `PAYMENT.CAPTURE.COMPLETED` con `sigValid=true` → pago `held`, captureId real `6TC46704SN4546024`. **Fixes + verificación en dispositivo (16/08, 2ª)**: cambio de proveedor reutiliza la fila de pago (constraint `@@unique([reservationId])`, 201 con payUrl) y tarjeta Stripe en Android (MainActivity → `FlutterFragmentActivity` + tema MaterialComponents claro/oscuro) — pago con tarjeta de prueba confirmado end-to-end. Todo commiteado en `885af6b`. |
| Módulo 4 — Itinerario automático por reglas | ✅ Completado | `POST /trips/:id/generate` (trips.service.ts), botón en trip_detail_screen |
| Módulo 5 — Mapa mejorado + Zonas de seguridad | ✅ Completado | Modelo `SafetyZone` + seed 6 zonas; `GET /map/safety-zones` (±bounds), `GET /map/safety-zones/check` (Haversine), `GET /map/events`; admin CRUD `/admin/safety-zones`; mapa: markers por categoría, capa de eventos y círculos por riesgo (map_screen.dart) |
| Módulo 6 — Gamificación | ✅ Completado | Puntos por reserva completada con `totalAmount` (`reservations.service.ts:complete`); modelo `Badge`/`UserBadge` (3 schemas) + seed 5 badges; lógica de asignación (`gamification.service.ts`); endpoints `GET /gamification/me` y `/gamification/badges`; `points`+`userBadges` en `users/me`; pantalla `gamification_screen.dart` + menú "Mis Logros" y puntos en `profile_screen.dart`. Smoke test: completar reserva de 160 BOB → +160 pts (350→510). 196 tests backend OK; flutter analyze limpio |
| Módulo 7 — Soporte y resolución de conflictos | ⏳ | — |
| Módulo 8 — Onboarding con preferencias | ⏳ | — |
| Módulo 9 — Eventos publicados por usuarios | ⏳ | — |
| Módulo 10 — Clima mejorado | ⏳ | — |
| Módulo 11 — Perfil mejorado | ⏳ | — |
| Módulo 12 — IA conversacional (chat) | ⏳ | — |
| Módulo 13 — Armado de viaje mejorado | ⏳ | — |
| Módulo 14 — Tips de viaje | ⏳ | — |
| Módulo 15 — Efemérides | ⏳ | — |
| Módulo 16 — Realidad aumentada | ⏳ | — |
| Módulo 17 — Catálogo de lugares | ✅ Ya implementado (solo regresión) | — |
