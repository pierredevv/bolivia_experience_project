import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:intl/intl.dart';
import '../../../../config/colors.dart';
import '../../../../config/api_constants.dart';

class WeatherWidget extends StatefulWidget {
  final bool showForecast;
  const WeatherWidget({super.key, this.showForecast = false});

  @override
  State<WeatherWidget> createState() => _WeatherWidgetState();
}

class _WeatherWidgetState extends State<WeatherWidget> {
  Map<String, dynamic>? _weather;
  List<Map<String, dynamic>> _forecast = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadWeather();
  }

  String _mapIcon(String? desc) {
    if (desc == null) return '☀️';
    final d = desc.toLowerCase();
    if (d.contains('nublado') || d.contains('cloud')) return '⛅';
    if (d.contains('lluvia') || d.contains('rain')) return '🌧️';
    if (d.contains('tormenta') || d.contains('storm')) return '⛈️';
    if (d.contains('niebla') || d.contains('fog')) return '🌫️';
    if (d.contains('despejado') || d.contains('clear')) return '☀️';
    return '🌤️';
  }

  Future<void> _loadWeather() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final dio = Dio();

      // Load current weather
      final currentRes = await dio.get('${ApiConstants.baseUrl}${ApiConstants.weatherCurrent}');
      final currentData = currentRes.data['data'] ?? currentRes.data;

      setState(() {
        _weather = {
          'temp': currentData['temperature'] ?? currentData['temp'] ?? 28,
          'description': currentData['description'] ?? 'Clima actual',
          'icon': _mapIcon(currentData['description']),
          'humidity': currentData['humidity'] ?? 65,
          'wind': currentData['windSpeed'] ?? currentData['wind'] ?? 12,
        };
      });

      // Load forecast if requested
      if (widget.showForecast) {
        try {
          final forecastRes = await dio.get('${ApiConstants.baseUrl}${ApiConstants.weatherForecast}');
          final forecastData = forecastRes.data['data'] ?? forecastRes.data;
          final forecastList = forecastData['forecast'] ?? [];

          setState(() {
            _forecast = (forecastList as List).take(5).map<Map<String, dynamic>>((f) => {
              'date': f['date'] ?? '',
              'temp': f['temperature'] ?? f['temp'] ?? 28,
              'tempMin': f['tempMin'] ?? 25,
              'tempMax': f['tempMax'] ?? 32,
              'description': f['description'] ?? '',
              'icon': _mapIcon(f['description']),
            }).toList();
          });
        } catch (_) {}
      }

      setState(() => _isLoading = false);
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
          child: CircularProgressIndicator(color: AppColors.primary700, strokeWidth: 2),
        ),
      );
    }

    if (_error != null || _weather == null) {
      return const SizedBox.shrink();
    }

    return Column(
      children: [
        // Current weather
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 16),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [AppColors.primary700, AppColors.primary500],
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
                  const Text('Clima en Santa Cruz', style: TextStyle(color: Colors.white70, fontSize: 12)),
                  const SizedBox(height: 4),
                  Text('${_weather!['temp']}°C', style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold)),
                  Text(_weather!['description'], style: const TextStyle(color: Colors.white, fontSize: 14)),
                ],
              ),
              Column(
                children: [
                  Text(_weather!['icon'], style: const TextStyle(fontSize: 48)),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.water_drop, size: 12, color: Colors.white70),
                      const SizedBox(width: 4),
                      Text('${_weather!['humidity']}%', style: const TextStyle(color: Colors.white70, fontSize: 12)),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),

        // 5-day forecast
        if (widget.showForecast && _forecast.isNotEmpty) ...[
          const SizedBox(height: 12),
          SizedBox(
            height: 90,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _forecast.length,
              itemBuilder: (context, index) {
                final day = _forecast[index];
                final date = day['date'].isNotEmpty
                    ? DateFormat('EEE', 'es').format(DateTime.parse(day['date']))
                    : '';
                return Container(
                  width: 70,
                  margin: const EdgeInsets.only(right: 8),
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(date, style: const TextStyle(color: Colors.white70, fontSize: 10)),
                      const SizedBox(height: 4),
                      Text(day['icon'], style: const TextStyle(fontSize: 20)),
                      const SizedBox(height: 4),
                      Text('${day['tempMax']}°', style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                      Text('${day['tempMin']}°', style: const TextStyle(color: Colors.white60, fontSize: 10)),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ],
    );
  }
}
