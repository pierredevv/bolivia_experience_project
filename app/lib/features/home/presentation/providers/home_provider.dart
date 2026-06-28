import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/dio_provider.dart';
import '../../data/home_service.dart';

enum HomeStatus { initial, loading, loaded, error }

class HomeState {
  final HomeStatus status;
  final List<dynamic> featuredPlaces;
  final List<dynamic> categories;
  final List<dynamic> todayEvents;
  final List<dynamic> promotions;
  final String? errorMessage;

  const HomeState({
    this.status = HomeStatus.initial,
    this.featuredPlaces = const [],
    this.categories = const [],
    this.todayEvents = const [],
    this.promotions = const [],
    this.errorMessage,
  });

  HomeState copyWith({
    HomeStatus? status,
    List<dynamic>? featuredPlaces,
    List<dynamic>? categories,
    List<dynamic>? todayEvents,
    List<dynamic>? promotions,
    String? errorMessage,
  }) {
    return HomeState(
      status: status ?? this.status,
      featuredPlaces: featuredPlaces ?? this.featuredPlaces,
      categories: categories ?? this.categories,
      todayEvents: todayEvents ?? this.todayEvents,
      promotions: promotions ?? this.promotions,
      errorMessage: errorMessage,
    );
  }
}

final homeServiceProvider = Provider<HomeService>((ref) {
  final dio = ref.read(dioProvider);
  return HomeService(dio);
});

final homeProvider = StateNotifierProvider<HomeNotifier, HomeState>((ref) {
  return HomeNotifier(ref.read(homeServiceProvider));
});

class HomeNotifier extends StateNotifier<HomeState> {
  final HomeService _homeService;

  HomeNotifier(this._homeService) : super(const HomeState()) {
    loadHomeData();
  }

  Future<void> loadHomeData() async {
    state = state.copyWith(status: HomeStatus.loading, errorMessage: null);
    try {
      final results = await Future.wait([
        _homeService.getFeaturedPlaces().catchError((_) => <dynamic>[]),
        _homeService.getCategories().catchError((_) => <dynamic>[]),
        _homeService.getTodayEvents().catchError((_) => <dynamic>[]),
        _homeService.getPromotions().catchError((_) => <dynamic>[]),
      ]);

      state = state.copyWith(
        status: HomeStatus.loaded,
        featuredPlaces: results[0],
        categories: results[1],
        todayEvents: results[2],
        promotions: results[3],
      );
    } catch (e) {
      state = state.copyWith(
        status: HomeStatus.error,
        errorMessage: 'Error inesperado. Intentá de nuevo.',
      );
    }
  }
}