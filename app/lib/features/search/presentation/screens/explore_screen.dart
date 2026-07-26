import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../config/colors.dart';
import '../../../home/presentation/providers/home_provider.dart';
import '../../data/categories_service.dart';
import '../providers/categories_provider.dart';

class ExploreScreen extends ConsumerStatefulWidget {
  const ExploreScreen({super.key});

  @override
  ConsumerState<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends ConsumerState<ExploreScreen> {
  List<dynamic> _featuredPlaces = [];
  bool _loadingFeatured = true;

  @override
  void initState() {
    super.initState();
    _loadFeaturedPlaces();
  }

  Future<void> _loadFeaturedPlaces() async {
    setState(() => _loadingFeatured = true);
    try {
      final homeService = ref.read(homeServiceProvider);
      final places = await homeService.getFeaturedPlaces();
      if (mounted) {
        setState(() {
          _featuredPlaces = places;
          _loadingFeatured = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() => _loadingFeatured = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final categoriesAsync = ref.watch(categoriesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Explorar'),
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(categoriesProvider);
          await _loadFeaturedPlaces();
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Search bar
              Padding(
                padding: const EdgeInsets.all(16),
                child: GestureDetector(
                  onTap: () => context.push('/search'),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      color: AppColors.neutral100,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.neutral300),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.search, color: AppColors.neutral500),
                        SizedBox(width: 12),
                        Text(
                          '¿Qué estás buscando?',
                          style: TextStyle(color: AppColors.neutral500),
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              // Categories section
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Text(
                  'Explorar por categoría',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
              ),
              const SizedBox(height: 12),
              categoriesAsync.when(
                loading: () => const SizedBox(
                  height: 150,
                  child: Center(child: CircularProgressIndicator()),
                ),
                error: (error, stack) => SizedBox(
                  height: 150,
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.error_outline, size: 32, color: AppColors.error500),
                        const SizedBox(height: 8),
                        Text('Error al cargar categorías', style: Theme.of(context).textTheme.bodyMedium),
                        const SizedBox(height: 8),
                        ElevatedButton(
                          onPressed: () => ref.refresh(categoriesProvider),
                          child: const Text('Reintentar'),
                        ),
                      ],
                    ),
                  ),
                ),
                data: (categories) {
                  if (categories.isEmpty) {
                    return const SizedBox(
                      height: 100,
                      child: Center(child: Text('No hay categorías disponibles')),
                    );
                  }
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
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
                    ),
                  );
                },
              ),

              const SizedBox(height: 24),

              // Featured places section
              if (_featuredPlaces.isNotEmpty) ...[
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Lugares Destacados',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      TextButton(
                        onPressed: () => context.go('/'),
                        child: const Text('Ver todos'),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  height: 200,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: _featuredPlaces.length,
                    itemBuilder: (context, index) {
                      final place = _featuredPlaces[index];
                      return _FeaturedPlaceCard(place: place);
                    },
                  ),
                ),
                const SizedBox(height: 24),
              ],

              // Loading indicator for featured
              if (_loadingFeatured && _featuredPlaces.isEmpty)
                const SizedBox(
                  height: 200,
                  child: Center(child: CircularProgressIndicator()),
                ),

              const SizedBox(height: 16),
            ],
          ),
        ),
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

class _FeaturedPlaceCard extends StatelessWidget {
  final Map<String, dynamic> place;

  const _FeaturedPlaceCard({required this.place});

  @override
  Widget build(BuildContext context) {
    final photos = place['photos'];
    final photoUrl = (photos is List && photos.isNotEmpty && photos[0] is Map)
        ? photos[0]['url']?.toString()
        : null;
    final averageRating = place['ratingAvg'] ?? 0;
    final category = place['category'];

    return GestureDetector(
      onTap: () => context.push('/places/${place['id']}'),
      child: Card(
        margin: const EdgeInsets.only(right: 12),
        child: SizedBox(
          width: 160,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                height: 100,
                decoration: const BoxDecoration(
                  color: AppColors.neutral200,
                  borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
                ),
                child: photoUrl != null
                    ? ClipRRect(
                        borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                        child: Image.network(
                          photoUrl,
                          fit: BoxFit.cover,
                          width: double.infinity,
                          errorBuilder: (context, error, stackTrace) {
                            return const Center(
                              child: Icon(Icons.image, color: AppColors.neutral400),
                            );
                          },
                        ),
                      )
                    : const Center(
                        child: Icon(Icons.image, color: AppColors.neutral400),
                      ),
              ),
              Padding(
                padding: const EdgeInsets.all(8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      place['name'] ?? '',
                      style: Theme.of(context).textTheme.titleMedium,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    Text(
                      (category is Map) ? (category['name'] ?? '') : '',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(Icons.star, size: 14, color: AppColors.secondary500),
                        const SizedBox(width: 4),
                        Text(
                          '${averageRating is double ? averageRating.toStringAsFixed(1) : averageRating}',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
