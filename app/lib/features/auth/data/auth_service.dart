import 'package:dio/dio.dart';
import '../../../../config/api_constants.dart';

class AuthException implements Exception {
  final int? statusCode;
  final String message;
  final String? apiMessage;

  AuthException({this.statusCode, required this.message, this.apiMessage});

  @override
  String toString() => message;
}

class AuthService {
  final Dio _dio;

  AuthService({Dio? dio})
      : _dio = dio ?? Dio(BaseOptions(baseUrl: ApiConstants.baseUrl));

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _dio.post(
        ApiConstants.login,
        data: {'email': email, 'password': password},
      );
      return response.data;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String password,
  }) async {
    try {
      final response = await _dio.post(
        ApiConstants.register,
        data: {'name': name, 'email': email, 'password': password},
      );
      return response.data;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<Map<String, dynamic>> loginWithGoogle(String idToken) async {
    try {
      final response = await _dio.post(
        '/auth/google',
        data: {'idToken': idToken},
      );
      return response.data;
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Exception _handleDioError(DioException e) {
    if (e.response != null) {
      final statusCode = e.response?.statusCode;
      final data = e.response?.data;

      String apiMessage = '';
      if (data is Map<String, dynamic>) {
        final error = data['error'];
        if (error is Map<String, dynamic>) {
          apiMessage = error['message'] ?? '';
        }
      }

      switch (statusCode) {
        case 400:
          return AuthException(
            statusCode: 400,
            message: apiMessage.isNotEmpty ? apiMessage : 'Datos inválidos.',
            apiMessage: apiMessage,
          );
        case 401:
          return AuthException(
            statusCode: 401,
            message: apiMessage.isNotEmpty ? apiMessage : 'Credenciales incorrectas.',
            apiMessage: apiMessage,
          );
        case 409:
          return AuthException(
            statusCode: 409,
            message: apiMessage.isNotEmpty ? apiMessage : 'Conflicto con datos existentes.',
            apiMessage: apiMessage,
          );
        case 500:
          return AuthException(
            statusCode: 500,
            message: apiMessage.isNotEmpty ? apiMessage : 'Error del servidor.',
            apiMessage: apiMessage,
          );
        default:
          return AuthException(
            statusCode: statusCode,
            message: apiMessage.isNotEmpty ? apiMessage : 'Error ($statusCode).',
            apiMessage: apiMessage,
          );
      }
    }

    if (e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.receiveTimeout ||
        e.type == DioExceptionType.sendTimeout) {
      return AuthException(
        message: 'La conexión tardó demasiado.',
      );
    }

    if (e.type == DioExceptionType.connectionError ||
        e.type == DioExceptionType.unknown) {
      return AuthException(
        message: 'Sin conexión a internet.',
      );
    }

    return AuthException(
      message: 'Error de conexión.',
    );
  }
}
