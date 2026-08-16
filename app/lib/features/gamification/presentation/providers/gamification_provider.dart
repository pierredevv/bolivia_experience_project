import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../../core/network/dio_provider.dart';
import '../../data/gamification_service.dart';

enum GamificationStatus { initial, loading, loaded, error }

class GamificationState {
  final GamificationStatus status;
  final GamificationSnapshot snapshot;
  final List<BadgeModel> allBadges;
  final String? errorMessage;

  const GamificationState({
    this.status = GamificationStatus.initial,
    this.snapshot = const GamificationSnapshot(),
    this.allBadges = const [],
    this.errorMessage,
  });

  GamificationState copyWith({
    GamificationStatus? status,
    GamificationSnapshot? snapshot,
    List<BadgeModel>? allBadges,
    String? errorMessage,
  }) {
    return GamificationState(
      status: status ?? this.status,
      snapshot: snapshot ?? this.snapshot,
      allBadges: allBadges ?? this.allBadges,
      errorMessage: errorMessage,
    );
  }
}

final gamificationServiceProvider = Provider<GamificationService>((ref) {
  final dio = ref.read(dioProvider);
  return GamificationService(dio);
});

final gamificationProvider =
    StateNotifierProvider<GamificationNotifier, GamificationState>((ref) {
  return GamificationNotifier(ref.read(gamificationServiceProvider));
});

class GamificationNotifier extends StateNotifier<GamificationState> {
  final GamificationService _service;

  GamificationNotifier(this._service) : super(const GamificationState());

  Future<void> load() async {
    if (state.status == GamificationStatus.loading) return;
    state = state.copyWith(status: GamificationStatus.loading, errorMessage: null);
    try {
      final snapshot = await _service.getMyGamification();
      if (!mounted) return;
      state = state.copyWith(
        status: GamificationStatus.loaded,
        snapshot: snapshot,
      );
    } on DioException catch (e) {
      if (!mounted) return;
      state = state.copyWith(
        status: GamificationStatus.error,
        errorMessage: _messageFrom(e),
      );
    } catch (_) {
      if (!mounted) return;
      state = state.copyWith(
        status: GamificationStatus.error,
        errorMessage: 'Error inesperado. Intentá de nuevo.',
      );
    }
  }

  Future<void> loadAllBadges() async {
    try {
      final badges = await _service.getAllBadges();
      if (!mounted) return;
      state = state.copyWith(allBadges: badges);
    } catch (_) {
      // silencioso
    }
  }

  String _messageFrom(DioException e) {
    if (e.response != null) {
      if (e.response?.statusCode == 401) return 'Sesión expirada';
      if (e.response?.statusCode == 500) return 'Error del servidor';
    }
    if (e.type == DioExceptionType.connectionError ||
        e.type == DioExceptionType.unknown) {
      return 'Sin conexión a internet';
    }
    return 'Error al cargar gamificación';
  }
}
