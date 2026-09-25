import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:bolivia_experience/config/colors.dart';
import 'package:bolivia_experience/features/travel_tips/data/travel_tips_service.dart';
import 'package:bolivia_experience/features/travel_tips/presentation/providers/travel_tips_provider.dart';

const _categories = <String>[
  'Todos',
  'transporte',
  'seguridad',
  'cultura',
  'gastronomia',
];

String _categoryLabel(String category) {
  switch (category) {
    case 'transporte':
      return 'Transporte';
    case 'seguridad':
      return 'Seguridad';
    case 'cultura':
      return 'Cultura';
    case 'gastronomia':
      return 'Gastronomia';
    default:
      return category;
  }
}

class TravelTipsScreen extends ConsumerStatefulWidget {
  const TravelTipsScreen({super.key});

  @override
  ConsumerState<TravelTipsScreen> createState() => _TravelTipsScreenState();
}

class _TravelTipsScreenState extends ConsumerState<TravelTipsScreen> {
  String _selected = 'Todos';

  @override
  Widget build(BuildContext context) {
    final tipsAsync = ref.watch(travelTipsListProvider);

    return Scaffold(
      backgroundColor: AppColors.neutral50,
      appBar: AppBar(
        title: const Text('Tips de viaje'),
        backgroundColor: AppColors.primary600,
        foregroundColor: Colors.white,
      ),
      body: tipsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.cloud_off_outlined,
                  size: 40,
                  color: AppColors.neutral400,
                ),
                const SizedBox(height: 12),
                const Text(
                  'No pudimos cargar los tips',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppColors.neutral700,
                  ),
                ),
                const SizedBox(height: 16),
                FilledButton(
                  onPressed: () => ref.invalidate(travelTipsListProvider),
                  child: const Text('Reintentar'),
                ),
              ],
            ),
          ),
        ),
        data: (tips) {
          final filtered = _selected == 'Todos'
              ? tips
              : tips.where((t) => t.category == _selected).toList();
          return Column(
            children: [
              const SizedBox(height: 8),
              SizedBox(
                height: 44,
                child: ListView.separated(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  scrollDirection: Axis.horizontal,
                  itemCount: _categories.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 8),
                  itemBuilder: (context, index) {
                    final cat = _categories[index];
                    final isSelected = cat == _selected;
                    return ChoiceChip(
                      label: Text(_categoryLabel(cat)),
                      selected: isSelected,
                      onSelected: (_) => setState(() => _selected = cat),
                      selectedColor: AppColors.primary600,
                      labelStyle: TextStyle(
                        color: isSelected
                            ? Colors.white
                            : AppColors.neutral700,
                        fontSize: 13,
                        fontWeight:
                            isSelected ? FontWeight.w600 : FontWeight.w400,
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 12),
              Expanded(
                child: filtered.isEmpty
                    ? const Center(
                        child: Text(
                          'Sin tips para esta categoria',
                          style: TextStyle(color: AppColors.neutral500),
                        ),
                      )
                    : ListView.separated(
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                        itemCount: filtered.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 10),
                        itemBuilder: (context, index) =>
                            _TipCard(tip: filtered[index]),
                      ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _TipCard extends StatelessWidget {
  final TravelTip tip;

  const _TipCard({required this.tip});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.neutral200),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppColors.primary50,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(
              _categoryIcon(tip.category),
              color: AppColors.primary600,
              size: 22,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  tip.text,
                  style: const TextStyle(
                    fontSize: 14,
                    height: 1.35,
                    color: AppColors.neutral800,
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.neutral100,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    _categoryLabel(tip.category),
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppColors.neutral600,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  IconData _categoryIcon(String category) {
    switch (category) {
      case 'transporte':
        return Icons.directions_bus;
      case 'seguridad':
        return Icons.shield_outlined;
      case 'cultura':
        return Icons.account_balance_outlined;
      case 'gastronomia':
        return Icons.restaurant_outlined;
      default:
        return Icons.lightbulb_outline;
    }
  }
}
