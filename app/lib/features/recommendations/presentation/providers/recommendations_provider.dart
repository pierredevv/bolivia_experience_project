import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/dio_provider.dart';
import '../../data/recommendations_service.dart';
import '../../domain/recommendations.dart';

enum RecommendationsStatus { initial, loading, loaded, error }

class RecommendationsState {
  final RecommendationsStatus status;
  final PersonalizedRecommendations? data;
  final String? errorMessage;

  const RecommendationsState({
    this.status = RecommendationsStatus.initial,
    this.data,
    this.errorMessage,
  });

  RecommendationsState copyWith({
    RecommendationsStatus? status,
    PersonalizedRecommendations? data,
    String? errorMessage,
  }) {
    return RecommendationsState(
      status: status ?? this.status,
      data: data ?? this.data,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}

final recommendationsServiceProvider = Provider<RecommendationsService>((ref) {
  final dio = ref.read(dioProvider);
  return RecommendationsService(dio);
});

final recommendationsProvider =
    StateNotifierProvider.autoDispose<RecommendationsNotifier, RecommendationsState>((ref) {
  return RecommendationsNotifier(ref.read(recommendationsServiceProvider));
});

class RecommendationsNotifier extends StateNotifier<RecommendationsState> {
  final RecommendationsService _service;

  RecommendationsNotifier(this._service) : super(const RecommendationsState());

  Future<void> loadRecommendations() async {
    if (state.status == RecommendationsStatus.loading) return;
    state = state.copyWith(status: RecommendationsStatus.loading, errorMessage: null);
    try {
      final data = await _service.getPersonalized(limit: 12);
      state = state.copyWith(status: RecommendationsStatus.loaded, data: data);
    } catch (e) {
      state = state.copyWith(
        status: RecommendationsStatus.error,
        errorMessage: 'No pudimos cargar tus recomendaciones.',
      );
    }
  }
}
