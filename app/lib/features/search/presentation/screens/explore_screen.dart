import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../config/colors.dart';
import '../../data/categories_service.dart';
import '../providers/categories_provider.dart';

class ExploreScreen extends ConsumerWidget {
  const ExploreScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final categoriesAsync = ref.watch(categoriesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Explorar'),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Buscar lugares, eventos...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.tune),
                  onPressed: () {},
                ),
              ),
            ),
          ),
          Expanded(
            child: categoriesAsync.when(
              loading: () => const Center(
                child: CircularProgressIndicator(),
              ),
              error: (error, stack) => Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.error_outline, size: 48, color: AppColors.error500),
                    const SizedBox(height: 16),
                    Text(
                      'Error al cargar categorías',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      error.toString(),
                      style: Theme.of(context).textTheme.bodySmall,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () => ref.refresh(categoriesProvider),
                      child: const Text('Reintentar'),
                    ),
                  ],
                ),
              ),
              data: (categories) {
                if (categories.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.category_outlined, size: 48, color: AppColors.neutral400),
                        const SizedBox(height: 16),
                        Text(
                          'No hay categorías disponibles',
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                      ],
                    ),
                  );
                }
                return GridView.builder(
                  padding: const EdgeInsets.all(16),
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: MediaQuery.of(context).size.width > 600 ? 4 : 3,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    childAspectRatio: 0.9,
                  ),
                  itemCount: categories.length,
                  itemBuilder: (context, index) {
                    final category = categories[index];
                    return _CategoryCard(category: category);
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _CategoryCard extends StatelessWidget {
  final Category category;

  const _CategoryCard({required this.category});

  IconData _getIcon(String iconName) {
    switch (iconName) {
      case 'restaurant':
        return Icons.restaurant;
      case 'hotel':
        return Icons.hotel;
      case 'local_bar':
        return Icons.local_bar;
      case 'local_cafe':
        return Icons.local_cafe;
      case 'place':
        return Icons.place;
      case 'park':
        return Icons.park;
      case 'museum':
        return Icons.museum;
      case 'shopping_cart':
        return Icons.shopping_cart;
      case 'sports_soccer':
        return Icons.sports_soccer;
      case 'build':
        return Icons.build;
      case 'church':
        return Icons.church;
      case 'directions_bus':
        return Icons.directions_bus;
      default:
        return Icons.category;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      clipBehavior: Clip.hardEdge,
      child: InkWell(
        onTap: () {
          context.push('/places/category/${category.slug}?name=${category.name}');
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                _getIcon(category.icon),
                size: 36,
                color: AppColors.primary700,
              ),
              const SizedBox(height: 8),
              Flexible(
                child: Text(
                  category.name,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              if (category.placeCount > 0) ...[
                const SizedBox(height: 4),
                Text(
                  '${category.placeCount} lugares',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppColors.neutral500,
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
