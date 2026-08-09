import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../config/colors.dart';
import '../providers/things_to_do_provider.dart';
import '../widgets/category_top_bar.dart';
import '../widgets/essential_card.dart';

final essentialExperiencesProvider = FutureProvider<List<Map<String, dynamic>>>(
  (ref) async => ref.watch(toursServiceProvider).getEssentialExperiences(),
);

/// Vista "Experiencias imprescindibles en Santa Cruz": colección curada mixta
/// de lugares y productos con flag `esImprescindible`. Reutiliza el top bar de
/// categorías para filtrar el subconjunto localmente.
class EssentialScreen extends ConsumerStatefulWidget {
  const EssentialScreen({super.key});

  @override
  ConsumerState<EssentialScreen> createState() => _EssentialScreenState();
}

class _EssentialScreenState extends ConsumerState<EssentialScreen> {
  ThingsToDoFilter _filter = const ThingsToDoFilter();

  bool _matches(Map<String, dynamic> item, ThingsToDoFilter f) {
    final tipo = item['tipo'];
    String? categorySlug;
    if (tipo == 'place') {
      final category = item['category'];
      categorySlug = (category is Map) ? category['slug']?.toString() : null;
    } else {
      final place = item['place'];
      categorySlug = (place is Map) ? place['categorySlug']?.toString() : null;
    }

    switch (f.type) {
      case ThingsToDoFilterType.all:
        return true;
      case ThingsToDoFilterType.category:
        return categorySlug == f.slug;
      case ThingsToDoFilterType.tours:
        return tipo == 'product';
      case ThingsToDoFilterType.oneDay:
        final dias = item['duracionDias'];
        return tipo == 'product' && (dias is num ? dias.toInt() : 1) == 1;
      case ThingsToDoFilterType.outdoor:
        final sub = item['subcategoriaTour']?.toString();
        return tipo == 'product' &&
            (sub == 'naturaleza_vida_salvaje' ||
                sub == 'caminata_turistica');
    }
  }

  @override
  Widget build(BuildContext context) {
    final asyncItems = ref.watch(essentialExperiencesProvider);

    return Scaffold(
      backgroundColor: AppColors.backgroundCanvas,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Header ──────────────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 12),
              child: Row(
                children: [
                  IconButton(
                    onPressed: () => context.pop(),
                    icon: const Icon(Icons.arrow_back_rounded),
                    color: AppColors.brandDark,
                    visualDensity: VisualDensity.compact,
                  ),
                  const SizedBox(width: 4),
                  const Expanded(
                    child: Text(
                      'Experiencias imprescindibles',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: AppColors.brandDark,
                        letterSpacing: -0.3,
                        height: 1.2,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            // ── Top bar de categorías (filtro local) ────────────────────────
            CategoryTopBar(
              filter: _filter,
              onSelect: (f) => setState(() => _filter = f),
              onSelectCategory: (c) => setState(() {
                _filter = ThingsToDoFilter(
                  type: ThingsToDoFilterType.category,
                  slug: c.slug,
                  label: c.name,
                );
              }),
            ),
            const SizedBox(height: 12),
            Expanded(child: _buildBody(asyncItems)),
          ],
        ),
      ),
    );
  }

  Widget _buildBody(AsyncValue<List<Map<String, dynamic>>> asyncItems) {
    return asyncItems.when(
      loading: () => const Center(
        child: CircularProgressIndicator(color: AppColors.brandEmerald),
      ),
      error: (error, stack) => Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.cloud_off_rounded,
                  size: 64, color: AppColors.neutral400),
              const SizedBox(height: 16),
              const Text(
                'No se pudieron cargar las experiencias imprescindibles.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 15,
                  color: AppColors.neutral600,
                ),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () =>
                    ref.invalidate(essentialExperiencesProvider),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.brandDark,
                  foregroundColor: Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text('Reintentar'),
              ),
            ],
          ),
        ),
      ),
      data: (items) {
        final visible = _filter.type == ThingsToDoFilterType.all
            ? items
            : items.where((i) => _matches(i, _filter)).toList();

        if (items.isEmpty) {
          return const Center(
            child: Text(
              'No hay experiencias imprescindibles todavía.',
              style: TextStyle(fontSize: 15, color: AppColors.textSecondary),
            ),
          );
        }

        if (visible.isEmpty) {
          return ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            children: const [
              SizedBox(height: 120),
              Column(
                children: [
                  Icon(Icons.explore_outlined,
                      size: 56, color: AppColors.neutral400),
                  SizedBox(height: 14),
                  Text(
                    'Sin resultados',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: AppColors.brandDark,
                    ),
                  ),
                  SizedBox(height: 6),
                  Text(
                    'No encontramos experiencias para este filtro.',
                    style: TextStyle(
                        fontSize: 13, color: AppColors.textSecondary),
                  ),
                ],
              ),
            ],
          );
        }

        return ListView.builder(
          padding: const EdgeInsets.only(top: 8, bottom: 24),
          itemCount: visible.length,
          itemBuilder: (context, index) {
            final item = visible[index];
            final isPlace = item['tipo'] == 'place';
            return EssentialCard(
              item: item,
              onTap: () => context.push(
                isPlace
                    ? '/places/${item['id']}'
                    : '/experiences/${item['id']}',
              ),
            );
          },
        );
      },
    );
  }
}
