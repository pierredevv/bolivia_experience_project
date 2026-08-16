import 'package:dio/dio.dart';
import '../../../../config/api_constants.dart';

class BadgeModel {
  final String id;
  final String key;
  final String name;
  final String? nameEn;
  final String? description;
  final String? descriptionEn;
  final String icon;
  final int points;
  final DateTime? earnedAt;

  const BadgeModel({
    required this.id,
    required this.key,
    required this.name,
    this.nameEn,
    this.description,
    this.descriptionEn,
    this.icon = 'emoji_events',
    this.points = 0,
    this.earnedAt,
  });

  factory BadgeModel.fromJson(Map<String, dynamic> json) {
    return BadgeModel(
      id: json['id'] ?? '',
      key: json['key'] ?? '',
      name: json['name'] ?? '',
      nameEn: json['nameEn'],
      description: json['description'],
      descriptionEn: json['descriptionEn'],
      icon: json['icon'] ?? 'emoji_events',
      points: json['points'] ?? 0,
      earnedAt: json['earnedAt'] != null
          ? DateTime.tryParse(json['earnedAt'].toString())
          : null,
    );
  }
}

class GamificationSnapshot {
  final int points;
  final List<BadgeModel> badges;

  const GamificationSnapshot({this.points = 0, this.badges = const []});

  factory GamificationSnapshot.fromJson(Map<String, dynamic> json) {
    final list = json['badges'];
    return GamificationSnapshot(
      points: json['points'] ?? 0,
      badges: list is List
          ? list
              .whereType<Map<String, dynamic>>()
              .map(BadgeModel.fromJson)
              .toList()
          : [],
    );
  }
}

class GamificationService {
  final Dio _dio;

  GamificationService(this._dio);

  Future<GamificationSnapshot> getMyGamification() async {
    final response = await _dio.get(ApiConstants.gamificationMe);
    final data = response.data;
    return GamificationSnapshot.fromJson(data['data'] ?? data);
  }

  Future<List<BadgeModel>> getAllBadges() async {
    final response = await _dio.get(ApiConstants.gamificationBadges);
    final raw = response.data;
    final data = raw['data'] ?? raw;
    if (data is! List) return [];
    return data
        .whereType<Map<String, dynamic>>()
        .map(BadgeModel.fromJson)
        .toList();
  }
}
