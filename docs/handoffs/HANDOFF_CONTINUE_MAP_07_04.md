# Handoff Continue: Week 1 Remaining Tasks

**Created:** 2026-07-04
**Branch:** main
**Previous Handoff:** HANDOFF_MAP_INTEGRATION_07_04.md

---

## Summary

Google Maps integration and profile screens are complete. This document defines the remaining Week 1 tasks that need to be implemented to reach a launchable state. The approach focuses on blockers to real launch: photo upload, push notifications, and missing detail screens.

---

## What Was Done (Recap)

- ✅ Google Maps integration (map_service, map_provider, map_screen, markers, bottom sheet)
- ✅ Profile screen enhanced (gradient header, stats, settings, logout)
- ✅ Edit profile screen (form validation, avatar, danger zone)

---

## Remaining Week 1 Tasks

### Task 1: Photo Upload Integration

**Priority:** HIGH — Users can't upload profile photos or place photos without this.

**Scope:**
- Backend: `POST /api/v1/uploads` endpoint for file upload
- Backend: Cloud Storage integration (Firebase Storage or GCP Cloud Storage)
- Flutter: Image picker widget (camera/gallery selection)
- Flutter: Upload service with progress indicator
- Flutter: Connect to profile screen avatar and place detail photos

**Files to create/modify:**
- `api/src/modules/uploads/uploads.module.ts` — NEW
- `api/src/modules/uploads/uploads.controller.ts` — NEW
- `api/src/modules/uploads/uploads.service.ts` — NEW
- `api/src/common/config/storage.config.ts` — NEW (Cloud Storage config)
- `app/lib/features/profile/data/upload_service.dart` — NEW
- `app/lib/features/profile/presentation/widgets/photo_picker.dart` — NEW
- `app/lib/features/profile/presentation/screens/edit_profile_screen.dart` — MODIFY (connect photo picker)
- `app/lib/features/places/presentation/screens/place_detail_screen.dart` — MODIFY (connect place photos)

**Approach:**
1. Create backend upload endpoint with Multer + Cloud Storage
2. Create Flutter upload service with Dio multipart
3. Create reusable PhotoPicker widget
4. Connect to edit profile screen
5. Connect to place detail screen

**Blockers:**
- Cloud Storage bucket must be created (Firebase or GCP)

---

### Task 2: Push Notifications

**Priority:** MEDIUM — Needed for user engagement but not core functionality.

**Scope:**
- Backend: Firebase Admin SDK integration
- Backend: Push notification service
- Backend: Notification endpoints (send, list, read)
- Flutter: Firebase Cloud Messaging setup
- Flutter: Notification handler (foreground/background)
- Flutter: Notification badge and list screen

**Files to create/modify:**
- `api/src/modules/notifications/notifications.module.ts` — NEW
- `api/src/modules/notifications/notifications.controller.ts` — NEW
- `api/src/modules/notifications/notifications.service.ts` — NEW
- `api/src/common/config/firebase.config.ts` — NEW
- `app/lib/features/notifications/data/notification_service.dart` — NEW
- `app/lib/features/notifications/presentation/providers/notification_provider.dart` — NEW
- `app/lib/features/notifications/presentation/screens/notifications_screen.dart` — NEW
- `app/lib/main.dart` — MODIFY (Firebase init, FCM setup)

**Approach:**
1. Set up Firebase project (if not exists)
2. Add Firebase Admin SDK to backend
3. Create notification service with FCM
4. Create Flutter notification handler
5. Create notification list screen
6. Connect to profile screen notifications toggle

