import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../../../core/services/deep_link_service.dart';
import '../../../../core/services/location_service.dart';
import '../../data/map_service.dart';

// ── Brand tokens ──────────────────────────────────────────────────────────────
const _brandDark = Color(0xFF0F172A);
const _brandGold = Color(0xFFF59E0B);
const _borderSubtle = Color(0xFFE2E8F0);
const _textSecondary = Color(0xFF64748B);

class PlacePreviewSheet extends StatelessWidget {
  final MapPlace place;
  final LatLng? userLocation;

  const PlacePreviewSheet({
    super.key,
    required this.place,
    this.userLocation,
  });

  // ── Untouched helpers ─────────────────────────────────────────────────────
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
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag handle
          Container(
            margin: const EdgeInsets.only(top: 12),
            width: 36,
            height: 4,
            decoration: BoxDecoration(
              color: _borderSubtle,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 4),

          // ── Hero image ────────────────────────────────────────────────
          if (place.primaryPhoto != null) ...[
            const SizedBox(height: 10),
            ClipRRect(
              borderRadius: BorderRadius.zero,
              child: Image.network(
                place.primaryPhoto!,
                height: 160,
                width: double.infinity,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Container(
                  height: 160,
                  color: _borderSubtle,
                  child: const Center(
                    child: Icon(Icons.image_outlined,
                        size: 40, color: _textSecondary),
                  ),
                ),
              ),
            ),
          ] else ...[
            const SizedBox(height: 10),
            Container(
              height: 80,
              width: double.infinity,
              color: _borderSubtle,
              child: const Center(
                child: Icon(Icons.map_outlined,
                    size: 32, color: _textSecondary),
              ),
            ),
          ],

          // ── Info section ──────────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Name
                Text(
                  place.name,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: _brandDark,
                    letterSpacing: -0.3,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 8),

                // Meta row: category + rating + distance
                Row(
                  children: [
                    if (categoryName.isNotEmpty) ...[
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: _brandDark.withValues(alpha: 0.06),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(_getCategoryIcon(categorySlug),
                                size: 11, color: _brandDark),
                            const SizedBox(width: 4),
                            Text(
                              categoryName,
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w500,
                                color: _brandDark,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                    ],
                    // Gold rating badge
                    const Icon(Icons.star_rounded,
                        size: 14, color: _brandGold),
                    const SizedBox(width: 3),
                    Text(
                      ratingDisplay,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: _brandDark,
                      ),
                    ),
                    if (place.ratingCount > 0) ...[
                      const SizedBox(width: 3),
                      Text(
                        '(${place.ratingCount})',
                        style: const TextStyle(
                            fontSize: 11, color: _textSecondary),
                      ),
                    ],
                  ],
                ),

                // Distance
                if (distanceText.isNotEmpty) ...[
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(Icons.directions_walk_rounded,
                          size: 13, color: _textSecondary),
                      const SizedBox(width: 4),
                      Text(
                        '$distanceText de ti',
                        style: const TextStyle(
                            fontSize: 12, color: _textSecondary),
                      ),
                    ],
                  ),
                ],

                // Address
                if (place.address != null && place.address!.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.location_on_outlined,
                          size: 13, color: _textSecondary),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          place.address!,
                          style: const TextStyle(
                              fontSize: 12, color: _textSecondary),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ],

                const SizedBox(height: 18),

                // ── Action buttons ─────────────────────────────────────
                Row(
                  children: [
                    // Directions — outlined
                    Expanded(
                      child: SizedBox(
                        height: 50,
                        child: OutlinedButton.icon(
                          onPressed: () {
                            Navigator.pop(context);
                            DeepLinkService.openDirections(
                              latitude: place.latitude,
                              longitude: place.longitude,
                              label: place.name,
                            );
                          },
                          icon: const Icon(Icons.directions_rounded, size: 17),
                          label: const Text('Cómo llegar'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: _brandDark,
                            side: const BorderSide(color: _borderSubtle, width: 1.2),
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12)),
                            textStyle: const TextStyle(
                                fontSize: 13, fontWeight: FontWeight.w600),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    // Ver detalle — filled dark
                    Expanded(
                      child: SizedBox(
                        height: 50,
                        child: ElevatedButton.icon(
                          onPressed: () {
                            Navigator.pop(context);
                            context.push('/places/${place.id}');
                          },
                          icon: const Icon(Icons.arrow_forward_rounded, size: 17),
                          label: const Text('Ver Detalle'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: _brandDark,
                            foregroundColor: Colors.white,
                            elevation: 0,
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12)),
                            textStyle: const TextStyle(
                                fontSize: 13, fontWeight: FontWeight.w600),
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
