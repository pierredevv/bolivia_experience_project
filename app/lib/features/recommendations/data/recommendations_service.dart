import 'package:dio/dio.dart';
import '../../../../config/api_constants.dart';
import '../domain/recommendations.dart';

class RecommendationsService {
  final Dio _dio;

  RecommendationsService(this._dio);

  Future<PersonalizedRecommendations> getPersonalized({int limit = 10}) async {
    final response = await _dio.get(ApiConstants.recommendationsPersonalized(
      limit: limit,
    ));
    final data = response.data;
    if (data is Map<String, dynamic>) {
      return PersonalizedRecommendations.fromJson(data);
    }
    throw Exception('Payload de recomendaciones inesperado');
  }
}
