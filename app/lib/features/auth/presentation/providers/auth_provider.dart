import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/auth_service.dart';
import '../../../../core/auth/token_manager.dart';
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
  return AuthService();
});

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.read(authServiceProvider));
});

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService _authService;

  AuthNotifier(this._authService) : super(const AuthState()) {
    _checkInitialAuth();
  }

  void _checkInitialAuth() {
    if (TokenManager.hasToken) {
      state = AuthState(
        status: AuthStatus.authenticated,
        token: TokenManager.token,
      );
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

  Future<void> logout() async {
    await TokenManager.clear();
    state = const AuthState(status: AuthStatus.unauthenticated);
  }
}
