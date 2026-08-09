import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hive/hive.dart';

import '../core/auth/token_manager.dart';
import '../features/auth/presentation/screens/splash_screen.dart';
import '../features/auth/presentation/screens/login_screen.dart';
import '../features/auth/presentation/screens/register_screen.dart';
import '../features/onboarding/presentation/screens/onboarding_screen.dart';
import '../features/home/presentation/screens/home_screen.dart';
import '../features/map/presentation/screens/map_screen.dart';
import '../features/search/presentation/screens/explore_screen.dart';
import '../features/search/presentation/screens/search_screen.dart';
import '../features/favorites/presentation/screens/favorites_screen.dart';
import '../features/profile/presentation/screens/profile_screen.dart';
import '../features/places/presentation/screens/place_detail_screen.dart';
import '../features/places/presentation/screens/places_list_screen.dart';
import '../features/events/presentation/screens/event_detail_screen.dart';
import '../features/reviews/presentation/screens/create_review_screen.dart';
import '../features/profile/presentation/screens/edit_profile_screen.dart';
import '../features/profile/presentation/screens/settings_screen.dart';
import '../features/profile/presentation/screens/my_reviews_screen.dart';
import '../features/profile/presentation/screens/privacy_policy_screen.dart';
import '../features/home/presentation/screens/main_shell.dart';
import '../features/trips/presentation/screens/trips_list_screen.dart';
import '../features/trips/presentation/screens/trip_detail_screen.dart';
import '../features/trips/presentation/screens/create_trip_screen.dart';
import '../features/events/presentation/screens/events_screen.dart';
import '../features/promotions/presentation/screens/promotions_screen.dart';
import '../features/promotions/presentation/screens/promotion_detail_screen.dart';
import '../features/notifications/presentation/screens/notifications_screen.dart';
import '../features/places/data/places_service.dart';
import '../features/reservations/presentation/screens/create_reservation_screen.dart';
import '../features/reservations/presentation/screens/payment_screen.dart';
import '../features/reservations/presentation/screens/reservation_waiting_screen.dart';
import '../features/reservations/presentation/screens/my_reservations_screen.dart';
import '../features/traveler_photos/data/traveler_photos_service.dart';
import '../features/traveler_photos/presentation/screens/traveler_photo_detail_screen.dart';
import '../features/traveler_photos/presentation/screens/traveler_photos_grid_screen.dart';
import '../features/traveler_photos/presentation/screens/create_traveler_photo_screen.dart';
import '../features/home/data/home_experience.dart';
import '../features/home/presentation/screens/experience_detail_screen.dart';
import '../features/hotels/presentation/screens/hotels_screen.dart';
import '../features/things_to_do/presentation/screens/essential_screen.dart';
import '../features/things_to_do/presentation/screens/things_to_do_screen.dart';
import '../features/things_to_do/presentation/screens/all_categories_screen.dart';
import '../features/restaurants/presentation/screens/restaurants_screen.dart';

