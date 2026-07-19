import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../config/colors.dart';
import '../../data/map_service.dart';

class PlaceBottomSheet extends StatelessWidget {
  final MapPlace place;
  final VoidCallback onClose;

  const PlaceBottomSheet({
    super.key,
    required this.place,
    required this.onClose,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.15),
            blurRadius: 20,
            offset: const Offset(0, -5),
          ),
        ],
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

          // Content
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Photo and Info Row
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Photo
                    Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        color: AppColors.neutral200,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: place.primaryPhoto != null
                          ? ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: CachedNetworkImage(
                                imageUrl: place.primaryPhoto!,
                                fit: BoxFit.cover,
                                placeholder: (context, url) => Center(
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: AppColors.primary600,
                                  ),
                                ),
                                errorWidget: (context, url, error) => Center(
                                  child: Icon(Icons.image, color: AppColors.neutral400),
                                ),
                              ),
                            )
                          : Center(
                              child: Icon(Icons.place, size: 32, color: AppColors.neutral400),
                            ),
                    ),
                    const SizedBox(width: 12),

                    // Info
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            place.name,
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),
                          if (place.categoryName != null)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: AppColors.primary50,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                place.categoryName!,
                                style: TextStyle(
                                  color: AppColors.primary700,
                                  fontSize: 11,
                                ),
                              ),
                            ),
                          const SizedBox(height: 6),
                          Row(
                            children: [
                              Icon(Icons.star, size: 14, color: AppColors.secondary500),
                              const SizedBox(width: 4),
                              Text(
                                '${place.ratingAvg.toStringAsFixed(1)} (${place.ratingCount})',
                                style: Theme.of(context).textTheme.bodySmall,
                              ),
                              if (place.distanceMeters != null) ...[
                                const SizedBox(width: 12),
                                Icon(Icons.location_on, size: 12, color: AppColors.neutral400),
                                const SizedBox(width: 4),
                                Text(
                                  _formatDistance(place.distanceMeters!),
                                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                    color: AppColors.neutral500,
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ],
                      ),
                    ),

                    // Close button
                    IconButton(
                      icon: Icon(Icons.close, color: AppColors.neutral500),
                      onPressed: onClose,
                    ),
                  ],
                ),

                // Address
                if (place.address != null) ...[
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Icon(Icons.location_on, size: 16, color: AppColors.neutral500),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          place.address!,
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppColors.neutral600,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ],

                const SizedBox(height: 16),

                // Action Buttons
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () => _openMaps(context),
                        icon: const Icon(Icons.directions, size: 18),
                        label: const Text('Cómo llegar'),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          side: BorderSide(color: AppColors.primary700),
                          foregroundColor: AppColors.primary700,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () => _viewDetails(context),
                        icon: const Icon(Icons.info_outline, size: 18),
                        label: const Text('Ver detalles'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary700,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 12),
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

  String _formatDistance(double meters) {
    if (meters < 1000) {
      return '${meters.round()} m';
    } else {
      return '${(meters / 1000).toStringAsFixed(1)} km';
    }
  }

  void _openMaps(BuildContext context) async {
    final url = 'https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}';
    if (await canLaunchUrl(Uri.parse(url))) {
      await launchUrl(Uri.parse(url));
    }
  }

  void _viewDetails(BuildContext context) {
    context.push('/places/${place.id}');
  }
}
