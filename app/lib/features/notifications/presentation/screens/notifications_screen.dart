import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:hive/hive.dart';
import '../../../../config/colors.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  List<Map<String, dynamic>> _notifications = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    setState(() => _isLoading = true);

    try {
      final box = Hive.box('settings');
      final stored = box.get('notifications', defaultValue: <dynamic>[]);
      final List<Map<String, dynamic>> notifications = [];
      for (final item in stored) {
        if (item is Map) {
          notifications.add(Map<String, dynamic>.from(item));
        }
      }

      // If no stored notifications, show sample ones
      if (notifications.isEmpty) {
        notifications.addAll(_getSampleNotifications());
      }

      setState(() {
        _notifications = notifications;
        _isLoading = false;
      });
    } catch (_) {
      setState(() {
        _notifications = _getSampleNotifications();
        _isLoading = false;
      });
    }
  }

  List<Map<String, dynamic>> _getSampleNotifications() {
    return [
      {
        'id': '1',
        'title': 'Bienvenido a BoliviaExperience',
        'body': 'Explora los mejores lugares de Santa Cruz de la Sierra',
        'type': 'welcome',
        'timestamp': DateTime.now().subtract(const Duration(hours: 1)).toIso8601String(),
        'read': false,
      },
      {
        'id': '2',
        'title': 'Nuevos eventos disponibles',
        'body': 'Descubre los eventos que tenemos para ti esta semana',
        'type': 'events',
        'timestamp': DateTime.now().subtract(const Duration(hours: 3)).toIso8601String(),
        'read': false,
      },
      {
        'id': '3',
        'title': 'Promociones especiales',
        'body': 'No te pierdas nuestras ofertas exclusivas en restaurantes y hoteles',
        'type': 'promotions',
        'timestamp': DateTime.now().subtract(const Duration(days: 1)).toIso8601String(),
        'read': true,
      },
    ];
  }

  Future<void> _markAsRead(String id) async {
    setState(() {
      for (var i = 0; i < _notifications.length; i++) {
        if (_notifications[i]['id'] == id) {
          _notifications[i]['read'] = true;
          break;
        }
      }
    });

    try {
      final box = Hive.box('settings');
      await box.put('notifications', _notifications);
    } catch (_) {}
  }

  Future<void> _clearAll() async {
    setState(() {
      for (var i = 0; i < _notifications.length; i++) {
        _notifications[i]['read'] = true;
      }
    });

    try {
      final box = Hive.box('settings');
      await box.put('notifications', _notifications);
    } catch (_) {}

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Todas las notificaciones marcadas como leídas')),
      );
    }
  }

  void _onTap(Map<String, dynamic> notification) {
    _markAsRead(notification['id']);

    final type = notification['type'];
    switch (type) {
      case 'events':
        context.push('/events');
        break;
      case 'promotions':
        context.push('/promotions');
        break;
      case 'place':
        final placeId = notification['placeId'];
        if (placeId != null) {
          context.push('/places/$placeId');
        }
        break;
      case 'event':
        final eventId = notification['eventId'];
        if (eventId != null) {
          context.push('/events/$eventId');
        }
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
      default:
        return AppColors.neutral600;
    }
  }

  String _formatTimestamp(String timestamp) {
    try {
      final date = DateTime.parse(timestamp);
      final now = DateTime.now();
      final difference = now.difference(date);

      if (difference.inMinutes < 60) {
        return 'Hace ${difference.inMinutes} min';
      } else if (difference.inHours < 24) {
        return 'Hace ${difference.inHours}h';
      } else if (difference.inDays < 7) {
        return 'Hace ${difference.inDays}d';
      } else {
        return '${date.day}/${date.month}/${date.year}';
      }
    } catch (_) {
      return '';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notificaciones'),
        actions: [
          if (_notifications.any((n) => n['read'] == false))
            TextButton(
              onPressed: _clearAll,
              child: const Text('Marcar todo leído'),
            ),
        ],
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_notifications.isEmpty) {
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
                'Las notificaciones de eventos y promociones aparecerán aquí',
                style: Theme.of(context).textTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadNotifications,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(vertical: 8),
        itemCount: _notifications.length,
        separatorBuilder: (_, __) => const Divider(height: 1),
        itemBuilder: (context, index) {
          final notification = _notifications[index];
          final isRead = notification['read'] == true;
          final type = notification['type'] ?? 'default';

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
              notification['title'] ?? '',
              style: TextStyle(
                fontWeight: isRead ? FontWeight.normal : FontWeight.w600,
              ),
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 4),
                Text(
                  notification['body'] ?? '',
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                const SizedBox(height: 4),
                Text(
                  _formatTimestamp(notification['timestamp'] ?? ''),
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
