import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../../core/network/dio_provider.dart';
import '../../data/promotion_service.dart';

enum PromotionsStatus { initial, loading, loaded, error }

class PromotionsState {
  final PromotionsStatus status;
  final List<Promotion> promotions;
  final String? errorMessage;

  const PromotionsState({
    this.status = PromotionsStatus.initial,
    this.promotions = const [],
    this.errorMessage,
  });

  PromotionsState copyWith({
    PromotionsStatus? status,
    List<Promotion>? promotions,
    String? errorMessage,
  }) {
    return PromotionsState(
      status: status ?? this.status,
      promotions: promotions ?? this.promotions,
      errorMessage: errorMessage,
    );
  }
}

final promotionsServiceProvider = Provider<PromotionsService>((ref) {
  final dio = ref.read(dioProvider);
  return PromotionsService(dio);
});

final promotionsProvider = StateNotifierProvider<PromotionsNotifier, PromotionsState>((ref) {
  return PromotionsNotifier(ref.read(promotionsServiceProvider));
});

class PromotionsNotifier extends StateNotifier<PromotionsState> {
  final PromotionsService _service;

  PromotionsNotifier(this._service) : super(const PromotionsState()) {
    loadPromotions();
  }

  Future<void> loadPromotions() async {
    if (!mounted) return;
    state = state.copyWith(status: PromotionsStatus.loading, errorMessage: null);

    try {
      final promotions = await _service.getPromotions();
      if (!mounted) return;
      state = state.copyWith(
        status: PromotionsStatus.loaded,
        promotions: promotions,
      );
    } on DioException catch (e) {
      if (!mounted) return;
      String message = 'Error al cargar promociones';
      if (e.response?.statusCode == 401) {
        message = 'Sesión expirada.';
      } else if (e.type == DioExceptionType.connectionError ||
          e.type == DioExceptionType.unknown) {
        message = 'Sin conexión a internet.';
      }
      state = state.copyWith(
        status: PromotionsStatus.error,
        errorMessage: message,
      );
    } catch (e) {
      if (!mounted) return;
      state = state.copyWith(
        status: PromotionsStatus.error,
        errorMessage: 'Error inesperado.',
      );
    }
  }
}

final promotionDetailProvider = FutureProvider.family<Promotion, String>((ref, promoId) async {
  final service = ref.read(promotionsServiceProvider);
  return service.getPromotionById(promoId);
});
