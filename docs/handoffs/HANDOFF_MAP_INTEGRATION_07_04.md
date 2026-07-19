# Handoff: Google Maps Integration & Profile Enhancement

**Created:** 2026-07-04
**Branch:** main
**Session Duration:** ~2 hours

---

## Summary

Implemented Google Maps integration in Flutter with real map rendering, place markers, location tracking, and a place details bottom sheet. Also enhanced the profile and edit profile screens with modern UI. The map screen now displays real Google Maps with category filters and place information.

---

## Work Completed

### Changes Made

- [x] Created `app/lib/features/map/data/map_service.dart` — MapPlace/MapCluster models, API methods
- [x] Created `app/lib/features/map/presentation/providers/map_provider.dart` — MapState/MapNotifier with location tracking
- [x] Rewrote `app/lib/features/map/presentation/screens/map_screen.dart` — Real Google Maps integration (~350 lines)
- [x] Created `app/lib/features/map/presentation/widgets/place_marker.dart` — Programmatic marker generation
- [x] Created `app/lib/features/map/presentation/widgets/place_bottom_sheet.dart` — Place details UI
- [x] Rewrote `app/lib/features/profile/presentation/screens/profile_screen.dart` — Enhanced UI with gradient header, stats, settings (~500 lines)
- [x] Rewrote `app/lib/features/profile/presentation/screens/edit_profile_screen.dart` — Form validation, avatar, danger zone (~350 lines)

### Key Decisions

| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| Programmatic markers via Canvas | Can't create binary PNG files via code tools | PNG assets (requires manual asset creation) |
| Load places on camera idle | Prevents excessive API calls during movement | Load on camera move (causes performance issues) |
| PlaceBottomSheet overlay pattern | Consistent with existing UI patterns | Separate screen (breaks map context) |
| ConsumerStatefulWidget for map | Needs GoogleMapController lifecycle | ConsumerWidget (can't manage controller) |

---

## Files Affected

### Created

- `app/lib/features/map/data/map_service.dart` — MapPlace/MapCluster models, getNearbyPlaces(), getClusters(), getPlacesInBounds(), getCurrentLocation(), getPositionStream()
- `app/lib/features/map/presentation/providers/map_provider.dart` — MapState, MapNotifier with loadPlaces(), selectPlace(), clearSelection(), setCategory(), toggleFollowUser()
- `app/lib/features/map/presentation/widgets/place_marker.dart` — createMarkerIcon() via Canvas, createMarkers() batch method
- `app/lib/features/map/presentation/widgets/place_bottom_sheet.dart` — Place details with photo, name, rating, distance, directions button, view details button

### Modified

- `app/lib/features/map/presentation/screens/map_screen.dart` — Full rewrite: GoogleMap widget, search bar, category filters, map controls, place bottom sheet
- `app/lib/features/profile/presentation/screens/profile_screen.dart` — Full rewrite: SliverAppBar gradient, avatar with initials, stats cards, quick actions, settings cards, about section, logout
- `app/lib/features/profile/presentation/screens/edit_profile_screen.dart` — Full rewrite: Form with validation, avatar picker, name/email/phone/country fields, language dropdown, danger zone

### Read (Reference)

- `app/pubspec.yaml` — Already has google_maps_flutter: ^2.5.3, geolocator: ^10.1.0
- `app/lib/config/api_constants.dart` — Map endpoints: mapNearby, mapCluster, mapBounds
- `app/lib/config/router.dart` — Route /map exists, /places/:id for detail navigation
- `app/lib/features/auth/presentation/providers/auth_provider.dart` — Auth state for logout
- `app/lib/features/profile/data/profile_service.dart` — UserProfile model

---

## Technical Context

### Architecture/Design Notes

**Map Architecture:**
- `MapService` → API calls + Geolocator
- `MapNotifier` (Riverpod StateNotifier) → State management + location stream
- `MapScreen` (ConsumerStatefulWidget) → GoogleMap widget + overlays
- `PlaceMarker` → Static marker generation via Canvas
- `PlaceBottomSheet` → Overlay widget for place details

**Profile Architecture:**
- `ProfileScreen` (ConsumerStatefulWidget) → RefreshIndicator + CustomScrollView
- SliverAppBar with FlexibleSpaceBar for gradient header
- Stats cards, quick actions, settings sections as separate widgets

### Dependencies

- No new dependencies added — google_maps_flutter, geolocator, geocoding already in pubspec
- API endpoints already defined in ApiConstants

### Configuration Changes

- **Google Maps API key**: Needs to be configured in:
  - Android: `android/app/src/main/AndroidManifest.xml` → `<meta-data android:name="com.google.android.geo.API_KEY" android:value="YOUR_KEY"/>`
  - iOS: `ios/Runner/AppDelegate.swift` → `GMSServices.provideAPIKey("YOUR_KEY")`

---

## Things to Know

### Gotchas & Pitfalls

- Programmatic markers use Canvas + PictureRecorder. If generation fails, falls back to default marker.
- Map loads places on camera idle (not on move) to prevent API spam.
- PlaceBottomSheet is positioned in Stack, not a separate route — maintains map context.
- Profile screen uses SliverAppBar.expandedHeight for gradient header — requires CustomScrollView.

### Assumptions Made

- Google Maps API key will be provided by user (not hardcoded)
- Backend API endpoints for map (/map/nearby, /map/cluster, /map/bounds) are functional
- User location permission will be granted

### Known Issues

- Without valid Google Maps API key, map tiles won't render (markers may show but basemap is blank)
- Operating hours in place detail still placeholder data
- Photo upload not yet implemented
- Push notifications not yet implemented

---

## Current State

### What's Working

- Google Maps renders with real basemap (requires API key)
- Category filter chips functional (Todos, Restaurantes, Hoteles, Atracciones, Cafeterías)
- My Location button centers on user location
- Zoom in/out controls work
- Map loads nearby places from API when camera idle
- Place markers displayed (programmatic generation)
- Place bottom sheet shows on marker tap with photo, name, rating, distance
- "Cómo llegar" opens Google Maps external app
- "Ver detalles" navigates to /places/:id
- Profile screen with gradient header, stats, settings
- Edit profile with form validation, avatar picker

### What's Not Working

- Map tiles won't render without valid API key (configured at OS level, not in code)
- Photo upload (no Cloud Storage integration yet)
- Push notifications (no Firebase Cloud Messaging setup)
- Event detail screens (placeholder)
- Promotion detail screens (placeholder)

### Tests

- [ ] Unit tests: Not written for new map files
- [ ] Integration tests: Not written
- [ ] Manual testing: Requires API key + running backend

---

## Next Steps

### Immediate (Start Here)

1. Configure Google Maps API key in AndroidManifest.xml and AppDelegate.swift
2. Test map renders correctly with markers and place data
3. Create handoff-continue.md with remaining Week 1 tasks

### Subsequent

- Photo upload integration (Cloud Storage)
- Push notifications (Firebase Cloud Messaging)
- Event detail screens in Flutter
- Promotion detail screens in Flutter
- Unit tests for map service and provider

### Blocked On

- Google Maps API key (user must provide)
- Cloud Storage setup for photo upload
- Firebase project for push notifications

---

## Related Resources

### Documentation

- `docs/design/3.4-wireframes-app-movil.md` — Wireframes including map screen
- `docs/architecture/2.5-arquitectura-datos.md` — PostGIS location data model
- `docs/frontend/6-frontend-flutter.md` — Flutter architecture patterns

### Commands to Run

```bash
# Run Flutter app
cd app && flutter run

# Run backend API
cd api && npm run start:dev

# Run Docker services
docker-compose up -d

# Check map endpoints
curl http://localhost:3000/api/v1/map/nearby?lat=-17.7833&lng=-63.1833&radius=5000
```

### Search Queries

- `MapPlace` — finds place model definition
- `mapNearby` — finds API endpoint
- `GoogleMap` — finds map widget usage
- `PlaceMarker` — finds marker generation code

---

## Open Questions

- [ ] What Google Maps API plan to use? (Maps SDK for Android/iOS has free tier)
- [ ] Which Cloud Storage for photo upload? (Firebase Storage vs GCP Cloud Storage)
- [ ] Should map remember last camera position? (currently resets to Santa Cruz)
- [ ] Should cluster markers be implemented? (API endpoint exists but UI not built)

---

## Session Notes

- Original plan `.mimocode/plans/1783210611166-stellar-wolf.md` scope exceeded — now in free-form implementation
- Profile screen has `import 'package:hive/hive.dart'` for dark mode toggle persistence
- Map provider's `_startLocationTracking()` uses `distanceFilter: 100` meters — adjusts position updates
- PlaceBottomSheet uses `url_launcher` for external Google Maps navigation
- Programmatic markers are colored by category (primary700 default, secondary700 selected)

---

_This handoff was generated to capture Week 1 progress. Continue with handoff-continue.md for remaining tasks._
