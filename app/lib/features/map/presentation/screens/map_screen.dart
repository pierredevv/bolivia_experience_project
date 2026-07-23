import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../../../config/colors.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  final Completer<GoogleMapController> _mapController = Completer();

  // Santa Cruz de la Sierra center
  static const CameraPosition _santaCruz = CameraPosition(
    target: LatLng(-17.7833, -63.1821),
    zoom: 13,
  );

  final Set<Marker> _markers = {};

  @override
  void initState() {
    super.initState();
    _loadPlaceMarkers();
  }

  void _loadPlaceMarkers() {
    // Sample places from seed data
    final places = [
      {'name': 'El Palmar', 'lat': -17.7833, 'lng': -63.1821},
      {'name': 'Cocina Mestiza', 'lat': -17.7754, 'lng': -63.1715},
      {'name': 'Hotel Buganvilia', 'lat': -17.7801, 'lng': -63.1789},
      {'name': 'Lomas de Arena', 'lat': -17.8200, 'lng': -63.2200},
      {'name': 'Museo Noel Kempff', 'lat': -17.7650, 'lng': -63.1500},
      {'name': 'Café Munaipata', 'lat': -17.7810, 'lng': -63.1850},
      {'name': 'Blue Velvet Bar', 'lat': -17.7780, 'lng': -63.1760},
      {'name': 'Churrasquía Don Toto', 'lat': -17.7890, 'lng': -63.1950},
      {'name': 'CC Ventura', 'lat': -17.7600, 'lng': -63.1300},
      {'name': 'Cristo Redentor', 'lat': -17.7730, 'lng': -63.1630},
    ];

    setState(() {
      for (final place in places) {
        _markers.add(
          Marker(
            markerId: MarkerId(place['name'] as String),
            position: LatLng(place['lat'] as double, place['lng'] as double),
            infoWindow: InfoWindow(title: place['name'] as String),
          ),
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mapa'),
        actions: [
          IconButton(
            icon: const Icon(Icons.my_location),
            onPressed: () async {
              final controller = await _mapController.future;
              controller.animateCamera(CameraUpdate.newCameraPosition(_santaCruz));
            },
          ),
        ],
      ),
      body: Stack(
        children: [
          // Real Google Map
          GoogleMap(
            initialCameraPosition: _santaCruz,
            markers: _markers,
            myLocationEnabled: true,
            myLocationButtonEnabled: false,
            zoomControlsEnabled: false,
            onMapCreated: (controller) {
              if (!_mapController.isCompleted) {
                _mapController.complete(controller);
              }
            },
          ),

          // Search bar overlay
          Positioned(
            top: 16,
            left: 16,
            right: 16,
            child: GestureDetector(
              onTap: () {
                // TODO: Navigate to search
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
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

          // Filter chips
          const Positioned(
            top: 70,
            left: 16,
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _MapFilterChip(label: 'Todos', isSelected: true),
                  _MapFilterChip(label: 'Restaurantes'),
                  _MapFilterChip(label: 'Hoteles'),
                  _MapFilterChip(label: 'Atracciones'),
                ],
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

class _MapFilterChip extends StatelessWidget {
  final String label;
  final bool isSelected;

  const _MapFilterChip({required this.label, this.isSelected = false});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (selected) {},
        selectedColor: AppColors.primary100,
        backgroundColor: Colors.white,
        checkmarkColor: AppColors.primary700,
        elevation: 2,
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
