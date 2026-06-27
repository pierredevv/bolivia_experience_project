import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class TokenManager {
  static String? _token;
  static const _storage = FlutterSecureStorage();
  static const _key = 'jwt_token';

  static String? get token => _token;

  static Future<void> init() async {
    _token = await _storage.read(key: _key);
  }

  static Future<void> save(String token) async {
    _token = token;
    await _storage.write(key: _key, value: token);
  }

  static Future<void> clear() async {
    _token = null;
    await _storage.delete(key: _key);
  }

  static bool get hasToken => _token != null && _token!.isNotEmpty;
}
