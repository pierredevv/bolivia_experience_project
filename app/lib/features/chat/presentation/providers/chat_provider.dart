import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../../core/network/dio_provider.dart';
import '../../data/chat_service.dart';

final chatServiceProvider = Provider<ChatService>((ref) {
  final dio = ref.read(dioProvider);
  return ChatService(dio);
});

class ChatState {
  final List<ChatMessage> messages;
  final String? conversationId;
  final bool isSending;
  final bool isInitializing;
  final String? errorMessage;

  const ChatState({
    this.messages = const [],
    this.conversationId,
    this.isSending = false,
    this.isInitializing = false,
    this.errorMessage,
  });

  ChatState copyWith({
    List<ChatMessage>? messages,
    String? conversationId,
    bool? isSending,
    bool? isInitializing,
    String? errorMessage,
  }) {
    return ChatState(
      messages: messages ?? this.messages,
      conversationId: conversationId ?? this.conversationId,
      isSending: isSending ?? this.isSending,
      isInitializing: isInitializing ?? this.isInitializing,
      errorMessage: errorMessage,
    );
  }
}

class ChatNotifier extends StateNotifier<ChatState> {
  final ChatService _service;
  static const _storageKey = 'chat_conversation_id';

  ChatNotifier(this._service) : super(const ChatState());

  Future<void> init() async {
    if (state.isInitializing) return;
    state = state.copyWith(isInitializing: true);

    final prefs = await SharedPreferences.getInstance();
    final convId = prefs.getString(_storageKey);
    if (convId != null && convId.isNotEmpty) {
      try {
        final history = await _service.getConversationMessages(convId);
        if (!mounted) return;
        state = state.copyWith(
          messages: history,
          conversationId: convId,
          isInitializing: false,
        );
        return;
      } catch (_) {
        // Conversation may no longer exist; fall through to greeting.
      }
    }

    if (mounted) state = state.copyWith(isInitializing: false);
  }

  Future<void> send(String text) async {
    final trimmed = text.trim();
    if (trimmed.isEmpty || state.isSending) return;

    state = state.copyWith(
      messages: [
        ...state.messages,
        ChatMessage(role: 'user', content: trimmed),
      ],
      isSending: true,
      errorMessage: null,
    );

    try {
      final reply = await _service.sendMessage(
        trimmed,
        conversationId: state.conversationId,
      );
      final prefs = await SharedPreferences.getInstance();
      if (reply.conversationId.isNotEmpty) {
        await prefs.setString(_storageKey, reply.conversationId);
      }
      if (!mounted) return;
      state = state.copyWith(
        messages: [
          ...state.messages,
          ChatMessage(role: 'assistant', content: reply.reply),
        ],
        conversationId: reply.conversationId,
        isSending: false,
      );
    } catch (e) {
      if (!mounted) return;
      state = state.copyWith(
        isSending: false,
        errorMessage: _friendlyError(e),
      );
    }
  }

  void clearError() => state = state.copyWith(errorMessage: null);

  String _friendlyError(Object e) {
    if (e is DioException) {
      if (e.response?.statusCode == 503) {
        return 'El asistente no está disponible ahora. Intentá más tarde.';
      }
      if (e.response?.statusCode == 502) {
        return 'No se pudo generar una respuesta. Intentá de nuevo.';
      }
      if (e.type == DioExceptionType.connectionError ||
          e.type == DioExceptionType.unknown) {
        return 'Sin conexión a internet. Verificá tu red.';
      }
    }
    return 'Ocurrió un error inesperado.';
  }
}

final chatProvider =
    StateNotifierProvider<ChatNotifier, ChatState>((ref) {
  return ChatNotifier(ref.read(chatServiceProvider));
});