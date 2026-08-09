import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/dio_provider.dart';
import '../../data/notifications_service.dart';

final notificationsServiceProvider = Provider<NotificationsService>((ref) {
  final dio = ref.read(dioProvider);
  return NotificationsService(dio);
});

enum NotificationsStatus { initial, loading, loaded, error }

class NotificationsState {
  final NotificationsStatus status;
  final List<NotificationItem> notifications;
  final String? errorMessage;

  const NotificationsState({
    this.status = NotificationsStatus.initial,
    this.notifications = const [],
    this.errorMessage,
  });

  NotificationsState copyWith({
    NotificationsStatus? status,
    List<NotificationItem>? notifications,
    String? errorMessage,
  }) {
    return NotificationsState(
      status: status ?? this.status,
      notifications: notifications ?? this.notifications,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}

final notificationsProvider =
    StateNotifierProvider<NotificationsNotifier, NotificationsState>((ref) {
  return NotificationsNotifier(ref.read(notificationsServiceProvider));
});

class NotificationsNotifier extends StateNotifier<NotificationsState> {
  final NotificationsService _service;

  NotificationsNotifier(this._service) : super(const NotificationsState());

  Future<void> load() async {
    state = state.copyWith(status: NotificationsStatus.loading, errorMessage: null);
    try {
      final notifications = await _service.getNotifications();
      if (!mounted) return;
      state = state.copyWith(status: NotificationsStatus.loaded, notifications: notifications);
    } catch (e) {
      if (!mounted) return;
      state = state.copyWith(
        status: NotificationsStatus.error,
        errorMessage: 'Error al cargar las notificaciones',
      );
    }
  }

  Future<void> markAsRead(String id) async {
    try {
      await _service.markAsRead(id);
      if (!mounted) return;
      state = state.copyWith(
        notifications: state.notifications
            .map((n) => n.id == id ? n.copyWith(isRead: true) : n)
            .toList(),
      );
    } catch (_) {}
  }

  Future<void> markAllAsRead() async {
    try {
      await _service.markAllAsRead();
      if (!mounted) return;
      state = state.copyWith(
        notifications: state.notifications
            .map((n) => n.copyWith(isRead: true))
            .toList(),
      );
    } catch (_) {}
  }
}
