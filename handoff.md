# Handoff de Sesión — BoliviaExperience

**Fecha**: 25 de julio, 2026
**Agente**: MiMoCode (build agent)
**Rama**: develop

---

## Resumen de la Sesión

Sesión de **rediseño arquitectónico del sistema de reseñas** y corrección de múltiples bugs UI. Se implementó una nueva arquitectura de estados para reseñas (PUBLISHED/UNDER_REVIEW/HIDDEN/DELETED) siguiendo el patrón de plataformas profesionales (Google Maps, Airbnb, Booking). Además se corrigieron bugs de UI: rating con exceso de decimales, fecha de visita sin mostrar, nombre del lugar no visible al crear reseña, favoritos con rating 0, y búsqueda con rating 0.

---

## Arquitectura Implementada — Sistema de Reseñas

### Modelo de Estados

```
enum ReviewStatus {
  PUBLISHED    // Visible públicamente
  UNDER_REVIEW // Reservado para futura moderación automática
  HIDDEN       // Administrador ocultó (acción de moderación)
  DELETED      // Usuario eliminó su reseña (terminal, no reversible)
}
```

### Reglas de Arquitectura

1. **DELETED nunca aparece en listados normales**
   - Listado público → solo PUBLISHED
   - Panel empresa → PUBLISHED + HIDDEN
   - Panel admin → todos (con filtro)

2. **Place.ratingAvg y Place.ratingCount son datos derivados**
   - Siempre se recalculan con `recalculatePlaceRating()`
   - Nunca se modifican manualmente

3. **Toda operación que modifique reseñas invoca recalculatePlaceRating()**
   - create() → recalculatePlaceRating()
   - update() → recalculatePlaceRating() (si cambió rating)
   - remove() → recalculatePlaceRating()
   - updateStatus() → recalculatePlaceRating()

4. **Reseñas se publican inmediatamente** (sin aprobación manual)

5. **Solo admin puede cambiar status** (empresa solo responde)

---

## Commits Realizados

| Commit | Tipo | Descripción |
|--------|------|-------------|
| Pendiente | feat | Rediseño sistema de reseñas + fixes UI |

---

## Archivos Modificados

### API (Backend) — 14 archivos

| Archivo | Cambio |
|---------|--------|
| `api/prisma/schema.prisma` | Reemplazado `isApproved Boolean` por `status String @default("PUBLISHED")`, agregado `moderatedAt`, `moderatedById` con relación a User, `@@index([status])` |
| `api/prisma/schema.sqlite.prisma` | Sincronizado con schema.prisma (mismos cambios) |
| `api/prisma/seed.ts` | Reviews creadas con `status: 'PUBLISHED'`, places con `ratingAvg: 0` y `ratingCount: 0` (recálculo automático) |
| `api/src/common/constants/review-status.ts` | **Nuevo**: Constantes PUBLISHED, UNDER_REVIEW, HIDDEN, DELETED |
| `api/src/modules/reviews/reviews.service.ts` | Reescritura completa: `create()` con `$transaction` + auto-publicar, `update()` con validación DELETED/HIDDEN, `updateStatus()` con auditoría, `remove()` soft delete, `recalculatePlaceRating()` privado |
| `api/src/modules/reviews/reviews.controller.ts` | Endpoint `@Patch('reviews/:id/status')` para admin (reemplaza `approve`) |
| `api/src/modules/reviews/dto/update-review-status.dto.ts` | **Nuevo**: DTO con `@IsEnum(ReviewStatus)` |
| `api/src/modules/reviews/dto/index.ts` | Exporta `UpdateReviewStatusDto` |
| `api/src/modules/reviews/reviews.service.spec.ts` | Tests actualizados: mocks con `aggregate`, validación de status, soft delete |
| `api/src/modules/empresa/empresa.service.ts` | Usa `ReviewStatus` de constants, filtra PUBLISHED+HIDDEN, stats sin DELETED |
| `api/src/modules/empresa/dto/index.ts` | Agregado `filter` field a `EmpresaReviewsDto` |
| `api/src/modules/admin/admin.service.ts` | Usa `ReviewStatus` de constants, filtros por status |
| `api/src/modules/admin/admin.service.spec.ts` | Tests actualizados con nuevos status |
| `api/src/modules/places/places.service.ts` | `findById` usa `status: 'PUBLISHED'` en vez de `isApproved: true` |
| `api/src/scripts/migrate-review-status.ts` | **Nuevo**: Script de migración de datos |
| `api/src/scripts/recalculate-ratings.ts` | **Nuevo**: Script de recálculo de ratings |
| `api/src/scripts/add-status-column.ts` | **Nuevo**: Script para agregar columna status |

