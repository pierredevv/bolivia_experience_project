import 'package:dio/dio.dart';
import '../../../config/api_constants.dart';

class MapPlace {
  final String id;
  final String name;
  final String? address;
  final double latitude;
  final double longitude;
  final dynamic ratingAvg;
  final int ratingCount;
  final Map<String, dynamic>? category;
  final String? primaryPhoto;

  MapPlace({
    required this.id,
    required this.name,
    this.address,
    required this.latitude,
    required this.longitude,
    this.ratingAvg,
    this.ratingCount = 0,
    this.category,
    this.primaryPhoto,
  });

  static double _parseDouble(dynamic value) {
    if (value == null) return 0;
    if (value is double) return value;
    if (value is int) return value.toDouble();
    return double.tryParse(value.toString()) ?? 0;
  }

  static Map<String, dynamic>? _parseCategory(Map<String, dynamic> json) {
    // Full category object from Prisma include
    if (json['category'] is Map) return json['category'] as Map<String, dynamic>;
    // Snake_case fields from GeoRepository
    if (json['category_name'] != null) {
      return {
        'id': json['category_id'] ?? '',
        'name': json['category_name'],
        'icon': json['category_icon'] ?? 'place',
      };
    }
    return null;
  }

  static String? _parsePrimaryPhoto(Map<String, dynamic> json) {
    // Direct string from GeoRepository
    if (json['primary_photo'] is String) return json['primary_photo'];
    // photos array from Prisma include
    final photos = json['photos'];
    if (photos is List && photos.isNotEmpty && photos[0] is Map) {
      return photos[0]['url']?.toString();
    }
    return null;
  }

  factory MapPlace.fromJson(Map<String, dynamic> json) {
    return MapPlace(
      id: (json['id'] ?? '').toString(),
      name: json['name'] ?? '',
      address: json['address'],
      latitude: _parseDouble(json['latitude'] ?? json['lat']),
      longitude: _parseDouble(json['longitude'] ?? json['lng']),
      ratingAvg: json['ratingAvg'] ?? json['rating_avg'] ?? 0,
      ratingCount: json['ratingCount'] ?? json['rating_count'] ?? 0,
      category: _parseCategory(json),
      primaryPhoto: _parsePrimaryPhoto(json),
    );
  }

  String? get categoryId => category?['id'];
  String? get categorySlug => category?['slug'];
  bool get isUrban => categorySlug == 'restaurantes' ||
      categorySlug == 'hoteles' ||
      categorySlug == 'vida-nocturna' ||
      categorySlug == 'compras';
}

class MapService {
  final Dio _dio;

  MapService(this._dio);

  Future<List<MapPlace>> getPlacesByBounds({
    required double neLat,
    required double neLng,
    required double swLat,
    required double swLng,
    String? categoryId,
  }) async {
    final queryParams = <String, dynamic>{
      'neLat': neLat,
      'neLng': neLng,
      'swLat': swLat,
      'swLng': swLng,
    };
    if (categoryId != null) queryParams['categoryId'] = categoryId;

    final response = await _dio.get(
      ApiConstants.mapBounds,
      queryParameters: queryParams,
    );

    final data = response.data;
    // Backend response: { success, data: [...], timestamp }
    final inner = data is Map<String, dynamic> ? data['data'] : data;
    final List items = (inner is List) ? inner : [];
    return items
        .whereType<Map<String, dynamic>>()
        .map((json) => MapPlace.fromJson(json))
        .toList();
  }

  Future<List<MapPlace>> getNearbyPlaces({
    required double lat,
    required double lng,
    double radius = 10,
    String? categoryId,
  }) async {
    final queryParams = <String, dynamic>{
      'lat': lat,
      'lng': lng,
      'radius': radius,
    };
    if (categoryId != null) queryParams['categoryId'] = categoryId;

    final response = await _dio.get(
      ApiConstants.mapNearby,
      queryParameters: queryParams,
    );

    final data = response.data;
    // Backend response: { success, data: [...], timestamp }
    final inner = data is Map<String, dynamic> ? data['data'] : data;
    final List items = (inner is List) ? inner : [];
    return items
        .whereType<Map<String, dynamic>>()
        .map((json) => MapPlace.fromJson(json))
        .toList();
  }
}
