import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
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
        _homeService.getFeaturedPlaces(),
        _homeService.getCategories(),
        _homeService.getTodayEvents(),
        _homeService.getPromotions(),
      ]);

      state = state.copyWith(
        status: HomeStatus.loaded,
        featuredPlaces: results[0],
        categories: results[1],
        todayEvents: results[2],
        promotions: results[3],
      );
    } on DioException catch (e) {
      String message = 'Error al cargar datos';
      if (e.response != null) {
        final statusCode = e.response?.statusCode;
        if (statusCode == 401) {
          message = 'Sesión expirada. Iniciá sesión nuevamente.';
        } else if (statusCode == 500) {
          message = 'Error del servidor. Intentá más tarde.';
        }
      } else if (e.type == DioExceptionType.connectionError ||
          e.type == DioExceptionType.unknown) {
        message = 'Sin conexión a internet. Verificá tu red.';
      }
      state = state.copyWith(
        status: HomeStatus.error,
        errorMessage: message,
      );
    } catch (e) {
      state = state.copyWith(
        status: HomeStatus.error,
        errorMessage: 'Error inesperado. Intentá de nuevo.',
      );
    }
  }
}