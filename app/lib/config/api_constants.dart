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
      return 'http://192.168.1.10:3000/api/v1';
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
  static String placesByCategorySlug(String slug) => '/places?categorySlug=$slug';
  static const placesNotHotel = '/places?notCategorySlug=hoteles';
  static const placesFeed = '/places/feed';
  static String placesFeedByCategory(String slug) =>
      '/places/feed?categorySlug=$slug';

  // Hotels
  static const hotels = '/hotels';
  static const hotelsCatalog = '/hotels/catalog';

  // Tours / Things to do
  static const tours = '/tours';
  static const toursRecommended = '/tours/recommended';

  // Products / Experiences
  static const products = '/products';
  static const homeExperiences = '/experiences/home';
  static const essentialExperiences = '/experiences/essential';
  static String productById(String id) => '/products/$id';
  static String experienceById(String id) => '/experiences/$id';
  static String productReviews(String id) => '/products/$id/reviews';

  // Restaurants
  static const restaurants = '/restaurants';

  // Categories
  static const categories = '/categories';

  // Reviews
  static String placeReviews(String placeId) => '/places/$placeId/reviews';
  static const reviews = '/reviews';
  static const userReviews = '/users/me/reviews';
  static const userReviewsStats = '/users/me/reviews/stats';

  // Favorites
  static const favorites = '/favorites';
  static String checkFavorite(String placeId) => '/favorites/check/$placeId';

  // Map
  static const mapNearby = '/map/nearby';
  static const mapCluster = '/map/cluster';
  static const mapBounds = '/map/bounds';
  static const mapSafetyZones = '/map/safety-zones';
  static const mapEvents = '/map/events';
  static const mapSafetyCheck = '/map/safety-zones/check';

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

  // Notifications
  static const notifications = '/notifications';
  static const notificationsReadAll = '/notifications/read-all';
  static const notificationsRegisterToken = '/notifications/register-token';
  static String notificationById(String id) => '/notifications/$id/read';

  // Reservations
  static const reservations = '/reservations';
  static const myReservations = '/reservations/my';
  static String reservationById(String id) => '/reservations/$id';
  static String cancelReservation(String id) => '/reservations/$id/cancel';

  // Payments
  static const payments = '/payments';
  static const paymentHistory = '/payments/my/history';
  static String paymentById(String id) => '/payments/$id';
  static String confirmPayment(String id) => '/payments/$id/confirm';

  // Stripe (Fase B)
  // Clave pública (no secreta) de Stripe. Default = clave de prueba del entorno
  // (pública por definición). Se puede sobreescribir en build con:
  //   --dart-define=STRIPE_PUBLISHABLE_KEY=pk_test_...
  static const stripePublishableKey = String.fromEnvironment(
    'STRIPE_PUBLISHABLE_KEY',
    defaultValue:
        'pk_test_51U4lvsGcoyR410ye0gte8iOir4V22I9PZ3ryzafkZMB2epx7rxAYEZwRXXFtNjUdTsll4XRXbPBFA6z5qyHdXspe00jhJhOja5',
  );

  // Traveler Photos
  static const travelerPhotos = '/traveler-photos';

  // Recommendations
  static String recommendationsPersonalized({int limit = 10}) =>
      '/recommendations/personalized?limit=$limit';
  static const recommendationsTrending = '/recommendations/trending';

  // Gamification
  static const gamificationMe = '/gamification/me';
  static const gamificationBadges = '/gamification/badges';
}
