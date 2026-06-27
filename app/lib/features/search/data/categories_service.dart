import 'package:dio/dio.dart';
import '../../../../config/api_constants.dart';

class Category {
  final String id;
  final String name;
  final String icon;
  final String slug;
  final int placeCount;

  Category({
    required this.id,
    required this.name,
    required this.icon,
    required this.slug,
    this.placeCount = 0,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      icon: json['icon'] ?? 'place',
      slug: json['slug'] ?? '',
      placeCount: json['_count']?['places'] ?? 0,
    );
  }
}

class CategoriesService {
  final Dio _dio;

  CategoriesService(this._dio);

  Future<List<Category>> getCategories() async {
    final response = await _dio.get(ApiConstants.categories);
    final data = response.data;
    final List items = data['data'] ?? data;
    return items.map((json) => Category.fromJson(json)).toList();
  }
}
