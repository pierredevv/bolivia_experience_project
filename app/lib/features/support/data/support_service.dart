import 'package:dio/dio.dart';
import '../../../config/api_constants.dart';

class SupportMessage {
  final String id;
  final String authorId;
  final String body;
  final String createdAt;

  const SupportMessage({
    required this.id,
    required this.authorId,
    required this.body,
    required this.createdAt,
  });

  factory SupportMessage.fromJson(Map<String, dynamic> json) {
    return SupportMessage(
      id: json['id']?.toString() ?? '',
      authorId: json['authorId']?.toString() ?? '',
      body: json['body']?.toString() ?? '',
      createdAt: json['createdAt']?.toString() ?? '',
    );
  }
}

class SupportTicket {
  final String id;
  final String type;
  final String status;
  final String subject;
  final String description;
  final String? reservationId;
  final String createdAt;
  final List<SupportMessage> messages;

  const SupportTicket({
    required this.id,
    required this.type,
    required this.status,
    required this.subject,
    required this.description,
    this.reservationId,
    required this.createdAt,
    this.messages = const [],
  });

  bool get isOpen => status == 'open' || status == 'in_progress';

  factory SupportTicket.fromJson(Map<String, dynamic> json) {
    final rawMessages = json['messages'];
    return SupportTicket(
      id: json['id']?.toString() ?? '',
      type: json['type']?.toString() ?? 'other',
      status: json['status']?.toString() ?? 'open',
      subject: json['subject']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      reservationId: json['reservationId']?.toString(),
      createdAt: json['createdAt']?.toString() ?? '',
      messages: rawMessages is List
          ? rawMessages
              .whereType<Map<String, dynamic>>()
              .map(SupportMessage.fromJson)
              .toList()
          : const [],
    );
  }

  Map<String, dynamic> toCreateJson() => {
        'type': type,
        if (reservationId != null && reservationId!.isNotEmpty)
          'reservationId': reservationId,
        'subject': subject,
        'description': description,
      };
}

class SupportService {
  final Dio _dio;

  SupportService(this._dio);

  dynamic _unwrap(dynamic data) {
    if (data is Map<String, dynamic> && data['data'] != null) {
      return data['data'];
    }
    return data;
  }

  Future<List<SupportTicket>> getMyTickets() async {
    final response = await _dio.get(ApiConstants.supportMine);
    final data = _unwrap(response.data);
    final list = data is Map<String, dynamic> ? data['data'] : data;
    if (list is List) {
      return list
          .whereType<Map<String, dynamic>>()
          .map(SupportTicket.fromJson)
          .toList();
    }
    return [];
  }

  Future<SupportTicket> getTicket(String id) async {
    final response = await _dio.get(ApiConstants.supportById(id));
    final data = _unwrap(response.data);
    return SupportTicket.fromJson(data as Map<String, dynamic>);
  }

  Future<SupportTicket> createTicket({
    required String type,
    String? reservationId,
    required String subject,
    required String description,
  }) async {
    final ticket = SupportTicket(
      id: '',
      type: type,
      status: 'open',
      subject: subject,
      description: description,
      reservationId: reservationId,
      createdAt: DateTime.now().toIso8601String(),
    );
    final response = await _dio.post(
      ApiConstants.support,
      data: ticket.toCreateJson(),
    );
    final data = _unwrap(response.data);
    return SupportTicket.fromJson(data as Map<String, dynamic>);
  }

  Future<SupportMessage> addMessage(String ticketId, String body) async {
    final response = await _dio.patch(
      ApiConstants.supportMessages(ticketId),
      data: {'body': body},
    );
    final data = _unwrap(response.data);
    return SupportMessage.fromJson(data as Map<String, dynamic>);
  }
}