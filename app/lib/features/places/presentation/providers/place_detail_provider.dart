import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../../core/network/dio_provider.dart';
import '../../../../config/api_constants.dart';
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
      errorMessage: errorMessage,
    );
  }
}

final placeDetailServiceProvider = Provider<PlacesService>((ref) {
  final dio = ref.read(dioProvider);
  return PlacesService(dio);
});

final placeDetailProvider = StateNotifierProvider.family<PlaceDetailNotifier, PlaceDetailState, String>((ref, placeId) {
  return PlaceDetailNotifier(ref.read(placeDetailServiceProvider), placeId);
});

class PlaceDetailNotifier extends StateNotifier<PlaceDetailState> {
  final PlacesService _placesService;
  final String _placeId;

  PlaceDetailNotifier(this._placesService, this._placeId) : super(const PlaceDetailState()) {
    loadPlaceDetail();
  }

  Future<void> loadPlaceDetail() async {
    if (!mounted) return;
    state = state.copyWith(status: PlaceDetailStatus.loading, errorMessage: null);

    try {
      final results = await Future.wait([
        _placesService.getPlaceById(_placeId),
        _placesService.getPlacePhotos(_placeId),
        _placesService.getPlaceReviews(_placeId),
      ]);

      if (!mounted) return;
      state = state.copyWith(
        status: PlaceDetailStatus.loaded,
        place: results[0] as Place,
        photos: results[1] as List<dynamic>,
        reviews: results[2] as List<dynamic>,
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
    if (!mounted) return;

    final currentFavorite = state.isFavorite;
    state = state.copyWith(isFavorite: !currentFavorite);

    try {
      final dio = Dio();
      final token = await _getStoredToken();

      if (token == null) {
        state = state.copyWith(isFavorite: currentFavorite);
        return;
      }

      if (currentFavorite) {
        // Remove from favorites
        await dio.delete(
          '${ApiConstants.baseUrl}${ApiConstants.favorites}/$_placeId',
          options: Options(
            headers: {'Authorization': 'Bearer $token'},
          ),
        );
      } else {
        // Add to favorites
        await dio.post(
          '${ApiConstants.baseUrl}${ApiConstants.favorites}/$_placeId',
          options: Options(
            headers: {'Authorization': 'Bearer $token'},
          ),
        );
      }
    } catch (e) {
      // Revert on error
      if (mounted) {
        state = state.copyWith(isFavorite: currentFavorite);
      }
    }
  }

  Future<String?> _getStoredToken() async {
    // This would use flutter_secure_storage in production
    // For now, return null if not authenticated
    return null;
  }
}
