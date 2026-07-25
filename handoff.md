# Handoff de Sesión — BoliviaExperience

**Fecha**: 24 de julio, 2026
**Agente**: MiMoCode (build agent)
**Rama**: develop

---

## Resumen de la Sesión

Sesión completa de debugging y fixes masivos. Se identificaron y corrigieron **35+ bugs** que afectaban las funciones core de la app: home vacío, categorías sin cargar, mapa sin markers, búsqueda incorrecta, y errores de navegación. Los problemas raíz incluían: parsing de respuestas paginadas incompatibles entre backend y frontend, providers Riverpod con race conditions, parámetros de query rechazados por ValidationPipe, y interfaces de datos incompletas.

---

## Commits Realizados (1 commit)

| Commit | Tipo | Descripción |
|--------|------|-------------|
| `37dad80` | fix | critical bug fixes - home empty, categories loading, map markers, search matching |

---

## Archivos Modificados

### API (Backend) — 5 archivos
| Archivo | Cambio |
|---------|--------|
| `api/src/common/dto/pagination.dto.ts` | Agregado `hasNext`/`hasPrevious` calculados al `PaginatedResponse` |
| `api/src/modules/places/dto/index.ts` | Agregado campo `categorySlug` a `QueryPlacesDto` |
| `api/src/modules/places/places.service.ts` | Resolución de `categorySlug` → `categoryId` en `findAll()`; removido `description` de búsqueda |
| `api/src/modules/places/repositories/geo.repository.ts` | Agregado `latitude`/`longitude` a respuestas `findByBoundsSQLite` y `findNearbySQLite`; actualizada interfaz `NearbyPlace` |
| `api/src/modules/search/search.service.ts` | Removido `description` de la búsqueda (solo name/address) |

### Flutter (Frontend) — 18 archivos
| Archivo | Cambio |
|---------|--------|
| `app/lib/config/router.dart` | Agregado `rootNavigatorKey`, `navigatorKey` en GoRouter, fallback `categoryName` via query param |
| `app/lib/core/network/dio_provider.dart` | Agregado redirect a `/login` en 401 con navigator key global |
| `app/lib/features/events/data/events_service.dart` | Fix `Event.id` toString, parsing de paginated response en `getEvents()` |
| `app/lib/features/home/data/home_service.dart` | Fix `getPromotions()` para desempaquetar `PaginatedResponse` anidado |
| `app/lib/features/home/presentation/providers/home_provider.dart` | Fix `copyWith` errorMessage, removido `.catchError` silenciador, cambiado a `autoDispose` |
| `app/lib/features/home/presentation/screens/home_screen.dart` | Fix category navigation a `/places/category/:slug`, fix photo/category safety checks |
| `app/lib/features/home/presentation/screens/main_shell.dart` | Fix bottom nav highlight con `startsWith('/explore')` |
| `app/lib/features/map/data/map_service.dart` | Fix `MapPlace.fromJson` para aceptar snake_case y camelCase; fix response parsing |
| `app/lib/features/map/presentation/providers/map_provider.dart` | Mejorado error message con detalle del exception |
| `app/lib/features/map/presentation/screens/map_screen.dart` | `myLocationEnabled: false` (sin permisos) |
| `app/lib/features/places/data/places_service.dart` | Fix query param `categorySlug`, parsing `meta` vs `pagination`, `Place.id` toString, `getPlaceReviews` unpack |
| `app/lib/features/places/presentation/providers/place_detail_provider.dart` | Reemplazado `Future.wait` por carga individual con try/catch, fix `copyWith` errorMessage |
| `app/lib/features/places/presentation/providers/places_provider.dart` | Convertido a `StateNotifierProvider.family.autoDispose` con auto-load |
| `app/lib/features/places/presentation/screens/place_detail_screen.dart` | Fix star rating logic, rating distribution dinámica, uso de `dioProvider` |
| `app/lib/features/places/presentation/screens/places_list_screen.dart` | Eliminada carga manual en `initState`, fix photoUrl safety check |
| `app/lib/features/reviews/data/reviews_service.dart` | Fix field names camelCase, `getPlaceReviews` paginated unpack |
| `app/lib/features/search/presentation/screens/explore_screen.dart` | Fix `_CategoryCard` overflow con `Flexible`/`mainAxisSize.min`, fix navigation a query param |
| `app/lib/features/search/presentation/screens/search_screen.dart` | Cancel button: `Navigator.pop` → `context.go('/map')` |

---

## Bugs Corregidos (Raíz → Fix)

### Home vacío
- **Raíz**: `home_provider.dart` tenía `.catchError((_) => [])` que traga TODOS los errores silenciosamente; `getPromotions()` no desempaquetaba el `PaginatedResponse` del backend
- **Fix**: Removido `.catchError`, cada llamada tiene su propio try/catch; `getPromotions()` ahora lee `data['data']['data']`

### Categorías sin cargar (loop infinito)
- **Raíz**: Flutter enviaba `?category=slug` pero el backend solo aceptaba `categoryId` (cuid); `forbidNonWhitelisted: true` rechazaba el parámetro con 400; `placesProvider` no era `family` causando race conditions
- **Fix**: Agregado `categorySlug` al DTO del backend con resolución a `categoryId`; provider convertido a `family.autoDispose`

