import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/dio_provider.dart';
import '../../data/home_service.dart';
import '../../data/home_experience.dart';

enum HomeStatus { initial, loading, loaded, error }

class HomeState {
  final HomeStatus status;
  final List<dynamic> featuredPlaces;
  final List<dynamic> categories;
  final List<dynamic> todayEvents;
  final List<dynamic> promotions;
  final List<dynamic> hotels;
  final List<dynamic> thingsToDo;
  final List<HomeExperience> experiences;
  final List<dynamic> restaurants;
  final String? errorMessage;

  const HomeState({
    this.status = HomeStatus.initial,
    this.featuredPlaces = const [],
    this.categories = const [],
    this.todayEvents = const [],
    this.promotions = const [],
    this.hotels = const [],
    this.thingsToDo = const [],
    this.experiences = const [],
    this.restaurants = const [],
    this.errorMessage,
  });

  HomeState copyWith({
    HomeStatus? status,
    List<dynamic>? featuredPlaces,
    List<dynamic>? categories,
    List<dynamic>? todayEvents,
    List<dynamic>? promotions,
    List<dynamic>? hotels,
    List<dynamic>? thingsToDo,
    List<HomeExperience>? experiences,
    List<dynamic>? restaurants,
    String? errorMessage,
  }) {
    return HomeState(
      status: status ?? this.status,
      featuredPlaces: featuredPlaces ?? this.featuredPlaces,
      categories: categories ?? this.categories,
      todayEvents: todayEvents ?? this.todayEvents,
      promotions: promotions ?? this.promotions,
      hotels: hotels ?? this.hotels,
      thingsToDo: thingsToDo ?? this.thingsToDo,
      experiences: experiences ?? this.experiences,
      restaurants: restaurants ?? this.restaurants,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}

final homeServiceProvider = Provider<HomeService>((ref) {
  final dio = ref.read(dioProvider);
  return HomeService(dio);
});

final homeProvider = StateNotifierProvider.autoDispose<HomeNotifier, HomeState>((ref) {
  return HomeNotifier(ref.read(homeServiceProvider));
});

class HomeNotifier extends StateNotifier<HomeState> {
  final HomeService _homeService;

  HomeNotifier(this._homeService) : super(const HomeState()) {
    loadHomeData();
  }

  Future<void> loadHomeData() async {
    state = state.copyWith(status: HomeStatus.loading, errorMessage: null);
    try {
      // Load each section individually so one failure doesn't break everything
      List<dynamic> featured = [];
      List<dynamic> cats = [];
      List<dynamic> events = [];
      List<dynamic> promos = [];
      List<dynamic> hotels = [];
      List<dynamic> thingsToDo = [];
      List<HomeExperience> experiences = [];
      List<dynamic> restaurants = [];

      try {
        featured = await _homeService.getFeaturedPlaces();
      } catch (e) {
        // Featured places failed, continue with empty list
      }

      try {
        cats = await _homeService.getCategories();
      } catch (e) {
        // Categories failed, continue with empty list
      }

      try {
        events = await _homeService.getTodayEvents();
      } catch (e) {
        // Events failed, continue with empty list
      }

      try {
        promos = await _homeService.getPromotions();
      } catch (e) {
        // Promotions failed, continue with empty list
      }

      try {
        hotels = await _homeService.getHotels();
      } catch (e) {
        // Hotels failed, continue with empty list
      }

      try {
        thingsToDo = await _homeService.getThingsToDo();
      } catch (e) {
        // Things to do failed, continue with empty list
      }

      try {
        experiences = await _homeService.getHomeExperiences();
      } catch (e) {
        // Experiences failed, continue with empty list
      }

      try {
        restaurants = await _homeService.getRestaurants();
      } catch (e) {
        // Restaurants failed, continue with empty list
      }

      state = state.copyWith(
        status: HomeStatus.loaded,
        featuredPlaces: featured,
        categories: cats,
        todayEvents: events,
        promotions: promos,
        hotels: hotels,
        thingsToDo: thingsToDo,
        experiences: experiences,
        restaurants: restaurants,
      );
    } catch (e) {
      state = state.copyWith(
        status: HomeStatus.error,
        errorMessage: 'Error inesperado. Intentá de nuevo.',
      );
    }
  }
}