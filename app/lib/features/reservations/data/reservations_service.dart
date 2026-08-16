import 'package:dio/dio.dart';
import '../../../config/api_constants.dart';

class Reservation {
  final String id;
  final String placeId;
  final String productId;
  final String date;
  final String time;
  final int partySize;
  final String status;
  final String modalidad;
  final DateTime? responseDeadline;
  final double totalAmount;
  final String? notes;
  final String? contactPhone;
  final String createdAt;
  final dynamic place;
  final Map<String, dynamic>? payment;

  Reservation({
    required this.id,
    required this.placeId,
    this.productId = '',
    required this.date,
    required this.time,
    required this.partySize,
    required this.status,
    this.modalidad = 'instantanea',
    this.responseDeadline,
    this.totalAmount = 0,
    this.notes,
    this.contactPhone,
    required this.createdAt,
    this.place,
    this.payment,
  });

  bool get isInstantanea => modalidad == 'instantanea';
  bool get isSolicitud => modalidad == 'solicitud';
  bool get needsPayment =>
      status == 'pending' &&
      payment != null &&
      payment!['status'] == 'pending';

  factory Reservation.fromJson(Map<String, dynamic> json) {
    return Reservation(
      id: json['id']?.toString() ?? '',
      placeId: json['placeId']?.toString() ?? '',
      productId: json['productId']?.toString() ?? '',
      date: json['date']?.toString() ?? '',
      time: json['time']?.toString() ?? '',
      partySize: json['partySize'] is int ? json['partySize'] : int.tryParse(json['partySize'].toString()) ?? 0,
      status: json['status']?.toString() ?? 'pending',
      modalidad: json['modalidad']?.toString() ?? 'instantanea',
      responseDeadline: DateTime.tryParse(json['responseDeadline']?.toString() ?? ''),
      totalAmount: double.tryParse(json['totalAmount']?.toString() ?? '') ?? 0,
      notes: json['notes']?.toString(),
      contactPhone: json['contactPhone']?.toString(),
      createdAt: json['createdAt']?.toString() ?? '',
      place: json['place'],
      payment: _parsePayment(json),
    );
  }

  static Map<String, dynamic>? _parsePayment(Map<String, dynamic> json) {
    if (json['payment'] is Map<String, dynamic>) {
      return json['payment'] as Map<String, dynamic>;
    }
    final payments = json['payments'];
    if (payments is List && payments.isNotEmpty && payments[0] is Map) {
      return Map<String, dynamic>.from(payments[0] as Map);
    }
    return null;
  }
}

class PaymentRecord {
  final String id;
  final double amount;
  final String currency;
  final String description;
  final String type;
  final String referenceId;
  final String status;
  final String createdAt;

  PaymentRecord({
    required this.id,
    required this.amount,
    required this.currency,
    required this.description,
    required this.type,
    required this.referenceId,
    required this.status,
    required this.createdAt,
  });

  factory PaymentRecord.fromJson(Map<String, dynamic> json) {
    return PaymentRecord(
      id: json['id']?.toString() ?? '',
      amount: double.tryParse(json['amount']?.toString() ?? '') ?? 0,
      currency: json['currency']?.toString() ?? 'BOB',
      description: json['description']?.toString() ?? '',
      type: json['type']?.toString() ?? '',
      referenceId: json['referenceId']?.toString() ?? '',
      status: json['status']?.toString() ?? 'pending',
      createdAt: json['createdAt']?.toString() ?? '',
    );
  }
}

class ReservationsService {
  final Dio _dio;

  ReservationsService(this._dio);

  dynamic _unwrap(dynamic data) {
    if (data is Map<String, dynamic>) {
      if (data['data'] != null) return data['data'];
    }
    return data;
  }

  Future<dynamic> createReservation({
    required String productId,
    String? placeId,
    required String date,
    required String time,
    required int partySize,
    String? notes,
    String? contactPhone,
  }) async {
    final response = await _dio.post(
      ApiConstants.reservations,
      data: {
        'productId': productId,
        if (placeId != null && placeId.isNotEmpty) 'placeId': placeId,
        'date': date,
        'time': time,
        'partySize': partySize,
        if (notes != null && notes.isNotEmpty) 'notes': notes,
        if (contactPhone != null && contactPhone.isNotEmpty) 'contactPhone': contactPhone,
      },
    );
    return _unwrap(response.data);
  }

  Future<List<Reservation>> getMyReservations() async {
    final response = await _dio.get(ApiConstants.myReservations);
    final data = _unwrap(response.data);
    if (data is List) {
      return data.map((e) => Reservation.fromJson(e as Map<String, dynamic>)).toList();
    }
    return [];
  }

  Future<void> cancelReservation(String id) async {
    await _dio.patch(ApiConstants.cancelReservation(id));
  }

  Future<dynamic> createPayment({
    required double amount,
    String currency = 'BOB',
    required String description,
    required String type,
    required String referenceId,
    String? provider,
  }) async {
    final response = await _dio.post(
      ApiConstants.payments,
      data: {
        'amount': amount,
        'currency': currency,
        'description': description,
        'type': type,
        'referenceId': referenceId,
        if (provider != null && provider.isNotEmpty) 'provider': provider,
      },
    );
    return _unwrap(response.data);
  }

  Future<dynamic> getPaymentStatus(String paymentId) async {
    final response = await _dio.get(ApiConstants.paymentById(paymentId));
    return _unwrap(response.data);
  }

  Future<dynamic> confirmPayment(String paymentId, {String? transactionId}) async {
    final response = await _dio.post(
      ApiConstants.confirmPayment(paymentId),
      data: {if (transactionId != null) 'transactionId': transactionId},
    );
    return _unwrap(response.data);
  }

  Future<List<PaymentRecord>> getPaymentHistory() async {
    final response = await _dio.get(ApiConstants.paymentHistory);
    final data = _unwrap(response.data);
    if (data is List) {
      return data.map((e) => PaymentRecord.fromJson(e as Map<String, dynamic>)).toList();
    }
    return [];
  }
}
