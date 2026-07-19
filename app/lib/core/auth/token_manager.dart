import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class TokenManager {
  static String? _token;
  static String? _refreshToken;
  static const _storage = FlutterSecureStorage();
  static const _accessTokenKey = 'jwt_access_token';
  static const _refreshTokenKey = 'jwt_refresh_token';

  static String? get token => _token;
  static String? get refreshToken => _refreshToken;

  static Future<void> init() async {
    _token = await _storage.read(key: _accessTokenKey);
    _refreshToken = await _storage.read(key: _refreshTokenKey);
  }

  static Future<void> saveTokens(String accessToken, String? refreshToken) async {
    _token = accessToken;
    _refreshToken = refreshToken;
    await _storage.write(key: _accessTokenKey, value: accessToken);
    if (refreshToken != null) {
      await _storage.write(key: _refreshTokenKey, value: refreshToken);
    }
  }

  static Future<void> clearTokens() async {
    _token = null;
    _refreshToken = null;
    await _storage.delete(key: _accessTokenKey);
    await _storage.delete(key: _refreshTokenKey);
  }

  static bool get hasToken => _token != null && _token!.isNotEmpty;
}