### Errores al tocar lugares
- **Raíz**: `Future.wait` en 3 llamadas fallaba si CUALQUIERA fallaba; `getPlaceReviews()` no desempaquetaba paginated response
- **Fix**: Carga individual con try/catch; `getPlaceReviews()` desempaqueta correctamente

### Mapa sin markers
- **Raíz**: `GeoRepository` no retornaba `latitude`/`longitude` en la respuesta; todos los markers se colocaban en `(0, 0)`
- **Fix**: Agregados `latitude`/`longitude` a `findByBoundsSQLite` y `findNearbySQLite`

### Búsqueda incorrecta
- **Raíz**: Backend buscaba en `name`, `description`, y `address`; "El Palmar" matcheaba "ho" por su descripción
- **Fix**: Búsqueda limitada a `name` y `address`

### Error al cancelar búsqueda
- **Raíz**: `Navigator.pop(context)` fallaba porque la ruta fue reemplazada con `context.go('/search')`
- **Fix**: Cambiado a `context.go('/map')`

### Pixel overflow en Explorar
- **Raíz**: `_CategoryCard` sin `Flexible`/`mainAxisSize.min`
- **Fix**: Agregado `Flexible` al Text y `mainAxisSize: MainAxisSize.min` al Column

### 401 sin redirect
- **Raíz**: Interceptor limpiaba token pero no redirigía a login
- **Fix**: Agregado redirect a `/login` con `rootNavigatorKey`

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

## Funcionalidades Corregidas

### Home Screen
- Categorías, lugares destacados, eventos y promociones cargan correctamente
- Tap en categoría → navega a lista filtrada por categoría
- Promociones ahora se muestran (antes siempre vacías)

### Categorías (Places List)
- Loading spinner resolve correctamente (antes loop infinito)
- Filtrado por categoría funciona via `categorySlug`
- Scroll infinito funciona (`hasNext`/`hasPrevious` calculados correctamente)
- Cada categoría tiene su propio provider (no hay contaminación de datos)

### Mapa
- Markers se muestran en Santa Cruz (antes en 0,0)
- Badge de lugares funciona
- `myLocationEnabled` deshabilitado (sin permisos)

### Búsqueda
- Búsqueda por nombre funciona correctamente
- Cancelar vuelve al mapa sin error
- Resultados más precisos (solo name/address, no description)

### Detalle de Lugar
- Carga sin error (antes fallaba si photos/reviews fallaban)
- Star rating muestra estrellas correctas (star_outline para vacías)
- Rating distribution calculada desde reviews reales

### Navegación
- Bottom nav highlight funciona con query params
- 401 redirige a login automáticamente
- `categoryName` persiste via query param

---

## Pendiente para el Usuario

1. **Google Maps API Key**: Reemplazar `YOUR_GOOGLE_MAPS_API_KEY` en `app/android/app/src/main/AndroidManifest.xml`
2. **Firebase (opcional)**: Configurar para Google Login
3. **Regenerar Prisma Client**: `cd api && npx prisma generate`
4. **Reconstruir BD SQLite**: `cd api && node setup-db.js sqlite --seed`

---

## Próximos Entregables (Sesión Siguiente)

### UI/UX — Prioridad Alta
1. **Acceso a "Mis Viajes"**: Agregar botón/sección visible en UI principal
2. **Revisión de vistas existentes**: Errores menores de UI (estilos, espaciado, estados vacíos)

### Fixes Pendientes
3. **Profile screen**: Menús "Mis Reseñas", "Idioma", "Acerca de", "Privacidad" con handlers vacíos
4. **Edit profile**: Botón "Guardar" no funciona (TODO)
5. **Settings**: Toggles de notificaciones, sonido, ubicación no funcionan (TODO)
6. **Weather widget**: Tests pendientes
7. **Place detail**: Mapa embebido muestra placeholder gris

### Mejoras
8. **Seed expandido**: 50-80 lugares reales de Santa Cruz
9. **Fotos de lugares**: PlacePhotos con URLs de Unsplash
10. **Reviews de ejemplo**: 3-5 reviews para places populares

---

## Verificación de la App

```bash
# 1. API
cd api && npm run start:dev

# 2. Flutter
cd app && flutter clean && flutter pub get && flutter run

# 3. Login
Email: maria@gmail.com
Contraseña: password123

# 4. Probar fixes
- Home: Ver categorías, lugares destacados, eventos, promociones
- Tap categoría: Debe cargar lugares filtrados
- Mapa: Debe mostrar markers en Santa Cruz
- Búsqueda: Buscar "h" → resultados por nombre
- Cancelar búsqueda: Vuelve al mapa sin error
```

---

## Estadísticas de la Sesión

| Métrica | Valor |
|---------|-------|
| Commits realizados | 1 |
| Archivos modificados | 23 |
| Líneas agregadas | ~283 |
| Líneas eliminadas | ~118 |
| Bugs corregidos | 35+ |
| Backend archivos modificados | 5 |
| Flutter archivos modificados | 18 |
