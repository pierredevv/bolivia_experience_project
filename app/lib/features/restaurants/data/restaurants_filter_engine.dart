import '../../hotels/data/hotel_distance.dart';
import 'restaurant.dart';
import 'restaurant_availability.dart';
import 'restaurant_catalogs.dart';
import 'restaurant_filters.dart';

/// Motor de filtrado/ordenamiento de restaurantes. Lógica pura y testeable.
class RestaurantsFilterEngine {
  const RestaurantsFilterEngine._();

  /// Aplica disponibilidad + todos los filtros y devuelve los ids ordenados.
  static List<String> apply(RestaurantFilters f, List<Restaurant> restaurants) {
    final matching = restaurants.where((r) {
      if (!RestaurantAvailability.isAvailable(r, f.date, f.time)) {
        return false;
      }
      if (!fitsCapacity(r, f.persons)) return false;
      if (f.cocinaSlugs.isNotEmpty) {
        final slug = r.cocinaSlug;
        if (slug == null || !f.cocinaSlugs.contains(slug)) return false;
      }
      if (f.priceLevels.isNotEmpty &&
          (r.nivelPrecio == null || !f.priceLevels.contains(r.nivelPrecio))) {
        return false;
      }
      if (f.cashbackOnly && !r.hasCashback) return false;
      if (f.comodidades.isNotEmpty &&
          !r.comodidades.toSet().containsAll(f.comodidades)) {
        return false;
      }
      if (f.maxDistanceKm != null && f.distancePlace != null) {
        final d = distanceToReference(r, f.distancePlace!, f.useMiles);
        if (d == null || d > f.maxDistanceKm!) return false;
      }
      return true;
    }).toList();

    final sorted = List<Restaurant>.from(matching)
      ..sort((a, b) => _compare(f, a, b));
    return sorted.map((r) => r.id).toList();
  }

  /// ¿La mesa del restaurante alberga a las personas indicadas? Una mesa sin
  /// `capacity` informado se considera válida.
  static bool fitsCapacity(Restaurant r, int persons) {
    final cap = r.mesa.capacity;
    if (persons <= 0) return true;
    if (cap == null || cap >= persons) return true;
    return false;
  }

  /// Distancia del restaurante al punto de referencia, en la unidad activa.
  /// Retorna null si no hay coordenadas.
  static double? distanceToReference(
    Restaurant restaurant,
    RestaurantReference reference,
    bool useMiles,
  ) {
    final lat = restaurant.latitude;
    final lng = restaurant.longitude;
    if (lat == null || lng == null || reference.latitude == null || reference.longitude == null) {
      return null;
    }
    final km = HotelDistance.calculateDistanceKm(
      lat1: lat,
      lon1: lng,
      lat2: reference.latitude!,
      lon2: reference.longitude!,
    );
    return useMiles ? HotelDistance.kmToMi(km) : km;
  }

  static int _compare(RestaurantFilters f, Restaurant a, Restaurant b) {
    switch (f.sort) {
      case RestaurantSort.recommended:
        return _recommendedScore(b).compareTo(_recommendedScore(a));
      case RestaurantSort.bestRating:
        return b.ratingAvgValue.compareTo(a.ratingAvgValue);
      case RestaurantSort.priceAsc:
        return a.priceFrom.compareTo(b.priceFrom);
      case RestaurantSort.distanceFromPlaza:
        final da = distanceToReference(a, f.referencePlace!, f.useMiles);
        final db = distanceToReference(b, f.referencePlace!, f.useMiles);
        final av = da ?? double.infinity;
        final bv = db ?? double.infinity;
        if (av == bv) return 0;
        if (av == double.infinity) return 1;
        if (bv == double.infinity) return -1;
        return av.compareTo(bv);
    }
  }

  /// Score "Recomendados": premia rating, reviews, cashback y nivel de precio.
  static double _recommendedScore(Restaurant r) {
    double score = r.ratingAvgValue;
    if (r.ratingCount >= 10) score += 0.5;
    if (r.ratingCount >= 100) score += 0.5;
    if (r.hasCashback) score += 0.3;
    if (r.canReserve) score += 0.2;
    return score;
  }
}
