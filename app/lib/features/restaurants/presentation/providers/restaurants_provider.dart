import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/dio_provider.dart';
import '../../../../core/services/location_service.dart';
import '../../../hotels/data/hotel_distance.dart';
import '../../data/restaurant.dart';
import '../../data/restaurant_catalogs.dart';
import '../../data/restaurant_filters.dart';
import '../../data/restaurants_filter_engine.dart';
import '../../data/restaurants_service.dart';

final restaurantsServiceProvider = Provider<RestaurantsService>((ref) {
  return RestaurantsService(ref.read(dioProvider));
});

enum RestaurantsStatus { initial, loading, loaded, error }

class RestaurantsState {
  final RestaurantsStatus status;
  final List<Restaurant> allRestaurants;
  final List<String> restaurantIds;
  final RestaurantReference? referencePlace;
  final List<Map<String, dynamic>> cocinaCategories;
  final RestaurantFilters filters;
  final String? errorMessage;
  final bool hasUserLocation;

  RestaurantsState({
    this.status = RestaurantsStatus.initial,
    this.allRestaurants = const [],
    this.restaurantIds = const [],
    this.referencePlace,
    this.cocinaCategories = const [],
    RestaurantFilters? filters,
    this.errorMessage,
    this.hasUserLocation = false,
  }) : filters = filters ?? RestaurantFilters.defaults();

  RestaurantsState copyWith({
    RestaurantsStatus? status,
    List<Restaurant>? allRestaurants,
    List<String>? restaurantIds,
    RestaurantReference? referencePlace,
    List<Map<String, dynamic>>? cocinaCategories,
    RestaurantFilters? filters,
    String? errorMessage,
    bool? hasUserLocation,
  }) {
    return RestaurantsState(
      status: status ?? this.status,
      allRestaurants: allRestaurants ?? this.allRestaurants,
      restaurantIds: restaurantIds ?? this.restaurantIds,
      referencePlace: referencePlace ?? this.referencePlace,
      cocinaCategories: cocinaCategories ?? this.cocinaCategories,
      filters: filters ?? this.filters,
      errorMessage: errorMessage ?? this.errorMessage,
      hasUserLocation: hasUserLocation ?? this.hasUserLocation,
    );
  }
}

final restaurantsProvider =
    StateNotifierProvider<RestaurantsNotifier, RestaurantsState>((ref) {
  return RestaurantsNotifier(ref.read(restaurantsServiceProvider));
});

class RestaurantsNotifier extends StateNotifier<RestaurantsState> {
  final RestaurantsService _service;

  RestaurantsNotifier(this._service) : super(RestaurantsState());

  bool _loading = false;

  Future<void> load() async {
    if (_loading) return;
    _loading = true;
    if (!mounted) return;
    state = state.copyWith(status: RestaurantsStatus.loading, errorMessage: null);
    try {
      final result = await _service.getRestaurants();
      if (!mounted) return;

      final reference = result.referencePlace ?? state.referencePlace;
      final restaurants = _attachDistances(result.restaurants, reference);

      final filters = state.filters.copyWith(referencePlace: reference);
      state = state.copyWith(
        status: RestaurantsStatus.loaded,
        allRestaurants: restaurants,
        referencePlace: reference,
        cocinaCategories: result.cocinaCategories,
        filters: filters,
        errorMessage: null,
      );
      state = state.copyWith(restaurantIds: _applyFilters(state));

      _applyUserDistances(restaurants);
    } catch (e) {
      if (!mounted) return;
      state = state.copyWith(
        status: RestaurantsStatus.error,
        errorMessage: 'No se pudieron cargar los restaurantes.',
      );
    } finally {
      _loading = false;
    }
  }

  Future<void> _applyUserDistances(List<Restaurant> restaurants) async {
    try {
      final position = await LocationService.getCurrentLocation();
      if (!mounted || position == null) return;
      state = state.copyWith(hasUserLocation: true);
    } catch (_) {
      // Sin permiso de ubicación: solo se muestra la distancia a la Plaza.
    }
  }

  List<Restaurant> _attachDistances(
    List<Restaurant> restaurants,
    RestaurantReference? reference,
  ) {
    final withDistance = List<Restaurant>.from(restaurants);
    for (final r in withDistance) {
      r.distanceFromReferenceKm = null;
      final refLat = reference?.latitude;
      final refLng = reference?.longitude;
      if (r.latitude != null &&
          r.longitude != null &&
          refLat != null &&
          refLng != null) {
        r.distanceFromReferenceKm = HotelDistance.calculateDistanceKm(
          lat1: r.latitude!,
          lon1: r.longitude!,
          lat2: refLat,
          lon2: refLng,
        );
      }
    }
    return withDistance;
  }

  List<String> _applyFilters(RestaurantsState s) {
    return RestaurantsFilterEngine.apply(s.filters, s.allRestaurants);
  }

  void setFilters(RestaurantFilters filters) {
    state = state.copyWith(filters: filters);
    state = state.copyWith(restaurantIds: _applyFilters(state));
  }

  void setDateTime(String time, DateTime date) {
    final f = state.filters.copyWith(time: time, date: date);
    setFilters(f);
  }

  void setPersons(int persons) {
    final f = state.filters.copyWith(persons: persons);
    setFilters(f);
  }

  void setSort(RestaurantSort sort) {
    final f = state.filters.copyWith(sort: sort);
    setFilters(f);
  }

  void toggleCocina(String slug) {
    final current = state.filters.cocinaSlugs;
    final next = Set<String>.from(current);
    if (!next.add(slug)) next.remove(slug);
    final f = state.filters.copyWith(cocinaSlugs: next);
    setFilters(f);
  }

  void clearCocina() {
    final f = state.filters.copyWith(clearCocina: true);
    setFilters(f);
  }

  void togglePriceLevel(int level) {
    final current = state.filters.priceLevels;
    final next = Set<int>.from(current);
    if (!next.add(level)) next.remove(level);
    final f = state.filters.copyWith(priceLevels: next);
    setFilters(f);
  }

  void clearPriceLevels() {
    final f = state.filters.copyWith(clearPriceLevels: true);
    setFilters(f);
  }

  void toggleCashbackOnly() {
    final f = state.filters
        .copyWith(cashbackOnly: !state.filters.cashbackOnly);
    setFilters(f);
  }

  void toggleComodidad(String id) {
    final current = state.filters.comodidades;
    final next = Set<String>.from(current);
    if (!next.add(id)) next.remove(id);
    final f = state.filters.copyWith(comodidades: next);
    setFilters(f);
  }

  void clearComodidades() {
    final f = state.filters.copyWith(clearComodidades: true);
    setFilters(f);
  }

  void setDistanceFilter(RestaurantReference? place, double? maxKm) {
    final f = state.filters.copyWith(distancePlace: place, maxDistanceKm: maxKm);
    setFilters(f);
  }

  void setUseMiles(bool useMiles) {
    final f = state.filters.copyWith(useMiles: useMiles);
    setFilters(f);
  }

  void clearDistanceFilter() {
    final f = state.filters.copyWith(clearDistance: true);
    setFilters(f);
  }
}
