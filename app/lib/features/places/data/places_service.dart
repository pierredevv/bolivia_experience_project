import 'package:dio/dio.dart';
import '../../../../config/api_constants.dart';

class Place {
  final String id;
  final String name;
  final String? description;
  final String? address;
  final double? latitude;
  final double? longitude;
  final dynamic ratingAvg;
  final int? ratingCount;
  final Map<String, dynamic>? category;
  final List<dynamic>? photos;
  final String? phone;
  final String? website;
  final bool? isFeatured;
  final bool? isActive;

  Place({
    required this.id,
    required this.name,
    this.description,
    this.address,
    this.latitude,
    this.longitude,
    this.ratingAvg,
    this.ratingCount,
    this.category,
    this.photos,
    this.phone,
    this.website,
    this.isFeatured,
    this.isActive,
  });

  factory Place.fromJson(Map<String, dynamic> json) {
    return Place(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'],
      address: json['address'],
      latitude: json['latitude'] != null ? double.tryParse(json['latitude'].toString()) : null,
      longitude: json['longitude'] != null ? double.tryParse(json['longitude'].toString()) : null,
      ratingAvg: json['ratingAvg'] ?? 0,
      ratingCount: json['ratingCount'] ?? 0,
      category: json['category'] is Map ? json['category'] : null,
      photos: json['photos'] is List ? json['photos'] : null,
      phone: json['phone'],
      website: json['website'],
      isFeatured: json['isFeatured'],
      isActive: json['isActive'],
    );
  }
}

class PaginatedResponse<T> {
  final List<T> data;
  final int total;
  final int page;
  final int perPage;
  final int totalPages;
  final bool hasNext;
  final bool hasPrevious;

  PaginatedResponse({
    required this.data,
    required this.total,
    required this.page,
    required this.perPage,
    required this.totalPages,
    required this.hasNext,
    required this.hasPrevious,
  });
}

class PlacesService {
  final Dio _dio;

  PlacesService(this._dio);

  Future<PaginatedResponse<Place>> getPlacesByCategory({
    required String categorySlug,
    int page = 1,
    int limit = 10,
  }) async {
    final response = await _dio.get(
      ApiConstants.places,
      queryParameters: {
        'category': categorySlug,
        'page': page,
        'limit': limit,
      },
    );

    final data = response.data;
    final List items = data['data'] ?? [];
    final pagination = data['pagination'] ?? {};

    return PaginatedResponse(
      data: items.map((json) => Place.fromJson(json)).toList(),
      total: pagination['total'] ?? 0,
      page: pagination['page'] ?? page,
      perPage: pagination['per_page'] ?? limit,
      totalPages: pagination['total_pages'] ?? 1,
      hasNext: pagination['has_next'] ?? false,
      hasPrevious: pagination['has_previous'] ?? false,
    );
  }

  Future<Place> getPlaceById(String id) async {
    final response = await _dio.get('${ApiConstants.places}/$id');
    final data = response.data;
    return Place.fromJson(data['data'] ?? data);
  }

  Future<List<dynamic>> getPlacePhotos(String placeId) async {
    final response = await _dio.get('${ApiConstants.places}/$placeId/photos');
    final data = response.data;
    return data['data'] ?? [];
  }

  Future<List<dynamic>> getPlaceReviews(String placeId) async {
    final response = await _dio.get(ApiConstants.placeReviews(placeId));
    final data = response.data;
    return data['data'] ?? [];
  }
}