import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../../core/network/dio_provider.dart';
import '../../../favorites/presentation/providers/favorites_provider.dart';
import '../../data/places_service.dart';

enum PlaceDetailStatus { initial, loading, loaded, error }

class PlaceDetailState {
  final PlaceDetailStatus status;
  final Place? place;
  final List<dynamic> photos;
  final List<dynamic> reviews;
  final bool isFavorite;
  final String? errorMessage;

  const PlaceDetailState({
    this.status = PlaceDetailStatus.initial,
    this.place,
    this.photos = const [],
    this.reviews = const [],
    this.isFavorite = false,
    this.errorMessage,
  });

  PlaceDetailState copyWith({
    PlaceDetailStatus? status,
    Place? place,
    List<dynamic>? photos,
    List<dynamic>? reviews,
    bool? isFavorite,
    String? errorMessage,
  }) {
    return PlaceDetailState(
      status: status ?? this.status,
      place: place ?? this.place,
      photos: photos ?? this.photos,
      reviews: reviews ?? this.reviews,
      isFavorite: isFavorite ?? this.isFavorite,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}

final placeDetailServiceProvider = Provider<PlacesService>((ref) {
  final dio = ref.read(dioProvider);
  return PlacesService(dio);
});

final placeDetailProvider = StateNotifierProvider.family<PlaceDetailNotifier, PlaceDetailState, String>((ref, placeId) {
  return PlaceDetailNotifier(ref.read(placeDetailServiceProvider), ref, placeId);
});

class PlaceDetailNotifier extends StateNotifier<PlaceDetailState> {
  final PlacesService _placesService;
  final Ref _ref;
  final String _placeId;

  PlaceDetailNotifier(this._placesService, this._ref, this._placeId) : super(const PlaceDetailState()) {
    loadPlaceDetail();
  }

  Future<void> loadPlaceDetail() async {
    if (!mounted) return;
    state = state.copyWith(status: PlaceDetailStatus.loading, errorMessage: null);

    try {
      // Load place data first (critical)
      final place = await _placesService.getPlaceById(_placeId);

      if (!mounted) return;
      state = state.copyWith(place: place);

      // Load photos and reviews individually (non-critical, don't break UI)
      List<dynamic> photos = [];
      List<dynamic> reviews = [];

      try {
        photos = await _placesService.getPlacePhotos(_placeId);
      } catch (_) {
        // Photos failed, continue without them
      }

      try {
        reviews = await _placesService.getPlaceReviews(_placeId);
      } catch (_) {
        // Reviews failed, continue without them
      }

      // Check favorite status (non-critical)
      bool isFav = false;
      try {
        final favService = _ref.read(favoritesServiceProvider);
        isFav = await favService.checkFavorite(_placeId);
      } catch (_) {}

      if (!mounted) return;
      state = state.copyWith(
        status: PlaceDetailStatus.loaded,
        photos: photos,
        reviews: reviews,
        isFavorite: isFav,
      );
    } on DioException catch (e) {
      if (!mounted) return;
      String message = 'Error al cargar detalles del lugar';
      if (e.response != null) {
        final statusCode = e.response?.statusCode;
        if (statusCode == 401) {
          message = 'Sesión expirada. Iniciá sesión nuevamente.';
        } else if (statusCode == 404) {
          message = 'No se encontró el lugar solicitado.';
        } else if (statusCode == 500) {
          message = 'Error del servidor. Intentá más tarde.';
        }
      } else if (e.type == DioExceptionType.connectionError ||
          e.type == DioExceptionType.unknown) {
        message = 'Sin conexión a internet. Verificá tu red.';
      }
      state = state.copyWith(
        status: PlaceDetailStatus.error,
        errorMessage: message,
      );
    } catch (e) {
      if (!mounted) return;
      state = state.copyWith(
        status: PlaceDetailStatus.error,
        errorMessage: 'Error inesperado. Intentá de nuevo.',
      );
    }
  }

  Future<void> toggleFavorite() async {
    try {
      final favNotifier = _ref.read(favoritesProvider.notifier);
      if (state.isFavorite) {
        await favNotifier.removeFavorite(_placeId);
      } else {
        await favNotifier.addFavorite(_placeId);
      }
      if (!mounted) return;
      state = state.copyWith(isFavorite: !state.isFavorite);
    } catch (_) {}
  }
}