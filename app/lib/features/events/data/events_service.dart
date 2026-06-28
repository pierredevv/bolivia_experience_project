import 'package:dio/dio.dart';
import '../../../../config/api_constants.dart';

class Event {
  final String id;
  final String name;
  final String? description;
  final String? dateStart;
  final String? dateEnd;
  final String? location;
  final double? latitude;
  final double? longitude;
  final String? photoUrl;
  final String? category;

  Event({
    required this.id,
    required this.name,
    this.description,
    this.dateStart,
    this.dateEnd,
    this.location,
    this.latitude,
    this.longitude,
    this.photoUrl,
    this.category,
  });

  factory Event.fromJson(Map<String, dynamic> json) {
    return Event(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'],
      dateStart: json['dateStart'],
      dateEnd: json['dateEnd'],
      location: json['location'],
      latitude: json['latitude'] != null ? double.tryParse(json['latitude'].toString()) : null,
      longitude: json['longitude'] != null ? double.tryParse(json['longitude'].toString()) : null,
      photoUrl: json['photoUrl'],
      category: json['category'],
    );
  }
}

class EventsService {
  final Dio _dio;

  EventsService(this._dio);

  Future<List<Event>> getEvents() async {
    final response = await _dio.get(ApiConstants.events);
    final data = response.data;
    final List items = data['data'] ?? [];
    return items.map((json) => Event.fromJson(json)).toList();
  }

  Future<List<Event>> getTodayEvents() async {
    final response = await _dio.get(ApiConstants.todayEvents);
    final data = response.data;
    final List items = data['data'] ?? [];
    return items.map((json) => Event.fromJson(json)).toList();
  }

  Future<Event> getEventById(String id) async {
    final response = await _dio.get('${ApiConstants.events}/$id');
    final data = response.data;
    return Event.fromJson(data['data'] ?? data);
  }
}