final rootNavigatorKey = GlobalKey<NavigatorState>();

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    navigatorKey: rootNavigatorKey,
    initialLocation: '/splash',
    redirect: (context, state) {
      final isAuthenticated = TokenManager.hasToken;
      final isAuthRoute = state.matchedLocation == '/login' ||
          state.matchedLocation == '/register' ||
          state.matchedLocation == '/splash' ||
          state.matchedLocation == '/onboarding';

      final protectedRoutes = ['/favorites', '/profile', '/profile/edit', '/profile/reviews', '/settings', '/reservations', '/traveler-photos/create'];
      final isProtectedRoute = protectedRoutes.any((r) => state.matchedLocation.startsWith(r));
      final isReviewRoute = state.matchedLocation.contains('/review');
      final isReserveRoute = state.matchedLocation.contains('/reserve');

      // If not authenticated and trying to access protected route, redirect to login
      if (!isAuthenticated && (isProtectedRoute || isReviewRoute || isReserveRoute)) {
        return '/login';
      }

      // If authenticated and on auth routes, redirect to home
      if (isAuthenticated && isAuthRoute && state.matchedLocation != '/splash') {
        return '/';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      ShellRoute(
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          GoRoute(
            path: '/',
            builder: (context, state) => const HomeScreen(),
          ),
          GoRoute(
            path: '/map',
            builder: (context, state) => const MapScreen(),
          ),
          GoRoute(
            path: '/explore',
            builder: (context, state) => const ExploreScreen(),
          ),
          GoRoute(
            path: '/favorites',
            builder: (context, state) => const FavoritesScreen(),
          ),
          GoRoute(
            path: '/profile',
            builder: (context, state) => const ProfileScreen(),
          ),
        ],
      ),
      GoRoute(
        path: '/search',
        builder: (context, state) => const SearchScreen(),
      ),
      GoRoute(
        path: '/hotels',
        builder: (context, state) => const HotelsScreen(),
      ),
      GoRoute(
        path: '/restaurants',
        builder: (context, state) => const RestaurantsScreen(),
      ),
      GoRoute(
        path: '/things-to-do',
        builder: (context, state) => const ThingsToDoScreen(),
      ),
      GoRoute(
        path: '/things-to-do/categories',
        builder: (context, state) => const AllCategoriesScreen(),
      ),
      GoRoute(
        path: '/experiences/essential',
        builder: (context, state) => const EssentialScreen(),
      ),
      GoRoute(
        path: '/places/category/:slug',
        builder: (context, state) => PlacesListScreen(
          categorySlug: state.pathParameters['slug']!,
          categoryName: state.uri.queryParameters['name'] ?? state.extra as String? ?? '',
        ),
      ),
      GoRoute(
        path: '/places/:id',
        builder: (context, state) => PlaceDetailScreen(
          placeId: state.pathParameters['id']!,
        ),
      ),
      GoRoute(
        path: '/experiences/:id',
        builder: (context, state) => ExperienceDetailScreen(
          experienceId: state.pathParameters['id']!,
          initial: state.extra is HomeExperience
              ? state.extra as HomeExperience
              : null,
        ),
      ),
      GoRoute(
        path: '/events/:id',
        builder: (context, state) => EventDetailScreen(
          eventId: state.pathParameters['id']!,
        ),
      ),
      GoRoute(
        path: '/places/:id/review',
        builder: (context, state) => CreateReviewScreen(
          placeId: state.pathParameters['id']!,
          placeName: state.extra as String? ?? '',
        ),
      ),
      GoRoute(
        path: '/profile/edit',
        builder: (context, state) => const EditProfileScreen(),
      ),
      GoRoute(
        path: '/profile/reviews',
        builder: (context, state) => const MyReviewsScreen(),
      ),
      GoRoute(
        path: '/profile/privacy',
        builder: (context, state) => const PrivacyPolicyScreen(),
      ),
      GoRoute(
        path: '/settings',
        builder: (context, state) => const SettingsScreen(),
      ),
      GoRoute(
        path: '/trips',
        builder: (context, state) => const TripsListScreen(),
      ),
      GoRoute(
        path: '/trips/create',
        builder: (context, state) => const CreateTripScreen(),
      ),
      GoRoute(
        path: '/trips/:id',
        builder: (context, state) => TripDetailScreen(
          tripId: state.pathParameters['id']!,
        ),
      ),
      GoRoute(
        path: '/events',
        builder: (context, state) => const EventsScreen(),
      ),
      GoRoute(
        path: '/promotions',
        builder: (context, state) => const PromotionsScreen(),
      ),
      GoRoute(
        path: '/promotions/:id',
        builder: (context, state) => PromotionDetailScreen(
          promotionId: state.pathParameters['id']!,
        ),
      ),
      GoRoute(
        path: '/notifications',
        builder: (context, state) => const NotificationsScreen(),
      ),
      GoRoute(
        path: '/places/:id/reserve',
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>? ?? const {};
          return CreateReservationScreen(
            placeId: state.pathParameters['id']!,
            placeName: extra['placeName']?.toString() ?? '',
            priceLevel: extra['priceLevel'],
            products: extra['products'] is List
                ? (extra['products'] as List).whereType<Product>().toList()
                : null,
          );
        },
      ),
      GoRoute(
        path: '/places/:id/reserve/waiting',
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>? ?? const {};
          return ReservationWaitingScreen(
            reservationId: extra['reservationId']?.toString() ?? '',
            placeName: extra['placeName']?.toString() ?? '',
            partySize: extra['partySize'] is int ? extra['partySize'] as int : 1,
            date: extra['date']?.toString() ?? '',
            time: extra['time']?.toString() ?? '',
            responseDeadline: DateTime.tryParse(extra['responseDeadline']?.toString() ?? ''),
          );
        },
      ),
      GoRoute(
        path: '/places/:id/reserve/pay',
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>? ?? const {};
          return PaymentScreen(
            reservationId: extra['reservationId']?.toString() ?? '',
            placeName: extra['placeName']?.toString() ?? '',
            amount: (extra['amount'] is num ? extra['amount'] as num : 0).toDouble(),
            partySize: extra['partySize'] is int ? extra['partySize'] as int : 1,
            date: extra['date']?.toString() ?? '',
            time: extra['time']?.toString() ?? '',
            paymentId: extra['paymentId']?.toString() ?? '',
            qrData: extra['qrData']?.toString(),
            expiresAt: DateTime.tryParse(extra['expiresAt']?.toString() ?? ''),
          );
        },
      ),
      GoRoute(
        path: '/reservations',
        builder: (context, state) => const MyReservationsScreen(),
      ),
      GoRoute(
        path: '/traveler-photos',
        builder: (context, state) => const TravelerPhotosGridScreen(),
      ),
      GoRoute(
        path: '/traveler-photos/create',
        builder: (context, state) => const CreateTravelerPhotoScreen(),
      ),
      GoRoute(
        path: '/traveler-photos/:id',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          final initial = state.extra;
          return TravelerPhotoDetailScreen(
            photoId: id,
            initialPhoto: initial is TravelerPhoto ? initial : null,
          );
        },
      ),
    ],
  );
});

final themeModeProvider = StateProvider<ThemeMode>((ref) {
  final box = Hive.box('settings');
  final isDark = box.get('darkMode', defaultValue: false);
  return isDark ? ThemeMode.dark : ThemeMode.light;
});
