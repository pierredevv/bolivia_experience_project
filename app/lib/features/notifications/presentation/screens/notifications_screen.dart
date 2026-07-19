import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../config/colors.dart';
import '../providers/notification_provider.dart';
import '../widgets/notification_tile.dart';

class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(notificationProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notificaciones'),
        actions: [
          if (state.unreadCount > 0)
            TextButton(
              onPressed: () => ref.read(notificationProvider.notifier).markAllAsRead(),
              child: const Text('Marcar todo leído'),
            ),
        ],
      ),
      body: _buildBody(context, ref, state),
    );
  }

  Widget _buildBody(BuildContext context, WidgetRef ref, NotificationState state) {
    if (state.status == NotificationStatus.loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (state.status == NotificationStatus.error) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 64, color: AppColors.error500),
              const SizedBox(height: 16),
              Text(
                state.errorMessage ?? 'Error al cargar notificaciones',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: () => ref.read(notificationProvider.notifier).loadNotifications(),
                icon: const Icon(Icons.refresh),
                label: const Text('Reintentar'),
              ),
            ],
          ),
        ),
      );
    }

    if (state.notifications.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.notifications_none, size: 64, color: AppColors.neutral400),
              const SizedBox(height: 16),
              Text(
                'Sin notificaciones',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 8),
              Text(
                'No tienes notificaciones nuevas',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () => ref.read(notificationProvider.notifier).loadNotifications(),
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(vertical: 8),
        itemCount: state.notifications.length,
        separatorBuilder: (_, __) => const Divider(height: 1),
        itemBuilder: (context, index) {
          final notification = state.notifications[index];
          return NotificationTile(
            notification: notification,
            onTap: () {
              if (!notification.isRead) {
                ref.read(notificationProvider.notifier).markAsRead(notification.id);
              }
            },
            onDismiss: () {
              ref.read(notificationProvider.notifier).deleteNotification(notification.id);
            },
          );
        },
      ),
    );
  }
}
