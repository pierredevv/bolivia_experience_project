import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../config/colors.dart';

/// Tile de un item del itinerario. Puede referenciar un lugar (ver lugares),
/// un item manual o una experiencia/producto del catÃ¡logo (badge "Experiencia").
class TripItemTile extends StatelessWidget {
  final Map<String, dynamic> item;
  final VoidCallback? onDelete;

  const TripItemTile({super.key, required this.item, this.onDelete});

  @override
  Widget build(BuildContext context) {
    final timeSlot = item['timeSlot'] as String?;
    final title = item['title'] as String? ?? '';
    final description = item['description'] as String?;
    final placeId = item['placeId'] as String?;
    final productId = item['productId'] as String?;
    final isProduct = productId != null ||
        (item['placeId'] == null && item['title'] != null &&
            (item['tipo'] != null || item['product'] != null));

    return InkWell(
      onTap: placeId != null ? () => context.push('/places/$placeId') : null,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: AppColors.neutral50,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppColors.neutral200),
        ),
        child: Row(
          children: [
            if (timeSlot != null && timeSlot.isNotEmpty) ...[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.neutral200,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  timeSlot,
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: AppColors.neutral600,
                  ),
                ),
              ),
              const SizedBox(width: 10),
            ],
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          title,
                          style: const TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                          ),
                        ),
                      ),
                      if (isProduct) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 6,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.neutral100,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.tour_outlined,
                                size: 11,
                                color: AppColors.neutral500,
                              ),
                              SizedBox(width: 2),
                              Text(
                                'Experiencia',
                                style: TextStyle(
                                  fontSize: 9,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.neutral500,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ] else ...[
                        const Icon(
                          Icons.chevron_right,
                          size: 18,
                          color: AppColors.neutral300,
                        ),
                      ],
                    ],
                  ),
                  if (description != null && description.isNotEmpty) ...[
                    const SizedBox(height: 2),
                    Text(
                      description,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.neutral500,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ],
              ),
            ),
            if (onDelete != null) ...[
              const SizedBox(width: 4),
              InkWell(
                onTap: onDelete,
                borderRadius: BorderRadius.circular(6),
                child: const Padding(
                  padding: EdgeInsets.all(4),
                  child: Icon(
                    Icons.clear,
                    size: 16,
                    color: AppColors.neutral400,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

