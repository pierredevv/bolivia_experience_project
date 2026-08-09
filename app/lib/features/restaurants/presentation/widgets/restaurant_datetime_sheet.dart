import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../config/colors.dart';
import '../../data/restaurant_catalogs.dart';
import '../providers/restaurants_provider.dart';

/// Selector de fecha + hora de la reserva de mesa.
class RestaurantDateTimeSheet extends ConsumerStatefulWidget {
  const RestaurantDateTimeSheet({super.key});

  @override
  ConsumerState<RestaurantDateTimeSheet> createState() =>
      _RestaurantDateTimeSheetState();
}

class _RestaurantDateTimeSheetState
    extends ConsumerState<RestaurantDateTimeSheet> {
  late DateTime _date;
  late String _time;

  @override
  void initState() {
    super.initState();
    final f = ref.read(restaurantsProvider).filters;
    _date = f.date;
    _time = f.time;
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final picked = await showDatePicker(
      context: context,
      firstDate: today,
      lastDate: today.add(const Duration(days: 60)),
      initialDate: _date,
      builder: (context, child) => Theme(
        data: Theme.of(context).copyWith(
          colorScheme: const ColorScheme.light(primary: AppColors.brandDark),
        ),
        child: child!,
      ),
    );
    if (picked != null) setState(() => _date = picked);
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Fecha y hora',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.neutral900,
                ),
              ),
              IconButton(
                icon: const Icon(Icons.close),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Fecha
          const Text(
            'Fecha',
            style: TextStyle(fontSize: 14, color: AppColors.neutral700),
          ),
          const SizedBox(height: 8),
          InkWell(
            onTap: _pickDate,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              decoration: BoxDecoration(
                color: AppColors.neutral100,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  const Icon(Icons.calendar_today_rounded,
                      size: 18, color: AppColors.brandDark),
                  const SizedBox(width: 10),
                  Text(
                    DateFormat('EEEE, d \'de\' MMMM').format(_date),
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: AppColors.brandDark,
                    ),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 16),
          const Text(
            'Hora',
            style: TextStyle(fontSize: 14, color: AppColors.neutral700),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: kReservationTimes.map((t) {
              final selected = _time == t;
              return ChoiceChip(
                label: Text(t),
                selected: selected,
                onSelected: (_) => setState(() => _time = t),
                selectedColor: AppColors.brandDark,
                labelStyle: TextStyle(
                  color: selected ? Colors.white : AppColors.neutral700,
                ),
                checkmarkColor: Colors.white,
              );
            }).toList(),
          ),

          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                ref.read(restaurantsProvider.notifier).setDateTime(_time, _date);
                Navigator.pop(context);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.brandDark,
                foregroundColor: Colors.white,
                elevation: 0,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text(
                'Aplicar',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
