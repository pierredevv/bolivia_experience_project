import 'package:dio/dio.dart';
import 'package:geolocator/geolocator.dart';
import '../../../../config/api_constants.dart';

class MapPlace {
  final String id;
  final String name;
  final String? description;
  final String? address;
  final double latitude;
  final double longitude;
  final double ratingAvg;
  final int ratingCount;
  final String? categoryName;
  final String? categoryIcon;
  final String? primaryPhoto;
  final double? distanceMeters;

  MapPlace({
    required this.id,
    required this.name,
    this.description,
    this.address,
    required this.latitude,
    required this.longitude,
    required this.ratingAvg,
    required this.ratingCount,
    this.categoryName,
    this.categoryIcon,
    this.primaryPhoto,
    this.distanceMeters,
  });

  factory MapPlace.fromJson(Map<String, dynamic> json) {
    return MapPlace(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'],
      address: json['address'],
      latitude: double.parse(json['latitude'].toString()),
      longitude: double.parse(json['longitude'].toString()),
      ratingAvg: double.parse((json['ratingAvg'] ?? 0).toString()),
      ratingCount: json['ratingCount'] ?? 0,
      categoryName: json['category']?['name'],
      categoryIcon: json['category']?['icon'],
      primaryPhoto: json['photos']?.isNotEmpty == true
          ? json['photos'][0]['url']
          : null,
      distanceMeters: json['distance'] != null
          ? double.parse(json['distance'].toString())
          : null,
    );
  }

  factory MapPlace.fromNearbyJson(Map<String, dynamic> json) {
    return MapPlace(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'],
      address: json['address'],
      latitude: double.parse(json['latitude']?.toString() ?? '0'),
      longitude: double.parse(json['longitude']?.toString() ?? '0'),
      ratingAvg: double.parse((json['rating_avg'] ?? 0).toString()),
      ratingCount: json['rating_count'] ?? 0,
      categoryName: json['category_name'],
      categoryIcon: json['category_icon'],
      primaryPhoto: json['primary_photo'],
      distanceMeters: json['distance_meters'] != null
          ? double.parse(json['distance_meters'].toString())
          : null,
    );
  }
}

class MapCluster {
  final int clusterId;
  final int clusterCount;
  final double avgLat;
  final double avgLng;

  MapCluster({
    required this.clusterId,
    required this.clusterCount,
    required this.avgLat,
    required this.avgLng,
  });

  factory MapCluster.fromJson(Map<String, dynamic> json) {
    return MapCluster(
      clusterId: json['cluster_id'] ?? 0,
      clusterCount: json['cluster_count'] ?? 0,
      avgLat: double.parse(json['avg_lat'].toString()),
      avgLng: double.parse(json['avg_lng'].toString()),
    );
  }
}

class MapService {
  final Dio _dio;

  MapService(this._dio);

  Future<List<MapPlace>> getNearbyPlaces({
    required double latitude,
    required double longitude,
    double radiusMeters = 5000,
    int limit = 50,
    String? categoryId,
  }) async {
    final params = <String, dynamic>{
      'lat': latitude,
      'lng': longitude,
      'radius': radiusMeters,
      'limit': limit,
    };
    if (categoryId != null) params['categoryId'] = categoryId;

    final response = await _dio.get(
      ApiConstants.mapNearby,
      queryParameters: params,
    );
    final data = response.data;
    final List items = data is List ? data : (data['data'] ?? []);
    return items.map((json) => MapPlace.fromNearbyJson(json)).toList();
  }

  Future<List<MapCluster>> getClusters({
    required double neLat,
    required double neLng,
    required double swLat,
    required double swLng,
  }) async {
    final response = await _dio.get(
      ApiConstants.mapCluster,
      queryParameters: {
        'neLat': neLat,
        'neLng': neLng,
        'swLat': swLat,
        'swLng': swLng,
      },
    );
    final data = response.data;
    final List items = data is List ? data : (data['data'] ?? []);
    return items.map((json) => MapCluster.fromJson(json)).toList();
  }

  Future<List<MapPlace>> getPlacesInBounds({
    required double neLat,
    required double neLng,
    required double swLat,
    required double swLng,
    String? categoryId,
  }) async {
    final params = <String, dynamic>{
      'neLat': neLat,
      'neLng': neLng,
      'swLat': swLat,
      'swLng': swLng,
    };
    if (categoryId != null) params['categoryId'] = categoryId;

    final response = await _dio.get(
      ApiConstants.mapBounds,
      queryParameters: params,
    );
    final data = response.data;
    final List items = data is List ? data : (data['data'] ?? []);
    return items.map((json) => MapPlace.fromNearbyJson(json)).toList();
  }

  Future<Position?> getCurrentLocation() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) return null;

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) return null;
    }

    if (permission == LocationPermission.deniedForever) return null;

    return await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high,
    );
  }

  Stream<Position> getPositionStream() {
    return Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 100,
      ),
    );
  }
}
