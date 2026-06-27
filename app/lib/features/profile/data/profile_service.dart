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

  UserProfile({
    required this.id,
    required this.name,
    required this.email,
    this.photo,
    this.country,
    this.language,
    this.createdAt,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      photo: json['photo'],
      country: json['country'],
      language: json['language'],
      createdAt: json['created_at'],
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