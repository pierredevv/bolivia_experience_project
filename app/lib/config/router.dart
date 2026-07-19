import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hive/hive.dart';

import '../features/auth/presentation/screens/splash_screen.dart';
import '../features/auth/presentation/screens/login_screen.dart';
import '../features/auth/presentation/screens/register_screen.dart';
import '../features/home/presentation/screens/home_screen.dart';
import '../features/map/presentation/screens/map_screen.dart';
import '../features/search/presentation/screens/explore_screen.dart';
import '../features/search/presentation/screens/search_screen.dart';
import '../features/favorites/presentation/screens/favorites_screen.dart';
import '../features/profile/presentation/screens/profile_screen.dart';
import '../features/places/presentation/screens/place_detail_screen.dart';
import '../features/places/presentation/screens/places_list_screen.dart';
import '../features/events/presentation/screens/event_detail_screen.dart';
import '../features/events/presentation/screens/events_screen.dart';
import '../features/notifications/presentation/screens/notifications_screen.dart';
import '../features/promotions/presentation/screens/promotions_screen.dart';
import '../features/promotions/presentation/screens/promotion_detail_screen.dart';
import '../features/reviews/presentation/screens/create_review_screen.dart';
import '../features/profile/presentation/screens/edit_profile_screen.dart';
import '../features/profile/presentation/screens/settings_screen.dart';
import '../features/home/presentation/screens/main_shell.dart';

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/splash',
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
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
        path: '/places/category/:slug',
        builder: (context, state) => PlacesListScreen(
          categorySlug: state.pathParameters['slug']!,
          categoryName: state.extra as String? ?? '',
        ),
      ),
      GoRoute(
        path: '/places/:id',
        builder: (context, state) => PlaceDetailScreen(
          placeId: state.pathParameters['id']!,
        ),
      ),
      GoRoute(
        path: '/events',
        builder: (context, state) => const EventsScreen(),
      ),
      GoRoute(
        path: '/notifications',
        builder: (context, state) => const NotificationsScreen(),
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
        path: '/events/:id',
        builder: (context, state) => EventDetailScreen(
          eventId: state.pathParameters['id']!,
        ),
      ),
      GoRoute(
        path: '/places/:id/review',
        builder: (context, state) => CreateReviewScreen(
          placeId: state.pathParameters['id']!,
        ),
      ),
      GoRoute(
        path: '/profile/edit',
        builder: (context, state) => const EditProfileScreen(),
      ),
      GoRoute(
        path: '/settings',
        builder: (context, state) => const SettingsScreen(),
      ),
    ],
  );
});

final themeModeProvider = StateProvider<ThemeMode>((ref) {
  final box = Hive.box('settings');
  final isDark = box.get('darkMode', defaultValue: false);
  return isDark ? ThemeMode.dark : ThemeMode.light;
});
