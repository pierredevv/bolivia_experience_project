import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../../config/colors.dart';
import '../../data/notification_service.dart';

class NotificationTile extends StatelessWidget {
  final AppNotification notification;
  final VoidCallback? onTap;
  final VoidCallback? onDismiss;

  const NotificationTile({
    super.key,
    required this.notification,
    this.onTap,
    this.onDismiss,
  });

  @override
  Widget build(BuildContext context) {
    return Dismissible(
      key: Key(notification.id),
      direction: DismissDirection.endToStart,
      onDismissed: (_) => onDismiss?.call(),
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 16),
        color: AppColors.error500,
        child: const Icon(Icons.delete, color: Colors.white),
      ),
      child: ListTile(
        leading: _buildIcon(),
        title: Text(
          notification.title,
          style: TextStyle(
            fontWeight: notification.isRead ? FontWeight.normal : FontWeight.bold,
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              notification.body,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            if (notification.createdAt != null)
              Text(
                _formatDate(notification.createdAt!),
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppColors.neutral500,
                    ),
              ),
          ],
        ),
        trailing: !notification.isRead
            ? Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.primary700,
                ),
              )
            : null,
        onTap: onTap,
      ),
    );
  }

  Widget _buildIcon() {
    IconData icon;
    Color color;

    switch (notification.type) {
      case 'promotion':
        icon = Icons.local_offer;
        color = AppColors.secondary700;
        break;
      case 'event':
        icon = Icons.event;
        color = AppColors.primary700;
        break;
      case 'review':
        icon = Icons.rate_review;
        color = AppColors.success700;
        break;
      default:
        icon = Icons.notifications;
        color = AppColors.neutral600;
    }

    return CircleAvatar(
      backgroundColor: color.withOpacity(0.1),
      child: Icon(icon, color: color, size: 20),
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);

    if (diff.inMinutes < 60) return 'Hace ${diff.inMinutes}m';
    if (diff.inHours < 24) return 'Hace ${diff.inHours}h';
    if (diff.inDays < 7) return 'Hace ${diff.inDays}d';
    return DateFormat('dd/MM/yyyy').format(date);
  }
}
