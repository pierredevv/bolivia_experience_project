import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../../core/network/dio_provider.dart';
import '../../data/favorites_service.dart';

enum FavoritesStatus { initial, loading, loaded, error }

class FavoritesState {
  final FavoritesStatus status;
  final List<dynamic> favorites;
  final String? errorMessage;

  const FavoritesState({
    this.status = FavoritesStatus.initial,
    this.favorites = const [],
    this.errorMessage,
  });

  FavoritesState copyWith({
    FavoritesStatus? status,
    List<dynamic>? favorites,
    String? errorMessage,
  }) {
    return FavoritesState(
      status: status ?? this.status,
      favorites: favorites ?? this.favorites,
      errorMessage: errorMessage,
    );
  }
}

final favoritesServiceProvider = Provider<FavoritesService>((ref) {
  final dio = ref.read(dioProvider);
  return FavoritesService(dio);
});

final favoritesProvider = StateNotifierProvider<FavoritesNotifier, FavoritesState>((ref) {
  return FavoritesNotifier(ref.read(favoritesServiceProvider));
});

class FavoritesNotifier extends StateNotifier<FavoritesState> {
  final FavoritesService _favoritesService;

  FavoritesNotifier(this._favoritesService) : super(const FavoritesState()) {
    loadFavorites();
  }

  Future<void> loadFavorites() async {
    if (!mounted) return;
    state = state.copyWith(status: FavoritesStatus.loading, errorMessage: null);

    try {
      final favorites = await _favoritesService.getFavorites();
      if (!mounted) return;
      state = state.copyWith(
        status: FavoritesStatus.loaded,
        favorites: favorites,
      );
    } on DioException catch (e) {
      if (!mounted) return;
      String message = 'Error al cargar favoritos';
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
        status: FavoritesStatus.error,
        errorMessage: message,
      );
    } catch (e) {
      if (!mounted) return;
      state = state.copyWith(
        status: FavoritesStatus.error,
        errorMessage: 'Error inesperado. Intentá de nuevo.',
      );
    }
  }

  Future<void> addFavorite(String placeId) async {
    try {
      await _favoritesService.addFavorite(placeId);
      await loadFavorites();
    } on DioException catch (e) {
      String message = 'Error al agregar favorito';
      if (e.response != null) {
        final statusCode = e.response?.statusCode;
        if (statusCode == 401) {
          message = 'Sesión expirada. Iniciá sesión nuevamente.';
        } else if (statusCode == 409) {
          message = 'Ya está en tus favoritos';
        }
      }
      state = state.copyWith(errorMessage: message);
    } catch (e) {
      state = state.copyWith(errorMessage: 'Error inesperado');
    }
  }

  Future<void> removeFavorite(String placeId) async {
    try {
      await _favoritesService.removeFavorite(placeId);
      await loadFavorites();
    } on DioException catch (e) {
      String message = 'Error al quitar favorito';
      if (e.response != null) {
        final statusCode = e.response?.statusCode;
        if (statusCode == 401) {
          message = 'Sesión expirada. Iniciá sesión nuevamente.';
        }
      }
      state = state.copyWith(errorMessage: message);
    } catch (e) {
      state = state.copyWith(errorMessage: 'Error inesperado');
    }
  }

  Future<bool> checkFavorite(String placeId) async {
    try {
      return await _favoritesService.checkFavorite(placeId);
    } catch (e) {
      return false;
    }
  }
}