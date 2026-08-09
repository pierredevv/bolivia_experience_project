import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../config/colors.dart';
import '../../data/notifications_service.dart';
import '../providers/notifications_provider.dart';

class NotificationsScreen extends ConsumerStatefulWidget {
  const NotificationsScreen({super.key});

  @override
  ConsumerState<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends ConsumerState<NotificationsScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(notificationsProvider.notifier).load());
  }

  void _onTap(NotificationItem notification) {
    ref.read(notificationsProvider.notifier).markAsRead(notification.id);

    final type = notification.type;
    final data = notification.parsedData;
    switch (type) {
      case 'events':
        context.push('/events');
        break;
      case 'promotions':
        context.push('/promotions');
        break;
      case 'place':
        final placeId = data['placeId'];
        if (placeId != null) {
          context.push('/places/$placeId');
        }
        break;
      case 'event':
        final eventId = data['eventId'];
        if (eventId != null) {
          context.push('/events/$eventId');
        }
        break;
      case 'reservation':
      case 'reservation_confirmed':
      case 'reservation_rejected':
      case 'reservation_expired':
      case 'reservation_completed':
      case 'reservation_no_show':
      case 'reservation_request':
      case 'reservation_cancelled':
        context.push('/reservations');
        break;
      default:
        // Welcome or unknown type - stay on screen
        break;
    }
  }

  IconData _getNotificationIcon(String type) {
    switch (type) {
      case 'welcome':
        return Icons.waving_hand;
      case 'events':
        return Icons.event;
      case 'promotions':
        return Icons.local_offer;
      case 'place':
        return Icons.place;
      case 'event':
        return Icons.event_available;
      case 'reservation':
      case 'reservation_confirmed':
      case 'reservation_request':
      case 'reservation_cancelled':
        return Icons.event_note;
      case 'reservation_rejected':
      case 'reservation_expired':
      case 'reservation_no_show':
        return Icons.notifications_off_outlined;
      case 'reservation_completed':
        return Icons.check_circle_outline;
      default:
        return Icons.notifications;
    }
  }

  Color _getNotificationColor(String type) {
    switch (type) {
      case 'welcome':
        return AppColors.primary700;
      case 'events':
        return AppColors.success700;
      case 'promotions':
        return AppColors.secondary700;
      case 'place':
        return AppColors.error700;
      case 'reservation_confirmed':
      case 'reservation_completed':
        return AppColors.brandEmerald;
      case 'reservation_rejected':
      case 'reservation_expired':
      case 'reservation_no_show':
        return AppColors.error500;
      case 'reservation':
      case 'reservation_request':
      case 'reservation_cancelled':
        return AppColors.brandGold;
      default:
        return AppColors.neutral600;
    }
  }

  String _formatTimestamp(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inMinutes < 1) return 'Recién';
    if (difference.inMinutes < 60) return 'Hace ${difference.inMinutes} min';
    if (difference.inHours < 24) return 'Hace ${difference.inHours}h';
    if (difference.inDays < 7) return 'Hace ${difference.inDays}d';
    return '${date.day}/${date.month}/${date.year}';
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(notificationsProvider);
    final notifications = state.notifications;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notificaciones'),
        actions: [
          if (notifications.any((n) => !n.isRead))
            TextButton(
              onPressed: () => ref.read(notificationsProvider.notifier).markAllAsRead(),
              child: const Text('Marcar todo leído'),
            ),
        ],
      ),
      body: _buildBody(state),
    );
  }

  Widget _buildBody(NotificationsState state) {
    if (state.status == NotificationsStatus.initial ||
        state.status == NotificationsStatus.loading) {
      return const Center(child: CircularProgressIndicator(color: AppColors.brandDark));
    }

    if (state.status == NotificationsStatus.error && state.notifications.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.notifications_off_outlined, size: 64, color: AppColors.neutral400),
              const SizedBox(height: 16),
              Text(
                'No se pudieron cargar las notificaciones',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 8),
              Text(
                'Revisá tu conexión e intentá de nuevo',
                style: Theme.of(context).textTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref.read(notificationsProvider.notifier).load(),
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.brandDark),
                child: const Text('Reintentar'),
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
              const Icon(Icons.notifications_none, size: 64, color: AppColors.neutral400),
              const SizedBox(height: 16),
              Text(
                'No tienes notificaciones',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 8),
              Text(
                'Las notificaciones de reservas, eventos y promociones aparecerán aquí',
                style: Theme.of(context).textTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () => ref.read(notificationsProvider.notifier).load(),
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(vertical: 8),
        itemCount: state.notifications.length,
        separatorBuilder: (_, __) => const Divider(height: 1),
        itemBuilder: (context, index) {
          final notification = state.notifications[index];
          final isRead = notification.isRead;
          final type = notification.type;

          return ListTile(
            onTap: () => _onTap(notification),
            leading: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: _getNotificationColor(type).withAlpha(25),
                shape: BoxShape.circle,
              ),
              child: Icon(
                _getNotificationIcon(type),
                color: _getNotificationColor(type),
                size: 20,
              ),
            ),
            title: Text(
              notification.title,
              style: TextStyle(
                fontWeight: isRead ? FontWeight.normal : FontWeight.w600,
                color: AppColors.brandDark,
              ),
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 4),
                Text(
                  notification.body,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                const SizedBox(height: 4),
                Text(
                  _formatTimestamp(notification.createdAt),
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppColors.neutral500,
                  ),
                ),
              ],
            ),
            trailing: !isRead
                ? Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: AppColors.primary700,
                      shape: BoxShape.circle,
                    ),
                  )
                : null,
          );
        },
      ),
    );
  }
}
