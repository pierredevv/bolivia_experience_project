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
  final int points;
  final int badgeCount;

  UserProfile({
    required this.id,
    required this.name,
    required this.email,
    this.photo,
    this.country,
    this.language,
    this.createdAt,
    this.points = 0,
    this.badgeCount = 0,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    final count = json['_count'];
    return UserProfile(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      photo: json['photoUrl'],
      country: json['country'],
      language: json['language'],
      createdAt: json['created_at'],
      points: json['points'] ?? 0,
      badgeCount: (count is Map) ? (count['userBadges'] ?? 0) : 0,
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