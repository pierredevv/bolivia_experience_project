import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../../core/network/dio_provider.dart';
import '../../data/events_service.dart';

enum EventsStatus { initial, loading, loaded, error }

class EventsState {
  final EventsStatus status;
  final List<Event> events;
  final String? errorMessage;

  const EventsState({
    this.status = EventsStatus.initial,
    this.events = const [],
    this.errorMessage,
  });

  EventsState copyWith({
    EventsStatus? status,
    List<Event>? events,
    String? errorMessage,
  }) {
    return EventsState(
      status: status ?? this.status,
      events: events ?? this.events,
      errorMessage: errorMessage,
    );
  }
}

final eventsServiceProvider = Provider<EventsService>((ref) {
  final dio = ref.read(dioProvider);
  return EventsService(dio);
});

final eventDetailProvider = FutureProvider.family<Event, String>((ref, id) async {
  final service = ref.read(eventsServiceProvider);
  return service.getEventById(id);
});

final eventsProvider = StateNotifierProvider<EventsNotifier, EventsState>((ref) {
  return EventsNotifier(ref.read(eventsServiceProvider));
});

class EventsNotifier extends StateNotifier<EventsState> {
  final EventsService _eventsService;

  EventsNotifier(this._eventsService) : super(const EventsState()) {
    loadEvents();
  }

  Future<void> loadEvents() async {
    if (!mounted) return;
    state = state.copyWith(status: EventsStatus.loading, errorMessage: null);

    try {
      final events = await _eventsService.getEvents();
      if (!mounted) return;
      state = state.copyWith(
        status: EventsStatus.loaded,
        events: events,
      );
    } on DioException catch (e) {
      if (!mounted) return;
      String message = 'Error al cargar eventos';
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
        status: EventsStatus.error,
        errorMessage: message,
      );
    } catch (e) {
      if (!mounted) return;
      state = state.copyWith(
        status: EventsStatus.error,
        errorMessage: 'Error inesperado. Intentá de nuevo.',
      );
    }
  }
}