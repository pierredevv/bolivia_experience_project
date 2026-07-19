import 'dart:async';

import 'package:dio/dio.dart';
import '../auth/token_manager.dart';
import '../../config/api_constants.dart';

class AuthInterceptor extends Interceptor {
  final Dio _dio;
  Completer<String?>? _refreshCompleter;

  AuthInterceptor(this._dio);

  Dio get _refreshDio => Dio(BaseOptions(
        baseUrl: _dio.options.baseUrl,
        connectTimeout: _dio.options.connectTimeout,
        receiveTimeout: _dio.options.receiveTimeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ));

  @override
  void onRequest(RequestOptions options, handler) {
    final token = TokenManager.token;
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    print('[DIO REQUEST] ${options.method} ${options.uri}');
    print('[DIO AUTH HEADER] ${options.headers['Authorization']}');
    handler.next(options);
  }

  @override
  void onResponse(Response response, handler) {
    print(
        '[DIO RESPONSE] ${response.statusCode} ${response.requestOptions.uri}');
    handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    print('[DIO ERROR] ${err.type} ${err.response?.statusCode} ${err.message}');
    print('[DIO ERROR DETAIL] URL: ${err.requestOptions.uri}');
    if (err.response?.data != null) {
      print('[DIO ERROR DATA] ${err.response?.data}');
    }

    final isUnauthorized = err.response?.statusCode == 401;
    final isRefreshCall = err.requestOptions.path == ApiConstants.refreshToken;
    final alreadyRetried =
        err.requestOptions.extra['retriedAfterRefresh'] == true;

    if (isUnauthorized && !isRefreshCall && !alreadyRetried) {
      final newToken = await _refreshToken();

      if (newToken == null) {
        return handler.next(err);
      }

      try {
        err.requestOptions.extra['retriedAfterRefresh'] = true;
        err.requestOptions.headers['Authorization'] = 'Bearer $newToken';
        final response = await _dio.fetch(err.requestOptions);
        return handler.resolve(response);
      } catch (e) {
        return handler.next(err);
      }
    }

    handler.next(err);
  }

  /// Refresca el token compartiendo el resultado entre peticiones 401
  /// concurrentes: la primera dispara la llamada a /auth/refresh y las
  /// demás esperan ese mismo resultado en vez de fallar de inmediato.
  Future<String?> _refreshToken() async {
    if (_refreshCompleter != null) {
      return _refreshCompleter!.future;
    }

    final completer = Completer<String?>();
    _refreshCompleter = completer;

    // Obtenemos el único token disponible directamente desde el getter síncrono
    final currentToken = TokenManager.token;

    if (currentToken == null) {
      await TokenManager.clear();
      completer.complete(null);
      _refreshCompleter = null;
      return null;
    }

    try {
      // Mandamos el token actual para que el backend NestJS sepa a quién renovar
      final refreshResponse = await _refreshDio.post(
        ApiConstants.refreshToken,
        data: {
          'token': currentToken,
        },
      );

      final data = refreshResponse.data;
      final newAccessToken = data['accessToken'] ??
          data['token']; // se adapta a lo que devuelva tu API

      if (newAccessToken == null) {
        await TokenManager.clear();
        completer.complete(null);
        return null;
      }

      // Guardamos el nuevo token de forma limpia usando tu método posicional
      await TokenManager.save(newAccessToken);

      completer.complete(newAccessToken);
      return newAccessToken;
    } catch (e) {
      print('[DIO REFRESH FAILED] $e');
      await TokenManager.clear();
      completer.complete(null);
      return null;
    } finally {
      _refreshCompleter = null;
    }
  }
}
