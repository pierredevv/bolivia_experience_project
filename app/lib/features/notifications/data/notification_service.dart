import 'package:dio/dio.dart';
import '../../../../config/api_constants.dart';

class AppNotification {
  final String id;
  final String title;
  final String body;
  final String? type;
  final Map<String, dynamic>? data;
  final bool isRead;
  final DateTime? createdAt;

  AppNotification({
    required this.id,
    required this.title,
    required this.body,
    this.type,
    this.data,
    this.isRead = false,
    this.createdAt,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      body: json['body'] ?? '',
      type: json['type'],
      data: json['data'] is Map ? Map<String, dynamic>.from(json['data']) : null,
      isRead: json['isRead'] ?? false,
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt']) : null,
    );
  }
}

class NotificationService {
  final Dio _dio;

  NotificationService(this._dio);

  Future<List<AppNotification>> getNotifications({int page = 1, int limit = 20}) async {
    final response = await _dio.get(
      ApiConstants.notifications,
      queryParameters: {'page': page, 'limit': limit},
    );
    final data = response.data;
    final List items = data['data'] ?? [];
    return items.map((json) => AppNotification.fromJson(json)).toList();
  }

  Future<int> getUnreadCount() async {
    try {
      final response = await _dio.get(ApiConstants.notificationsUnreadCount);
      final data = response.data;
      return data['count'] ?? 0;
    } catch (e) {
      return 0;
    }
  }

  Future<void> markAsRead(String notificationId) async {
    await _dio.patch('${ApiConstants.notifications}/$notificationId/read');
  }

  Future<void> markAllAsRead() async {
    await _dio.patch('${ApiConstants.notifications}/read-all');
  }

  Future<void> deleteNotification(String notificationId) async {
    await _dio.delete('${ApiConstants.notifications}/$notificationId');
  }
}
