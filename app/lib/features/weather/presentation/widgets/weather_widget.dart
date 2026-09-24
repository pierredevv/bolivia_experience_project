import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../../config/colors.dart';
import '../providers/weather_provider.dart';

String mapWeatherIcon(String? desc) {
  if (desc == null) return '☀️';
  final d = desc.toLowerCase();
  if (d.contains('nublado') || d.contains('cloud')) return '⛅';
  if (d.contains('lluvia') || d.contains('rain')) return '🌧️';
  if (d.contains('tormenta') || d.contains('storm')) return '⛈️';
  if (d.contains('niebla') || d.contains('fog')) return '🌫️';
  if (d.contains('despejado') || d.contains('clear')) return '☀️';
  return '🌤️';
}

class WeatherWidget extends ConsumerWidget {
  final bool showForecast;
  const WeatherWidget({super.key, this.showForecast = false});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cityId = ref.watch(selectedWeatherCityProvider);
    final weatherAsync = ref.watch(weatherBundleProvider(cityId));

    return weatherAsync.when(
      loading: () => const SizedBox(
        height: 80,
        child: Center(
          child: CircularProgressIndicator(color: AppColors.primary700, strokeWidth: 2),
        ),
      ),
      error: (_, __) => const SizedBox.shrink(),
      data: (bundle) {
        final current = bundle.current;
        final forecast = bundle.forecast;
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Current weather
            GestureDetector(
              onTap: () => context.push('/weather'),
              child: Container(
                margin: const EdgeInsets.symmetric(horizontal: 16),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
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
                        Row(
                          children: [
                            Text('Clima en ${current.city}',
                                style: const TextStyle(color: Colors.white70, fontSize: 12)),
                            const SizedBox(width: 6),
                            const Icon(Icons.chevron_right, color: Colors.white54, size: 16),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text('${current.temperature}°C', style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold)),
                        Text(current.description, style: const TextStyle(color: Colors.white, fontSize: 14)),
                      ],
                    ),
                    Column(
                      children: [
                        Text(mapWeatherIcon(current.description), style: const TextStyle(fontSize: 48)),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(Icons.water_drop, size: 12, color: Colors.white70),
                            const SizedBox(width: 4),
                            Text('${current.humidity}%', style: const TextStyle(color: Colors.white70, fontSize: 12)),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            // 5-day forecast
            if (showForecast && forecast.days.isNotEmpty) ...[
              const SizedBox(height: 12),
              SizedBox(
                height: 90,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: forecast.days.length,
                  itemBuilder: (context, index) {
                    final day = forecast.days[index];
                    final date = DateFormat('EEE', 'es').format(day.date);
                    return Container(
                      width: 70,
                      margin: const EdgeInsets.only(right: 8),
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(date, style: const TextStyle(color: Colors.white70, fontSize: 10)),
                          const SizedBox(height: 4),
                          Text(mapWeatherIcon(day.description), style: const TextStyle(fontSize: 20)),
                          const SizedBox(height: 4),
                          Text('${day.tempMax}°', style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                          Text('${day.tempMin}°', style: const TextStyle(color: Colors.white60, fontSize: 10)),
                        ],
                      ),
                    );
                  },
                ),
              ),
            ],
          ],
        );
      },
    );
  }
}