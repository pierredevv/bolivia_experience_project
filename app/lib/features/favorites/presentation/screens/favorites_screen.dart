import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../config/colors.dart';
import '../providers/favorites_provider.dart';

class FavoritesScreen extends ConsumerStatefulWidget {
  const FavoritesScreen({super.key});

  @override
  ConsumerState<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends ConsumerState<FavoritesScreen> {
  String? _selectedCategory;

  List<String> _extractCategories(List<dynamic> favorites) {
    final categories = <String>{};
    for (final fav in favorites) {
      final place = fav['place'] ?? fav;
      final category = place['category'];
      if (category is Map && category['name'] != null) {
        categories.add(category['name'].toString());
      }
    }
    return categories.toList()..sort();
  }

  List<dynamic> _filterFavorites(List<dynamic> favorites, String? category) {
    if (category == null) return favorites;
    return favorites.where((fav) {
      final place = fav['place'] ?? fav;
      final cat = place['category'];
      return cat is Map && cat['name'] == category;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final favoritesState = ref.watch(favoritesProvider);

    return Scaffold(
      appBar: AppBar(
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Mis Favoritos'),
            if (favoritesState.favorites.isNotEmpty) ...[
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.primary700,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '${favoritesState.favorites.length}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ],
        ),
        actions: [
          if (favoritesState.favorites.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.flight_takeoff),
              onPressed: () => context.push('/trips/create'),
              tooltip: 'Crear viaje',
            ),
        ],
      ),
      body: _buildBody(context, favoritesState),
    );
  }

  Widget _buildBody(BuildContext context, FavoritesState state) {
    if (state.status == FavoritesStatus.loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (state.status == FavoritesStatus.error) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: AppColors.error500),
              const SizedBox(height: 16),
              Text(
                state.errorMessage ?? 'Error al cargar favoritos',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: () => ref.read(favoritesProvider.notifier).loadFavorites(),
                icon: const Icon(Icons.refresh),
                label: const Text('Reintentar'),
              ),
            ],
          ),
        ),
      );
    }

    if (state.favorites.isEmpty) {
      return _buildEmptyState(context);
    }

    final categories = _extractCategories(state.favorites);
    final filtered = _filterFavorites(state.favorites, _selectedCategory);

    return Column(
      children: [
        // Category filters
        if (categories.isNotEmpty)
          Container(
            height: 50,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: FilterChip(
                    label: const Text('Todos'),
                    selected: _selectedCategory == null,
                    onSelected: (_) => setState(() => _selectedCategory = null),
                    selectedColor: AppColors.primary100,
                    checkmarkColor: AppColors.primary700,
                  ),
                ),
                ...categories.map((cat) => Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: FilterChip(
                    label: Text(cat),
                    selected: _selectedCategory == cat,
                    onSelected: (_) => setState(
                      () => _selectedCategory = _selectedCategory == cat ? null : cat,
                    ),
                    selectedColor: AppColors.primary100,
                    checkmarkColor: AppColors.primary700,
                  ),
                )),
              ],
            ),
          ),

        // Favorites list
        Expanded(
          child: RefreshIndicator(
            onRefresh: () => ref.read(favoritesProvider.notifier).loadFavorites(),
            child: filtered.isEmpty
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.filter_list_off, size: 48, color: AppColors.neutral400),
                          const SizedBox(height: 16),
                          Text(
                            'No hay favoritos en esta categoría',
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                        ],
                      ),
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: filtered.length,
                    itemBuilder: (context, index) {
                      final favorite = filtered[index];
                      final place = favorite['place'] ?? favorite;
                      return _FavoritePlaceCard(
                        place: place,
                        onTap: () => context.push('/places/${place['id']}'),
                        onRemove: () {
                          ref.read(favoritesProvider.notifier).removeFavorite(place['id']);
                        },
                        onShare: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Compartir ${place['name']} (próximamente)'),
                              duration: const Duration(seconds: 2),
                            ),
                          );
                        },
                      );
                    },
                  ),
          ),
        ),
      ],
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: const BoxDecoration(
                color: AppColors.primary50,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.favorite_outline,
                size: 40,
                color: AppColors.primary700,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'Aún no tienes favoritos',
              style: Theme.of(context).textTheme.headlineSmall,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Guarda los lugares que más te gusten para visitarlos después',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: AppColors.neutral500,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () => context.go('/explore'),
              icon: const Icon(Icons.explore),
              label: const Text('Explorar lugares'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary700,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FavoritePlaceCard extends StatelessWidget {
  final dynamic place;
  final VoidCallback? onTap;
  final VoidCallback? onRemove;
  final VoidCallback? onShare;

  const _FavoritePlaceCard({
    required this.place,
    this.onTap,
    this.onRemove,
    this.onShare,
  });

  @override
  Widget build(BuildContext context) {
    final photos = place['photos'] as List<dynamic>? ?? [];
    final photoUrl = photos.isNotEmpty ? photos[0]['url'] : null;
    final averageRating = place['ratingAvg'] ?? 0;
    final category = place['category'] as Map<String, dynamic>? ?? {};
    final address = place['address'] as String?;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Photo
              Container(
                width: 70,
                height: 70,
                decoration: BoxDecoration(
                  color: AppColors.neutral200,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: photoUrl != null
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.network(
                          photoUrl,
                          fit: BoxFit.cover,
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
              const SizedBox(width: 12),

              // Info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      place['name'] ?? '',
                      style: Theme.of(context).textTheme.titleMedium,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        if (category.isNotEmpty) ...[
                          Icon(
                            _getCategoryIcon(category['slug']),
                            size: 12,
                            color: AppColors.primary700,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            category['name'] ?? '',
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: AppColors.primary700,
                            ),
                          ),
                          const SizedBox(width: 8),
                        ],
                        const Icon(Icons.star, size: 14, color: AppColors.secondary500),
                        const SizedBox(width: 2),
                        Text(
                          '${averageRating is double ? averageRating.toStringAsFixed(1) : averageRating}',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                    if (address != null && address.isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.location_on, size: 12, color: AppColors.neutral500),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              address,
                              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: AppColors.neutral500,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),

              // Actions
              Column(
                children: [
                  IconButton(
                    icon: const Icon(Icons.share, size: 20),
                    onPressed: onShare,
                    color: AppColors.neutral500,
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                  const SizedBox(height: 4),
                  IconButton(
                    icon: const Icon(Icons.favorite, size: 20),
                    onPressed: onRemove,
                    color: AppColors.error500,
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  IconData _getCategoryIcon(String? slug) {
    switch (slug) {
      case 'restaurantes':
        return Icons.restaurant;
      case 'hoteles':
        return Icons.hotel;
      case 'cafeterias':
        return Icons.coffee;
      case 'naturaleza':
        return Icons.landscape;
      case 'parques':
        return Icons.park;
      case 'compras':
        return Icons.shopping_bag;
      case 'vida-nocturna':
        return Icons.nightlife;
      case 'cultura':
        return Icons.museum;
      default:
        return Icons.place;
    }
  }
}
