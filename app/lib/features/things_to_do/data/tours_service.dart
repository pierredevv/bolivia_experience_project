import 'package:dio/dio.dart';
import '../../../../config/api_constants.dart';
import 'tour.dart';

/// Servicio de datos para la vista "Cosas que hacer en Santa Cruz".
class ToursService {
  final Dio _dio;

  ToursService(this._dio);

  /// Todos los tours (agrupados por subcategoría en el provider).
  Future<List<Tour>> getTours() async {
    final response = await _dio.get(ApiConstants.tours);
    final items = _unwrapList(response.data);
    return items
        .whereType<Map<String, dynamic>>()
        .map((json) => Tour.fromJson(json))
        .toList();
  }

  /// Tours recomendados (scoring por perfil si hay sesión; si no, por rating).
  Future<List<Tour>> getRecommendedTours() async {
    final response = await _dio.get(ApiConstants.toursRecommended);
    final items = _unwrapList(response.data);
    return items
        .whereType<Map<String, dynamic>>()
        .map((json) => Tour.fromJson(json))
        .toList();
  }

  /// Feed de lugares (formato compacto de card). Si se pasa un slug de
  /// categoría, solo devuelve lugares de esa categoría (sin hoteles).
  Future<List<Map<String, dynamic>>> getPlacesFeed(String? categorySlug) async {
    final path = (categorySlug != null && categorySlug.isNotEmpty)
        ? ApiConstants.placesFeedByCategory(categorySlug)
        : ApiConstants.placesFeed;
    final response = await _dio.get(path);
    final items = _unwrapList(response.data);
    return items.whereType<Map<String, dynamic>>().toList();
  }

  /// Experiencias imprescindibles: colección curada mixta de lugares y
  /// productos con flag `esImprescindible`. Cada item trae `tipo: place|product`.
  Future<List<Map<String, dynamic>>> getEssentialExperiences() async {
    final response = await _dio.get(ApiConstants.essentialExperiences);
    final items = _unwrapList(response.data);
    return items.whereType<Map<String, dynamic>>().toList();
  }

  /// Restaurantes con mesa reservable. Devuelve `{ data, meta }` completo:
  /// `data` = lista de restaurantes con `nivelPrecio`, `mesa`, `comodidades`;
  /// `meta` = `referencePlace` (para distancias) y `cocinaCategories`.
  Future<Map<String, dynamic>> getRestaurants() async {
    final response = await _dio.get(ApiConstants.restaurants);
    final data = response.data;
    if (data is Map<String, dynamic>) {
      final inner = data['data'];
      if (inner is Map<String, dynamic>) return inner;
    }
    return const {'data': <dynamic>[], 'meta': <String, dynamic>{}};
  }

  /// Desenvuelve el envelope del backend: `{ success, data: { data: [...], meta }, ... }`.
  List<dynamic> _unwrapList(dynamic data) {
    if (data is Map<String, dynamic>) {
      final inner = data['data'];
      if (inner is Map<String, dynamic>) {
        final items = inner['data'];
        if (items is List) return items.cast<dynamic>();
      }
      if (inner is List) return inner.cast<dynamic>();
    }
    if (data is List) return data.cast<dynamic>();
    return const [];
  }
}
