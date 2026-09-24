import 'package:dio/dio.dart';
import '../../../config/api_constants.dart';

class ChatMessage {
  final String role;
  final String content;
  final String? createdAt;

  const ChatMessage({required this.role, required this.content, this.createdAt});

  factory ChatMessage.fromJson(Map<String, dynamic> json) => ChatMessage(
        role: json['role'] ?? '',
        content: json['content'] ?? '',
        createdAt: json['createdAt'],
      );
}

class ChatReply {
  final String reply;
  final String conversationId;

  const ChatReply({required this.reply, required this.conversationId});
}

class ChatService {
  final Dio _dio;

  ChatService(this._dio);

  Future<ChatReply> sendMessage(String message,
      {String? conversationId}) async {
    final response = await _dio.post(
      ApiConstants.chatMessage,
      data: {
        'message': message,
        if (conversationId != null) 'conversationId': conversationId,
      },
    );
    final data = response.data is Map ? response.data : {};
    return ChatReply(
      reply: data['reply']?.toString() ?? '',
      conversationId: data['conversationId']?.toString() ?? '',
    );
  }

  Future<List<ChatMessage>> getConversationMessages(
      String conversationId) async {
    final response = await _dio
        .get(ApiConstants.chatConversationMessages(conversationId));
    final raw = response.data is Map
        ? (response.data['data'] ?? [])
        : (response.data ?? []);
    if (raw is! List) return const [];
    return raw
        .whereType<Map<String, dynamic>>()
        .map(ChatMessage.fromJson)
        .toList();
  }
}