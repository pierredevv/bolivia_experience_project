import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import '../../../../config/colors.dart';
import '../../../../config/api_constants.dart';
import '../../../../core/auth/token_manager.dart';
import '../providers/auth_provider.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _validateAndNavigate();
  }

  Future<void> _validateAndNavigate() async {
    await Future.delayed(const Duration(seconds: 2));

    if (!mounted) return;

    // No token → go to login
    if (!TokenManager.hasToken) {
      context.go('/login');
      return;
    }

    // Validate token with API
    try {
      final dio = Dio(BaseOptions(
        baseUrl: ApiConstants.baseUrl,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${TokenManager.token}',
        },
      ));

      final response = await dio.get('/users/me');

      if (response.statusCode == 200) {
        // Token valid
        if (mounted) context.go('/');
        return;
      }
    } on DioException catch (e) {
      if (e.response?.statusCode == 401) {
        // Token expired → try refresh
        final refreshed = await ref.read(authProvider.notifier).tryRefreshToken();
        if (refreshed && mounted) {
          context.go('/');
          return;
        }
      }
    } catch (_) {}

    // Token invalid and refresh failed → go to login
    if (mounted) context.go('/login');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primary700,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.explore,
              size: 100,
              color: Colors.white,
            ),
            const SizedBox(height: 24),
            Text(
              'BoliviaExperience',
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Toda Santa Cruz en la palma de tu mano',
              style: TextStyle(
                fontSize: 16,
                color: Colors.white70,
              ),
            ),
            const SizedBox(height: 48),
            CircularProgressIndicator(
              color: Colors.white,
            ),
          ],
        ),
      ),
    );
  }
}
