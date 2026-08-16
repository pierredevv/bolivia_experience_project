import 'package:dio/dio.dart';
import '../../../config/api_constants.dart';

class TripsService {
  final Dio _dio;
  TripsService(this._dio);

  Future<List<dynamic>> getTrips() async {
    final response = await _dio.get(ApiConstants.trips);
    final data = response.data;
    return data is List ? data : data['data'] ?? [];
  }

  Future<Map<String, dynamic>> getTripById(String id) async {
    final response = await _dio.get('${ApiConstants.trips}/$id');
    final data = response.data;
    return data is Map<String, dynamic> ? data['data'] : data;
  }

  Future<Map<String, dynamic>> createTrip({
    required String name,
    required String startDate,
    required String endDate,
    String? description,
    String? destination,
    String? budgetType,
    double? budgetMin,
    double? budgetMax,
    bool isPublic = false,
  }) async {
    final response = await _dio.post(
      ApiConstants.trips,
      data: {
        'name': name,
        'startDate': startDate,
        'endDate': endDate,
        if (description != null) 'description': description,
        if (destination != null) 'destination': destination,
        if (budgetType != null) 'budgetType': budgetType,
        if (budgetMin != null) 'budgetMin': budgetMin,
        if (budgetMax != null) 'budgetMax': budgetMax,
        'isPublic': isPublic,
      },
    );
    final data = response.data;
    return data is Map<String, dynamic> ? data['data'] : data;
  }

  Future<Map<String, dynamic>> addDay(
    String tripId, {
    required int dayNumber,
    required String date,
    String? description,
  }) async {
    final response = await _dio.post(
      '${ApiConstants.trips}/$tripId/days',
      data: {
        'dayNumber': dayNumber,
        'date': date,
        if (description != null) 'description': description,
      },
    );
    final data = response.data;
    return data is Map<String, dynamic> ? data['data'] : data;
  }

  Future<Map<String, dynamic>> generateItinerary(String tripId) async {
    final response = await _dio.post('${ApiConstants.trips}/$tripId/generate');
    final data = response.data;
    return data is Map<String, dynamic> ? data['data'] : data;
  }

  Future<Map<String, dynamic>> addItem(
    String dayId, {
    required String title,
    String? placeId,
    String? description,
    String? timeSlot,
    int? orderIndex,
  }) async {
    final response = await _dio.post(
      '${ApiConstants.trips}/$dayId/items',
      data: {
        'title': title,
        if (placeId != null) 'placeId': placeId,
        if (description != null) 'description': description,
        if (timeSlot != null) 'timeSlot': timeSlot,
        if (orderIndex != null) 'orderIndex': orderIndex,
      },
    );
    final data = response.data;
    return data is Map<String, dynamic> ? data['data'] : data;
  }

  Future<void> removeItem(String tripId, String itemId) async {
    await _dio.delete('${ApiConstants.trips}/$tripId/items/$itemId');
  }

  Future<void> removeDay(String tripId, String dayId) async {
    await _dio.delete('${ApiConstants.trips}/$tripId/days/$dayId');
  }

  Future<void> deleteTrip(String id) async {
    await _dio.delete('${ApiConstants.trips}/$id');
  }
}
