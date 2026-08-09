import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../config/colors.dart';
import '../../../search/data/categories_service.dart';
import '../../../search/presentation/providers/categories_provider.dart';

/// Vista "Todas las categorías": lista todas las categorías registradas en la
/// app (misma fuente de datos que la vista Explorar).
class AllCategoriesScreen extends ConsumerWidget {
  const AllCategoriesScreen({super.key});

  IconData _getIcon(String iconName) {
    switch (iconName) {
      case 'restaurant':
      case 'restaurant_menu':
        return Icons.restaurant;
      case 'hotel':
        return Icons.hotel;
      case 'local_bar':
      case 'nightlife':
        return Icons.local_bar;
      case 'local_cafe':
      case 'coffee':
        return Icons.local_cafe;
      case 'place':
        return Icons.place;
      case 'park':
        return Icons.park;
      case 'museum':
        return Icons.museum;
      case 'shopping_cart':
      case 'shopping_bag':
        return Icons.shopping_cart;
      case 'sports_soccer':
        return Icons.sports_soccer;
      case 'build':
        return Icons.build;
      case 'church':
        return Icons.church;
      case 'directions_bus':
        return Icons.directions_bus;
      case 'landscape':
        return Icons.landscape;
      default:
        return Icons.category_outlined;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final categoriesAsync = ref.watch(categoriesProvider);

    return Scaffold(
      backgroundColor: AppColors.backgroundCanvas,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
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
                      'Todas las categorías',
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
            Expanded(
              child: categoriesAsync.when(
                loading: () => const Center(
                  child: CircularProgressIndicator(
                      color: AppColors.brandEmerald),
                ),
                error: (error, stack) => Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline,
                          size: 48, color: AppColors.error500),
                      const SizedBox(height: 12),
                      const Text(
                        'Error al cargar las categorías',
                        style: TextStyle(
                            fontSize: 14, color: AppColors.textSecondary),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () => ref.refresh(categoriesProvider),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.brandDark,
                          foregroundColor: Colors.white,
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10)),
                        ),
                        child: const Text('Reintentar'),
                      ),
                    ],
                  ),
                ),
                data: (categories) {
                  // Los tipos de cocina (`cocina-*`) son subcategorías de
                  // restaurantes, no categorías de lugar; se filtran aquí.
                  final visible =
                      categories.where((c) => !c.slug.startsWith('cocina-')).toList();
                  if (visible.isEmpty) {
                    return const Center(
                      child: Text(
                        'No hay categorías disponibles',
                        style: TextStyle(
                            fontSize: 14, color: AppColors.textSecondary),
                      ),
                    );
                  }
                  return GridView.builder(
                    padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 3,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      childAspectRatio: 0.88,
                    ),
                    itemCount: visible.length,
                    itemBuilder: (context, index) {
                      final category = visible[index];
                      return _CategoryCard(
                        category: category,
                        icon: _getIcon(category.icon),
                      );
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Card de categoría (mismo diseño que la de la vista Explorar).
class _CategoryCard extends StatelessWidget {
  final Category category;
  final IconData icon;

  const _CategoryCard({required this.category, required this.icon});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.pop(category),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.borderSubtle),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                  color: AppColors.brandDark.withValues(alpha: 0.06),
                  borderRadius: BorderRadius.circular(13),
                ),
                child: Icon(icon, size: 24, color: AppColors.brandDark),
              ),
              const SizedBox(height: 8),
              Flexible(
                child: Text(
                  category.name,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: AppColors.brandDark,
                  ),
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              if (category.placeCount > 0) ...[
                const SizedBox(height: 3),
                Text(
                  '${category.placeCount} lugares',
                  style: const TextStyle(
                    fontSize: 10,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
