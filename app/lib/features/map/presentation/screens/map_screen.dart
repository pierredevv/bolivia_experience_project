import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../../../config/colors.dart';
import '../providers/map_provider.dart';
import '../widgets/map_filter_sheet.dart';
import '../widgets/place_preview_sheet.dart';

class MapScreen extends ConsumerStatefulWidget {
  const MapScreen({super.key});

  @override
  ConsumerState<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends ConsumerState<MapScreen> {
  final Completer<GoogleMapController> _mapController = Completer();
  LatLngBounds? _lastBounds;

  // Santa Cruz de la Sierra center
  static const CameraPosition _santaCruz = CameraPosition(
    target: LatLng(-17.7833, -63.1821),
    zoom: 13,
  );

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadMarkersForCurrentView();
      ref.read(mapProvider.notifier).loadUserLocation();
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final mapState = ref.read(mapProvider);
    if (mapState.lastTappedMarkerId != null) {
      _showPlacePreview(mapState.lastTappedMarkerId!);
      ref.read(mapProvider.notifier).clearLastTappedMarker();
    }
  }

  void _loadMarkersForCurrentView() async {
    if (_lastBounds == null) return;
    final notifier = ref.read(mapProvider.notifier);
    await notifier.loadMarkers(_lastBounds!);
  }

  void _onCameraIdle() async {
    final controller = await _mapController.future;
    final bounds = await controller.getVisibleRegion();
    if (mounted) {
      setState(() => _lastBounds = bounds);
      final notifier = ref.read(mapProvider.notifier);
      await notifier.loadMarkers(bounds);
    }
  }

  void _showFilterSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const MapFilterSheet(),
    );
  }

  void _showPlacePreview(String placeId) {
    final place = ref.read(mapProvider.notifier).getPlaceById(placeId);
    if (place == null) return;

    final mapState = ref.read(mapProvider);
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => PlacePreviewSheet(
        place: place,
        userLocation: mapState.userLocation,
      ),
    );
  }

  Future<void> _goToMyLocation() async {
    final mapState = ref.read(mapProvider);

    if (mapState.userLocation != null) {
      final controller = await _mapController.future;
      controller.animateCamera(
        CameraUpdate.newCameraPosition(
          CameraPosition(
            target: mapState.userLocation!,
            zoom: 15,
          ),
        ),
      );
    } else {
      await ref.read(mapProvider.notifier).loadUserLocation();
      final newState = ref.read(mapProvider);
      if (newState.userLocation != null) {
        final controller = await _mapController.future;
        controller.animateCamera(
          CameraUpdate.newCameraPosition(
            CameraPosition(
              target: newState.userLocation!,
              zoom: 15,
            ),
          ),
        );
      }
    }
  }

  Future<void> _loadNearbyPlaces() async {
    final mapState = ref.read(mapProvider);

    if (mapState.userLocation == null) {
      await ref.read(mapProvider.notifier).loadUserLocation();
    }

    final newState = ref.read(mapProvider);
    if (newState.userLocation == null) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('No se pudo obtener tu ubicación'),
            duration: Duration(seconds: 2),
          ),
        );
      }
      return;
    }

    // Center map on user location
    final controller = await _mapController.future;
    controller.animateCamera(
      CameraUpdate.newCameraPosition(
        CameraPosition(
          target: newState.userLocation!,
          zoom: 14,
        ),
      ),
    );

    // Load nearby places
    await ref.read(mapProvider.notifier).loadNearbyFromUser();
  }

  @override
  Widget build(BuildContext context) {
    final mapState = ref.watch(mapProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mapa'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: _showFilterSheet,
            tooltip: 'Filtros',
          ),
          IconButton(
            icon: const Icon(Icons.near_me),
            onPressed: _loadNearbyPlaces,
            tooltip: 'Cercanos a mí',
          ),
          IconButton(
            icon: const Icon(Icons.my_location),
            onPressed: _goToMyLocation,
            tooltip: 'Mi ubicación',
          ),
        ],
      ),
      body: Stack(
        children: [
          GoogleMap(
            initialCameraPosition: _santaCruz,
            markers: mapState.markers,
            myLocationEnabled: true,
            myLocationButtonEnabled: false,
            zoomControlsEnabled: false,
            onMapCreated: (controller) {
              if (!_mapController.isCompleted) {
                _mapController.complete(controller);
              }
            },
            onCameraIdle: _onCameraIdle,
          ),

          // Search bar overlay
          Positioned(
            top: 16,
            left: 16,
            right: 16,
            child: GestureDetector(
              onTap: () => context.go('/search'),
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.1),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: const Row(
                  children: [
                    Icon(Icons.search, color: AppColors.neutral500),
                    SizedBox(width: 12),
                    Text(
                      'Buscar en el mapa...',
                      style: TextStyle(color: AppColors.neutral500),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Active category chip indicator
          if (mapState.selectedCategoryId != null)
            Positioned(
              top: 70,
              left: 16,
              child: GestureDetector(
                onTap: _showFilterSheet,
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.primary100,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.filter_list,
                          size: 16, color: AppColors.primary700),
                      const SizedBox(width: 4),
                      const Text(
                        'Filtro activo',
                        style: TextStyle(
                          color: AppColors.primary700,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(width: 4),
                      GestureDetector(
                        onTap: () {
                          ref.read(mapProvider.notifier).setSelectedCategory(null);
                          _loadMarkersForCurrentView();
                        },
                        child: const Icon(Icons.close,
                            size: 14, color: AppColors.primary700),
                      ),
                    ],
                  ),
                ),
              ),
            ),

          // Loading indicator
          if (mapState.status == MapStatus.loading)
            const Positioned(
              top: 70,
              right: 16,
              child: SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
            ),

          // Place count badge
          if (mapState.status == MapStatus.loaded)
            Positioned(
              bottom: 100,
              left: 16,
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.1),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Text(
                  '${mapState.places.length} lugares',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: AppColors.neutral700,
                  ),
                ),
              ),
            ),

          // Error snackbar
          if (mapState.status == MapStatus.error && mapState.errorMessage != null)
            Positioned(
              bottom: 100,
              left: 16,
              right: 16,
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.error100,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  mapState.errorMessage!,
                  style: const TextStyle(
                    color: AppColors.error900,
                    fontSize: 13,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ),

          // Zoom controls
          Positioned(
            bottom: 100,
            right: 16,
            child: Column(
              children: [
                _MapControlButton(
                  icon: Icons.add,
                  onPressed: () async {
                    final controller = await _mapController.future;
                    controller.animateCamera(CameraUpdate.zoomIn());
                  },
                ),
                const SizedBox(height: 8),
                _MapControlButton(
                  icon: Icons.remove,
                  onPressed: () async {
                    final controller = await _mapController.future;
                    controller.animateCamera(CameraUpdate.zoomOut());
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _MapControlButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onPressed;

  const _MapControlButton({required this.icon, required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: IconButton(
        icon: Icon(icon),
        onPressed: onPressed,
      ),
    );
  }
}
