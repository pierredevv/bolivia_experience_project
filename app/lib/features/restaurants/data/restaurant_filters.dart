import 'restaurant.dart';
import 'restaurant_catalogs.dart';

/// Estado de búsqueda de restaurantes (solicitud del usuario).
class RestaurantFilters {
  final DateTime date;
  final String time;
  final int persons;

  final Set<String> cocinaSlugs;
  final bool cashbackOnly;
  final Set<int> priceLevels;
  final Set<String> comodidades;

  /// Punto de referencia fijo de la vista (Plaza 24 de Septiembre).
  /// Se usa SOLO para el orden "Distancia desde la Plaza".
  final RestaurantReference? referencePlace;

  /// Lugar elegido por el usuario para el filtro "Distancia desde".
  final RestaurantReference? distancePlace;
  final double? maxDistanceKm;
  final bool useMiles;
  final RestaurantSort sort;

  const RestaurantFilters({
    required this.date,
    required this.time,
    required this.persons,
    this.cocinaSlugs = const {},
    this.cashbackOnly = false,
    this.priceLevels = const {},
    this.comodidades = const {},
    this.referencePlace,
    this.distancePlace,
    this.maxDistanceKm,
    this.useMiles = false,
    this.sort = RestaurantSort.recommended,
  });

  factory RestaurantFilters.defaults() {
    return RestaurantFilters(
      date: DateTime.now(),
      time: '20:00',
      persons: 2,
    );
  }

  RestaurantFilters copyWith({
    DateTime? date,
    String? time,
    int? persons,
    Set<String>? cocinaSlugs,
    bool? cashbackOnly,
    Set<int>? priceLevels,
    Set<String>? comodidades,
    RestaurantReference? referencePlace,
    RestaurantReference? distancePlace,
    double? maxDistanceKm,
    bool? useMiles,
    RestaurantSort? sort,
    bool clearCocina = false,
    bool clearPriceLevels = false,
    bool clearComodidades = false,
    bool clearDistance = false,
  }) {
    return RestaurantFilters(
      date: date ?? this.date,
      time: time ?? this.time,
      persons: persons ?? this.persons,
      cocinaSlugs: clearCocina ? const {} : cocinaSlugs ?? this.cocinaSlugs,
      cashbackOnly: cashbackOnly ?? this.cashbackOnly,
      priceLevels:
          clearPriceLevels ? const {} : priceLevels ?? this.priceLevels,
      comodidades:
          clearComodidades ? const {} : comodidades ?? this.comodidades,
      referencePlace: referencePlace ?? this.referencePlace,
      distancePlace:
          clearDistance ? null : distancePlace ?? this.distancePlace,
      maxDistanceKm: clearDistance ? null : maxDistanceKm ?? this.maxDistanceKm,
      useMiles: useMiles ?? this.useMiles,
      sort: sort ?? this.sort,
    );
  }
}
