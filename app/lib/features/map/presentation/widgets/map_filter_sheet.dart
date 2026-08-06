import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../config/colors.dart';
import '../../../search/data/categories_service.dart';
import '../../../search/presentation/providers/categories_provider.dart';
import '../providers/map_provider.dart';

class MapFilterSheet extends ConsumerStatefulWidget {
  const MapFilterSheet({super.key});

  @override
  ConsumerState<MapFilterSheet> createState() => _MapFilterSheetState();
}

class _MapFilterSheetState extends ConsumerState<MapFilterSheet> {
  String? _tempCategoryId;
  late double _tempRadius;

  @override
  void initState() {
    super.initState();
    final mapState = ref.read(mapProvider);
    _tempCategoryId = mapState.selectedCategoryId;
    _tempRadius = mapState.radiusKm;
  }

  @override
  Widget build(BuildContext context) {
    final categoriesAsync = ref.watch(categoriesProvider);

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Filtros del mapa',
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
          const Text(
            'Categorías',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AppColors.neutral700,
            ),
          ),
          const SizedBox(height: 8),
          categoriesAsync.when(
            data: (categories) => _buildCategoryChips(categories),
            loading: () => const SizedBox(
              height: 40,
              child: Center(child: CircularProgressIndicator()),
            ),
            error: (e, _) => const Text('Error al cargar categorías'),
          ),
          const SizedBox(height: 24),
          Text(
            'Radio: ${_tempRadius.toStringAsFixed(0)} km',
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AppColors.neutral700,
            ),
          ),
          Slider(
            value: _tempRadius,
            min: 1,
            max: 20,
            divisions: 19,
            activeColor: const Color(0xFF10B981),
            inactiveColor: const Color(0xFFE2E8F0),
            label: '${_tempRadius.toStringAsFixed(0)} km',
            onChanged: (value) {
              setState(() => _tempRadius = value);
            },
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _applyFilters,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0F172A),
                foregroundColor: Colors.white,
                elevation: 0,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text(
                'Aplicar filtros',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
            ),
          ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }

  Widget _buildCategoryChips(List<Category> categories) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        FilterChip(
          label: const Text('Todos'),
          selected: _tempCategoryId == null,
          onSelected: (_) {
            setState(() => _tempCategoryId = null);
          },
          selectedColor: AppColors.primary100,
          checkmarkColor: AppColors.primary700,
        ),
        ...categories.map(
          (cat) => FilterChip(
            label: Text(cat.name),
            selected: _tempCategoryId == cat.id,
            onSelected: (_) {
              setState(() {
                _tempCategoryId = _tempCategoryId == cat.id ? null : cat.id;
              });
            },
            selectedColor: const Color(0xFF10B981).withValues(alpha: 0.15),
            checkmarkColor: const Color(0xFF10B981),
          ),
        ),
      ],
    );
  }

  void _applyFilters() {
    final notifier = ref.read(mapProvider.notifier);
    notifier.setSelectedCategory(_tempCategoryId);
    notifier.setRadiusKm(_tempRadius);
    Navigator.pop(context);
  }
}
