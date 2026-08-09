import 'dart:io';
import 'package:dio/dio.dart';
import '../../../../config/api_constants.dart';

class TravelerPhotoAuthor {
  final String id;
  final String name;
  final String? country;
  final String? photoUrl;

  const TravelerPhotoAuthor({
    required this.id,
    required this.name,
    this.country,
    this.photoUrl,
  });

  factory TravelerPhotoAuthor.fromJson(Map<String, dynamic> json) {
    return TravelerPhotoAuthor(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      country: json['country'],
      photoUrl: json['photoUrl'],
    );
  }
}

class TravelerPhoto {
  final String id;
  final String imageUrl;
  final String title;
  final String? description;
  final DateTime? createdAt;
  final int likeCount;
  final bool likedByUser;
  final TravelerPhotoAuthor author;

  const TravelerPhoto({
    required this.id,
    required this.imageUrl,
    required this.title,
    this.description,
    this.createdAt,
    this.likeCount = 0,
    this.likedByUser = false,
    required this.author,
  });

  factory TravelerPhoto.fromJson(Map<String, dynamic> json) {
    return TravelerPhoto(
      id: json['id']?.toString() ?? '',
      imageUrl: json['imageUrl'] ?? '',
      title: json['title'] ?? '',
      description: json['description'],
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString())
          : null,
      likeCount: json['likeCount'] ?? 0,
      likedByUser: json['likedByUser'] == true,
      author: json['author'] is Map<String, dynamic>
          ? TravelerPhotoAuthor.fromJson(json['author'])
          : const TravelerPhotoAuthor(id: '', name: ''),
    );
  }

  TravelerPhoto copyWith({
    int? likeCount,
    bool? likedByUser,
  }) {
    return TravelerPhoto(
      id: id,
      imageUrl: imageUrl,
      title: title,
      description: description,
      createdAt: createdAt,
      likeCount: likeCount ?? this.likeCount,
      likedByUser: likedByUser ?? this.likedByUser,
      author: author,
    );
  }
}

class TravelerPhotoLikeResult {
  final bool liked;
  final int likeCount;

  const TravelerPhotoLikeResult({required this.liked, required this.likeCount});
}

class TravelerPhotosService {
  final Dio _dio;

  TravelerPhotosService(this._dio);

  Future<List<TravelerPhoto>> getPhotos({int page = 1, int limit = 20}) async {
    final response = await _dio.get(
      ApiConstants.travelerPhotos,
      queryParameters: {'page': page, 'limit': limit},
    );
    final data = response.data;
    final inner = data is Map<String, dynamic> ? data['data'] : data;
    final List items = (inner is Map<String, dynamic> && inner['data'] is List)
        ? inner['data']
        : (inner is List ? inner : []);
    return items
        .map((json) => TravelerPhoto.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  Future<TravelerPhoto> getPhoto(String id) async {
    final response = await _dio.get('${ApiConstants.travelerPhotos}/$id');
    final data = response.data;
    return TravelerPhoto.fromJson(data['data'] ?? data);
  }

  Future<TravelerPhoto> createPhoto({
    required String title,
    String? description,
    required String filePath,
  }) async {
    final fileName = filePath.split(Platform.pathSeparator).last;
    final formData = FormData.fromMap({
      'title': title,
      if (description != null && description.isNotEmpty) 'description': description,
      'file': await MultipartFile.fromFile(filePath, filename: fileName),
    });
    final response = await _dio.post(
      ApiConstants.travelerPhotos,
      data: formData,
    );
    final data = response.data;
    return TravelerPhoto.fromJson(data['data'] ?? data);
  }

  Future<TravelerPhotoLikeResult> toggleLike(String photoId) async {
    final response = await _dio.post(
      '${ApiConstants.travelerPhotos}/$photoId/like',
    );
    final data = response.data;
    final body = data is Map<String, dynamic> ? data['data'] ?? data : data;
    return TravelerPhotoLikeResult(
      liked: body['liked'] == true,
      likeCount: body['likeCount'] ?? 0,
    );
  }

  Future<TravelerPhotoLikeResult> removeLike(String photoId) async {
    final response = await _dio.delete(
      '${ApiConstants.travelerPhotos}/$photoId/like',
    );
    final data = response.data;
    final body = data is Map<String, dynamic> ? data['data'] ?? data : data;
    return TravelerPhotoLikeResult(
      liked: body['liked'] == true,
      likeCount: body['likeCount'] ?? 0,
    );
  }
}
