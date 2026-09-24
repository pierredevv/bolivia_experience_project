import 'package:dio/dio.dart';
import '../../../../config/api_constants.dart';

class UserProfile {
  final String id;
  final String name;
  final String email;
  final String? photo;
  final String? country;
  final String? language;
  final String? createdAt;
  final int points;
  final int badgeCount;
  final bool isPremium;
  final int reservationCount;
  final int paymentCount;

  UserProfile({
    required this.id,
    required this.name,
    required this.email,
    this.photo,
    this.country,
    this.language,
    this.createdAt,
    this.points = 0,
    this.badgeCount = 0,
    this.isPremium = false,
    this.reservationCount = 0,
    this.paymentCount = 0,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    final count = json['_count'];
    return UserProfile(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      photo: json['photoUrl'],
      country: json['country'],
      language: json['language'],
      createdAt: json['created_at'],
      points: json['points'] ?? 0,
      badgeCount: (count is Map) ? (count['userBadges'] ?? 0) : 0,
      isPremium: json['isPremium'] ?? false,
      reservationCount: (count is Map) ? (count['reservations'] ?? 0) : 0,
      paymentCount: (count is Map) ? (count['payments'] ?? 0) : 0,
    );
  }
}

class PaymentHistoryItem {
  final String id;
  final String? referenceId;
  final String type;
  final String provider;
  final double amount;
  final String currency;
  final String status;
  final String? description;
  final String? createdAt;

  const PaymentHistoryItem({
    required this.id,
    this.referenceId,
    required this.type,
    required this.provider,
    required this.amount,
    required this.currency,
    required this.status,
    this.description,
    this.createdAt,
  });

  factory PaymentHistoryItem.fromJson(Map<String, dynamic> json) {
    return PaymentHistoryItem(
      id: json['id']?.toString() ?? '',
      referenceId: json['referenceId']?.toString(),
      type: json['type'] ?? '',
      provider: json['provider'] ?? '',
      amount: double.tryParse(json['amount']?.toString() ?? '') ?? 0,
      currency: json['currency'] ?? '',
      status: json['status'] ?? '',
      description: json['description'],
      createdAt: json['createdAt'],
    );
  }
}

class ProfileService {
  final Dio _dio;

  ProfileService(this._dio);

  Future<UserProfile> getProfile() async {
    final response = await _dio.get(ApiConstants.userProfile);
    final data = response.data;
    return UserProfile.fromJson(data['data'] ?? data);
  }

  Future<List<PaymentHistoryItem>> getPaymentHistory() async {
    final response = await _dio.get(ApiConstants.paymentHistory);
    final raw = response.data is Map
        ? (response.data['data'] ?? [])
        : (response.data ?? []);
    if (raw is! List) return const [];
    return raw
        .whereType<Map<String, dynamic>>()
        .map(PaymentHistoryItem.fromJson)
        .toList();
  }

  Future<UserProfile> updateProfile({
    String? name,
    String? photoUrl,
    String? country,
    String? language,
    String? budgetType,
    String? tourismType,
    List<String>? interests,
  }) async {
    final response = await _dio.put(
      ApiConstants.userProfile,
      data: {
        if (name != null) 'name': name,
        if (photoUrl != null) 'photoUrl': photoUrl,
        if (country != null) 'country': country,
        if (language != null) 'language': language,
        if (budgetType != null) 'budgetType': budgetType,
        if (tourismType != null) 'tourismType': tourismType,
        if (interests != null) 'interests': interests,
      },
    );
    final data = response.data;
    return UserProfile.fromJson(data['data'] ?? data);
  }
}