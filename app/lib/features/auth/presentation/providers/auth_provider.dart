import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../../data/auth_service.dart';
import '../../../../core/network/dio_provider.dart';
import '../../../../core/auth/token_manager.dart';
import '../../../../config/api_constants.dart';
export '../../data/auth_service.dart' show AuthException;

enum AuthStatus { initial, loading, authenticated, unauthenticated, error }

class AuthState {
  final AuthStatus status;
  final String? token;
  final String? errorMessage;

  const AuthState({
    this.status = AuthStatus.initial,
    this.token,
    this.errorMessage,
  });

  AuthState copyWith({
    AuthStatus? status,
    String? token,
    String? errorMessage,
  }) {
    return AuthState(
      status: status ?? this.status,
      token: token ?? this.token,
      errorMessage: errorMessage,
    );
  }
}

final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService(dio: ref.watch(dioProvider));
});

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.read(authServiceProvider));
});

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService _authService;

  AuthNotifier(this._authService) : super(const AuthState()) {
    _checkInitialAuth();
  }

  void _checkInitialAuth() async {
    if (TokenManager.hasToken) {
      try {
        final dio = Dio(
          BaseOptions(
            baseUrl: ApiConstants.baseUrl,
            connectTimeout: const Duration(seconds: 10),
            receiveTimeout: const Duration(seconds: 10),
          ),
        );
        final response = await dio.get(
          ApiConstants.userProfile,
          options: Options(
            headers: {'Authorization': 'Bearer ${TokenManager.token}'},
          ),
        );

        if (response.statusCode == 200) {
          state = AuthState(
            status: AuthStatus.authenticated,
            token: TokenManager.token,
          );
        } else {
          await TokenManager.clear();
          state = const AuthState(status: AuthStatus.unauthenticated);
        }
      } catch (e) {
        await TokenManager.clear();
        state = const AuthState(status: AuthStatus.unauthenticated);
      }
    } else {
      state = const AuthState(status: AuthStatus.unauthenticated);
    }
  }

  Future<void> login(String email, String password) async {
    state = state.copyWith(status: AuthStatus.loading, errorMessage: null);
    try {
      final response = await _authService.login(
        email: email,
        password: password,
      );

      final data = response['data'] ?? response;
      final token = data['accessToken'] ?? data['token'];

      if (token != null) {
        await TokenManager.save(token);
        state = AuthState(status: AuthStatus.authenticated, token: token);
      } else {
        state = state.copyWith(
          status: AuthStatus.error,
          errorMessage: 'No se recibió token del servidor',
        );
      }
    } on AuthException catch (e) {
      state = state.copyWith(
        status: AuthStatus.error,
        errorMessage: e.message,
      );
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.error,
        errorMessage: 'Error de conexión. Intentá de nuevo.',
      );
    }
  }

  Future<void> register(String name, String email, String password) async {
    state = state.copyWith(status: AuthStatus.loading, errorMessage: null);
    try {
      await _authService.register(
        name: name,
        email: email,
        password: password,
      );
      state = const AuthState(status: AuthStatus.unauthenticated);
    } on AuthException catch (e) {
      state = state.copyWith(
        status: AuthStatus.error,
        errorMessage: e.message,
      );
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.error,
        errorMessage: 'Error de conexión. Intentá de nuevo.',
      );
    }
  }

  Future<void> loginWithGoogle() async {
    state = state.copyWith(status: AuthStatus.loading, errorMessage: null);
    try {
      final GoogleSignIn googleSignIn = GoogleSignIn(
        scopes: ['email', 'profile'],
      );
      final googleUser = await googleSignIn.signIn();
      if (googleUser == null) {
        state = state.copyWith(status: AuthStatus.unauthenticated);
        return;
      }
      final googleAuth = await googleUser.authentication;
      final idToken = googleAuth.idToken;
      if (idToken == null) {
        state = state.copyWith(
          status: AuthStatus.error,
          errorMessage: 'No se pudo obtener token de Google',
        );
        return;
      }
      final response = await _authService.loginWithGoogle(idToken);
      final data = response['data'] ?? response;
      final token = data['accessToken'] ?? data['token'];
      if (token != null) {
        await TokenManager.save(token);
        state = AuthState(status: AuthStatus.authenticated, token: token);
      } else {
        state = state.copyWith(
          status: AuthStatus.error,
          errorMessage: 'No se recibió token del servidor',
        );
      }
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.error,
        errorMessage: 'Error al iniciar sesión con Google',
      );
    }
  }

  Future<void> logout() async {
    await TokenManager.clear();
    state = const AuthState(status: AuthStatus.unauthenticated);
  }
}
