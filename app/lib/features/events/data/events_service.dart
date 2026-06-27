import 'package:dio/dio.dart';
import '../../../../config/api_constants.dart';

class Event {
  final String id;
  final String name;
  final String? description;
  final String? date;
  final String? startTime;
  final String? endTime;
  final String? venue;
  final String? address;
  final Map<String, dynamic>? location;
  final String? category;
  final double? price;
  final List<dynamic>? photos;

  Event({
    required this.id,
    required this.name,
    this.description,
    this.date,
    this.startTime,
    this.endTime,
    this.venue,
    this.address,
    this.location,
    this.category,
    this.price,
    this.photos,
  });

  factory Event.fromJson(Map<String, dynamic> json) {
    return Event(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'],
      date: json['date'],
      startTime: json['start_time'],
      endTime: json['end_time'],
      venue: json['venue'],
      address: json['address'],
      location: json['location'],
      category: json['category'],
      price: json['price']?.toDouble(),
      photos: json['photos'],
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