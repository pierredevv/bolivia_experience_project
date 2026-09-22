import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/dio_provider.dart';
import '../../../reservations/data/reservations_service.dart';
import '../../../reservations/presentation/providers/reservations_provider.dart';
import '../../data/support_service.dart';

final supportServiceProvider = Provider<SupportService>((ref) {
  return SupportService(ref.read(dioProvider));
});

final supportTicketsProvider = StateNotifierProvider<SupportTicketsNotifier, SupportTicketsState>(
  (ref) => SupportTicketsNotifier(ref.read(supportServiceProvider), ref.read(reservationsServiceProvider)),
);

enum SupportStatus { initial, loading, loaded, error }

class SupportTicketsState {
  final SupportStatus status;
  final List<SupportTicket> tickets;
  final List<Reservation> reservations;
  final String? errorMessage;

  const SupportTicketsState({
    this.status = SupportStatus.initial,
    this.tickets = const [],
    this.reservations = const [],
    this.errorMessage,
  });

  SupportTicketsState copyWith({
    SupportStatus? status,
    List<SupportTicket>? tickets,
    List<Reservation>? reservations,
    String? errorMessage,
  }) {
    return SupportTicketsState(
      status: status ?? this.status,
      tickets: tickets ?? this.tickets,
      reservations: reservations ?? this.reservations,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}

class SupportTicketsNotifier extends StateNotifier<SupportTicketsState> {
  final SupportService _service;
  final ReservationsService _reservationsService;

  SupportTicketsNotifier(this._service, this._reservationsService)
      : super(const SupportTicketsState());

  Future<void> loadAll() async {
    if (!mounted) return;
    state = state.copyWith(status: SupportStatus.loading, errorMessage: null);
    try {
      final tickets = await _service.getMyTickets();
      final reservations = await _reservationsService.getMyReservations();
      if (!mounted) return;
      state = state.copyWith(
        status: SupportStatus.loaded,
        tickets: tickets,
        reservations: reservations,
      );
    } catch (e) {
      if (!mounted) return;
      state = state.copyWith(
        status: SupportStatus.error,
        errorMessage: 'Error al cargar tus tickets de soporte',
      );
    }
  }

  Future<void> createTicket({
    required String type,
    String? reservationId,
    required String subject,
    required String description,
  }) async {
    await _service.createTicket(
      type: type,
      reservationId: reservationId,
      subject: subject,
      description: description,
    );
    await loadAll();
  }

  Future<void> reply(String ticketId, String body) async {
    await _service.addMessage(ticketId, body);
    await loadAll();
  }
}