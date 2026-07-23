import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:bolivia_experience/features/profile/presentation/screens/profile_screen.dart';
import 'package:bolivia_experience/features/profile/presentation/providers/profile_provider.dart';
import 'package:bolivia_experience/features/favorites/presentation/providers/favorites_provider.dart';
import 'package:bolivia_experience/l10n/app_localizations.dart';

class MockProfileNotifier extends StateNotifier<ProfileState> implements ProfileNotifier {
  MockProfileNotifier() : super(const ProfileState());

  @override
  Future<void> loadProfile() async {}

  @override
  Future<void> updateProfile({String? name}) async {}
}

class MockFavoritesNotifier extends StateNotifier<FavoritesState> implements FavoritesNotifier {
  MockFavoritesNotifier() : super(const FavoritesState());

  @override
  Future<void> loadFavorites() async {}

  @override
  Future<void> addFavorite(String placeId) async {}

  @override
  Future<void> removeFavorite(String placeId) async {}

  @override
  Future<bool> checkFavorite(String placeId) async => false;
}

void main() {
  group('ProfileScreen', () {
    late MockProfileNotifier mockProfileNotifier;
    late MockFavoritesNotifier mockFavoritesNotifier;

    setUp(() {
      mockProfileNotifier = MockProfileNotifier();
      mockFavoritesNotifier = MockFavoritesNotifier();
    });

    Widget buildTestableProfile() {
      return MaterialApp(
        localizationsDelegates: const [
          AppLocalizations.delegate,
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        supportedLocales: AppLocalizations.supportedLocales,
        home: ProviderScope(
          overrides: [
            profileProvider.overrideWith((ref) => mockProfileNotifier),
            favoritesProvider.overrideWith((ref) => mockFavoritesNotifier),
          ],
          child: const ProfileScreen(),
        ),
      );
    }

    testWidgets('renders profile screen', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestableProfile());
      await tester.pumpAndSettle();

      expect(find.byType(Scaffold), findsOneWidget);
    });

    testWidgets('shows profile menu items', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestableProfile());
      await tester.pumpAndSettle();

      expect(find.byType(ListTile), findsWidgets);
    });

    testWidgets('shows user avatar', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestableProfile());
      await tester.pumpAndSettle();

      expect(find.byType(CircleAvatar), findsOneWidget);
    });

    testWidgets('shows logout button', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestableProfile());
      await tester.pumpAndSettle();

      expect(find.byType(OutlinedButton), findsWidgets);
    });
  });
}
