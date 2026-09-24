import 'package:dio/dio.dart';
import '../../../../config/api_constants.dart';

class WeatherCity {
  final String id;
  final String name;
  final double latitude;
  final double longitude;

  const WeatherCity({
    required this.id,
    required this.name,
    required this.latitude,
    required this.longitude,
  });

  factory WeatherCity.fromJson(Map<String, dynamic> json) {
    return WeatherCity(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      latitude: double.tryParse(json['latitude']?.toString() ?? '') ?? 0,
      longitude: double.tryParse(json['longitude']?.toString() ?? '') ?? 0,
    );
  }
}

class WeatherCurrent {
  final int temperature;
  final int feelsLike;
  final int humidity;
  final String description;
  final String? icon;
  final double windSpeed;
  final String city;

  const WeatherCurrent({
    required this.temperature,
    required this.feelsLike,
    required this.humidity,
    required this.description,
    this.icon,
    required this.windSpeed,
    required this.city,
  });

  factory WeatherCurrent.fromJson(Map<String, dynamic> json) {
    return WeatherCurrent(
      temperature: json['temperature'] is num
          ? (json['temperature'] as num).round()
          : int.tryParse(json['temperature']?.toString() ?? '') ?? 0,
      feelsLike: json['feelsLike'] is num
          ? (json['feelsLike'] as num).round()
          : int.tryParse(json['feelsLike']?.toString() ?? '') ?? 0,
      humidity: json['humidity'] is num
          ? (json['humidity'] as num).round()
          : int.tryParse(json['humidity']?.toString() ?? '') ?? 0,
      description: json['description'] ?? '',
      icon: json['icon'],
      windSpeed: double.tryParse(json['windSpeed']?.toString() ?? '') ?? 0,
      city: json['city'] ?? '',
    );
  }
}

class WeatherForecastDay {
  final DateTime date;
  final int temperature;
  final int tempMin;
  final int tempMax;
  final String description;
  final String? icon;
  final int humidity;

  const WeatherForecastDay({
    required this.date,
    required this.temperature,
    required this.tempMin,
    required this.tempMax,
    required this.description,
    this.icon,
    required this.humidity,
  });

  factory WeatherForecastDay.fromJson(Map<String, dynamic> json) {
    return WeatherForecastDay(
      date: DateTime.tryParse(json['date'] ?? '') ?? DateTime.now(),
      temperature: json['temperature'] is num
          ? (json['temperature'] as num).round()
          : int.tryParse(json['temperature']?.toString() ?? '') ?? 0,
      tempMin: json['tempMin'] is num
          ? (json['tempMin'] as num).round()
          : int.tryParse(json['tempMin']?.toString() ?? '') ?? 0,
      tempMax: json['tempMax'] is num
          ? (json['tempMax'] as num).round()
          : int.tryParse(json['tempMax']?.toString() ?? '') ?? 0,
      description: json['description'] ?? '',
      icon: json['icon'],
      humidity: json['humidity'] is num
          ? (json['humidity'] as num).round()
          : int.tryParse(json['humidity']?.toString() ?? '') ?? 0,
    );
  }
}

class WeatherForecast {
  final String city;
  final List<WeatherForecastDay> days;

  const WeatherForecast({required this.city, required this.days});

  factory WeatherForecast.fromJson(Map<String, dynamic> json) {
    final list = (json['forecast'] as List?)?.whereType<Map<String, dynamic>>() ?? [];
    return WeatherForecast(
      city: json['city'] ?? '',
      days: list.map(WeatherForecastDay.fromJson).toList(),
    );
  }
}

class WeatherService {
  final Dio _dio;

  WeatherService(this._dio);

  Future<List<WeatherCity>> getCities() async {
    final response = await _dio.get(ApiConstants.weatherCities);
    final data = response.data['data'] ?? response.data;
    return (data as List)
        .whereType<Map<String, dynamic>>()
        .map(WeatherCity.fromJson)
        .toList();
  }

  Future<WeatherCurrent> getCurrent({String? cityId}) async {
    final response = await _dio.get(
      ApiConstants.weatherCurrent,
      queryParameters: cityId != null && cityId.isNotEmpty ? {'city': cityId} : null,
    );
    final data = response.data['data'] ?? response.data;
    final current = data is Map<String, dynamic> ? data : (data['current'] ?? const {});
    return WeatherCurrent.fromJson(current);
  }

  Future<WeatherForecast> getForecast({String? cityId}) async {
    final response = await _dio.get(
      ApiConstants.weatherForecast,
      queryParameters: cityId != null && cityId.isNotEmpty ? {'city': cityId} : null,
    );
    final data = response.data['data'] ?? response.data;
    return WeatherForecast.fromJson(data is Map<String, dynamic> ? data : const {});
  }
}