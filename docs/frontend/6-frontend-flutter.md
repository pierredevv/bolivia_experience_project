# 6. Frontend Flutter (App Móvil) — BoliviaExperience

**Proyecto:** BoliviaExperience
**Versión:** 1.0
**Fecha:** 2026-06-26
**Responsables:** Flutter Lead, Mobile Developer

---

## 1. Estructura del Proyecto

```
app/
├── pubspec.yaml                 # Dependencias
├── lib/
│   ├── main.dart                # Entry point
│   ├── app.dart                 # App principal (MaterialApp)
│   ├── config/
│   │   ├── colors.dart          # Design tokens de colores
│   │   ├── theme.dart           # Temas light/dark
│   │   ├── router.dart          # GoRouter configuración
│   │   └── api_constants.dart   # URLs de la API
│   ├── core/
│   │   ├── network/
│   │   │   └── dio_provider.dart # Cliente HTTP
│   │   ├── widgets/
│   │   │   ├── skeleton_loader.dart
│   │   │   └── empty_state.dart
│   │   └── error/
│   └── features/
│       ├── auth/
│       │   └── presentation/screens/
│       │       ├── splash_screen.dart
│       │       └── login_screen.dart
│       ├── home/
│       │   └── presentation/screens/
│       │       ├── main_shell.dart      # Bottom Navigation
│       │       └── home_screen.dart     # Home principal
│       ├── map/
│       │   └── presentation/screens/
│       │       └── map_screen.dart      # Mapa interactivo
│       ├── search/
│       │   └── presentation/screens/
│       │       └── explore_screen.dart  # Explorar y buscar
│       ├── favorites/
│       │   └── presentation/screens/
│       │       └── favorites_screen.dart
│       ├── profile/
│       │   └── presentation/screens/
│       │       ├── profile_screen.dart
│       │       ├── edit_profile_screen.dart
│       │       └── settings_screen.dart
│       ├── places/
│       │   └── presentation/screens/
│       │       └── place_detail_screen.dart  # Detalle de lugar
│       ├── events/
│       │   └── presentation/screens/
│       │       └── event_detail_screen.dart
│       └── reviews/
│           └── presentation/screens/
│               └── create_review_screen.dart
└── assets/
    ├── images/
    ├── icons/
    ├── fonts/
    └── lottie/
```

---

## 2. Stack Tecnológico

| Componente | Tecnología | Versión |
|------------|-----------|---------|
| Framework | Flutter | 3.x |
| Lenguaje | Dart | 3.x |
| State Management | Riverpod | 2.4 |
| Navegación | GoRouter | 13.0 |
| HTTP Client | Dio | 5.4 |
| Storage Local | Hive + SharedPreferences | - |
| Mapas | Google Maps Flutter SDK | - |
| Firebase | firebase_core, firebase_auth, firebase_storage | - |
| UI Components | Material Design 3 | - |
| i18n | flutter_localizations | - |

---

## 3. Pantallas Implementadas

### 3.1 Auth Flow

| Pantalla | Descripción | Estado |
|----------|-------------|--------|
| Splash Screen | Pantalla de carga con logo | ✅ Implementado |
| Login Screen | Login con Google OAuth y Email | ✅ Implementado |

### 3.2 Main Shell (Bottom Navigation)

| Tab | Icono | Pantalla | Descripción |
|-----|-------|----------|-------------|
| 0 | home | HomeScreen | Inicio con weather, categorías, nearby |
| 1 | map | MapScreen | Mapa interactivo con markers |
| 2 | explore | ExploreScreen | Búsqueda y filtros |
| 3 | favorite | FavoritesScreen | Lugares guardados |
| 4 | person | ProfileScreen | Perfil del usuario |

### 3.3 Feature Screens

