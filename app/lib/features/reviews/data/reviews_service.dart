import 'package:dio/dio.dart';
import '../../../../config/api_constants.dart';

class Review {
  final String id;
  final String userId;
  final String? userName;
  final String? userPhoto;
  final String placeId;
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
    required this.rating,
    this.comment,
    this.createdAt,
    this.updatedAt,
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    return Review(
      id: json['id'] ?? '',
      userId: json['user_id'] ?? '',
      userName: json['user']?['name'],
      userPhoto: json['user']?['photo'],
      placeId: json['place_id'] ?? '',
      rating: json['rating'] ?? 0,
      comment: json['comment'],
      createdAt: json['created_at'],
      updatedAt: json['updated_at'],
    );
  }
}

class ReviewsService {
  final Dio _dio;

  ReviewsService(this._dio);

  Future<List<Review>> getPlaceReviews(String placeId) async {
    final response = await _dio.get(ApiConstants.placeReviews(placeId));
    final data = response.data;
    final List items = data['data'] ?? [];
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
}