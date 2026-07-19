import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:dio/dio.dart';
import '../../../../core/network/dio_provider.dart';
import '../../data/map_service.dart';

enum MapStatus { initial, loading, loaded, error }

class MapState {
  final MapStatus status;
  final List<MapPlace> places;
  final List<MapCluster> clusters;
  final LatLng? currentLocation;
  final LatLng? selectedLocation;
  final MapPlace? selectedPlace;
  final String? selectedCategory;
  final String? errorMessage;
  final bool isFollowingUser;

  const MapState({
    this.status = MapStatus.initial,
    this.places = const [],
    this.clusters = const [],
    this.currentLocation,
    this.selectedLocation,
    this.selectedPlace,
    this.selectedCategory,
    this.errorMessage,
    this.isFollowingUser = true,
  });

  MapState copyWith({
    MapStatus? status,
    List<MapPlace>? places,
    List<MapCluster>? clusters,
    LatLng? currentLocation,
    LatLng? selectedLocation,
    MapPlace? selectedPlace,
    String? selectedCategory,
    String? errorMessage,
    bool? isFollowingUser,
    bool clearSelectedPlace = false,
    bool clearSelectedLocation = false,
  }) {
    return MapState(
      status: status ?? this.status,
      places: places ?? this.places,
      clusters: clusters ?? this.clusters,
      currentLocation: currentLocation ?? this.currentLocation,
      selectedLocation: clearSelectedLocation ? null : (selectedLocation ?? this.selectedLocation),
      selectedPlace: clearSelectedPlace ? null : (selectedPlace ?? this.selectedPlace),
      selectedCategory: selectedCategory ?? this.selectedCategory,
      errorMessage: errorMessage,
      isFollowingUser: isFollowingUser ?? this.isFollowingUser,
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
  StreamSubscription<Position>? _positionSubscription;

  MapNotifier(this._mapService) : super(const MapState()) {
    _init();
  }

  @override
  void dispose() {
    _positionSubscription?.cancel();
    super.dispose();
  }

  Future<void> _init() async {
    try {
      final position = await _mapService.getCurrentLocation();
      if (position != null && mounted) {
        final latLng = LatLng(position.latitude, position.longitude);
        state = state.copyWith(currentLocation: latLng);
        await loadPlaces(latLng);
        _startLocationTracking();
      }
    } catch (e) {
      // Location service unavailable - map still works without user position
      if (mounted) {
        state = state.copyWith(
          status: MapStatus.loaded,
          errorMessage: 'No se pudo obtener la ubicación',
        );
      }
    }
  }

  void _startLocationTracking() {
    _positionSubscription?.cancel();
    _positionSubscription = _mapService.getPositionStream().listen((position) {
      if (mounted && state.isFollowingUser) {
        final latLng = LatLng(position.latitude, position.longitude);
        state = state.copyWith(currentLocation: latLng);
      }
    });
  }

  Future<void> loadPlaces(LatLng center) async {
    if (!mounted) return;
    state = state.copyWith(status: MapStatus.loading);

    try {
      final places = await _mapService.getNearbyPlaces(
        latitude: center.latitude,
        longitude: center.longitude,
        radiusMeters: 10000,
        limit: 50,
        categoryId: state.selectedCategory,
      );

      if (!mounted) return;
      state = state.copyWith(
        status: MapStatus.loaded,
        places: places,
      );
    } on DioException catch (e) {
      if (!mounted) return;
      String message = 'Error al cargar lugares';
      if (e.type == DioExceptionType.connectionError) {
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
        errorMessage: 'Error inesperado',
      );
    }
  }

  void selectPlace(MapPlace? place) {
    state = state.copyWith(
      selectedPlace: place,
      selectedLocation: place != null
          ? LatLng(place.latitude, place.longitude)
          : null,
      isFollowingUser: false,
    );
  }

  void clearSelection() {
    state = state.copyWith(
      clearSelectedPlace: true,
      clearSelectedLocation: true,
    );
  }

  void setCategory(String? categoryId) {
    state = state.copyWith(selectedCategory: categoryId);
    if (state.currentLocation != null) {
      loadPlaces(state.currentLocation!);
    }
  }

  void toggleFollowUser() {
    final newFollowing = !state.isFollowingUser;
    state = state.copyWith(isFollowingUser: newFollowing);
    if (newFollowing && state.currentLocation != null) {
      state = state.copyWith(selectedLocation: state.currentLocation);
    }
  }

  void onCameraMove(LatLng center) {
    // Could load new places when camera moves significantly
  }

  void onCameraIdle(LatLng center) {
    loadPlaces(center);
  }
}
