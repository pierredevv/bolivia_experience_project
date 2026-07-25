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
    if (data is Map<String, dynamic>) {
      final inner = data['data'];
      // Backend wraps in PaginatedResponse: { data: [...], meta: {...} }
      if (inner is Map<String, dynamic> && inner['data'] is List) {
        return inner['data'] as List<dynamic>;
      }
      // Fallback: direct list
      if (inner is List) {
        return inner;
      }
    }
    return [];
  }
}