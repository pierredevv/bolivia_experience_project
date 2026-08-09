import 'package:dio/dio.dart';
import '../../../../config/api_constants.dart';

class Product {
  final String id;
  final String name;
  final String? description;
  final double price;
  final String currency;
  final int? capacity;
  final String modalidadReserva;
  final String type;

  Product({
    required this.id,
    required this.name,
    this.description,
    required this.price,
    this.currency = 'BOB',
    this.capacity,
    this.modalidadReserva = 'ninguna',
    this.type = 'actividad',
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      description: json['description']?.toString(),
      price: double.tryParse(json['price']?.toString() ?? '') ?? 0,
      currency: json['currency']?.toString() ?? 'BOB',
      capacity: json['capacity'] != null ? int.tryParse(json['capacity'].toString()) : null,
      modalidadReserva: json['modalidadReserva']?.toString() ?? 'ninguna',
      type: json['type']?.toString() ?? 'actividad',
    );
  }

  bool get isInstantanea => modalidadReserva == 'instantanea';
  bool get isSolicitud => modalidadReserva == 'solicitud';
}

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
  final int? priceLevel;
  final bool canReserve;
  final List<Product> products;

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
    this.priceLevel,
    this.canReserve = false,
    this.products = const [],
  });

  factory Place.fromJson(Map<String, dynamic> json) {
    final count = json['_count'];
    final reservableFromCount = count is Map<String, dynamic>
        ? (count['products'] is int ? count['products'] > 0 : false)
        : false;
    return Place(
      id: json['id']?.toString() ?? '',
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
      priceLevel: json['priceLevel'] is int ? json['priceLevel'] : (json['priceLevel'] != null ? int.tryParse(json['priceLevel'].toString()) : null),
      canReserve: json['canReserve'] == true || reservableFromCount,
      products: json['products'] is List
          ? (json['products'] as List<dynamic>)
              .whereType<Map<String, dynamic>>()
              .map((item) => Product.fromJson(item))
              .toList()
          : const [],
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
        'categorySlug': categorySlug,
        'page': page,
        'limit': limit,
      },
    );

    final data = response.data;
    // Backend response: { success, data: { data: [...], meta: {...} }, timestamp }
    final inner = data is Map<String, dynamic> ? data['data'] : data;
    final List items = (inner is Map<String, dynamic> && inner['data'] is List)
        ? inner['data']
        : (inner is List ? inner : []);
    final meta = (inner is Map<String, dynamic> ? inner['meta'] : null) ?? {};

    return PaginatedResponse(
      data: items.map((json) => Place.fromJson(json)).toList(),
      total: meta['total'] ?? 0,
      page: meta['page'] ?? page,
      perPage: meta['limit'] ?? limit,
      totalPages: meta['totalPages'] ?? 1,
      hasNext: meta['hasNext'] ?? (page < (meta['totalPages'] ?? 1)),
      hasPrevious: meta['hasPrevious'] ?? (page > 1),
    );
  }

  Future<Place> getPlaceById(String id) async {
    final response = await _dio.get('${ApiConstants.places}/$id');
    final data = response.data;

    // Backend envelope: { success, data: <place>, timestamp }.
    // Unwrap defensively so an unexpected shape never triggers a raw TypeError.
    Object? payload;
    if (data is Map<String, dynamic>) {
      payload = data['data'];
    } else {
      payload = data;
    }

    // If the detail response came back as a paginated/nested shape
    // ({ data: [...], meta }), recover the first item if present.
    if (payload is Map<String, dynamic> && payload['data'] is List) {
      final list = payload['data'] as List;
      if (list.isNotEmpty && list.first is Map<String, dynamic>) {
        payload = list.first;
      }
    }

    if (payload is Map<String, dynamic>) {
      return Place.fromJson(payload);
    }

    throw DioException(
      requestOptions: response.requestOptions,
      type: DioExceptionType.badResponse,
      error: 'Respuesta inesperada del servidor al cargar el lugar.',
    );
  }

  Future<List<dynamic>> getPlacePhotos(String placeId) async {
    final response = await _dio.get('${ApiConstants.places}/$placeId/photos');
    final data = response.data;
    if (data is Map<String, dynamic>) {
      final inner = data['data'];
      if (inner is List) {
        return inner;
      }
    }
    return [];
  }

  Future<List<dynamic>> getPlaceReviews(String placeId) async {
    final response = await _dio.get(ApiConstants.placeReviews(placeId));
    final data = response.data;
    if (data is Map<String, dynamic>) {
      final inner = data['data'];
      // Backend wraps in PaginatedResponse: { data: [...], meta: {...} }
      if (inner is Map<String, dynamic> && inner['data'] is List) {
        return inner['data'] as List<dynamic>;
      }
      if (inner is List) {
        return inner;
      }
    }
    return [];
  }
}