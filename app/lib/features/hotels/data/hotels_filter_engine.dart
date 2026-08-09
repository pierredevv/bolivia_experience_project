import 'hotel.dart';
import 'hotel_availability.dart';
import 'hotel_catalogs.dart';
import 'hotel_distance.dart';
import 'hotel_filters.dart';

/// Motor de filtrado/ordenamiento de hoteles. Lógica pura y testeable.
///
/// Criterios de filtro y orden basados en el frontend de referencia de la
/// sección Hoteles (TripAdvisor-style), traducidos a los datos del backend:
///
/// - Productos marcados con `premiado` => "El mejor de Bolivia".
/// - Cashback activo => "Cashback" / 7% de la card.
/// - Distancia a la Plaza 24 de Septiembre => "Distancia desde la Plaza".
/// - Orden "Ranking de viajeros": rating + volumen de reviews.
class HotelsFilterEngine {
  const HotelsFilterEngine._();

  /// Aplica disponibilidad + todos los filtros y devuelve los ids ordenados.
  static List<String> apply(HotelFilters f, List<Hotel> hotels) {
    final matching = hotels.where((h) {
      if (!HotelAvailability.isAvailableForRange(h, f.checkIn, f.checkOut)) {
        return false;
      }
      if (!fitsCapacity(h, f.rooms, f.totalGuests)) return false;
      if (f.cashbackOnly && !h.hasCashback) return false;
      if (f.maxPrice != null && h.minPrice > f.maxPrice!) return false;
      if (f.tieneOfertaOnly && !h.tieneOferta) return false;
      if (f.reembolsableOnly && !h.reembolsable) return false;
      if (f.pagoDiferidoOnly && !h.pagoDiferido) return false;
      if (f.altamenteConcurrido && !_isHighlyBooked(h, f)) return false;
      if (f.premiadoOnly && !h.premiado) return false;
      if (f.estrellas != null && h.estrellas != f.estrellas) return false;
      if (f.tipoPropiedad.isNotEmpty &&
          (h.tipoPropiedad == null || !f.tipoPropiedad.contains(h.tipoPropiedad))) {
        return false;
      }
      if (f.amenities.isNotEmpty && !h.allAmenities.containsAll(f.amenities)) {
        return false;
      }
      if (f.maxDistanceKm != null && f.distancePlace != null) {
        final d = distanceToReference(h, f.distancePlace!, f.useMiles);
        if (d == null || d > f.maxDistanceKm!) return false;
      }
      return true;
    }).toList();

    final sorted = List<Hotel>.from(matching)
      ..sort((a, b) => _compare(f, a, b));
    return sorted.map((h) => h.id).toList();
  }

  /// ¿Cabe la solicitud en el hotel? El hotel debe tener al menos un producto
  /// (habitación) con capacidad suficiente por cuarto.
  ///
  /// `requiredPerRoom = ceil(guests / rooms)`: si pides 2 cuartos y 4 personas,
  /// se exige una habitación con capacidad >= 2. Un producto sin `capacity`
  /// (sin límite) y un hotel sin productos informados se consideran válidos.
  static bool fitsCapacity(Hotel h, int rooms, int totalGuests) {
    if (rooms <= 0 || totalGuests <= 0) return true;
    final requiredPerRoom = (totalGuests / rooms).ceil();
    for (final p in h.products) {
      final cap = p.capacity;
      if (cap == null || cap >= requiredPerRoom) return true;
    }
    // Hotel sin productos con capacidad informada: sin límite conocido.
    return h.products.isEmpty;
  }

  /// Distancia del hotel al punto de referencia, en la unidad activa.
  /// Retorna null si el hotel no tiene coordenadas.
  static double? distanceToReference(
    Hotel hotel,
    PlaceReference reference,
    bool useMiles,
  ) {
    final lat = hotel.latitude;
    final lng = hotel.longitude;
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

  static int _compare(HotelFilters f, Hotel a, Hotel b) {
    switch (f.sort) {
      case HotelSort.recommended:
        return _recommendedScore(b).compareTo(_recommendedScore(a));
      case HotelSort.bestRating:
        return b.ratingAvgValue.compareTo(a.ratingAvgValue);
      case HotelSort.travelerRanking:
        return _rankingScore(b).compareTo(_rankingScore(a));
      case HotelSort.priceAsc:
        return a.minPrice.compareTo(b.minPrice);
      case HotelSort.distanceFromPlaza:
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

  /// Score "Recomendados": premia rating, reviews, cashback y premios.
  static double _recommendedScore(Hotel h) {
    double score = h.ratingAvgValue;
    if (h.ratingCount >= 10) score += 0.5;
    if (h.ratingCount >= 100) score += 0.5;
    if (h.hasCashback) score += 0.3;
    if (h.premiado) score += 0.5;
    if (h.tieneOferta) score += 0.2;
    return score;
  }

  /// Score "Ranking de viajeros" (TripAdvisor-like: rating ponderado por volumen).
  static double _rankingScore(Hotel h) {
    final avg = h.ratingAvgValue;
    final count = h.ratingCount.toDouble();
    if (count == 0) return 0;
    return (avg * count) / (count + 5);
  }

  /// Simulación "Altamente concurridos": hoteles con >= 50% noches reservadas
  /// en el rango (determinista por hotel + fechas).
  static bool _isHighlyBooked(Hotel h, HotelFilters f) {
    return HotelAvailability.bookedFraction(h.id, f.checkIn, f.checkOut) >= 0.5;
  }
}