| Pantalla | Descripción | Estado |
|----------|-------------|--------|
| Home Screen | Weather widget, categorías, nearby, eventos, promos | ✅ Implementado |
| Map Screen | Mapa con search, filtros, controles | ✅ Implementado |
| Explore Screen | Búsqueda, filtros, resultados | ✅ Implementado |
| Favorites Screen | Lista de favoritos con tabs | ✅ Implementado |
| Profile Screen | Avatar, stats, menú | ✅ Implementado |
| Place Detail | Imagen, info, horarios, contacto, reseñas | ✅ Implementado |
| Event Detail | Imagen, fecha, ubicación, descripción | ✅ Implementado |
| Create Review | Rating, comentario, fotos | ✅ Implementado |
| Edit Profile | Avatar, nombre, país, idioma | ✅ Implementado |
| Settings | Dark mode, notificaciones, idioma | ✅ Implementado |

---

## 4. Design System Implementado

### 4.1 Colores

- **Primary:** Azul (#1976D2) - Cielo boliviano, confianza
- **Secondary:** Naranja (#E65100) - Energía, turismo
- **Success:** Verde (#2E7D32) - Naturaleza
- **Error:** Rojo (#D32F2F) - Alertas
- **Neutrals:** Escala de grises

### 4.2 Temas

- **Light Theme:** Fondo blanco/gris claro, texto oscuro
- **Dark Theme:** Fondo oscuro, texto claro
- **Persistencia:** Hive box 'settings' con key 'darkMode'

### 4.3 Tipografía

- **Familia:** Inter
- **Pesos:** Regular (400), Medium (500), SemiBold (600), Bold (700)
- **Escalas:** 12, 14, 16, 18, 20, 24, 28, 32

---

## 5. Navegación

### 5.1 GoRouter Configuration

```dart
Routes:
├── /splash          → SplashScreen
├── /login           → LoginScreen
├── ShellRoute       → MainShell (BottomNav)
│   ├── /            → HomeScreen
│   ├── /map         → MapScreen
│   ├── /explore     → ExploreScreen
│   ├── /favorites   → FavoritesScreen
│   └── /profile     → ProfileScreen
├── /places/:id      → PlaceDetailScreen
├── /events/:id      → EventDetailScreen
├── /places/:id/review → CreateReviewScreen
├── /profile/edit    → EditProfileScreen
└── /settings        → SettingsScreen
```

### 5.2 Deep Linking

Soportado via GoRouter para:
- `/places/{id}` - Abrir lugar específico
- `/events/{id}` - Abrir evento específico

---

## 6. Componentes Reutilizados

| Componente | Archivo | Uso |
|------------|---------|-----|
| SkeletonLoader | core/widgets/skeleton_loader.dart | Loading states |
| PlaceCardSkeleton | core/widgets/skeleton_loader.dart | Skeleton de place card |
| EmptyState | core/widgets/empty_state.dart | Estados vacíos |
| ErrorState | core/widgets/empty_state.dart | Estados de error |

---

## 7. Comandos de Desarrollo

```bash
# Instalar dependencias
cd app
flutter pub get

# Ejecutar en desarrollo
flutter run

# Build para Android
flutter build apk --release

# Build para iOS
flutter build ipa --release

# Generar código (Riverpod, Freezed, JSON)
dart run build_runner build --delete-conflicting-outputs

# Analizar código
flutter analyze

# Formatear código
dart format .
```

---

## 8. Checklist de Completitud — Entregable 6

- [x] Estructura del proyecto Flutter
- [x] Configuración (pubspec.yaml, themes, colors)
- [x] Entry point (main.dart)
- [x] App principal con MaterialApp.router
- [x] Configuración de GoRouter
- [x] Design tokens (colores, tema light/dark)
- [x] Core widgets (skeleton, empty state, error state)
- [x] 10 pantallas implementadas:
  - [x] Splash Screen
  - [x] Login Screen
  - [x] Main Shell (Bottom Navigation)
  - [x] Home Screen
  - [x] Map Screen
  - [x] Explore Screen
  - [x] Favorites Screen
  - [x] Profile Screen
  - [x] Place Detail Screen
  - [x] Event Detail Screen
  - [x] Create Review Screen
  - [x] Edit Profile Screen
  - [x] Settings Screen
- [x] Navegación con Bottom Navigation (5 tabs)
- [x] Deep linking configurado
- [x] ThemeMode con persistencia

---

**Próximo entregable:** 7 — Frontend Web (React)