### Flutter (Frontend) — 7 archivos

| Archivo | Cambio |
|---------|--------|
| `app/lib/features/reviews/presentation/screens/create_review_screen.dart` | Agregado `placeName` parameter, Card muestra nombre real, `ref.invalidate(placeDetailProvider)` después de crear reseña, fecha de visita dinámica en input |
| `app/lib/features/places/presentation/screens/place_detail_screen.dart` | Rating formateado a 1 decimal (`toStringAsFixed(1)`), pasa `place.name` vía `extra` al navegar a crear reseña |
| `app/lib/features/places/presentation/screens/places_list_screen.dart` | Rating formateado a 1 decimal |
| `app/lib/features/home/presentation/screens/home_screen.dart` | Rating formateado a 1 decimal |
| `app/lib/features/search/presentation/screens/search_screen.dart` | Rating formateado a 1 decimal, fix `result['ratingAvg']` en vez de `result['rating']['average']` |
| `app/lib/features/favorites/presentation/screens/favorites_screen.dart` | Rating formateado a 1 decimal, fix `place['ratingAvg']` en vez de `place['rating']['average']` |
| `app/lib/config/router.dart` | Pasa `placeName` vía `state.extra` en ruta de crear reseña |

---

## Bugs Corregidos

### 1. Reseñas no se publican (Bug crítico)
- **Raíz**: `isApproved` defaultaba en `false`; `findByPlace()` filtraba por `isApproved: true`
- **Fix**: Nuevo enum `ReviewStatus`, reseñas se crean con `PUBLISHED` automáticamente

### 2. Rating del lugar no se actualiza
- **Raíz**: `create()` solo insertaba Review, nunca actualizaba `ratingAvg`/`ratingCount` en Place
- **Fix**: `recalculatePlaceRating()` dentro de `$transaction` en create/update/remove/updateStatus

### 3. Barras de rating vacías
- **Raíz**: Seed data seteaba `ratingCount` directamente sin crear Reviews reales
- **Fix**: Seed con `ratingCount: 0`, recálculo automático desde Reviews reales

### 4. UI no refresca después de crear reseña
- **Raíz**: `placeDetailProvider` mantenía data stale
- **Fix**: `ref.invalidate(placeDetailProvider(widget.placeId))` después de crear reseña

### 5. Rating con exceso de decimales (4.666666666667)
- **Raíz**: `'$averageRating'` mostraba valor raw sin formatear
- **Fix**: `averageRating.toStringAsFixed(1)` en todas las pantallas (home, detail, list, search, favorites)

### 6. "Lugar" no muestra nombre al crear reseña
- **Raíz**: `CreateReviewScreen` solo recibía `placeId`, no nombre
- **Fix**: Agregado `placeName` parameter, pasado vía `context.push(..., extra: place.name)`

### 7. Fecha de visita no se muestra en input
- **Raíz**: `InputDecorator` child era `const` con texto hardcodeado
- **Fix**: Child dinámico según `_visitDate`

### 8. Favoritos muestra rating 0
- **Raíz**: Flutter buscaba `place['rating']['average']` pero API retorna `place['ratingAvg']`
- **Fix**: Cambiado a `place['ratingAvg']`

