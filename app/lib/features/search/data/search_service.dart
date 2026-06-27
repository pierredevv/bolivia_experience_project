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