**Blockers:**
- Firebase project must be created
- `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) must be added

---

### Task 3: Event Detail Screen

**Priority:** MEDIUM — Events are a key feature for tourism.

**Scope:**
- Flutter: Event detail screen with full info
- Flutter: Event list screen (if not exists)
- Backend: Verify event endpoints return complete data

**Files to create/modify:**
- `app/lib/features/events/presentation/screens/event_detail_screen.dart` — REWRITE (currently placeholder)
- `app/lib/features/events/presentation/screens/events_screen.dart` — VERIFY/CREATE
- `app/lib/features/events/data/event_service.dart` — VERIFY/CREATE
- `app/lib/features/events/presentation/providers/event_provider.dart` — VERIFY/CREATE

**Approach:**
1. Check existing event screens and services
2. Rewrite event detail screen with full UI
3. Create event list screen if missing
4. Connect to backend event endpoints

---

### Task 4: Promotion Detail Screen

**Priority:** LOW — Promotions are secondary to core tourism features.

**Scope:**
- Flutter: Promotion detail screen
- Flutter: Promotion list screen (if not exists)
- Backend: Verify promotion endpoints

**Files to create/modify:**
- `app/lib/features/promotions/presentation/screens/promotion_detail_screen.dart` — CREATE
- `app/lib/features/promotions/presentation/screens/promotions_screen.dart` — VERIFY/CREATE
- `app/lib/features/promotions/data/promotion_service.dart` — VERIFY/CREATE

**Approach:**
1. Check existing promotion screens and services
2. Create promotion detail screen
3. Create promotion list screen if missing
4. Connect to backend promotion endpoints

---

### Task 5: Map Verification & Polish

**Priority:** HIGH — Map must work correctly before launch.

**Scope:**
- Configure Google Maps API key
- Test map renders with markers
- Test location tracking
- Test category filters
- Test place bottom sheet navigation
- Fix any issues found

**Files to modify:**
- `android/app/src/main/AndroidManifest.xml` — Add API key
- `ios/Runner/AppDelegate.swift` — Add API key
- `app/lib/features/map/presentation/screens/map_screen.dart` — Bug fixes if needed
- `app/lib/features/map/data/map_service.dart` — Bug fixes if needed

**Approach:**
1. Get Google Maps API key from user
2. Configure in Android and iOS
3. Test full map flow
4. Fix any rendering or data issues

---

## Execution Order

Recommended order for maximum progress:

1. **Task 5: Map Verification** (unblocks testing of existing work)
2. **Task 1: Photo Upload** (high priority, users need this)
3. **Task 3: Event Detail** (medium priority, tourism feature)
4. **Task 2: Push Notifications** (medium priority, engagement)
5. **Task 4: Promotion Detail** (low priority, can defer)

---

## Commands to Run

```bash
# Test map endpoints
curl http://localhost:3000/api/v1/map/nearby?lat=-17.7833&lng=-63.1833&radius=5000

# Test event endpoints
curl http://localhost:3000/api/v1/events

# Test promotion endpoints
curl http://localhost:3000/api/v1/promotions

# Run Flutter app
cd app && flutter run

# Run backend
cd api && npm run start:dev
```

---

## Resources Needed

- [ ] Google Maps API key (for map verification)
- [ ] Firebase project (for push notifications)
- [ ] Cloud Storage bucket (for photo upload)
- [ ] `google-services.json` and `GoogleService-Info.plist` (for Firebase)

---

## Success Criteria

Week 1 is complete when:

1. ✅ Map renders with real Google Maps basemap
2. ✅ Map shows place markers from API
3. ✅ Map category filters work
4. ✅ Place bottom sheet shows correct info
5. ✅ Users can upload profile photos
6. ✅ Users can upload place photos
7. ✅ Push notifications can be sent/received
8. ✅ Event detail screen shows full info
9. ✅ Promotion detail screen shows full info

---

## Notes

- Backend API already has endpoints for events, promotions, uploads (verify they exist)
- Flutter router already has routes for event detail and promotion detail (verify they work)
- Profile screen already has notification toggle (needs real backend connection)
- Map screen already has search bar (navigates to /search which exists)

---

_Continue with Task 5 (Map Verification) first, then proceed through tasks in order._
