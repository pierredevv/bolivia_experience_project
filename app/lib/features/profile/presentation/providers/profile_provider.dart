import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../../core/network/dio_provider.dart';
import '../../data/profile_service.dart';
import '../../../reviews/data/reviews_service.dart';

enum ProfileStatus { initial, loading, loaded, error }

class ProfileState {
  final ProfileStatus status;
  final UserProfile? profile;
  final String? errorMessage;
  final int totalReviews;
  final double averageRating;

  const ProfileState({
    this.status = ProfileStatus.initial,
    this.profile,
    this.errorMessage,
    this.totalReviews = 0,
    this.averageRating = 0,
  });

  ProfileState copyWith({
    ProfileStatus? status,
    UserProfile? profile,
    String? errorMessage,
    int? totalReviews,
    double? averageRating,
  }) {
    return ProfileState(
      status: status ?? this.status,
      profile: profile ?? this.profile,
      errorMessage: errorMessage,
      totalReviews: totalReviews ?? this.totalReviews,
      averageRating: averageRating ?? this.averageRating,
    );
  }
}

final profileServiceProvider = Provider<ProfileService>((ref) {
  final dio = ref.read(dioProvider);
  return ProfileService(dio);
});

final reviewsServiceProvider = Provider<ReviewsService>((ref) {
  final dio = ref.read(dioProvider);
  return ReviewsService(dio);
});

final profileProvider = StateNotifierProvider<ProfileNotifier, ProfileState>((ref) {
  return ProfileNotifier(
    ref.read(profileServiceProvider),
    ref.read(reviewsServiceProvider),
  );
});

class ProfileNotifier extends StateNotifier<ProfileState> {
  final ProfileService _profileService;
  final ReviewsService _reviewsService;

  ProfileNotifier(this._profileService, this._reviewsService) : super(const ProfileState()) {
    loadProfile();
  }

  Future<void> loadProfile() async {
    if (!mounted) return;
    state = state.copyWith(status: ProfileStatus.loading, errorMessage: null);

    try {
      final profile = await _profileService.getProfile();
      if (!mounted) return;
      state = state.copyWith(
        status: ProfileStatus.loaded,
        profile: profile,
      );
      // Load review stats after profile loads
      _loadReviewStats();
    } on DioException catch (e) {
      if (!mounted) return;
      String message = 'Error al cargar perfil';
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
        status: ProfileStatus.error,
        errorMessage: message,
      );
    } catch (e) {
      if (!mounted) return;
      state = state.copyWith(
        status: ProfileStatus.error,
        errorMessage: 'Error inesperado. Intentá de nuevo.',
      );
    }
  }

  Future<void> _loadReviewStats() async {
    try {
      final stats = await _reviewsService.getUserReviewStats();
      if (!mounted) return;
      state = state.copyWith(
        totalReviews: stats['totalReviews'] ?? 0,
        averageRating: (stats['averageRating'] ?? 0).toDouble(),
      );
    } catch (_) {
      // Silently fail for review stats
    }
  }

  Future<void> updateProfile({String? name}) async {
    state = state.copyWith(status: ProfileStatus.loading, errorMessage: null);

    try {
      final profile = await _profileService.updateProfile(name: name);
      state = state.copyWith(
        status: ProfileStatus.loaded,
        profile: profile,
      );
    } on DioException catch (e) {
      String message = 'Error al actualizar perfil';
      if (e.response != null) {
        final statusCode = e.response?.statusCode;
        if (statusCode == 401) {
          message = 'Sesión expirada. Iniciá sesión nuevamente.';
        } else if (statusCode == 400) {
          final data = e.response?.data;
          final error = data?['error'];
          message = error?['message'] ?? 'Datos inválidos';
        } else if (statusCode == 500) {
          message = 'Error del servidor. Intentá más tarde.';
        }
      } else if (e.type == DioExceptionType.connectionError ||
          e.type == DioExceptionType.unknown) {
        message = 'Sin conexión a internet. Verificá tu red.';
      }
      state = state.copyWith(
        status: ProfileStatus.error,
        errorMessage: message,
      );
    } catch (e) {
      state = state.copyWith(
        status: ProfileStatus.error,
        errorMessage: 'Error inesperado. Intentá de nuevo.',
      );
    }
  }
}
