import 'package:dio/dio.dart';
import '../../../../config/api_constants.dart';
import 'restaurant.dart';

/// Servicio de datos para la vista de Restaurantes.
class RestaurantsService {
  final Dio _dio;

  RestaurantsService(this._dio);

  /// Lista de restaurantes con su mesa reservable y nivel de precio.
  ///
  /// Envelope del backend: `{ success, data: { data: [...], meta: {...} }, timestamp }`.
  Future<RestaurantsResult> getRestaurants() async {
    final response = await _dio.get(ApiConstants.restaurants);
    final payload = _unwrapPayload(response.data);

    if (payload is Map<String, dynamic>) {
      final items =
          payload['data'] is List ? payload['data'] as List : const [];
      final meta = payload['meta'] is Map<String, dynamic>
          ? payload['meta'] as Map<String, dynamic>
          : const <String, dynamic>{};

      RestaurantReference? reference;
      if (meta['referencePlace'] is Map<String, dynamic>) {
        reference = RestaurantReference.fromJson(
            meta['referencePlace'] as Map<String, dynamic>);
      }

      final cocinaCategories = <Map<String, dynamic>>[];
      if (meta['cocinaCategories'] is List) {
        for (final c in meta['cocinaCategories'] as List) {
          if (c is Map<String, dynamic>) cocinaCategories.add(c);
        }
      }

      return RestaurantsResult(
        restaurants: items
            .whereType<Map<String, dynamic>>()
            .map((json) => Restaurant.fromJson(json))
            .toList(),
        referencePlace: reference,
        cocinaCategories: cocinaCategories,
      );
    }

    return const RestaurantsResult();
  }

  Object? _unwrapPayload(dynamic data) {
    if (data is Map<String, dynamic>) {
      final inner = data['data'];
      if (inner is Map<String, dynamic>) return inner;
      return inner;
    }
    return data;
  }
}
