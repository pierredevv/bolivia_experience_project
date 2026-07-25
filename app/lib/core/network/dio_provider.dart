import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../config/api_constants.dart';
import '../../config/router.dart';
import '../auth/token_manager.dart';

final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(
    BaseOptions(
      baseUrl: ApiConstants.baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ),
  );

  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) {
        final token = TokenManager.token;
        if (token != null && token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401) {
          await TokenManager.clear();
          // Redirect to login using the global navigator key
          final context = rootNavigatorKey.currentContext;
          if (context != null) {
            WidgetsBinding.instance.addPostFrameCallback((_) {
              GoRouter.of(context).go('/login');
            });
          }
        }
        return handler.next(error);
      },
    ),
  );

  return dio;
});
