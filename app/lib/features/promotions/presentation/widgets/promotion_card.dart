import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../config/colors.dart';
import '../../data/promotion_service.dart';

class PromotionCard extends StatelessWidget {
  final Promotion promotion;
  final VoidCallback? onTap;

  const PromotionCard({
    super.key,
    required this.promotion,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Photo
            if (promotion.photoUrl != null)
              SizedBox(
                height: 160,
                width: double.infinity,
                child: CachedNetworkImage(
                  imageUrl: promotion.photoUrl!,
                  fit: BoxFit.cover,
                  placeholder: (_, __) => Container(color: AppColors.secondary100),
                  errorWidget: (_, __, ___) => Container(
                    color: AppColors.secondary100,
                    child: Center(
                      child: Icon(Icons.local_offer, size: 48, color: AppColors.secondary700),
                    ),
                  ),
                ),
              )
            else
              Container(
                height: 120,
                width: double.infinity,
                color: AppColors.secondary100,
                child: Center(
                  child: Icon(Icons.local_offer, size: 48, color: AppColors.secondary700),
                ),
              ),

            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      if (promotion.discountPercentage != null)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.secondary700,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            '${promotion.discountPercentage!.toInt()}% OFF',
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        ),
                      const Spacer(),
                      if (promotion.place != null)
                        Text(
                          promotion.place!['name'] ?? '',
                          style: Theme.of(context).textTheme.bodySmall,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    promotion.title,
                    style: Theme.of(context).textTheme.titleMedium,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (promotion.startDate != null || promotion.endDate != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Row(
                        children: [
                          Icon(Icons.access_time, size: 14, color: AppColors.neutral500),
                          const SizedBox(width: 4),
                          Text(
                            _formatDateRange(promotion.startDate, promotion.endDate),
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatDateRange(String? start, String? end) {
    if (start != null && end != null) return '$start — $end';
    return start ?? end ?? '';
  }
}
