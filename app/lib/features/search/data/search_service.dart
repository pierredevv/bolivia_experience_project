import 'package:dio/dio.dart';
import '../../../../config/api_constants.dart';

class SearchService {
  final Dio _dio;

  SearchService(this._dio);

  Future<List<dynamic>> search({
    required String query,
    int page = 1,
    int limit = 10,
  }) async {
    final response = await _dio.get(
      ApiConstants.search,
      queryParameters: {
        'q': query,
        'page': page,
        'limit': limit,
      },
    );
    final data = response.data;
    if (data is Map<String, dynamic> && data['data'] is List) {
      return data['data'] as List<dynamic>;
    }
    return [];
  }

  Future<Map<String, dynamic>> advancedSearch({
    String? query,
    String? categoryId,
    double? minRating,
    double? maxRating,
    double? lat,
    double? lng,
    double? radius,
    bool? featured,
    String? sortBy,
    String? sortOrder,
    int page = 1,
    int limit = 20,
  }) async {
    final params = <String, dynamic>{
      'page': page,
      'limit': limit,
    };

    if (query != null && query.isNotEmpty) params['q'] = query;
    if (categoryId != null) params['categoryId'] = categoryId;
    if (minRating != null) params['minRating'] = minRating;
    if (maxRating != null) params['maxRating'] = maxRating;
    if (lat != null) params['lat'] = lat;
    if (lng != null) params['lng'] = lng;
    if (radius != null) params['radius'] = radius;
    if (featured != null) params['featured'] = featured;
    if (sortBy != null) params['sortBy'] = sortBy;
    if (sortOrder != null) params['sortOrder'] = sortOrder;

    final response = await _dio.get(
      '${ApiConstants.search}/advanced',
      queryParameters: params,
    );
    final data = response.data;
    if (data is Map<String, dynamic>) {
      return data;
    }
    return {'data': [], 'meta': {'total': 0, 'page': 1, 'limit': limit, 'totalPages': 0}};
  }

  Future<List<dynamic>> getSuggestions({required String query}) async {
    final response = await _dio.get(
      ApiConstants.searchSuggestions,
      queryParameters: {'q': query},
    );
    final data = response.data;
    if (data is Map<String, dynamic> && data['data'] is List) {
      return data['data'] as List<dynamic>;
    }
    return [];
  }

  Future<List<dynamic>> getSearchHistory() async {
    final response = await _dio.get(ApiConstants.searchHistory);
    final data = response.data;
    if (data is Map<String, dynamic> && data['data'] is List) {
      return data['data'] as List<dynamic>;
    }
    return [];
  }
}
