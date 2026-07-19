import 'package:dio/dio.dart';
import '../../../../config/api_constants.dart';

class UserProfile {
  final String id;
  final String name;
  final String email;
  final String? photo;
  final String? country;
  final String? language;
  final String? createdAt;
  final int reviewCount;
  final int favoriteCount;
  final double? avgRating;

  UserProfile({
    required this.id,
    required this.name,
    required this.email,
    this.photo,
    this.country,
    this.language,
    this.createdAt,
    this.reviewCount = 0,
    this.favoriteCount = 0,
    this.avgRating,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    final count = json['_count'] ?? {};
    return UserProfile(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      photo: json['photoUrl'],
      country: json['country'],
      language: json['language'],
      createdAt: json['created_at'] ?? json['createdAt'],
      reviewCount: count['reviews'] ?? 0,
      favoriteCount: count['favorites'] ?? 0,
      avgRating: json['avgRating'] != null ? double.tryParse(json['avgRating'].toString()) : null,
    );
  }
}

class ProfileService {
  final Dio _dio;

  ProfileService(this._dio);

  Future<UserProfile> getProfile() async {
    final response = await _dio.get(ApiConstants.userProfile);
    final data = response.data;
    return UserProfile.fromJson(data['data'] ?? data);
  }

  Future<UserProfile> updateProfile({String? name}) async {
    final response = await _dio.put(
      ApiConstants.userProfile,
      data: {
        if (name != null) 'name': name,
      },
    );
    final data = response.data;
    return UserProfile.fromJson(data['data'] ?? data);
  }
}
