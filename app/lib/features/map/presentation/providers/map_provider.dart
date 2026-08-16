import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../../../core/network/dio_provider.dart';
import '../../../../core/services/location_service.dart';
import '../../data/map_service.dart';

enum MapStatus { initial, loading, loaded, error }

class MapState {
  final MapStatus status;
  final Set<Marker> markers;
  final List<MapPlace> places;
  final List<MapSafetyZone> safetyZones;
  final List<MapEvent> events;
  final Set<Circle> safetyCircles;
  final String? selectedCategoryId;
  final double radiusKm;
  final String? errorMessage;
  final LatLng? userLocation;
  final String? lastTappedMarkerId;

  const MapState({
    this.status = MapStatus.initial,
    this.markers = const {},
    this.places = const [],
    this.safetyZones = const [],
    this.events = const [],
    this.safetyCircles = const {},
    this.selectedCategoryId,
    this.radiusKm = 10,
    this.errorMessage,
    this.userLocation,
    this.lastTappedMarkerId,
  });

  MapState copyWith({
    MapStatus? status,
    Set<Marker>? markers,
    List<MapPlace>? places,
    List<MapSafetyZone>? safetyZones,
    List<MapEvent>? events,
    Set<Circle>? safetyCircles,
    String? selectedCategoryId,
    bool clearCategoryId = false,
    double? radiusKm,
    String? errorMessage,
    bool clearError = false,
    LatLng? userLocation,
    bool clearUserLocation = false,
    String? lastTappedMarkerId,
    bool clearLastTapped = false,
  }) {
    return MapState(
      status: status ?? this.status,
      markers: markers ?? this.markers,
      places: places ?? this.places,
      safetyZones: safetyZones ?? this.safetyZones,
      events: events ?? this.events,
      safetyCircles: safetyCircles ?? this.safetyCircles,
      selectedCategoryId:
          clearCategoryId ? null : (selectedCategoryId ?? this.selectedCategoryId),
      radiusKm: radiusKm ?? this.radiusKm,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
      userLocation: clearUserLocation ? null : (userLocation ?? this.userLocation),
      lastTappedMarkerId: clearLastTapped ? null : (lastTappedMarkerId ?? this.lastTappedMarkerId),
    );
  }
}

final mapServiceProvider = Provider<MapService>((ref) {
  final dio = ref.read(dioProvider);
  return MapService(dio);
});

final mapProvider = StateNotifierProvider<MapNotifier, MapState>((ref) {
  return MapNotifier(ref.read(mapServiceProvider));
});

class MapNotifier extends StateNotifier<MapState> {
  final MapService _mapService;

  MapNotifier(this._mapService) : super(const MapState());

  Marker _buildMarker(MapPlace place) {
    final isUrban = place.isUrban;
    return Marker(
      markerId: MarkerId(place.id),
      position: LatLng(place.latitude, place.longitude),
      infoWindow: InfoWindow(
        title: place.name,
        snippet: place.address,
        onTap: () {
          state = state.copyWith(lastTappedMarkerId: place.id);
        },
      ),
      icon: BitmapDescriptor.defaultMarkerWithHue(
        isUrban ? BitmapDescriptor.hueAzure : BitmapDescriptor.hueGreen,
      ),
    );
  }

  Set<Circle> _buildSafetyCircles(List<MapSafetyZone> zones) {
    return zones.map((zone) {
      final color = _riskColor(zone.nivelRiesgo);
      return Circle(
        circleId: CircleId(zone.id),
        center: LatLng(zone.latitude, zone.longitude),
        radius: (zone.radioKm * 1000),
        fillColor: color.withValues(alpha: 0.12),
        strokeColor: color.withValues(alpha: 0.55),
        strokeWidth: 2,
      );
    }).toSet();
  }

  Color _riskColor(String nivelRiesgo) {
    switch (nivelRiesgo) {
      case 'alto':
        return const Color(0xFFEF4444);
      case 'medio':
        return const Color(0xFFF59E0B);
      case 'bajo':
      default:
        return const Color(0xFF10B981);
    }
  }

  void onMarkerTapped(String markerId) {
    state = state.copyWith(lastTappedMarkerId: markerId);
  }

  void clearLastTappedMarker() {
    state = state.copyWith(clearLastTapped: true);
  }

  Future<void> loadUserLocation() async {
    final position = await LocationService.getCurrentLocation();
    if (position != null && mounted) {
      state = state.copyWith(
        userLocation: LatLng(position.latitude, position.longitude),
      );
    }
  }

