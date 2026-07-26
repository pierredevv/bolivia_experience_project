import 'package:dio/dio.dart';
import '../../../../config/api_constants.dart';

class Review {
  final String id;
  final String userId;
  final String? userName;
  final String? userPhoto;
  final String placeId;
  final String? placeName;
  final int rating;
  final String? comment;
  final String? createdAt;
  final String? updatedAt;

  Review({
    required this.id,
    required this.userId,
    this.userName,
    this.userPhoto,
    required this.placeId,
    this.placeName,
    required this.rating,
    this.comment,
    this.createdAt,
    this.updatedAt,
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    return Review(
      id: json['id']?.toString() ?? '',
      userId: json['userId']?.toString() ?? '',
      userName: json['user']?['name'],
      userPhoto: json['user']?['photoUrl'],
      placeId: json['placeId']?.toString() ?? '',
      placeName: json['place']?['name'],
      rating: json['rating'] ?? 0,
      comment: json['comment'],
      createdAt: json['createdAt'],
      updatedAt: json['updatedAt'],
    );
  }
}

class ReviewsService {
  final Dio _dio;

  ReviewsService(this._dio);

  Future<List<Review>> getPlaceReviews(String placeId) async {
    final response = await _dio.get(ApiConstants.placeReviews(placeId));
    final data = response.data;
    // Backend wraps in PaginatedResponse: { success, data: { data: [...], meta: {...} }, timestamp }
    final inner = data is Map<String, dynamic> ? data['data'] : data;
    final List items = (inner is Map<String, dynamic> && inner['data'] is List)
        ? inner['data']
        : (inner is List ? inner : []);
    return items.map((json) => Review.fromJson(json)).toList();
  }

  Future<Review> createReview({
    required String placeId,
    required int rating,
    required String comment,
  }) async {
    final response = await _dio.post(
      ApiConstants.placeReviews(placeId),
      data: {
        'rating': rating,
        'comment': comment,
      },
    );
    final data = response.data;
    return Review.fromJson(data['data'] ?? data);
  }

  Future<Review> updateReview({
    required String reviewId,
    required int rating,
    required String comment,
  }) async {
    final response = await _dio.put(
      '${ApiConstants.reviews}/$reviewId',
      data: {
        'rating': rating,
        'comment': comment,
      },
    );
    final data = response.data;
    return Review.fromJson(data['data'] ?? data);
  }

  Future<void> deleteReview(String reviewId) async {
    await _dio.delete('${ApiConstants.reviews}/$reviewId');
  }

  Future<List<Review>> getUserReviews() async {
    final response = await _dio.get(ApiConstants.userReviews);
    final data = response.data;
    final inner = data is Map<String, dynamic> ? data['data'] : data;
    final List items = (inner is Map<String, dynamic> && inner['data'] is List)
        ? inner['data']
        : (inner is List ? inner : []);
    return items.map((json) => Review.fromJson(json)).toList();
  }

  Future<Map<String, dynamic>> getUserReviewStats() async {
    final response = await _dio.get(ApiConstants.userReviewsStats);
    final data = response.data;
    return data['data'] ?? data;
  }
}