import 'package:dio/dio.dart';
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
  final String? selectedCategoryId;
  final double radiusKm;
  final String? errorMessage;
  final LatLng? userLocation;
  final String? lastTappedMarkerId;

  const MapState({
    this.status = MapStatus.initial,
    this.markers = const {},
    this.places = const [],
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
      final places = await _mapService.getPlacesByBounds(
        neLat: bounds.northeast.latitude,
        neLng: bounds.northeast.longitude,
        swLat: bounds.southwest.latitude,
        swLng: bounds.southwest.longitude,
        categoryId: categoryId ?? state.selectedCategoryId,
      );

      if (!mounted) return;

      final markers = places.map(_buildMarker).toSet();
      state = state.copyWith(
        status: MapStatus.loaded,
        markers: markers,
        places: places,
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
      final places = await _mapService.getNearbyPlaces(
        lat: state.userLocation!.latitude,
        lng: state.userLocation!.longitude,
        radius: state.radiusKm,
        categoryId: state.selectedCategoryId,
      );

      if (!mounted) return;

      final markers = places.map(_buildMarker).toSet();
      state = state.copyWith(
        status: MapStatus.loaded,
        markers: markers,
        places: places,
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
