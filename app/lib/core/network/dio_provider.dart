import 'dart:async';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/api_constants.dart';
import '../auth/token_manager.dart';

bool _isRefreshing = false;
final _refreshQueue = <Completer<void>>[];

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
        // Only handle 401 on non-auth endpoints
        final isAuthEndpoint = error.requestOptions.path.contains('/auth/');
        if (error.response?.statusCode != 401 || isAuthEndpoint) {
          return handler.next(error);
        }

        // If already refreshing, queue this request
        if (_isRefreshing) {
          final completer = Completer<void>();
          _refreshQueue.add(completer);
          await completer.future;

          // Retry with new token
          final newToken = TokenManager.token;
          if (newToken != null) {
            error.requestOptions.headers['Authorization'] = 'Bearer $newToken';
            try {
              final retryResponse = await dio.fetch(error.requestOptions);
              return handler.resolve(retryResponse);
            } catch (e) {
              return handler.next(error);
            }
          }
          return handler.next(error);
        }

        // Start refresh
        _isRefreshing = true;
        try {
          final refreshToken = TokenManager.refreshToken;
          if (refreshToken == null) {
            _notifyQueue();
            return handler.next(error);
          }

          final response = await Dio().post(
            '${ApiConstants.baseUrl}${ApiConstants.refreshToken}',
            data: {'refreshToken': refreshToken},
            options: Options(
              headers: {'Content-Type': 'application/json'},
            ),
          );

          final data = response.data['data'] ?? response.data;
          final newAccessToken = data['accessToken'];
          final newRefreshToken = data['refreshToken'];

          if (newAccessToken != null) {
            await TokenManager.saveTokens(newAccessToken, newRefreshToken);

            // Retry original request
            error.requestOptions.headers['Authorization'] = 'Bearer $newAccessToken';
            final retryResponse = await dio.fetch(error.requestOptions);

            _notifyQueue();
            return handler.resolve(retryResponse);
          }

          _notifyQueue();
          return handler.next(error);
        } catch (e) {
          _notifyQueue();
          return handler.next(error);
        } finally {
          _isRefreshing = false;
        }
      },
    ),
  );

  return dio;
});

void _notifyQueue() {
  for (final completer in _refreshQueue) {
    if (!completer.isCompleted) {
      completer.complete();
    }
  }
  _refreshQueue.clear();
}
