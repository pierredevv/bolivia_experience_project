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

  factory MapPlace.fromJson(Map<String, dynamic> json) {
    return MapPlace(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      address: json['address'],
      latitude: double.parse(json['latitude'].toString()),
      longitude: double.parse(json['longitude'].toString()),
      ratingAvg: json['ratingAvg'],
      ratingCount: json['ratingCount'] ?? 0,
      category: json['category'] is Map ? json['category'] : null,
      primaryPhoto: json['photos'] is List && (json['photos'] as List).isNotEmpty
          ? json['photos'][0]['url']
          : null,
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
    final List items = data['data'] ?? [];
    return items.map((json) => MapPlace.fromJson(json)).toList();
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
    final List items = data['data'] ?? [];
    return items.map((json) => MapPlace.fromJson(json)).toList();
  }
}
