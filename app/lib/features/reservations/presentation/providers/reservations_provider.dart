import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/dio_provider.dart';
import '../../data/reservations_service.dart';

final reservationsServiceProvider = Provider<ReservationsService>((ref) {
  final dio = ref.read(dioProvider);
  return ReservationsService(dio);
});

enum ReservationsStatus { initial, loading, loaded, error }

class ReservationsState {
  final ReservationsStatus status;
  final List<Reservation> reservations;
  final List<PaymentRecord> payments;
  final String? errorMessage;

  const ReservationsState({
    this.status = ReservationsStatus.initial,
    this.reservations = const [],
    this.payments = const [],
    this.errorMessage,
  });

  ReservationsState copyWith({
    ReservationsStatus? status,
    List<Reservation>? reservations,
    List<PaymentRecord>? payments,
    String? errorMessage,
  }) {
    return ReservationsState(
      status: status ?? this.status,
      reservations: reservations ?? this.reservations,
      payments: payments ?? this.payments,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}

final reservationsProvider = StateNotifierProvider<ReservationsNotifier, ReservationsState>((ref) {
  return ReservationsNotifier(ref.read(reservationsServiceProvider));
});

class ReservationsNotifier extends StateNotifier<ReservationsState> {
  final ReservationsService _service;

  ReservationsNotifier(this._service) : super(const ReservationsState());

  Future<void> loadAll() async {
    if (!mounted) return;
    state = state.copyWith(status: ReservationsStatus.loading, errorMessage: null);
    try {
      final reservations = await _service.getMyReservations();
      final payments = await _service.getPaymentHistory();
      if (!mounted) return;
      state = state.copyWith(
        status: ReservationsStatus.loaded,
        reservations: reservations,
        payments: payments,
      );
    } catch (e) {
      if (!mounted) return;
      state = state.copyWith(
        status: ReservationsStatus.error,
        errorMessage: 'Error al cargar tus reservas',
      );
    }
  }

  Future<void> cancel(String id) async {
    try {
      await _service.cancelReservation(id);
      await loadAll();
    } catch (_) {}
  }
}
