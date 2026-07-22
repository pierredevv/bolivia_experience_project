import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../../../../config/colors.dart';
import '../../../../config/api_constants.dart';

class WeatherWidget extends StatefulWidget {
  const WeatherWidget({super.key});

  @override
  State<WeatherWidget> createState() => _WeatherWidgetState();
}

class _WeatherWidgetState extends State<WeatherWidget> {
  Map<String, dynamic>? _weather;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadWeather();
  }

  Future<void> _loadWeather() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final dio = Dio();
      final response = await dio.get('${ApiConstants.baseUrl}${ApiConstants.weatherCurrent}');
      final data = response.data;
      final weatherData = data['data'] ?? data;

      // Map weather condition to emoji
      String icon = '☀️';
      final desc = (weatherData['description'] ?? '').toLowerCase();
      if (desc.contains('nublado') || desc.contains('cloud')) icon = '⛅';
      if (desc.contains('lluvia') || desc.contains('rain')) icon = '🌧️';
      if (desc.contains('tormenta') || desc.contains('storm')) icon = '⛈️';
      if (desc.contains('niebla') || desc.contains('fog')) icon = '🌫️';

      setState(() {
        _weather = {
          'temp': weatherData['temperature'] ?? weatherData['temp'] ?? 28,
          'description': weatherData['description'] ?? 'Clima actual',
          'icon': icon,
          'humidity': weatherData['humidity'] ?? 65,
          'wind': weatherData['windSpeed'] ?? weatherData['wind'] ?? 12,
        };
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Error al cargar clima';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const SizedBox(
        height: 80,
        child: Center(
          child: CircularProgressIndicator(
            color: AppColors.primary700,
            strokeWidth: 2,
          ),
        ),
      );
    }

    if (_error != null || _weather == null) {
      return const SizedBox.shrink();
    }

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.primary700,
            AppColors.primary500,
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Clima en Santa Cruz',
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 12,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                '${_weather!['temp']}°C',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                _weather!['description'],
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                ),
              ),
            ],
          ),
          Column(
            children: [
              Text(
                _weather!['icon'],
                style: const TextStyle(fontSize: 48),
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  Icon(Icons.water_drop, size: 12, color: Colors.white70),
                  const SizedBox(width: 4),
                  Text(
                    '${_weather!['humidity']}%',
                    style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}
