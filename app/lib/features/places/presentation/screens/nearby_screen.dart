import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../config/colors.dart';
import '../../../../core/services/location_service.dart';
import '../../../../core/widgets/empty_state.dart';
import '../../../../core/widgets/skeleton_loader.dart';

class NearbyScreen extends ConsumerStatefulWidget {
  const NearbyScreen({super.key});

  @override
  ConsumerState<NearbyScreen> createState() => _NearbyScreenState();
}

class _NearbyScreenState extends ConsumerState<NearbyScreen> {
  bool _isLoading = true;
  String? _error;
  List<Map<String, dynamic>> _nearbyPlaces = [];

  @override
  void initState() {
    super.initState();
    _loadNearbyPlaces();
  }

  Future<void> _loadNearbyPlaces() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final position = await LocationService.getCurrentLocation();
      if (position == null) {
        setState(() {
          _error = 'No se pudo obtener tu ubicación';
          _isLoading = false;
        });
        return;
      }

      // TODO: Call API with nearby places endpoint
      // For now, show empty state
      setState(() {
        _nearbyPlaces = [];
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Error al cargar lugares cercanos';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Cerca de ti'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadNearbyPlaces,
          ),
        ],
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.primary700),
      );
    }

    if (_error != null) {
      return EmptyState(
        icon: Icons.location_off,
        title: _error!,
        actionLabel: 'Reintentar',
        onAction: _loadNearbyPlaces,
      );
    }

    if (_nearbyPlaces.isEmpty) {
      return const EmptyState(
        icon: Icons.near_me,
        title: 'No hay lugares cercanos',
        subtitle: 'Activa tu ubicación para ver lugares cercanos',
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _nearbyPlaces.length,
      itemBuilder: (context, index) {
        final place = _nearbyPlaces[index];
        return _NearbyPlaceCard(place: place);
      },
    );
  }
}

class _NearbyPlaceCard extends StatelessWidget {
  final Map<String, dynamic> place;

  const _NearbyPlaceCard({required this.place});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        contentPadding: const EdgeInsets.all(12),
        leading: ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: Container(
            width: 60,
            height: 60,
            color: AppColors.neutral200,
            child: const Icon(Icons.place, color: AppColors.neutral400),
          ),
        ),
        title: Text(
          place['name'] ?? '',
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Text(
          place['distance'] ?? '',
          style: TextStyle(color: AppColors.neutral600, fontSize: 12),
        ),
        trailing: const Icon(Icons.chevron_right),
        onTap: () {
          context.go('/places/${place['id']}');
        },
      ),
    );
  }
}
