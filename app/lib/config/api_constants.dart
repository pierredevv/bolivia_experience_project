import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;

class ApiConstants {
  static String get baseUrl {
    const customUrl = String.fromEnvironment('API_BASE_URL');
    if (customUrl.isNotEmpty) {
      return customUrl;
    }
    if (kIsWeb) {
      return 'http://localhost:3000/api/v1';
    }
    if (Platform.isAndroid) {
      return 'http://192.168.1.4:3000/api/v1';
    }
    return 'http://localhost:3000/api/v1';
  }

  // Auth
  static const register = '/auth/register';
  static const login = '/auth/login';
  static const googleAuth = '/auth/google';
  static const refreshToken = '/auth/refresh';

  // Users
  static const userProfile = '/users/me';

  // Places
  static const places = '/places';
  static const featuredPlaces = '/places/featured';

  // Categories
  static const categories = '/categories';

  // Reviews
  static String placeReviews(String placeId) => '/places/$placeId/reviews';
  static const reviews = '/reviews';

  // Favorites
  static const favorites = '/favorites';
  static String checkFavorite(String placeId) => '/favorites/check/$placeId';

  // Map
  static const mapNearby = '/map/nearby';
  static const mapCluster = '/map/cluster';
  static const mapBounds = '/map/bounds';

  // Search
  static const search = '/search';
  static const searchSuggestions = '/search/suggestions';
  static const searchHistory = '/search/history';

  // Events
  static const events = '/events';
  static const todayEvents = '/events/today';

  // Promotions
  static const promotions = '/promotions';

  // Weather
  static const weatherCurrent = '/weather/current';
  static const weatherForecast = '/weather/forecast';

  // Trips
  static const trips = '/trips';
}
