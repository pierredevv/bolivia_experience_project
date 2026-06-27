import 'package:dio/dio.dart';
import '../../../../config/api_constants.dart';

class FavoritesService {
  final Dio _dio;

  FavoritesService(this._dio);

  Future<List<dynamic>> getFavorites() async {
    final response = await _dio.get(ApiConstants.favorites);
    final data = response.data;
    if (data is Map<String, dynamic> && data['data'] is List) {
      return data['data'] as List<dynamic>;
    }
    return [];
  }

  Future<void> addFavorite(String placeId) async {
    await _dio.post('${ApiConstants.favorites}/$placeId');
  }

  Future<void> removeFavorite(String placeId) async {
    await _dio.delete('${ApiConstants.favorites}/$placeId');
  }

  Future<bool> checkFavorite(String placeId) async {
    final response = await _dio.get(ApiConstants.checkFavorite(placeId));
    final data = response.data;
    if (data is Map<String, dynamic>) {
      return data['is_favorite'] ?? data['data']?['is_favorite'] ?? false;
    }
    return false;
  }
}