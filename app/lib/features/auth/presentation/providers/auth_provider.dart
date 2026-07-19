import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import 'package:google_sign_in/google_sign_in.dart';
// import 'package:flutter_facebook_auth/flutter_facebook_auth.dart'; // TODO: Habilitar cuando se implemente Facebook login
import '../../data/auth_service.dart';
import '../../../../core/auth/token_manager.dart';
import '../../../../core/network/dio_provider.dart';
export '../../data/auth_service.dart' show AuthException;

enum AuthStatus { initial, loading, authenticated, unauthenticated, error }

class AuthState {
  final AuthStatus status;
  final String? token;
  final String? errorMessage;
  final bool isEmailVerified;

  const AuthState({
    this.status = AuthStatus.initial,
    this.token,
    this.errorMessage,
    this.isEmailVerified = true,
  });

  AuthState copyWith({
    AuthStatus? status,
    String? token,
    String? errorMessage,
    bool? isEmailVerified,
  }) {
    return AuthState(
      status: status ?? this.status,
      token: token ?? this.token,
      errorMessage: errorMessage,
      isEmailVerified: isEmailVerified ?? this.isEmailVerified,
    );
  }
}

final authServiceProvider = Provider<AuthService>((ref) {
  final dio = ref.read(dioProvider);
  return AuthService(dio);
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
      final accessToken = data['accessToken'] ?? data['token'];
      final refreshToken = data['refreshToken'];
      final isEmailVerified = data['user']?['isEmailVerified'] ?? true;

      if (accessToken != null) {
        await TokenManager.saveTokens(accessToken, refreshToken);
        state = AuthState(
          status: AuthStatus.authenticated,
          token: accessToken,
          isEmailVerified: isEmailVerified,
        );
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

  Future<bool> tryRefreshToken() async {
    final refreshToken = TokenManager.refreshToken;
    if (refreshToken == null) return false;

    try {
      final response = await _authService.refreshTokens(refreshToken);
      final data = response['data'] ?? response;
      final newAccessToken = data['accessToken'];
      final newRefreshToken = data['refreshToken'];

      if (newAccessToken != null) {
        await TokenManager.saveTokens(newAccessToken, newRefreshToken);
        state = state.copyWith(token: newAccessToken);
        return true;
      }
      return false;
    } catch (e) {
      return false;
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
        state = state.copyWith(status: AuthStatus.error, errorMessage: 'Inicio de sesión cancelado');
        return;
      }

      final googleAuth = await googleUser.authentication;
      final idToken = googleAuth.idToken;

      if (idToken == null) {
        state = state.copyWith(
          status: AuthStatus.error,
          errorMessage: 'No se pudo obtener token de Google. Verifica la configuración.',
        );
        return;
      }

      final response = await _authService.loginWithGoogle(idToken);
      final data = response['data'] ?? response;
      final accessToken = data['accessToken'] ?? data['token'];
      final refreshToken = data['refreshToken'];
      final isEmailVerified = data['user']?['isEmailVerified'] ?? true;

      if (accessToken != null) {
        await TokenManager.saveTokens(accessToken, refreshToken);
        state = AuthState(
          status: AuthStatus.authenticated,
          token: accessToken,
          isEmailVerified: isEmailVerified,
        );
      } else {
        state = state.copyWith(status: AuthStatus.error, errorMessage: 'Error al iniciar sesión con Google');
      }
    } on AuthException catch (e) {
      state = state.copyWith(status: AuthStatus.error, errorMessage: e.message);
    } catch (e) {
      // Print error for debugging — remove in production
      print('Google login error: $e');
      String message = 'Error con Google';
      if (e.toString().contains('10')) {
        message = 'Error de configuración de Google. Verifica google-services.json y SHA-1 en Google Cloud Console.';
      } else if (e.toString().contains('12500')) {
        message = 'Inicio de sesión cancelado por el usuario.';
      } else if (e.toString().contains('12501')) {
        message = 'Inicio de sesión cancelado.';
      } else if (e.toString().contains('12502')) {
        message = 'Error de conexión con Google. Intentá de nuevo.';
      }
      state = state.copyWith(status: AuthStatus.error, errorMessage: message);
    }
  }

  // TODO: Habilitar cuando se implemente Facebook login
  // Future<void> loginWithFacebook() async {
  //   state = state.copyWith(status: AuthStatus.loading, errorMessage: null);
  //   try {
  //     final result = await FacebookAuth.instance.login();
  //     if (result.status != LoginStatus.success) {
  //       state = state.copyWith(status: AuthStatus.error, errorMessage: 'Inicio de sesión cancelado');
  //       return;
  //     }
  //     final accessToken = result.accessToken?.token;
  //     if (accessToken == null) {
  //       state = state.copyWith(status: AuthStatus.error, errorMessage: 'No se pudo obtener token de Facebook');
  //       return;
  //     }
  //     final response = await _authService.loginWithFacebook(accessToken);
  //     final data = response['data'] ?? response;
  //     final appAccessToken = data['accessToken'] ?? data['token'];
  //     final refreshToken = data['refreshToken'];
  //     final isEmailVerified = data['user']?['isEmailVerified'] ?? true;
  //     if (appAccessToken != null) {
  //       await TokenManager.saveTokens(appAccessToken, refreshToken);
  //       state = AuthState(status: AuthStatus.authenticated, token: appAccessToken, isEmailVerified: isEmailVerified);
  //     } else {
  //       state = state.copyWith(status: AuthStatus.error, errorMessage: 'Error al iniciar sesión con Facebook');
  //     }
  //   } on AuthException catch (e) {
  //     state = state.copyWith(status: AuthStatus.error, errorMessage: e.message);
  //   } catch (e) {
  //     state = state.copyWith(status: AuthStatus.error, errorMessage: 'Error de conexión con Facebook');
  //   }
  // }

  Future<void> logout() async {
    await _authService.logout(TokenManager.refreshToken);
    await TokenManager.clearTokens();
    state = const AuthState(status: AuthStatus.unauthenticated);
  }

  void forceUnauthenticated() {
    TokenManager.clearTokens();
    state = const AuthState(status: AuthStatus.unauthenticated);
  }
}
