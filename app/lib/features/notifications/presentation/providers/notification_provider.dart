import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../../core/network/dio_provider.dart';
import '../../data/notification_service.dart';

enum NotificationStatus { initial, loading, loaded, error }

class NotificationState {
  final NotificationStatus status;
  final List<AppNotification> notifications;
  final int unreadCount;
  final String? errorMessage;

  const NotificationState({
    this.status = NotificationStatus.initial,
    this.notifications = const [],
    this.unreadCount = 0,
    this.errorMessage,
  });

  NotificationState copyWith({
    NotificationStatus? status,
    List<AppNotification>? notifications,
    int? unreadCount,
    String? errorMessage,
  }) {
    return NotificationState(
      status: status ?? this.status,
      notifications: notifications ?? this.notifications,
      unreadCount: unreadCount ?? this.unreadCount,
      errorMessage: errorMessage,
    );
  }
}

final notificationServiceProvider = Provider<NotificationService>((ref) {
  final dio = ref.read(dioProvider);
  return NotificationService(dio);
});

final notificationProvider = StateNotifierProvider<NotificationNotifier, NotificationState>((ref) {
  return NotificationNotifier(ref.read(notificationServiceProvider));
});

class NotificationNotifier extends StateNotifier<NotificationState> {
  final NotificationService _service;

  NotificationNotifier(this._service) : super(const NotificationState()) {
    loadNotifications();
  }

  Future<void> loadNotifications() async {
    if (!mounted) return;
    state = state.copyWith(status: NotificationStatus.loading, errorMessage: null);

    try {
      final results = await Future.wait([
        _service.getNotifications(),
        _service.getUnreadCount(),
      ]);

      if (!mounted) return;
      state = state.copyWith(
        status: NotificationStatus.loaded,
        notifications: results[0] as List<AppNotification>,
        unreadCount: results[1] as int,
      );
    } on DioException catch (e) {
      if (!mounted) return;
      String message = 'Error al cargar notificaciones';
      if (e.response?.statusCode == 401) {
        message = 'Sesión expirada. Iniciá sesión nuevamente.';
      } else if (e.type == DioExceptionType.connectionError ||
          e.type == DioExceptionType.unknown) {
        message = 'Sin conexión a internet.';
      }
      state = state.copyWith(
        status: NotificationStatus.error,
        errorMessage: message,
      );
    } catch (e) {
      if (!mounted) return;
      state = state.copyWith(
        status: NotificationStatus.error,
        errorMessage: 'Error inesperado.',
      );
    }
  }

  Future<void> markAsRead(String notificationId) async {
    try {
      await _service.markAsRead(notificationId);
      state = state.copyWith(
        notifications: state.notifications.map((n) {
          if (n.id == notificationId) {
            return AppNotification(
              id: n.id,
              title: n.title,
              body: n.body,
              type: n.type,
              data: n.data,
              isRead: true,
              createdAt: n.createdAt,
            );
          }
          return n;
        }).toList(),
        unreadCount: state.unreadCount > 0 ? state.unreadCount - 1 : 0,
      );
    } catch (e) {
      // Silently fail
    }
  }

  Future<void> markAllAsRead() async {
    try {
      await _service.markAllAsRead();
      state = state.copyWith(
        notifications: state.notifications.map((n) {
          return AppNotification(
            id: n.id,
            title: n.title,
            body: n.body,
            type: n.type,
            data: n.data,
            isRead: true,
            createdAt: n.createdAt,
          );
        }).toList(),
        unreadCount: 0,
      );
    } catch (e) {
      // Silently fail
    }
  }

  Future<void> deleteNotification(String notificationId) async {
    try {
      await _service.deleteNotification(notificationId);
      final removed = state.notifications.firstWhere((n) => n.id == notificationId);
      state = state.copyWith(
        notifications: state.notifications.where((n) => n.id != notificationId).toList(),
        unreadCount: removed.isRead ? state.unreadCount : (state.unreadCount > 0 ? state.unreadCount - 1 : 0),
      );
    } catch (e) {
      // Silently fail
    }
  }
}
