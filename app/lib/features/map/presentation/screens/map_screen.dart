import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:go_router/go_router.dart';
import '../../../../config/colors.dart';
import '../providers/map_provider.dart';
import '../widgets/place_bottom_sheet.dart';
import '../widgets/place_marker.dart';

class MapScreen extends ConsumerStatefulWidget {
  const MapScreen({super.key});

  @override
  ConsumerState<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends ConsumerState<MapScreen> {
  GoogleMapController? _mapController;
  bool _isMapReady = false;

  static const CameraPosition _initialPosition = CameraPosition(
    target: LatLng(-17.7833, -63.1833), // Santa Cruz
    zoom: 13,
  );

  @override
  void initState() {
    super.initState();
    PlaceMarker.loadIcons();
  }

  @override
  void dispose() {
    _mapController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final mapState = ref.watch(mapProvider);

    return Scaffold(
      body: Stack(
        children: [
          // Google Map
          _buildMap(mapState),

          // Search bar
          _buildSearchBar(),

          // Category filters
          _buildCategoryFilters(mapState),

          // Map controls
          _buildMapControls(mapState),

          // Loading indicator
          if (mapState.status == MapStatus.loading)
            Positioned(
              top: MediaQuery.of(context).padding.top + 130,
              left: 0,
              right: 0,
              child: const Center(
                child: CircularProgressIndicator(),
              ),
            ),

          // Place bottom sheet
          if (mapState.selectedPlace != null)
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: PlaceBottomSheet(
                place: mapState.selectedPlace!,
                onClose: () {
                  ref.read(mapProvider.notifier).clearSelection();
                },
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildMap(MapState mapState) {
    return GoogleMap(
      initialCameraPosition: mapState.currentLocation != null
          ? CameraPosition(target: mapState.currentLocation!, zoom: 14)
          : _initialPosition,
      myLocationEnabled: true,
      myLocationButtonEnabled: false,
      zoomControlsEnabled: false,
      mapToolbarEnabled: false,
      onMapCreated: (controller) {
        _mapController = controller;
        setState(() => _isMapReady = true);

        if (mapState.currentLocation != null) {
          controller.animateCamera(
            CameraUpdate.newLatLngZoom(mapState.currentLocation!, 14),
          );
        }
      },
      onCameraMove: (position) {
        ref.read(mapProvider.notifier).onCameraMove(position.target);
      },
      onCameraIdle: () {
        _mapController?.getVisibleRegion().then((bounds) {
          ref.read(mapProvider.notifier).onCameraIdle(
            LatLng(
              (bounds.northeast.latitude + bounds.southwest.latitude) / 2,
              (bounds.northeast.longitude + bounds.southwest.longitude) / 2,
            ),
          );
        });
      },
      onTap: (_) {
        ref.read(mapProvider.notifier).clearSelection();
      },
      markers: PlaceMarker.createMarkers(
        places: mapState.places,
        onTap: (place) {
          ref.read(mapProvider.notifier).selectPlace(place);
          _mapController?.animateCamera(
            CameraUpdate.newLatLngZoom(
              LatLng(place.latitude, place.longitude),
              16,
            ),
          );
        },
        selectedPlaceId: mapState.selectedPlace?.id,
      ),
    );
  }

  Widget _buildSearchBar() {
    return Positioned(
      top: MediaQuery.of(context).padding.top + 16,
      left: 16,
      right: 16,
      child: GestureDetector(
        onTap: () => context.push('/search'),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            children: [
              Icon(Icons.search, color: AppColors.neutral500),
              const SizedBox(width: 12),
              Text(
                'Buscar en el mapa...',
                style: TextStyle(
                  color: AppColors.neutral500,
                  fontSize: 15,
                ),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.primary50,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  Icons.tune,
                  size: 18,
                  color: AppColors.primary700,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCategoryFilters(MapState mapState) {
    final categories = [
      {'id': null, 'name': 'Todos', 'icon': Icons.all_inclusive},
      {'id': 'restaurant', 'name': 'Restaurantes', 'icon': Icons.restaurant},
      {'id': 'hotel', 'name': 'Hoteles', 'icon': Icons.hotel},
      {'id': 'attraction', 'name': 'Atracciones', 'icon': Icons.attractions},
      {'id': 'cafe', 'name': 'Cafeterías', 'icon': Icons.coffee},
    ];

    return Positioned(
      top: MediaQuery.of(context).padding.top + 80,
      left: 0,
      right: 0,
      child: SizedBox(
        height: 44,
        child: ListView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 16),
          children: categories.map((cat) {
            final isSelected = mapState.selectedCategory == cat['id'];
            return Padding(
              padding: const EdgeInsets.only(right: 8),
              child: FilterChip(
                avatar: Icon(
                  cat['icon'] as IconData,
                  size: 18,
                  color: isSelected ? AppColors.primary700 : AppColors.neutral600,
                ),
                label: Text(cat['name'] as String),
                selected: isSelected,
                onSelected: (selected) {
                  ref.read(mapProvider.notifier).setCategory(
                    selected ? cat['id'] as String? : null,
                  );
                },
                selectedColor: AppColors.primary100,
                checkmarkColor: AppColors.primary700,
                backgroundColor: Colors.white,
                elevation: 2,
                padding: const EdgeInsets.symmetric(horizontal: 8),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildMapControls(MapState mapState) {
    return Positioned(
      bottom: mapState.selectedPlace != null ? 220 : 100,
      right: 16,
      child: Column(
        children: [
          // My location button
          _MapControlButton(
            icon: Icons.my_location,
            onPressed: () {
              if (mapState.currentLocation != null) {
                _mapController?.animateCamera(
                  CameraUpdate.newLatLngZoom(mapState.currentLocation!, 14),
                );
                ref.read(mapProvider.notifier).toggleFollowUser();
              }
            },
            isActive: mapState.isFollowingUser,
          ),
          const SizedBox(height: 12),

          // Zoom in
          _MapControlButton(
            icon: Icons.add,
            onPressed: () {
              _mapController?.animateCamera(CameraUpdate.zoomIn());
            },
          ),
          const SizedBox(height: 8),

          // Zoom out
          _MapControlButton(
            icon: Icons.remove,
            onPressed: () {
              _mapController?.animateCamera(CameraUpdate.zoomOut());
            },
          ),
          const SizedBox(height: 12),

          // Layers
          _MapControlButton(
            icon: Icons.layers_outlined,
            onPressed: () {
              _showLayerPicker(context);
            },
          ),
        ],
      ),
    );
  }

  void _showLayerPicker(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                margin: const EdgeInsets.only(top: 12),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.neutral300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16),
                child: Text(
                  'Tipo de Mapa',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              ListTile(
                leading: const Icon(Icons.map),
                title: const Text('Estándar'),
                trailing: Icon(Icons.check, color: AppColors.primary700),
                onTap: () => Navigator.pop(context),
              ),
              ListTile(
                leading: const Icon(Icons.satellite_alt),
                title: const Text('Satélite'),
                onTap: () => Navigator.pop(context),
              ),
              ListTile(
                leading: const Icon(Icons.terrain),
                title: const Text('Terreno'),
                onTap: () => Navigator.pop(context),
              ),
              const SizedBox(height: 16),
            ],
          ),
        );
      },
    );
  }
}

class _MapControlButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onPressed;
  final bool isActive;

  const _MapControlButton({
    required this.icon,
    required this.onPressed,
    this.isActive = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: isActive ? AppColors.primary700 : Colors.white,
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: IconButton(
        icon: Icon(
          icon,
          color: isActive ? Colors.white : AppColors.neutral700,
          size: 22,
        ),
        onPressed: onPressed,
      ),
    );
  }
}
