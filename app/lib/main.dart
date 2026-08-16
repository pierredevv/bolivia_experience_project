import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_stripe/flutter_stripe.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'app.dart';
import 'config/api_constants.dart';
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

  await _initStripe();

  runApp(
    const ProviderScope(
      child: BoliviaExperienceApp(),
    ),
  );
}

Future<void> _initStripe() async {
  try {
    Stripe.publishableKey = ApiConstants.stripePublishableKey;
    await Stripe.instance.applySettings();
  } catch (e) {
    debugPrint('Stripe no inicializado: $e');
  }
}
