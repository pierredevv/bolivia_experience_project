import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../../core/network/dio_provider.dart';
import '../../data/places_service.dart';

enum PlacesStatus { initial, loading, loaded, error, loadingMore }

class PlacesState {
  final PlacesStatus status;
  final List<Place> places;
  final int currentPage;
  final int totalPages;
  final bool hasNext;
  final String? errorMessage;
  final String? selectedCategory;

  const PlacesState({
    this.status = PlacesStatus.initial,
    this.places = const [],
    this.currentPage = 1,
    this.totalPages = 1,
    this.hasNext = false,
    this.errorMessage,
    this.selectedCategory,
  });

  PlacesState copyWith({
    PlacesStatus? status,
    List<Place>? places,
    int? currentPage,
    int? totalPages,
    bool? hasNext,
    String? errorMessage,
    String? selectedCategory,
  }) {
    return PlacesState(
      status: status ?? this.status,
      places: places ?? this.places,
      currentPage: currentPage ?? this.currentPage,
      totalPages: totalPages ?? this.totalPages,
      hasNext: hasNext ?? this.hasNext,
      errorMessage: errorMessage,
      selectedCategory: selectedCategory ?? this.selectedCategory,
    );
  }
}

final placesServiceProvider = Provider<PlacesService>((ref) {
  final dio = ref.read(dioProvider);
  return PlacesService(dio);
});

final placesProvider = StateNotifierProvider<PlacesNotifier, PlacesState>((ref) {
  return PlacesNotifier(ref.read(placesServiceProvider));
});

class PlacesNotifier extends StateNotifier<PlacesState> {
  final PlacesService _placesService;

  PlacesNotifier(this._placesService) : super(const PlacesState());

  Future<void> loadPlacesByCategory(String categorySlug) async {
    state = state.copyWith(
      status: PlacesStatus.loading,
      selectedCategory: categorySlug,
      errorMessage: null,
    );

    try {
      final result = await _placesService.getPlacesByCategory(
        categorySlug: categorySlug,
        page: 1,
        limit: 10,
      );

      state = state.copyWith(
        status: PlacesStatus.loaded,
        places: result.data,
        currentPage: result.page,
        totalPages: result.totalPages,
        hasNext: result.hasNext,
      );
    } on DioException catch (e) {
      String message = 'Error al cargar lugares';
      if (e.response != null) {
        final statusCode = e.response?.statusCode;
        if (statusCode == 401) {
          message = 'Sesión expirada. Iniciá sesión nuevamente.';
        } else if (statusCode == 404) {
          message = 'No se encontraron lugares para esta categoría.';
        } else if (statusCode == 500) {
          message = 'Error del servidor. Intentá más tarde.';
        }
      } else if (e.type == DioExceptionType.connectionError ||
          e.type == DioExceptionType.unknown) {
        message = 'Sin conexión a internet. Verificá tu red.';
      }
      state = state.copyWith(
        status: PlacesStatus.error,
        errorMessage: message,
      );
    } catch (e) {
      state = state.copyWith(
        status: PlacesStatus.error,
        errorMessage: 'Error inesperado. Intentá de nuevo.',
      );
    }
  }

  Future<void> loadMorePlaces() async {
    if (!state.hasNext || state.status == PlacesStatus.loadingMore) return;

    state = state.copyWith(status: PlacesStatus.loadingMore);

    try {
      final result = await _placesService.getPlacesByCategory(
        categorySlug: state.selectedCategory ?? '',
        page: state.currentPage + 1,
        limit: 10,
      );

      state = state.copyWith(
        status: PlacesStatus.loaded,
        places: [...state.places, ...result.data],
        currentPage: result.page,
        totalPages: result.totalPages,
        hasNext: result.hasNext,
      );
    } on DioException catch (_) {
      state = state.copyWith(
        status: PlacesStatus.loaded,
        errorMessage: 'Error al cargar más lugares',
      );
    } catch (_) {
      state = state.copyWith(
        status: PlacesStatus.loaded,
        errorMessage: 'Error inesperado',
      );
    }
  }
}