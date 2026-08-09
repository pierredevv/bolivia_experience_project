import 'package:dio/dio.dart';
import '../../../../config/api_constants.dart';
import 'hotel.dart';

/// Servicio de datos para la vista de Hoteles.
class HotelsService {
  final Dio _dio;

  HotelsService(this._dio);

  /// Lista de hoteles con su producto hospedaje más barato.
  ///
  /// Envelope del backend: `{ success, data: { data: [...], meta: {...} }, timestamp }`.
  Future<HotelsResult> getHotels() async {
    final response = await _dio.get(ApiConstants.hotels);
    final payload = _unwrapPayload(response.data);

    if (payload is Map<String, dynamic>) {
      final items = payload['data'] is List ? payload['data'] as List : const [];
      final meta =
          payload['meta'] is Map<String, dynamic> ? payload['meta'] as Map<String, dynamic> : const <String, dynamic>{};

      PlaceReference? reference;
      if (meta['referencePlace'] is Map<String, dynamic>) {
        reference = PlaceReference.fromJson(meta['referencePlace'] as Map<String, dynamic>);
      }
      final maxMinPrice = _asDouble(meta['maxMinPrice']);

      return HotelsResult(
        hotels: items
            .whereType<Map<String, dynamic>>()
            .map((json) => Hotel.fromJson(json))
            .toList(),
        maxMinPrice: maxMinPrice,
        referencePlace: reference,
      );
    }

    return const HotelsResult();
  }

  /// Catálogo de lugares (solo los que tienen coordenadas) para el selector
  /// de "distancia desde un lugar".
  Future<List<PlaceReference>> getPlacesCatalog() async {
    final response = await _dio.get(
      ApiConstants.places,
      queryParameters: {'limit': 100},
    );
    final payload = _unwrapPayload(response.data);

    final result = <PlaceReference>[];
    if (payload is Map<String, dynamic>) {
      final items = payload['data'] is List ? payload['data'] as List : const [];
      for (final e in items) {
        if (e is! Map<String, dynamic>) continue;
        final lat = e['latitude'];
        final lng = e['longitude'];
        final hasLat = lat is num || (lat != null && double.tryParse(lat.toString()) != null);
        final hasLng = lng is num || (lng != null && double.tryParse(lng.toString()) != null);
        if (hasLat && hasLng) {
          result.add(PlaceReference.fromJson(e));
        }
      }
    }
    return result;
  }

  Object? _unwrapPayload(dynamic data) {
    if (data is Map<String, dynamic>) {
      final inner = data['data'];
      if (inner is Map<String, dynamic>) {
        return inner;
      }
      return inner;
    }
    return data;
  }

  double _asDouble(dynamic value) {
    if (value is num) return value.toDouble();
    return double.tryParse(value?.toString() ?? '') ?? 0;
  }
}
