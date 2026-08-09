import 'package:dio/dio.dart';
import '../../../../config/api_constants.dart';
import 'experience_detail.dart';
import 'home_experience.dart';

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

  Future<List<dynamic>> getHotels() async {
    return _getPaginatedPlaces(ApiConstants.placesByCategorySlug('hoteles'));
  }

  Future<List<dynamic>> getThingsToDo() async {
    return _getPaginatedPlaces(ApiConstants.placesNotHotel);
  }

  Future<List<dynamic>> getRestaurants() async {
    return _getPaginatedPlaces(ApiConstants.placesByCategorySlug('restaurantes'));
  }

  Future<List<HomeExperience>> getHomeExperiences() async {
    final response = await _dio.get(ApiConstants.homeExperiences);
    final data = response.data;
    if (data is Map<String, dynamic> && data['data'] is List) {
      return (data['data'] as List)
          .whereType<Map<String, dynamic>>()
          .map((json) => HomeExperience.fromJson(json))
          .toList();
    }
    return [];
  }

  Future<ExperienceDetail> getExperienceDetail(String id) async {
    final response = await _dio.get(ApiConstants.experienceById(id));
    final data = response.data;
    if (data is Map<String, dynamic> && data['data'] is Map<String, dynamic>) {
      return ExperienceDetail.fromJson(data['data'] as Map<String, dynamic>);
    }
    throw Exception('Payload de experiencia inesperado');
  }

  Future<List<ExperienceReview>> getExperienceReviews(String id) async {
    final response = await _dio.get(ApiConstants.productReviews(id));
    final data = response.data;
    if (data is Map<String, dynamic>) {
      final inner = data['data'];
      if (inner is Map<String, dynamic> && inner['data'] is List) {
        return (inner['data'] as List)
            .whereType<Map<String, dynamic>>()
            .map((json) => ExperienceReview.fromJson(json))
            .toList();
      }
      if (inner is List) {
        return inner
            .whereType<Map<String, dynamic>>()
            .map((json) => ExperienceReview.fromJson(json))
            .toList();
      }
    }
    return [];
  }

  Future<List<dynamic>> _getPaginatedPlaces(String endpoint) async {
    final response = await _dio.get(endpoint);
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