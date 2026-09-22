# Handoff de Sesión — BoliviaExperience

**Fecha**: 22 de septiembre, 2026
**Agente**: opencode (build agent)
**Rama**: develop
**Commit**: `02e7452` (último; push aplicado — `origin/develop` en sincronía `0/0`)

---

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