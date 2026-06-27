import 'package:dio/dio.dart';
import '../../../../config/api_constants.dart';

class HomeService {
  final Dio _dio;

  HomeService(this._dio);

  Future<List<dynamic>> getFeaturedPlaces() async {
    final response = await _dio.get(ApiConstants.featuredPlaces);
    final data = response.data;
    if (data is Map<String, dynamic> && data['data'] is List) {
      return data['data'] as List<dynamic>;
    }
    return [];
  }

  Future<List<dynamic>> getCategories() async {
    final response = await _dio.get(ApiConstants.categories);
    final data = response.data;
    if (data is Map<String, dynamic> && data['data'] is List) {
      return data['data'] as List<dynamic>;
    }
    return [];
  }

  Future<List<dynamic>> getTodayEvents() async {
    final response = await _dio.get(ApiConstants.todayEvents);
    final data = response.data;
    if (data is Map<String, dynamic> && data['data'] is List) {
      return data['data'] as List<dynamic>;
    }
    return [];
  }

  Future<List<dynamic>> getPromotions() async {
    final response = await _dio.get(ApiConstants.promotions);
    final data = response.data;
    if (data is Map<String, dynamic> && data['data'] is List) {
      return data['data'] as List<dynamic>;
    }
    return [];
  }
}