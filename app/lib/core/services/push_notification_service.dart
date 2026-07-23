import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:dio/dio.dart';
import '../../config/api_constants.dart';
import '../auth/token_manager.dart';

class PushNotificationService {
  static final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  static final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();

  static Future<void> initialize() async {
    // Request permission
    final settings = await _firebaseMessaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      provisional: false,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      // Get FCM token
      final token = await _firebaseMessaging.getToken();
      if (token != null) {
        await _sendTokenToServer(token);
      }

      // Listen for token refresh
      _firebaseMessaging.onTokenRefresh.listen(_sendTokenToServer);

      // Initialize local notifications
      await _initializeLocalNotifications();

      // Handle foreground messages
      FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

      // Handle background messages
      FirebaseMessaging.onBackgroundMessage(_handleBackgroundMessage);

      // Handle notification tap when app is terminated
      FirebaseMessaging.onMessageOpenedApp.listen(_handleNotificationTap);
    }
  }

  static Future<void> _initializeLocalNotifications() async {
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: false,
      requestBadgePermission: false,
      requestSoundPermission: false,
    );

    await _localNotifications.initialize(
      const InitializationSettings(
        android: androidSettings,
        iOS: iosSettings,
      ),
      onDidReceiveNotificationResponse: (details) {
        if (details.payload != null) {
          final data = jsonDecode(details.payload!);
          _navigateToScreen(data);
        }
      },
    );
  }

  static void _handleForegroundMessage(RemoteMessage message) {
    final notification = message.notification;
    if (notification != null) {
      _showLocalNotification(
        title: notification.title ?? '',
        body: notification.body ?? '',
        payload: jsonEncode(message.data),
      );
    }
  }

  static Future<void> _handleBackgroundMessage(RemoteMessage message) async {
    // Handle background message
    debugPrint('Background message: ${message.messageId}');
  }

  static void _handleNotificationTap(RemoteMessage message) {
    _navigateToScreen(message.data);
  }

  static void _navigateToScreen(Map<String, dynamic> data) {
    final type = data['type'];
    final id = data['id'];

    // Navigation will be handled by the router
    // This is a placeholder for the actual navigation logic
    debugPrint('Navigate to: $type/$id');
  }

  static Future<void> _showLocalNotification({
    required String title,
    required String body,
    String? payload,
  }) async {
    const androidDetails = AndroidNotificationDetails(
      'boliviaexperience_channel',
      'BoliviaExperience',
      channelDescription: 'Notificaciones de BoliviaExperience',
      importance: Importance.high,
      priority: Priority.high,
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    await _localNotifications.show(
      DateTime.now().millisecondsSinceEpoch ~/ 1000,
      title,
      body,
      const NotificationDetails(
        android: androidDetails,
        iOS: iosDetails,
      ),
      payload: payload,
    );
  }

  static Future<void> _sendTokenToServer(String token) async {
    try {
      final authToken = TokenManager.token;
      if (authToken == null) return;

      final dio = Dio();
      await dio.post(
        '${ApiConstants.baseUrl}/notifications/register-token',
        data: {'token': token, 'platform': 'flutter'},
        options: Options(
          headers: {'Authorization': 'Bearer $authToken'},
        ),
      );
    } catch (e) {
      debugPrint('Failed to send FCM token: $e');
    }
  }

  static Future<void> subscribeToTopic(String topic) async {
    await _firebaseMessaging.subscribeToTopic(topic);
  }

  static Future<void> unsubscribeFromTopic(String topic) async {
    await _firebaseMessaging.unsubscribeFromTopic(topic);
  }

  static Future<String?> getToken() async {
    return await _firebaseMessaging.getToken();
  }
}