### 9. Búsqueda muestra rating 0
- **Raíz**: Mismo problema que favoritos
- **Fix**: Cambiado a `result['ratingAvg']`

---

## Credenciales para Probar la App

### Usuarios del Seed

| Rol | Email | Contraseña |
|-----|-------|------------|
| **Admin** | admin@boliviaexperience.com | password123 |
| **Empresa** | empresa@boliviaexperience.com | password123 |
| **Usuario** | maria@gmail.com | password123 |
| **Usuario** | juan@gmail.com | password123 |
| **Usuario** | ana@gmail.com | password123 |

---

## Funcionalidades Implementadas

### Sistema de Reseñas (API)
- Publicación inmediata de reseñas (status PUBLISHED)
- Recálculo automático de ratingAvg/ratingCount en transacción
- Soft delete (DELETED es terminal, no reversible)
- Moderación admin (HIDDEN/PUBLISHED/DELETED)
- Auditoría (moderatedAt, moderatedBy)
- Empresa puede responder pero no moderar
- Validación: no editar reseñas DELETED/HIDDEN
- Validación: no restaurar reseñas DELETED

### UI Flutter
- Crear reseña muestra nombre del lugar real
- Fecha de visita se muestra correctamente en input
- Rating promedio formateado a 1 decimal en todas las pantallas
- Favoritos muestra rating real
- Búsqueda muestra rating real
- Detalle del lugar se refresca después de crear reseña

---

## Pendiente para el Usuario

1. **Regenerar Prisma Client**: `cd api && npx prisma generate`
2. **Reconstruir BD SQLite**: `cd api && npx prisma db push --force-reset && npx prisma db seed`
3. **Google Maps API Key**: Reemplazar `YOUR_GOOGLE_MAPS_API_KEY` en `app/android/app/src/main/AndroidManifest.xml`
4. **Firebase (opcional)**: Configurar para Google Login

---

## Próximos Entregables (Sesión Siguiente)

### UI/UX — Prioridad Alta
1. **Acceso a "Mis Viajes"**: Agregar botón/sección visible en UI principal
2. **Revisión de vistas existentes**: Errores menores de UI (estilos, espaciado, estados vacíos)

### Fixes Pendientes
3. **Profile screen**: Menús "Mis Reseñas", "Idioma", "Acerca de", "Privacidad" con handlers vacíos
4. **Edit profile**: Botón "Guardar" no funciona (TODO)
5. **Settings**: Toggles de notificaciones, sonido, ubicación no funcionan (TODO)
6. **Place detail**: Mapa embebido muestra placeholder gris

### Sistema de Reseñas — Futuro
7. **Moderación automática**: Integrar IA para detectar spam/fraude → status UNDER_REVIEW
8. **Sistema de reportes**: Modelo ReviewReport + endpoint de denuncia
9. **Notificaciones**: Notificar a empresa cuando responden a su reseña

---

## Verificación de la App

```bash
# 1. API
cd api && npx prisma generate && npx prisma db push --force-reset && npx prisma db seed && npm run start:dev

# 2. Flutter
cd app && flutter clean && flutter pub get && flutter run

# 3. Login
Email: maria@gmail.com
Contraseña: password123

# 4. Probar fixes
- Crear reseña: Debe mostrar nombre del lugar, fecha funcional, rating actualiza
- Detalle lugar: Rating con 1 decimal, barras de rating correctas
- Favoritos: Rating real (no 0)
- Búsqueda: Rating real (no 0)
- Home: Rating con 1 decimal en cada lugar
```

---

## Estadísticas de la Sesión

| Métrica | Valor |
|---------|-------|
| Commits realizados | 1 (pendiente) |
| Archivos modificados | 25 |
| Archivos nuevos | 5 |
| Backend archivos modificados | 14 |
| Flutter archivos modificados | 7 |
| Bugs corregidos | 9 |
| Tests pasando | 36/36 |
