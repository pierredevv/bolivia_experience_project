import 'dart:convert';
import 'package:hive/hive.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

class CacheService {
  static const String _placesBox = 'places_cache';
  static const String _homeBox = 'home_cache';
  static const String _searchBox = 'search_cache';
  static const Duration _defaultTtl = Duration(hours: 1);
  static const Duration _homeTtl = Duration(minutes: 30);
  static const Duration _searchTtl = Duration(minutes: 15);

  static Future<void> initialize() async {
    await Hive.openBox(_placesBox);
    await Hive.openBox(_homeBox);
    await Hive.openBox(_searchBox);
  }

  static Future<bool> isOnline() async {
    final connectivity = await Connectivity().checkConnectivity();
    return connectivity != ConnectivityResult.none;
  }

  // Generic cache methods
  static Future<void> cacheData(String key, dynamic data, {
    Duration? ttl,
    String boxName = _placesBox,
  }) async {
    final box = Hive.box(boxName);
    final entry = {
      'data': data,
      'timestamp': DateTime.now().millisecondsSinceEpoch,
      'ttl': (ttl ?? _defaultTtl).inMilliseconds,
    };
    await box.put(key, jsonEncode(entry));
  }

  static Future<T?> getCachedData<T>(String key, {
    String boxName = _placesBox,
  }) async {
    final box = Hive.box(boxName);
    final raw = box.get(key);
    if (raw == null) return null;

    try {
      final entry = jsonDecode(raw as String) as Map<String, dynamic>;
      final timestamp = entry['timestamp'] as int;
      final ttl = entry['ttl'] as int;

      if (DateTime.now().millisecondsSinceEpoch - timestamp > ttl) {
        await box.delete(key);
        return null;
      }

      return entry['data'] as T;
    } catch (e) {
      await box.delete(key);
      return null;
    }
  }

  // Place-specific cache
  static Future<void> cachePlace(String placeId, Map<String, dynamic> place) async {
    await cacheData('place_$placeId', place, ttl: _defaultTtl);
  }

  static Future<Map<String, dynamic>?> getCachedPlace(String placeId) async {
    return getCachedData<Map<String, dynamic>>('place_$placeId');
  }

  static Future<void> cachePlacesList(String query, List<dynamic> places) async {
    await cacheData('places_$query', places, ttl: _defaultTtl);
  }

  static Future<List<dynamic>?> getCachedPlacesList(String query) async {
    return getCachedData<List<dynamic>>('places_$query');
  }

  // Home cache
  static Future<void> cacheHomeData(Map<String, dynamic> data) async {
    await cacheData('home', data, ttl: _homeTtl, boxName: _homeBox);
  }

  static Future<Map<String, dynamic>?> getCachedHomeData() async {
    return getCachedData<Map<String, dynamic>>('home', boxName: _homeBox);
  }

  // Search cache
  static Future<void> cacheSearchResults(String query, List<dynamic> results) async {
    await cacheData('search_$query', results, ttl: _searchTtl, boxName: _searchBox);
  }

  static Future<List<dynamic>?> getCachedSearchResults(String query) async {
    return getCachedData<List<dynamic>>('search_$query', boxName: _searchBox);
  }

  // Clear methods
  static Future<void> clearAll() async {
    await Hive.box(_placesBox).clear();
    await Hive.box(_homeBox).clear();
    await Hive.box(_searchBox).clear();
  }

  static Future<void> clearExpired() async {
    for (final boxName in [_placesBox, _homeBox, _searchBox]) {
      final box = Hive.box(boxName);
      final keysToDelete = <dynamic>[];

      for (final key in box.keys) {
        final raw = box.get(key);
        if (raw == null) continue;

        try {
          final entry = jsonDecode(raw as String) as Map<String, dynamic>;
          final timestamp = entry['timestamp'] as int;
          final ttl = entry['ttl'] as int;

          if (DateTime.now().millisecondsSinceEpoch - timestamp > ttl) {
            keysToDelete.add(key);
          }
        } catch (e) {
          keysToDelete.add(key);
        }
      }

      for (final key in keysToDelete) {
        await box.delete(key);
      }
    }
  }

  // Sync pending operations (for future offline queue)
  static Future<void> queueOfflineOperation(String type, Map<String, dynamic> data) async {
    final box = Hive.box('offline_queue');
    final operations = box.get('operations', defaultValue: []) as List;
    operations.add({
      'type': type,
      'data': data,
      'timestamp': DateTime.now().millisecondsSinceEpoch,
    });
    await box.put('operations', operations);
  }

  static Future<List<Map<String, dynamic>>> getPendingOperations() async {
    final box = Hive.box('offline_queue');
    final operations = box.get('operations', defaultValue: []) as List;
    return operations.cast<Map<String, dynamic>>();
  }

  static Future<void> clearPendingOperations() async {
    final box = Hive.box('offline_queue');
    await box.put('operations', []);
  }
}
