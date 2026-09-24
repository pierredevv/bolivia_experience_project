import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../../core/network/dio_provider.dart';
import '../../data/weather_service.dart';

const _selectedCityKey = 'selected_weather_city';

final weatherServiceProvider = Provider<WeatherService>((ref) {
  return WeatherService(ref.read(dioProvider));
});

final weatherCitiesProvider = FutureProvider<List<WeatherCity>>((ref) async {
  final service = ref.read(weatherServiceProvider);
  return service.getCities();
});

class SelectedWeatherCityNotifier extends StateNotifier<String> {
  SelectedWeatherCityNotifier() : super('') {
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    state = prefs.getString(_selectedCityKey) ?? '';
  }

  Future<void> select(String cityId) async {
    state = cityId;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_selectedCityKey, cityId);
  }
}

final selectedWeatherCityProvider =
    StateNotifierProvider<SelectedWeatherCityNotifier, String>((ref) {
  return SelectedWeatherCityNotifier();
});

class WeatherBundle {
  final WeatherCurrent current;
  final WeatherForecast forecast;

  const WeatherBundle({required this.current, required this.forecast});
}

final weatherBundleProvider =
    FutureProvider.family<WeatherBundle, String>((ref, cityId) async {
  final service = ref.read(weatherServiceProvider);
  final current = await service.getCurrent(cityId: cityId);
  final forecast = await service.getForecast(cityId: cityId);
  return WeatherBundle(current: current, forecast: forecast);
});