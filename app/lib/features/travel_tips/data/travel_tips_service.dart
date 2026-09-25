import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:bolivia_experience/config/api_constants.dart';
import 'package:bolivia_experience/core/network/dio_provider.dart';

class TravelTip {
  final String id;
  final String text;
  final String category;
  final String categoryEn;
  final String city;
  final bool isActive;
  final String? icon;

  const TravelTip({
    required this.id,
    required this.text,
    required this.category,
    required this.categoryEn,
    required this.city,
    required this.isActive,
    this.icon,
  });

  factory TravelTip.fromJson(Map<String, dynamic> json) {
    return TravelTip(
      id: json['id']?.toString() ?? '',
      text: json['text']?.toString() ?? '',
      category: json['category']?.toString() ?? '',
      categoryEn: json['categoryEn']?.toString() ?? '',
      city: json['city']?.toString() ?? 'santa-cruz',
      isActive: json['isActive'] == true,
      icon: json['icon']?.toString(),
    );
  }
}

class TravelTipsService {
  final Dio _dio;

  TravelTipsService(this._dio);

  Future<List<TravelTip>> getTips({
    String? category,
    String city = 'santa-cruz',
  }) async {
    final response = await _dio.get(
      ApiConstants.travelTips,
      queryParameters: {
        if (category != null) 'category': category,
        'city': city,
      },
    );
    final data = response.data;
    final list = data is List
        ? data
        : data is Map<String, dynamic>
            ? (data['data'] as List?) ?? []
            : <dynamic>[];
    return list
        .whereType<Map<String, dynamic>>()
        .map(TravelTip.fromJson)
        .toList();
  }
}

final travelTipsServiceProvider = Provider<TravelTipsService>((ref) {
  return TravelTipsService(ref.read(dioProvider));
});
