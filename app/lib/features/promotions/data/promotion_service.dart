import 'package:dio/dio.dart';
import '../../../../config/api_constants.dart';

class Promotion {
  final String id;
  final String title;
  final String? description;
  final String? photoUrl;
  final double? discountPercentage;
  final String? startDate;
  final String? endDate;
  final Map<String, dynamic>? place;

  Promotion({
    required this.id,
    required this.title,
    this.description,
    this.photoUrl,
    this.discountPercentage,
    this.startDate,
    this.endDate,
    this.place,
  });

  factory Promotion.fromJson(Map<String, dynamic> json) {
    return Promotion(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'],
      photoUrl: json['photoUrl'],
      discountPercentage: json['discountPercentage'] != null
          ? double.tryParse(json['discountPercentage'].toString())
          : null,
      startDate: json['startDate'],
      endDate: json['endDate'],
      place: json['place'] is Map ? Map<String, dynamic>.from(json['place']) : null,
    );
  }
}

class PromotionsService {
  final Dio _dio;

  PromotionsService(this._dio);

  Future<List<Promotion>> getPromotions() async {
    final response = await _dio.get(ApiConstants.promotions);
    final data = response.data;
    final List items = data['data'] ?? [];
    return items.map((json) => Promotion.fromJson(json)).toList();
  }

  Future<Promotion> getPromotionById(String id) async {
    final response = await _dio.get('${ApiConstants.promotions}/$id');
    final data = response.data;
    return Promotion.fromJson(data['data'] ?? data);
  }
}
