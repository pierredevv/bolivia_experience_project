import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../../core/network/dio_provider.dart';
import '../../data/reviews_service.dart';

enum ReviewsStatus { initial, loading, loaded, error }

class ReviewsState {
  final ReviewsStatus status;
  final List<Review> reviews;
  final String? errorMessage;

  const ReviewsState({
    this.status = ReviewsStatus.initial,
    this.reviews = const [],
    this.errorMessage,
  });

  ReviewsState copyWith({
    ReviewsStatus? status,
    List<Review>? reviews,
    String? errorMessage,
  }) {
    return ReviewsState(
      status: status ?? this.status,
      reviews: reviews ?? this.reviews,
      errorMessage: errorMessage,
    );
  }
}

final reviewsServiceProvider = Provider<ReviewsService>((ref) {
  final dio = ref.read(dioProvider);
  return ReviewsService(dio);
});

final reviewsProvider = StateNotifierProvider<ReviewsNotifier, ReviewsState>((ref) {
  return ReviewsNotifier(ref.read(reviewsServiceProvider));
});

class ReviewsNotifier extends StateNotifier<ReviewsState> {
  final ReviewsService _reviewsService;

  ReviewsNotifier(this._reviewsService) : super(const ReviewsState());

  Future<void> loadReviews(String placeId) async {
    if (!mounted) return;
    state = state.copyWith(status: ReviewsStatus.loading, errorMessage: null);

    try {
      final reviews = await _reviewsService.getPlaceReviews(placeId);
      if (!mounted) return;
      state = state.copyWith(
        status: ReviewsStatus.loaded,
        reviews: reviews,
      );
    } on DioException catch (e) {
      if (!mounted) return;
      String message = 'Error al cargar reseñas';
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
        status: ReviewsStatus.error,
        errorMessage: message,
      );
    } catch (e) {
      if (!mounted) return;
      state = state.copyWith(
        status: ReviewsStatus.error,
        errorMessage: 'Error inesperado. Intentá de nuevo.',
      );
    }
  }

  Future<void> createReview({
    required String placeId,
    required int rating,
    required String comment,
  }) async {
    state = state.copyWith(status: ReviewsStatus.loading, errorMessage: null);

    try {
      final review = await _reviewsService.createReview(
        placeId: placeId,
        rating: rating,
        comment: comment,
      );
      state = state.copyWith(
        status: ReviewsStatus.loaded,
        reviews: [review, ...state.reviews],
      );
    } on DioException catch (e) {
      String message = 'Error al crear reseña';
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
        status: ReviewsStatus.error,
        errorMessage: message,
      );
    } catch (e) {
      state = state.copyWith(
        status: ReviewsStatus.error,
        errorMessage: 'Error inesperado. Intentá de nuevo.',
      );
    }
  }
}