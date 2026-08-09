import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/dio_provider.dart';
import '../../../../core/services/location_service.dart';
import '../../data/hotel.dart';
import '../../data/hotel_catalogs.dart';
import '../../data/hotel_distance.dart';
import '../../data/hotel_filters.dart';
import '../../data/hotels_filter_engine.dart';
import '../../data/hotels_service.dart';

final hotelsServiceProvider = Provider<HotelsService>((ref) {
  return HotelsService(ref.read(dioProvider));
});

enum HotelsStatus { initial, loading, loaded, error }

class HotelsState {
  final HotelsStatus status;
  final List<Hotel> allHotels;
  final List<String> hotelIds;
  final double maxMinPrice;
  final PlaceReference? referencePlace;
  final List<PlaceReference> placesCatalog;
  final HotelFilters filters;
  final String? errorMessage;
  final bool hasUserLocation;

  HotelsState({
    this.status = HotelsStatus.initial,
    this.allHotels = const [],
    this.hotelIds = const [],
    this.maxMinPrice = 0,
    this.referencePlace,
    this.placesCatalog = const [],
    HotelFilters? filters,
    this.errorMessage,
    this.hasUserLocation = false,
  }) : filters = filters ?? HotelFilters.defaults();

  HotelsState copyWith({
    HotelsStatus? status,
    List<Hotel>? allHotels,
    List<String>? hotelIds,
    double? maxMinPrice,
    PlaceReference? referencePlace,
    List<PlaceReference>? placesCatalog,
    HotelFilters? filters,
    String? errorMessage,
    bool? hasUserLocation,
  }) {
    return HotelsState(
      status: status ?? this.status,
      allHotels: allHotels ?? this.allHotels,
      hotelIds: hotelIds ?? this.hotelIds,
      maxMinPrice: maxMinPrice ?? this.maxMinPrice,
      referencePlace: referencePlace ?? this.referencePlace,
      placesCatalog: placesCatalog ?? this.placesCatalog,
      filters: filters ?? this.filters,
      errorMessage: errorMessage ?? this.errorMessage,
      hasUserLocation: hasUserLocation ?? this.hasUserLocation,
    );
  }
}

final hotelsProvider =
    StateNotifierProvider<HotelsNotifier, HotelsState>((ref) {
  return HotelsNotifier(ref.read(hotelsServiceProvider));
});

class HotelsNotifier extends StateNotifier<HotelsState> {
  final HotelsService _service;

  HotelsNotifier(this._service) : super(HotelsState());

  bool _loading = false;

  Future<void> load() async {
    if (_loading) return;
    _loading = true;
    if (!mounted) return;
    state = state.copyWith(status: HotelsStatus.loading, errorMessage: null);
    try {
      final result = await _service.getHotels();
      if (!mounted) return;

      // Distancia al punto de referencia del backend (Plaza 24 de Septiembre).
      final reference = result.referencePlace ?? state.referencePlace;
      final hotels = _attachDistances(result.hotels, reference);

      final filters = state.filters.copyWith(referencePlace: reference);
      state = state.copyWith(
        status: HotelsStatus.loaded,
        allHotels: hotels,
        maxMinPrice: result.maxMinPrice,
        referencePlace: reference,
        filters: filters,
        errorMessage: null,
      );
      state = state.copyWith(hotelIds: _applyFilters(state));

      // Carga del catálogo de lugares para el filtro de distancia.
      _loadPlacesCatalog();
    } catch (e) {
      if (!mounted) return;
      state = state.copyWith(
        status: HotelsStatus.error,
        errorMessage: 'No se pudieron cargar los hoteles.',
      );
    } finally {
      _loading = false;
    }
  }

  Future<void> _loadPlacesCatalog() async {
    try {
      final places = await _service.getPlacesCatalog();
      if (!mounted) return;
      state = state.copyWith(placesCatalog: places);
    } catch (_) {
      // No crítico: el selector de distancia queda sin opciones.
    }
  }

