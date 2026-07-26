import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../../../config/colors.dart';
import '../../../../core/services/deep_link_service.dart';
import '../../../../core/services/location_service.dart';
import '../../data/map_service.dart';

class PlacePreviewSheet extends StatelessWidget {
  final MapPlace place;
  final LatLng? userLocation;

  const PlacePreviewSheet({
    super.key,
    required this.place,
    this.userLocation,
  });

  String _getDistanceText() {
    if (userLocation == null) return '';
    final meters = LocationService.calculateDistance(
      userLocation!.latitude,
      userLocation!.longitude,
      place.latitude,
      place.longitude,
    );
    return LocationService.formatDistance(meters);
  }

  IconData _getCategoryIcon(String? slug) {
    switch (slug) {
      case 'restaurantes':
        return Icons.restaurant;
      case 'hoteles':
        return Icons.hotel;
      case 'cafeterias':
        return Icons.coffee;
      case 'naturaleza':
        return Icons.landscape;
      case 'parques':
        return Icons.park;
      case 'compras':
        return Icons.shopping_bag;
      case 'vida-nocturna':
        return Icons.nightlife;
      case 'cultura':
        return Icons.museum;
      default:
        return Icons.place;
    }
  }

  @override
  Widget build(BuildContext context) {
    final categoryName = place.category?['name'] as String? ?? '';
    final categorySlug = place.category?['slug'] as String?;
    final distanceText = _getDistanceText();
    final rating = place.ratingAvg;
    final ratingDisplay = rating != null
        ? (rating is double ? rating.toStringAsFixed(1) : rating.toString())
        : '0';

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle
          Container(
            margin: const EdgeInsets.only(top: 12),
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: AppColors.neutral300,
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // Photo
          if (place.primaryPhoto != null) ...[
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(0)),
              child: Image.network(
                place.primaryPhoto!,
                height: 120,
                width: double.infinity,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    height: 120,
                    color: AppColors.primary100,
                    child: const Center(
                      child: Icon(Icons.place, size: 48, color: AppColors.primary700),
                    ),
                  );
                },
              ),
            ),
          ],

          // Content
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Name
                Text(
                  place.name,
                  style: Theme.of(context).textTheme.titleLarge,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),

                const SizedBox(height: 4),

                // Category + Rating row
                Row(
                  children: [
                    if (categoryName.isNotEmpty) ...[
                      Icon(
                        _getCategoryIcon(categorySlug),
                        size: 14,
                        color: AppColors.primary700,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        categoryName,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.primary700,
                        ),
                      ),
                      const SizedBox(width: 12),
                    ],
                    const Icon(Icons.star, size: 14, color: AppColors.secondary500),
                    const SizedBox(width: 2),
                    Text(
                      ratingDisplay,
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                    if (place.ratingCount > 0) ...[
                      const SizedBox(width: 2),
                      Text(
                        '(${place.ratingCount})',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.neutral500,
                        ),
                      ),
                    ],
                  ],
                ),

                // Distance
                if (distanceText.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.directions_walk, size: 14, color: AppColors.neutral500),
                      const SizedBox(width: 4),
                      Text(
                        '$distanceText de ti',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.neutral500,
                        ),
                      ),
                    ],
                  ),
                ],

                // Address
                if (place.address != null && place.address!.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.location_on, size: 14, color: AppColors.neutral500),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          place.address!,
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppColors.neutral500,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ],

                const SizedBox(height: 16),

                // Action buttons
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () {
                          Navigator.pop(context);
                          DeepLinkService.openDirections(
                            latitude: place.latitude,
                            longitude: place.longitude,
                            label: place.name,
                          );
                        },
                        icon: const Icon(Icons.directions, size: 18),
                        label: const Text('Cómo llegar'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppColors.primary700,
                          side: const BorderSide(color: AppColors.primary700),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () {
                          Navigator.pop(context);
                          context.push('/places/${place.id}');
                        },
                        icon: const Icon(Icons.arrow_forward, size: 18),
                        label: const Text('Ver detalle'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary700,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