  Future<void> loadMarkers(LatLngBounds bounds, {String? categoryId}) async {
    if (!mounted) return;

    state = state.copyWith(
      status: MapStatus.loading,
      clearError: true,
    );

    try {
      final results = await Future.wait([
        _mapService.getPlacesByBounds(
          neLat: bounds.northeast.latitude,
          neLng: bounds.northeast.longitude,
          swLat: bounds.southwest.latitude,
          swLng: bounds.southwest.longitude,
          categoryId: categoryId ?? state.selectedCategoryId,
        ),
        _mapService.getSafetyZones(
          neLat: bounds.northeast.latitude,
          neLng: bounds.northeast.longitude,
          swLat: bounds.southwest.latitude,
          swLng: bounds.southwest.longitude,
        ),
        _mapService.getMapEvents(
          neLat: bounds.northeast.latitude,
          neLng: bounds.northeast.longitude,
          swLat: bounds.southwest.latitude,
          swLng: bounds.southwest.longitude,
        ),
      ]);

      if (!mounted) return;

      final places = results[0] as List<MapPlace>;
      final zones = results[1] as List<MapSafetyZone>;
      final events = results[2] as List<MapEvent>;

      final markers = places.map(_buildMarker).toSet();
      state = state.copyWith(
        status: MapStatus.loaded,
        markers: markers,
        places: places,
        safetyZones: zones,
        events: events,
        safetyCircles: _buildSafetyCircles(zones),
      );
    } on DioException catch (e) {
      if (!mounted) return;
      String message = 'Error al cargar lugares';
      if (e.response?.statusCode == 404) {
        message = 'No se encontraron lugares en esta zona';
      } else if (e.type == DioExceptionType.connectionError ||
          e.type == DioExceptionType.unknown) {
        message = 'Sin conexión a internet';
      }
      state = state.copyWith(
        status: MapStatus.error,
        errorMessage: message,
      );
    } catch (e) {
      if (!mounted) return;
      state = state.copyWith(
        status: MapStatus.error,
        errorMessage: 'Error al cargar lugares: ${e.toString()}',
      );
    }
  }

  Future<void> loadNearbyFromUser() async {
    if (state.userLocation == null) return;

    state = state.copyWith(status: MapStatus.loading, clearError: true);

    try {
      final results = await Future.wait([
        _mapService.getNearbyPlaces(
          lat: state.userLocation!.latitude,
          lng: state.userLocation!.longitude,
          radius: state.radiusKm,
          categoryId: state.selectedCategoryId,
        ),
        _mapService.getSafetyZones(),
        _mapService.getMapEvents(
          neLat: state.userLocation!.latitude + 0.2,
          neLng: state.userLocation!.longitude + 0.2,
          swLat: state.userLocation!.latitude - 0.2,
          swLng: state.userLocation!.longitude - 0.2,
        ),
      ]);

      if (!mounted) return;

      final places = results[0] as List<MapPlace>;
      final zones = results[1] as List<MapSafetyZone>;
      final events = results[2] as List<MapEvent>;

      final markers = places.map(_buildMarker).toSet();
      state = state.copyWith(
        status: MapStatus.loaded,
        markers: markers,
        places: places,
        safetyZones: zones,
        events: events,
        safetyCircles: _buildSafetyCircles(zones),
      );
    } on DioException catch (e) {
      if (!mounted) return;
      String message = 'Error al cargar lugares cercanos';
      if (e.type == DioExceptionType.connectionError ||
          e.type == DioExceptionType.unknown) {
        message = 'Sin conexión a internet';
      }
      state = state.copyWith(
        status: MapStatus.error,
        errorMessage: message,
      );
    } catch (e) {
      if (!mounted) return;
      state = state.copyWith(
        status: MapStatus.error,
        errorMessage: 'Error al cargar lugares cercanos',
      );
    }
  }

  void setSelectedCategory(String? categoryId) {
    state = state.copyWith(
      selectedCategoryId: categoryId,
      clearCategoryId: categoryId == null,
    );
  }

  void setRadiusKm(double radius) {
    state = state.copyWith(radiusKm: radius);
  }

  MapPlace? getPlaceById(String id) {
    try {
      return state.places.firstWhere((p) => p.id == id);
    } catch (_) {
      return null;
    }
  }
}
