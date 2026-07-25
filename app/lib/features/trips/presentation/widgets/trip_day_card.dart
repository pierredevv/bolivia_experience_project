import 'package:flutter/material.dart';
import '../../../../config/colors.dart';
import 'trip_item_tile.dart';

class TripDayCard extends StatelessWidget {
  final Map<String, dynamic> day;
  final VoidCallback? onAddItem;
  final void Function(String itemId)? onDeleteItem;

  const TripDayCard({
    super.key,
    required this.day,
    this.onAddItem,
    this.onDeleteItem,
  });

  @override
  Widget build(BuildContext context) {
    final dayNumber = day['dayNumber'] ?? 0;
    final dateStr = day['date'] as String? ?? '';
    final description = day['description'] as String?;
    final items = (day['items'] as List<dynamic>?) ?? [];

    String formattedDate = '';
    if (dateStr.isNotEmpty) {
      try {
        final date = DateTime.parse(dateStr);
        formattedDate =
            '${date.day} de ${_monthName(date.month)} ${date.year}';
      } catch (_) {
        formattedDate = dateStr;
      }
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: const BoxDecoration(
                color: AppColors.primary700,
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Text(
                  '$dayNumber',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Dia $dayNumber',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  if (formattedDate.isNotEmpty)
                    Text(
                      formattedDate,
                      style: const TextStyle(
                        fontSize: 13,
                        color: AppColors.neutral500,
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
        if (description != null && description.isNotEmpty) ...[
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.only(left: 48),
            child: Text(
              description,
              style: const TextStyle(
                fontSize: 13,
                color: AppColors.neutral600,
              ),
            ),
          ),
        ],
        const SizedBox(height: 12),
        if (items.isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(left: 48),
            child: Column(
              children: items.map<Widget>((item) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: TripItemTile(
                    item: item,
                    onDelete: onDeleteItem != null
                        ? () => onDeleteItem!(item['id'])
                        : null,
                  ),
                );
              }).toList(),
            ),
          )
        else
          Padding(
            padding: const EdgeInsets.only(left: 48),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.neutral50,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: AppColors.neutral200,
                  style: BorderStyle.solid,
                ),
              ),
              child: const Text(
                'Sin actividades programadas',
                style: TextStyle(
                  color: AppColors.neutral400,
                  fontSize: 13,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ),
        if (onAddItem != null)
          Padding(
            padding: const EdgeInsets.only(left: 48, top: 8),
            child: InkWell(
              onTap: onAddItem,
              borderRadius: BorderRadius.circular(8),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  color: AppColors.primary50,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.add, size: 18, color: AppColors.primary700),
                    SizedBox(width: 6),
                    Text(
                      'Agregar actividad',
                      style: TextStyle(
                        color: AppColors.primary700,
                        fontWeight: FontWeight.w600,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
      ],
    );
  }

  String _monthName(int month) {
    const months = [
      '', 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    return month >= 1 && month <= 12 ? months[month] : '';
  }
}
