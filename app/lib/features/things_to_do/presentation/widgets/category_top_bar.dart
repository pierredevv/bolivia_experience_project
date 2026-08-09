import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../config/colors.dart';
import '../../../search/data/categories_service.dart';
import '../providers/things_to_do_provider.dart';

/// Categorías fijas del top bar de "Cosas que hacer en Santa Cruz".
/// - `slug != null` → filtro por categoría (feed de lugares).
/// - `slug == null` → filtro local sobre la lista de tours.
const kTopBarCategories = <({String label, String? slug})>[
  (label: 'Atracciones', slug: 'atracciones'),
  (label: 'Tours', slug: null),
  (label: 'Excursiones de un día', slug: null),
  (label: 'Actividades al Aire libre', slug: null),
  (label: 'Comida y Bebida', slug: 'restaurantes'),
  (label: 'Compras', slug: 'centros-comerciales'),
  (label: 'Bares y Vida Nocturna', slug: 'bares'),
  (label: 'Parques y Naturaleza', slug: 'parques'),
];

/// Convierte un chip del top bar a un [ThingsToDoFilter].
ThingsToDoFilter _filterFor(({String label, String? slug}) cat) {
  if (cat.slug != null) {
    return ThingsToDoFilter(
      type: ThingsToDoFilterType.category,
      slug: cat.slug,
      label: cat.label,
    );
  }
  final type = switch (cat.label) {
    'Tours' => ThingsToDoFilterType.tours,
    'Excursiones de un día' => ThingsToDoFilterType.oneDay,
    'Actividades al Aire libre' => ThingsToDoFilterType.outdoor,
    _ => ThingsToDoFilterType.all,
  };
  return ThingsToDoFilter(type: type, label: cat.label);
}

/// Barra horizontal de categorías (sticky, fuera del scroll del listado).
/// El chip "Todo" es el filtro por defecto; los chips con slug cargan el feed
/// de esa categoría dentro de la misma vista; "Más categorías" abre el grid
/// de todas las categorías y al volver aplica la categoría elegida.
///
/// Por defecto lee/escribe el [thingsToDoProvider]. Se puede inyectar un
/// [ThingsToDoFilter] y callbacks para reutilizarla en otras vistas (por
/// ejemplo la de "Experiencias imprescindibles"), donde el filtro aplica a
/// un subconjunto local en vez del feed de lugares.
class CategoryTopBar extends ConsumerWidget {
  const CategoryTopBar({
    super.key,
    this.filter,
    this.onSelect,
    this.onSelectCategory,
  });

  /// Filtro activo. Si es null, se usa el del [thingsToDoProvider].
  final ThingsToDoFilter? filter;

  /// Callback al seleccionar un chip. Si es null, usa el notifier por defecto.
  final ValueChanged<ThingsToDoFilter>? onSelect;

  /// Callback al elegir una categoría desde "Más categorías". Si es null,
  /// aplica la categoría al notifier por defecto.
  final ValueChanged<Category>? onSelectCategory;

  Future<void> _openAllCategories(BuildContext context, WidgetRef ref) async {
    final result = await context.push<Category>('/things-to-do/categories');
    if (result == null || !context.mounted) return;
    final onSelectCategory = this.onSelectCategory;
    if (onSelectCategory != null) {
      onSelectCategory(result);
      return;
    }
    ref.read(thingsToDoProvider.notifier).selectFilter(
          ThingsToDoFilter(
            type: ThingsToDoFilterType.category,
            slug: result.slug,
            label: result.name,
          ),
        );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(thingsToDoProvider);
    final notifier = ref.read(thingsToDoProvider.notifier);
    final activeFilter = filter ?? state.filter;
    final select = onSelect ??
        (ThingsToDoFilter f) => notifier.selectFilter(f);
    const allFilter = ThingsToDoFilter();

    return SizedBox(
      height: 46,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        children: [
          _CategoryPill(
            label: 'Todo',
            selected: activeFilter.matches(allFilter),
            onTap: () => select(const ThingsToDoFilter()),
          ),
          for (final cat in kTopBarCategories) ...[
            const SizedBox(width: 8),
            _CategoryPill(
              label: cat.label,
              selected: activeFilter.matches(_filterFor(cat)),
              onTap: () => select(_filterFor(cat)),
            ),
          ],
          // "Más categorías" al final de la barra
          const SizedBox(width: 8),
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: GestureDetector(
              onTap: () => _openAllCategories(context, ref),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14),
                decoration: BoxDecoration(
                  color: AppColors.brandDark,
                  borderRadius: BorderRadius.circular(24),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.grid_view_rounded,
                        size: 16, color: Colors.white),
                    SizedBox(width: 6),
                    Text(
                      'Más categorías',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _CategoryPill extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _CategoryPill({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14),
        decoration: BoxDecoration(
          color: selected ? AppColors.brandDark : Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: selected ? AppColors.brandDark : AppColors.borderSubtle,
          ),
          boxShadow: selected
              ? null
              : [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.03),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
        ),
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: selected ? Colors.white : AppColors.textSecondary,
            ),
          ),
        ),
      ),
    );
  }
}
