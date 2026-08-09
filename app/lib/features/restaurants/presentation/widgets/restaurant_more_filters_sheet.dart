import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../config/colors.dart';
import '../../data/restaurant_catalogs.dart';
import '../../data/restaurant_filters.dart';
import '../providers/restaurants_provider.dart';

/// Panel "Más filtros": ordenamiento y opciones adicionales.
class RestaurantMoreFiltersSheet extends ConsumerStatefulWidget {
  const RestaurantMoreFiltersSheet({super.key});

  @override
  ConsumerState<RestaurantMoreFiltersSheet> createState() =>
      _RestaurantMoreFiltersSheetState();
}

class _RestaurantMoreFiltersSheetState
    extends ConsumerState<RestaurantMoreFiltersSheet> {
  late RestaurantFilters _f;

  @override
  void initState() {
    super.initState();
    _f = ref.read(restaurantsProvider).filters;
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
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Más filtros',
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
            const SizedBox(height: 8),

            // ── Ordenar por ────────────────────────────────────────────────
            const Text(
              'Ordenar por',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: AppColors.neutral800,
              ),
            ),
            const SizedBox(height: 8),
            RadioGroup<RestaurantSort>(
              groupValue: _f.sort,
              onChanged: (v) {
                if (v != null) setState(() => _f = _f.copyWith(sort: v));
              },
              child: Column(
                children: [
                  for (final sort in RestaurantSort.values)
                    _RadioTile<RestaurantSort>(
                      value: sort,
                      label: sort.label,
                      onTap: () =>
                          setState(() => _f = _f.copyWith(sort: sort)),
                    ),
                ],
              ),
            ),

            const SizedBox(height: 16),
            // ── Ofertas ────────────────────────────────────────────────────
            const Text(
              'Ofertas',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: AppColors.neutral800,
              ),
            ),
            const SizedBox(height: 8),
            _CheckTile(
              value: _f.cashbackOnly,
              label: 'Solo con cashback',
              onChanged: (v) => setState(() => _f = _f.copyWith(cashbackOnly: v)),
            ),

            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  ref.read(restaurantsProvider.notifier).setFilters(_f);
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
                child: const Text('Aplicar filtros',
                    style: TextStyle(
                        fontSize: 16, fontWeight: FontWeight.w600)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RadioTile<T> extends StatelessWidget {
  final T value;
  final String label;
  final VoidCallback onTap;

  const _RadioTile({
    required this.value,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Row(
          children: [
            Radio<T>(value: value, activeColor: AppColors.brandDark),
            const SizedBox(width: 4),
            Text(
              label,
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.neutral800,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CheckTile extends StatelessWidget {
  final bool value;
  final String label;
  final ValueChanged<bool> onChanged;

  const _CheckTile({
    required this.value,
    required this.label,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return CheckboxListTile(
      contentPadding: EdgeInsets.zero,
      controlAffinity: ListTileControlAffinity.leading,
      dense: true,
      activeColor: AppColors.brandEmerald,
      value: value,
      title: Text(
        label,
        style: const TextStyle(fontSize: 14, color: AppColors.neutral800),
      ),
      onChanged: (v) => onChanged(v ?? false),
    );
  }
}
