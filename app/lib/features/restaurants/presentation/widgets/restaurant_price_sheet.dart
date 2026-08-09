import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../config/colors.dart';
import '../providers/restaurants_provider.dart';

/// Filtro de nivel de precio por cuartiles ($/$$/$$$/$$$$).
class RestaurantPriceSheet extends ConsumerStatefulWidget {
  const RestaurantPriceSheet({super.key});

  @override
  ConsumerState<RestaurantPriceSheet> createState() =>
      _RestaurantPriceSheetState();
}

class _RestaurantPriceSheetState extends ConsumerState<RestaurantPriceSheet> {
  late Set<int> _selected;

  @override
  void initState() {
    super.initState();
    _selected = Set<int>.from(ref.read(restaurantsProvider).filters.priceLevels);
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
                'Rango de precio',
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
          const Text(
            'El precio se muestra en niveles según el costo por persona.',
            style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
          ),
          const SizedBox(height: 16),
          Column(
            children: [
              for (var level = 1; level <= 4; level++)
                CheckboxListTile(
                  contentPadding: EdgeInsets.zero,
                  controlAffinity: ListTileControlAffinity.leading,
                  dense: true,
                  activeColor: AppColors.brandEmerald,
                  value: _selected.contains(level),
                  title: Text(
                    List.filled(level, '\$').join(),
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: _selected.contains(level)
                          ? AppColors.brandDark
                          : AppColors.neutral600,
                    ),
                  ),
                  onChanged: (v) {
                    setState(() {
                      if (v == true) {
                        _selected.add(level);
                      } else {
                        _selected.remove(level);
                      }
                    });
                  },
                ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () {
                    setState(() => _selected.clear());
                  },
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.brandDark,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    side: const BorderSide(color: AppColors.borderSubtle),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text('Borrar',
                      style: TextStyle(fontWeight: FontWeight.w600)),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                flex: 2,
                child: ElevatedButton(
                  onPressed: () {
                    final notifier = ref.read(restaurantsProvider.notifier);
                    notifier.clearPriceLevels();
                    for (final level in _selected) {
                      notifier.togglePriceLevel(level);
                    }
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
                  child: const Text('Aplicar',
                      style: TextStyle(
                          fontSize: 16, fontWeight: FontWeight.w600)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
