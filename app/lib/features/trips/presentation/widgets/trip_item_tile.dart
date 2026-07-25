import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../config/colors.dart';

class TripItemTile extends StatelessWidget {
  final Map<String, dynamic> item;
  final VoidCallback? onDelete;

  const TripItemTile({
    super.key,
    required this.item,
    this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final timeSlot = item['timeSlot'] as String?;
    final title = item['title'] as String? ?? '';
    final description = item['description'] as String?;
    final placeId = item['placeId'] as String?;

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
                  color: AppColors.primary50,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  timeSlot,
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: AppColors.primary700,
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
                      if (placeId != null)
                        const Icon(
                          Icons.chevron_right,
                          size: 18,
                          color: AppColors.neutral400,
                        ),
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
              const SizedBox(width: 8),
              GestureDetector(
                onTap: onDelete,
                child: const Icon(
                  Icons.close,
                  size: 16,
                  color: AppColors.neutral400,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
