import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'app.dart';
import 'core/auth/token_manager.dart';
import 'core/services/push_notification_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Hive.initFlutter();
  await Hive.openBox('settings');
  await Hive.openBox('cache');

  await TokenManager.init();

  try {
    await PushNotificationService.initialize();
  } catch (e) {
    debugPrint('Push notifications no disponibles: $e');
  }

  runApp(
    const ProviderScope(
      child: BoliviaExperienceApp(),
    ),
  );
}
