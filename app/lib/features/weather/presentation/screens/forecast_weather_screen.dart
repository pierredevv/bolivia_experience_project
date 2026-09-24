import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../config/colors.dart';
import '../../../../core/services/location_service.dart';
import '../../data/weather_service.dart';
import '../providers/weather_provider.dart';
import '../widgets/weather_widget.dart';

class ForecastWeatherScreen extends ConsumerStatefulWidget {
  const ForecastWeatherScreen({super.key});

  @override
  ConsumerState<ForecastWeatherScreen> createState() => _ForecastWeatherScreenState();
}

class _ForecastWeatherScreenState extends ConsumerState<ForecastWeatherScreen> {
  bool _locating = false;

  Future<void> _useMyLocation() async {
    setState(() => _locating = true);
    try {
      final position = await LocationService.getCurrentLocation();
      if (position == null) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('No se pudo obtener tu ubicación')),
          );
        }
        return;
      }

      final cities = await ref.read(weatherCitiesProvider.future);
      WeatherCity? nearest;
      double bestDistance = double.infinity;
      for (final city in cities) {
        final dist = LocationService.calculateDistance(
          position.latitude,
          position.longitude,
          city.latitude,
          city.longitude,
        );
        if (dist < bestDistance) {
          bestDistance = dist;
          nearest = city;
        }
      }
      if (nearest != null) {
        await ref.read(selectedWeatherCityProvider.notifier).select(nearest.id);
      }
    } catch (_) {
      // ignore location failures
    } finally {
      if (mounted) setState(() => _locating = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cityId = ref.watch(selectedWeatherCityProvider);
    final citiesAsync = ref.watch(weatherCitiesProvider);
    final weatherAsync = ref.watch(weatherBundleProvider(cityId));

    return Scaffold(
      backgroundColor: AppColors.backgroundCanvas,
      appBar: AppBar(
        backgroundColor: AppColors.brandDark,
        foregroundColor: Colors.white,
        title: const Text('Pronóstico de Clima'),
        elevation: 0,
      ),
      body: Column(
        children: [
          Container(
            color: AppColors.brandDark,
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                citiesAsync.when(
                  loading: () => const LinearProgressIndicator(minHeight: 2),
                  error: (_, __) => const SizedBox(height: 8),
                  data: (cities) => SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        for (final city in cities)
                          Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: ChoiceChip(
                              label: Text(city.name),
                              selected: city.id == cityId,
                              selectedColor: AppColors.brandEmerald,
                              backgroundColor: Colors.white24,
                              labelStyle: TextStyle(
                                color: city.id == cityId ? Colors.white : Colors.white70,
                                fontSize: 13,
                              ),
                              onSelected: (_) => ref
                                  .read(selectedWeatherCityProvider.notifier)
                                  .select(city.id),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    IconButton(
                      onPressed: _locating ? null : _useMyLocation,
                      icon: _locating
                          ? const SizedBox(
                              height: 18,
                              width: 18,
                              child: CircularProgressIndicator(
                                  strokeWidth: 2, color: Colors.white),
                            )
                          : const Icon(Icons.my_location, color: Colors.white),
                      tooltip: 'Usar mi ubicación',
                    ),
                    const Text(
                      'Usar mi ubicación',
                      style: TextStyle(color: Colors.white70, fontSize: 13),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Expanded(
            child: weatherAsync.when(
              loading: () => const Center(
                child: CircularProgressIndicator(color: AppColors.primary700),
              ),
              error: (_, __) => const _WeatherUnavailable(),
              data: (bundle) => ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  _CurrentWeatherCard(bundle: bundle),
                  const SizedBox(height: 20),
                  const Text(
                    'Pronóstico 5 días',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: AppColors.brandDark,
                    ),
                  ),
                  const SizedBox(height: 12),
                  for (final day in bundle.forecast.days)
                    _ForecastDayTile(day: day),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _CurrentWeatherCard extends StatelessWidget {
  final WeatherBundle bundle;
  const _CurrentWeatherCard({required this.bundle});

  @override
  Widget build(BuildContext context) {
    final current = bundle.current;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.primary700, AppColors.primary500],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(current.city,
                  style: const TextStyle(color: Colors.white70, fontSize: 14)),
              const SizedBox(height: 6),
              Text('${current.temperature}°C',
                  style: const TextStyle(color: Colors.white, fontSize: 44, fontWeight: FontWeight.bold)),
              Text(current.description,
                  style: const TextStyle(color: Colors.white, fontSize: 15)),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.water_drop, size: 14, color: Colors.white70),
                  const SizedBox(width: 4),
                  Text('${current.humidity}%', style: const TextStyle(color: Colors.white70, fontSize: 13)),
                  const SizedBox(width: 16),
                  const Icon(Icons.air, size: 14, color: Colors.white70),
                  const SizedBox(width: 4),
                  Text('${current.windSpeed} km/h', style: const TextStyle(color: Colors.white70, fontSize: 13)),
                ],
              ),
            ],
          ),
          Column(
            children: [
              Text(mapWeatherIcon(current.description),
                  style: const TextStyle(fontSize: 64)),
              const SizedBox(height: 4),
              Text('Sensación ${current.feelsLike}°C',
                  style: const TextStyle(color: Colors.white70, fontSize: 12)),
            ],
          ),
        ],
      ),
    );
  }
}

class _ForecastDayTile extends StatelessWidget {
  final WeatherForecastDay day;
  const _ForecastDayTile({required this.day});

  @override
  Widget build(BuildContext context) {
    final label = DateFormat('EEE d MMM', 'es').format(day.date);
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Row(
        children: [
          Text(mapWeatherIcon(day.description), style: const TextStyle(fontSize: 28)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppColors.brandDark)),
                Text(day.description,
                    style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
              ],
            ),
          ),
          const SizedBox(width: 8),
Text(
             '${day.tempMin}°',
             style: const TextStyle(fontSize: 15, color: AppColors.neutral500),
           ),
           const Text('  /  ', style: TextStyle(color: AppColors.neutral300)),
          Text('${day.tempMax}°',
              style: const TextStyle(
                  fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.brandDark)),
        ],
      ),
    );
  }
}

class _WeatherUnavailable extends StatelessWidget {
  const _WeatherUnavailable();

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.cloud_off, size: 48, color: AppColors.neutral400),
          SizedBox(height: 12),
          Text(
            'Servicio de clima no disponible',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.neutral600),
          ),
          SizedBox(height: 4),
          Text(
            'Intentá de nuevo más tarde.',
            style: TextStyle(fontSize: 13, color: AppColors.neutral500),
          ),
        ],
      ),
    );
  }
}