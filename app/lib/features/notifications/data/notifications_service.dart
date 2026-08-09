import 'dart:convert';
import 'package:dio/dio.dart';
import '../../../config/api_constants.dart';

class NotificationItem {
  final String id;
  final String title;
  final String body;
  final String type;
  final String? data;
  final bool isRead;
  final DateTime createdAt;

  NotificationItem({
    required this.id,
    required this.title,
    required this.body,
    required this.type,
    this.data,
    required this.isRead,
    required this.createdAt,
  });

  factory NotificationItem.fromJson(Map<String, dynamic> json) {
    return NotificationItem(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      body: json['body']?.toString() ?? '',
      type: json['type']?.toString() ?? 'default',
      data: json['data']?.toString(),
      isRead: json['isRead'] == true,
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? '') ?? DateTime.now(),
    );
  }

  NotificationItem copyWith({bool? isRead}) {
    return NotificationItem(
      id: id,
      title: title,
      body: body,
      type: type,
      data: data,
      isRead: isRead ?? this.isRead,
      createdAt: createdAt,
    );
  }

  Map<String, dynamic> get parsedData {
    if (data == null || data!.isEmpty) return const {};
    try {
      final decoded = jsonDecode(data!);
      return decoded is Map<String, dynamic> ? decoded : const {};
    } catch (_) {
      return const {};
    }
  }
}

class NotificationsService {
  final Dio _dio;

  NotificationsService(this._dio);

  dynamic _unwrap(dynamic data) {
    if (data is Map<String, dynamic>) {
      if (data['data'] != null) return data['data'];
    }
    return data;
  }

  Future<List<NotificationItem>> getNotifications() async {
    final response = await _dio.get(ApiConstants.notifications);
    final data = _unwrap(response.data);
    if (data is List) {
      return data.map((e) => NotificationItem.fromJson(e as Map<String, dynamic>)).toList();
    }
    return [];
  }

  Future<void> markAsRead(String id) async {
    await _dio.patch(ApiConstants.notificationById(id));
  }

  Future<void> markAllAsRead() async {
    await _dio.patch(ApiConstants.notificationsReadAll);
  }
}