  List<Hotel> _attachDistances(
    List<Hotel> hotels,
    PlaceReference? reference,
  ) {
    final withUserDistance = List<Hotel>.from(hotels);
    for (final h in withUserDistance) {
      h.distanceFromUserKm = null;
      h.distanceFromReferenceKm = null;
      final refLat = reference?.latitude;
      final refLng = reference?.longitude;
      if (h.latitude != null &&
          h.longitude != null &&
          refLat != null &&
          refLng != null) {
        h.distanceFromReferenceKm = HotelDistance.calculateDistanceKm(
          lat1: h.latitude!,
          lon1: h.longitude!,
          lat2: refLat,
          lon2: refLng,
        );
      }
    }
    _applyUserDistances(withUserDistance);
    return withUserDistance;
  }

  Future<void> _applyUserDistances(List<Hotel> hotels) async {
    try {
      final position = await LocationService.getCurrentLocation();
      if (!mounted || position == null) return;
      for (final h in hotels) {
        if (h.latitude != null && h.longitude != null) {
          h.distanceFromUserKm = HotelDistance.calculateDistanceKm(
            lat1: h.latitude!,
            lon1: h.longitude!,
            lat2: position.latitude,
            lon2: position.longitude,
          );
        }
      }
      state = state.copyWith(hasUserLocation: true);
      state = state.copyWith(hotelIds: _applyFilters(state));
    } catch (_) {
      // Sin permiso de ubicación: solo se muestra la distancia a la Plaza.
    }
  }

  List<String> _applyFilters(HotelsState s) {
    return HotelsFilterEngine.apply(s.filters, s.allHotels);
  }

  /// Aplica nuevos criterios y recalcula la lista visible.
  void setFilters(HotelFilters filters) {
    state = state.copyWith(filters: filters);
    state = state.copyWith(hotelIds: _applyFilters(state));
  }

  void setDates(DateTime checkIn, DateTime checkOut) {
    final f = state.filters.copyWith(checkIn: checkIn, checkOut: checkOut);
    setFilters(f);
  }

  void setGuests({int? rooms, int? adults, int? children}) {
    final f = state.filters.copyWith(
      rooms: rooms,
      adults: adults,
      children: children,
    );
    setFilters(f);
  }

  void toggleCashbackOnly() {
    final f = state.filters.copyWith(cashbackOnly: !state.filters.cashbackOnly);
    setFilters(f);
  }

  void toggleTieneOferta() {
    final f = state.filters.copyWith(tieneOfertaOnly: !state.filters.tieneOfertaOnly);
    setFilters(f);
  }

  void toggleReembolsable() {
    final f = state.filters.copyWith(reembolsableOnly: !state.filters.reembolsableOnly);
    setFilters(f);
  }

  void togglePagoDiferido() {
    final f = state.filters.copyWith(pagoDiferidoOnly: !state.filters.pagoDiferidoOnly);
    setFilters(f);
  }

  void togglePremiado() {
    final f = state.filters.copyWith(premiadoOnly: !state.filters.premiadoOnly);
    setFilters(f);
  }

  void setSort(HotelSort sort) {
    final f = state.filters.copyWith(sort: sort);
    setFilters(f);
  }

  void setMaxPrice(double? maxPrice) {
    final f = state.filters.copyWith(maxPrice: maxPrice);
    setFilters(f);
  }

  void clearMaxPrice() {
    final f = state.filters.copyWith(clearMaxPrice: true);
    setFilters(f);
  }

  void setDistanceFilter(PlaceReference? place, double? maxKm) {
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

  void toggleAmenity(String id) {
    final current = state.filters.amenities;
    final next = Set<String>.from(current);
    if (!next.add(id)) {
      next.remove(id);
    }
    final f = state.filters.copyWith(amenities: next);
    setFilters(f);
  }

  void setEstrellas(int? estrellas) {
    final f = state.filters.copyWith(estrellas: estrellas);
    setFilters(f);
  }

  void toggleTipoPropiedad(String tipo) {
    final current = state.filters.tipoPropiedad;
    final next = Set<String>.from(current);
    if (!next.add(tipo)) {
      next.remove(tipo);
    }
    final f = state.filters.copyWith(tipoPropiedad: next);
    setFilters(f);
  }
}
