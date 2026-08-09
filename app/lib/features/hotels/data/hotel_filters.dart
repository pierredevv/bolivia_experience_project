import 'hotel.dart';
import 'hotel_catalogs.dart';

/// Estado de búsqueda de hoteles (solicitud del usuario).
class HotelFilters {
  final DateTime checkIn;
  final DateTime checkOut;
  final int rooms;
  final int adults;
  final int children;

  final bool cashbackOnly;
  final double? maxPrice;
  final Set<String> amenities;

  /// Punto de referencia fijo de la vista (Plaza 24 de Septiembre).
  /// Se usa SOLO para el orden "Distancia desde la Plaza".
  final PlaceReference? referencePlace;

  /// Lugar elegido por el usuario para el filtro "Distancia desde".
  final PlaceReference? distancePlace;
  final double? maxDistanceKm;
  final bool useMiles;
  final HotelSort sort;

  final bool tieneOfertaOnly;
  final bool reembolsableOnly;
  final bool pagoDiferidoOnly;
  final bool altamenteConcurrido;
  final int? estrellas;
  final bool premiadoOnly;
  final Set<String> tipoPropiedad;

  const HotelFilters({
    required this.checkIn,
    required this.checkOut,
    required this.rooms,
    required this.adults,
    required this.children,
    this.cashbackOnly = false,
    this.maxPrice,
    this.amenities = const {},
    this.referencePlace,
    this.distancePlace,
    this.maxDistanceKm,
    this.useMiles = false,
    this.sort = HotelSort.recommended,
    this.tieneOfertaOnly = false,
    this.reembolsableOnly = false,
    this.pagoDiferidoOnly = false,
    this.altamenteConcurrido = false,
    this.estrellas,
    this.premiadoOnly = false,
    this.tipoPropiedad = const {},
  });

  factory HotelFilters.defaults() {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    return HotelFilters(
      checkIn: today,
      checkOut: today.add(const Duration(days: 4)),
      rooms: 1,
      adults: 2,
      children: 0,
    );
  }

  int get totalGuests => adults + children;

  int get nights =>
      checkOut.difference(checkIn).inDays < 1 ? 0 : checkOut.difference(checkIn).inDays;

  HotelFilters copyWith({
    DateTime? checkIn,
    DateTime? checkOut,
    int? rooms,
    int? adults,
    int? children,
    bool? cashbackOnly,
    double? maxPrice,
    Set<String>? amenities,
    PlaceReference? referencePlace,
    PlaceReference? distancePlace,
    double? maxDistanceKm,
    bool? useMiles,
    HotelSort? sort,
    bool? tieneOfertaOnly,
    bool? reembolsableOnly,
    bool? pagoDiferidoOnly,
    bool? altamenteConcurrido,
    int? estrellas,
    bool? premiadoOnly,
    Set<String>? tipoPropiedad,
    bool clearMaxPrice = false,
    bool clearDistance = false,
    bool clearEstrellas = false,
    bool clearTipoPropiedad = false,
  }) {
    return HotelFilters(
      checkIn: checkIn ?? this.checkIn,
      checkOut: checkOut ?? this.checkOut,
      rooms: rooms ?? this.rooms,
      adults: adults ?? this.adults,
      children: children ?? this.children,
      cashbackOnly: cashbackOnly ?? this.cashbackOnly,
      maxPrice: clearMaxPrice ? null : maxPrice ?? this.maxPrice,
      amenities: amenities ?? this.amenities,
      referencePlace: referencePlace ?? this.referencePlace,
      distancePlace:
          clearDistance ? null : distancePlace ?? this.distancePlace,
      maxDistanceKm: clearDistance ? null : maxDistanceKm ?? this.maxDistanceKm,
      useMiles: useMiles ?? this.useMiles,
      sort: sort ?? this.sort,
      tieneOfertaOnly: tieneOfertaOnly ?? this.tieneOfertaOnly,
      reembolsableOnly: reembolsableOnly ?? this.reembolsableOnly,
      pagoDiferidoOnly: pagoDiferidoOnly ?? this.pagoDiferidoOnly,
      altamenteConcurrido: altamenteConcurrido ?? this.altamenteConcurrido,
      estrellas: clearEstrellas ? null : estrellas ?? this.estrellas,
      premiadoOnly: premiadoOnly ?? this.premiadoOnly,
      tipoPropiedad: clearTipoPropiedad
          ? const {}
          : tipoPropiedad ?? this.tipoPropiedad,
    );
  }
}
