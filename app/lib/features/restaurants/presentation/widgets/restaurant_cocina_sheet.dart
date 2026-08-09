import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../config/colors.dart';
import '../providers/restaurants_provider.dart';

/// Selector de tipos de cocina (categorías `cocina-*` del backend).
class RestaurantCocinaSheet extends ConsumerStatefulWidget {
  const RestaurantCocinaSheet({super.key});

  @override
  ConsumerState<RestaurantCocinaSheet> createState() =>
      _RestaurantCocinaSheetState();
}

class _RestaurantCocinaSheetState
    extends ConsumerState<RestaurantCocinaSheet> {
  late Set<String> _selected;

  @override
  void initState() {
    super.initState();
    _selected = Set<String>.from(
        ref.read(restaurantsProvider).filters.cocinaSlugs);
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(restaurantsProvider);
    final cocinaCategories = state.cocinaCategories;

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
                'Tipo de cocina',
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
          if (cocinaCategories.isEmpty)
            const Text(
              'No hay tipos de cocina disponibles.',
              style: TextStyle(fontSize: 14, color: AppColors.textSecondary),
            )
          else
            Flexible(
              child: ListView(
                shrinkWrap: true,
                children: cocinaCategories.map((c) {
                  final slug = c['slug']?.toString() ?? '';
                  final name = c['name']?.toString() ?? slug;
                  final checked = _selected.contains(slug);
                  return CheckboxListTile(
                    contentPadding: EdgeInsets.zero,
                    controlAffinity: ListTileControlAffinity.leading,
                    dense: true,
                    activeColor: AppColors.brandEmerald,
                    value: checked,
                    title: Text(
                      name,
                      style: const TextStyle(
                        fontSize: 15,
                        color: AppColors.neutral800,
                      ),
                    ),
                    onChanged: (v) {
                      setState(() {
                        if (v == true) {
                          _selected.add(slug);
                        } else {
                          _selected.remove(slug);
                        }
                      });
                    },
                  );
                }).toList(),
              ),
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
                    notifier.clearCocina();
                    for (final slug in _selected) {
                      notifier.toggleCocina(slug);
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
