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
  bool _isGridView = false;
  String? _selectedCategory;
  String _sortBy = 'recent';
  String _searchQuery = '';
  bool _isSearching = false;
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final favoritesState = ref.watch(favoritesProvider);

    return Scaffold(
      appBar: _buildAppBar(favoritesState),
      body: _buildBody(context, ref, favoritesState),
    );
  }

  // ============================================================================
  // App Bar
  // ============================================================================
  PreferredSizeWidget _buildAppBar(FavoritesState state) {
    if (_isSearching) {
      return AppBar(
        title: TextField(
          controller: _searchController,
          autofocus: true,
          decoration: InputDecoration(
            hintText: 'Buscar en favoritos...',
            border: InputBorder.none,
            prefixIcon: const Icon(Icons.search),
            suffixIcon: IconButton(
              icon: const Icon(Icons.close),
              onPressed: () {
                setState(() {
                  _isSearching = false;
                  _searchQuery = '';
                  _searchController.clear();
                });
              },
            ),
          ),
          onChanged: (value) {
            setState(() => _searchQuery = value);
          },
        ),
      );
    }

    return AppBar(
      title: Row(
        children: [
          const Text('Favoritos'),
          const SizedBox(width: 8),
          if (state.status == FavoritesStatus.loaded)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: AppColors.primary100,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                '${state.favorites.length}',
                style: TextStyle(
                  color: AppColors.primary700,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
        ],
      ),
      actions: [
        // Search button
        IconButton(
          icon: const Icon(Icons.search),
          onPressed: () {
            setState(() => _isSearching = true);
          },
        ),
        // View toggle
        IconButton(
          icon: Icon(_isGridView ? Icons.view_list : Icons.grid_view),
          onPressed: () {
            setState(() => _isGridView = !_isGridView);
          },
        ),
        // Filter button
        PopupMenuButton<String>(
          icon: const Icon(Icons.filter_list),
          onSelected: (value) {
            setState(() => _sortBy = value);
          },
          itemBuilder: (context) => [
            const PopupMenuItem(
              value: 'recent',
              child: Row(
                children: [
                  Icon(Icons.access_time, size: 20),
                  SizedBox(width: 8),
                  Text('Más recientes'),
                ],
              ),
            ),
            const PopupMenuItem(
              value: 'name',
              child: Row(
                children: [
                  Icon(Icons.sort_by_alpha, size: 20),
                  SizedBox(width: 8),
                  Text('Nombre (A-Z)'),
                ],
              ),
            ),
            const PopupMenuItem(
              value: 'rating',
              child: Row(
                children: [
                  Icon(Icons.star, size: 20),
                  SizedBox(width: 8),
                  Text('Mejor calificados'),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }

  // ============================================================================
  // Body
  // ============================================================================
  Widget _buildBody(BuildContext context, WidgetRef ref, FavoritesState state) {
    if (state.status == FavoritesStatus.loading) {
      return _buildLoadingState();
    }

    if (state.status == FavoritesStatus.error) {
      return _buildErrorState(context, ref, state);
    }

    final favorites = _getFilteredFavorites(state.favorites);

    if (favorites.isEmpty && _searchQuery.isEmpty) {
      return _buildEmptyState(context);
    }

    if (favorites.isEmpty && _searchQuery.isNotEmpty) {
      return _buildNoResultsState();
    }

    return Column(
      children: [
        // Category filter chips
        _buildCategoryChips(state.favorites),

        // Favorites list/grid
        Expanded(
          child: RefreshIndicator(
            onRefresh: () => ref.read(favoritesProvider.notifier).loadFavorites(),
            child: _isGridView
                ? _buildGridView(context, ref, favorites)
                : _buildListView(context, ref, favorites),
          ),
        ),
      ],
    );
  }

  // ============================================================================
  // Loading State
  // ============================================================================
  Widget _buildLoadingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(color: AppColors.primary600),
          const SizedBox(height: 16),
          Text(
            'Cargando favoritos...',
            style: TextStyle(color: AppColors.neutral500),
          ),
        ],
      ),
    );
  }

  // ============================================================================
  // Error State
  // ============================================================================
  Widget _buildErrorState(BuildContext context, WidgetRef ref, FavoritesState state) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppColors.error100,
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.error_outline, size: 48, color: AppColors.error700),
            ),
            const SizedBox(height: 24),
            Text(
              'Oops! Algo salió mal',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            Text(
              state.errorMessage ?? 'Error al cargar favoritos',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.neutral600),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () => ref.read(favoritesProvider.notifier).loadFavorites(),
              icon: const Icon(Icons.refresh),
              label: const Text('Reintentar'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary700,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ============================================================================
  // Empty State
  // ============================================================================
  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Animated heart icon
            TweenAnimationBuilder<double>(
              tween: Tween(begin: 0.8, end: 1.0),
              duration: const Duration(seconds: 2),
              curve: Curves.elasticOut,
              builder: (context, value, child) {
                return Transform.scale(
                  scale: value,
                  child: Container(
                    padding: const EdgeInsets.all(32),
                    decoration: BoxDecoration(
                      color: AppColors.error100,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.favorite_border,
                      size: 64,
                      color: AppColors.error500,
                    ),
                  ),
                );
              },
            ),
            const SizedBox(height: 32),
            Text(
              'Sin favoritos aún',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'Guarda tus lugares favoritos tocando el icono de corazón para encontrarlos fácilmente',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: AppColors.neutral600,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 32),
            ElevatedButton.icon(
              onPressed: () => context.go('/explore'),
              icon: const Icon(Icons.explore),
              label: const Text('Explorar lugares'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary700,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
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

  // ============================================================================
  // No Results State
  // ============================================================================
  Widget _buildNoResultsState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.search_off, size: 64, color: AppColors.neutral400),
            const SizedBox(height: 16),
            Text(
              'Sin resultados',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            Text(
              'No encontramos favoritos que coincidan con "$_searchQuery"',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.neutral600),
            ),
          ],
        ),
      ),
    );
  }

  // ============================================================================
  // Category Chips
  // ============================================================================
  Widget _buildCategoryChips(List<dynamic> favorites) {
    final categories = _getCategories(favorites);

    if (categories.isEmpty) return const SizedBox.shrink();

    return Container(
      height: 56,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: [
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: FilterChip(
              label: Text('Todos (${favorites.length})'),
              selected: _selectedCategory == null,
              onSelected: (selected) {
                setState(() => _selectedCategory = null);
              },
              selectedColor: AppColors.primary100,
              checkmarkColor: AppColors.primary700,
            ),
          ),
          ...categories.map((cat) {
            final count = favorites.where((f) {
              final place = f['place'] ?? f;
              final category = place['category'] as Map<String, dynamic>? ?? {};
              return category['name'] == cat;
            }).length;

            return Padding(
              padding: const EdgeInsets.only(right: 8),
              child: FilterChip(
                label: Text('$cat ($count)'),
                selected: _selectedCategory == cat,
                onSelected: (selected) {
                  setState(() {
                    _selectedCategory = selected ? cat : null;
                  });
                },
                selectedColor: AppColors.primary100,
                checkmarkColor: AppColors.primary700,
              ),
            );
          }),
        ],
      ),
    );
  }

  // ============================================================================
  // List View
  // ============================================================================
  Widget _buildListView(BuildContext context, WidgetRef ref, List<dynamic> favorites) {
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
      itemCount: favorites.length,
      itemBuilder: (context, index) {
        final favorite = favorites[index];
        final place = favorite['place'] ?? favorite;
        return _FavoriteListCard(
          place: place,
          onTap: () => context.go('/places/${place['id']}'),
          onRemove: () => _removeFavoriteWithUndo(ref, place),
        );
      },
    );
  }

  // ============================================================================
  // Grid View
  // ============================================================================
  Widget _buildGridView(BuildContext context, WidgetRef ref, List<dynamic> favorites) {
    return GridView.builder(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.75,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemCount: favorites.length,
      itemBuilder: (context, index) {
        final favorite = favorites[index];
        final place = favorite['place'] ?? favorite;
        return _FavoriteGridCard(
          place: place,
          onTap: () => context.go('/places/${place['id']}'),
          onRemove: () => _removeFavoriteWithUndo(ref, place),
        );
      },
    );
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================
  List<dynamic> _getFilteredFavorites(List<dynamic> favorites) {
    var filtered = List<dynamic>.from(favorites);

    // Filter by search query
    if (_searchQuery.isNotEmpty) {
      filtered = filtered.where((f) {
        final place = f['place'] ?? f;
        final name = (place['name'] ?? '').toString().toLowerCase();
        final address = (place['address'] ?? '').toString().toLowerCase();
        return name.contains(_searchQuery.toLowerCase()) ||
            address.contains(_searchQuery.toLowerCase());
      }).toList();
    }

    // Filter by category
    if (_selectedCategory != null) {
      filtered = filtered.where((f) {
        final place = f['place'] ?? f;
        final category = place['category'] as Map<String, dynamic>? ?? {};
        return category['name'] == _selectedCategory;
      }).toList();
    }

    // Sort
    switch (_sortBy) {
      case 'name':
        filtered.sort((a, b) {
          final nameA = (a['place']?['name'] ?? a['name'] ?? '').toString();
          final nameB = (b['place']?['name'] ?? b['name'] ?? '').toString();
          return nameA.compareTo(nameB);
        });
        break;
      case 'rating':
        filtered.sort((a, b) {
          final ratingA = a['place']?['ratingAvg'] ?? a['ratingAvg'] ?? 0;
          final ratingB = b['place']?['ratingAvg'] ?? b['ratingAvg'] ?? 0;
          return (ratingB as num).compareTo(ratingA as num);
        });
        break;
      case 'recent':
      default:
        // Keep original order (most recent first)
        break;
    }

    return filtered;
  }

  List<String> _getCategories(List<dynamic> favorites) {
    final categories = <String>{};
    for (final favorite in favorites) {
      final place = favorite['place'] ?? favorite;
      final category = place['category'] as Map<String, dynamic>?;
      if (category != null && category['name'] != null) {
        categories.add(category['name']);
      }
    }
    return categories.toList()..sort();
  }

  void _removeFavoriteWithUndo(WidgetRef ref, dynamic place) {
    final placeName = place['name'] ?? 'Este lugar';
    
    // Optimistic removal
    ref.read(favoritesProvider.notifier).removeFavorite(place['id']);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('$placeName eliminado de favoritos'),
        action: SnackBarAction(
          label: 'Deshacer',
          textColor: AppColors.primary300,
          onPressed: () {
            ref.read(favoritesProvider.notifier).addFavorite(place['id']);
          },
        ),
        backgroundColor: AppColors.neutral800,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        duration: const Duration(seconds: 3),
      ),
    );
  }
}

// ============================================================================
// List Card
// ============================================================================
class _FavoriteListCard extends StatelessWidget {
  final dynamic place;
  final VoidCallback? onTap;
  final VoidCallback? onRemove;

  const _FavoriteListCard({
    required this.place,
    this.onTap,
    this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    final photos = place['photos'] as List<dynamic>? ?? [];
    final photoUrl = photos.isNotEmpty ? photos[0]['url'] : null;
    final ratingAvg = place['ratingAvg'] ?? 0;
    final ratingCount = place['ratingCount'] ?? 0;
    final category = place['category'] as Map<String, dynamic>? ?? {};
    final address = place['address'] as String?;

    return Dismissible(
      key: Key(place['id'].toString()),
      direction: DismissDirection.endToStart,
      onDismissed: (_) => onRemove?.call(),
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 24),
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: AppColors.error500,
          borderRadius: BorderRadius.circular(16),
        ),
        child: const Icon(Icons.delete_outline, color: Colors.white),
      ),
      child: Card(
        margin: const EdgeInsets.only(bottom: 12),
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: AppColors.neutral200),
        ),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Photo
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: AppColors.neutral200,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: photoUrl != null
                      ? ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Image.network(
                            photoUrl,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return Center(
                                child: Icon(Icons.image, color: AppColors.neutral400),
                              );
                            },
                          ),
                        )
                      : Center(
                          child: Icon(Icons.restaurant, color: AppColors.neutral400, size: 32),
                        ),
                ),
                const SizedBox(width: 12),

                // Info
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Name
                      Text(
                        place['name'] ?? '',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),

                      // Category
                      if (category.isNotEmpty)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.primary50,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            category['name'] ?? '',
                            style: TextStyle(
                              color: AppColors.primary700,
                              fontSize: 11,
                            ),
                          ),
                        ),
                      const SizedBox(height: 6),

                      // Rating
                      Row(
                        children: [
                          ...List.generate(5, (index) {
                            return Icon(
                              index < (ratingAvg as num).round()
                                  ? Icons.star
                                  : Icons.star_border,
                              size: 14,
                              color: AppColors.secondary500,
                            );
                          }),
                          const SizedBox(width: 4),
                          Text(
                            '${ratingAvg is num ? ratingAvg.toStringAsFixed(1) : '0'}',
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '($ratingCount)',
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: AppColors.neutral500,
                            ),
                          ),
                        ],
                      ),

                      // Address
                      if (address != null) ...[
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Icon(Icons.location_on, size: 12, color: AppColors.neutral400),
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

                // Remove button
                IconButton(
                  icon: Icon(Icons.favorite, color: AppColors.error500),
                  onPressed: onRemove,
                  tooltip: 'Quitar de favoritos',
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ============================================================================
// Grid Card
// ============================================================================
class _FavoriteGridCard extends StatelessWidget {
  final dynamic place;
  final VoidCallback? onTap;
  final VoidCallback? onRemove;

  const _FavoriteGridCard({
    required this.place,
    this.onTap,
    this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    final photos = place['photos'] as List<dynamic>? ?? [];
    final photoUrl = photos.isNotEmpty ? photos[0]['url'] : null;
    final ratingAvg = place['ratingAvg'] ?? 0;
    final category = place['category'] as Map<String, dynamic>? ?? {};

    return Dismissible(
      key: Key(place['id'].toString()),
      direction: DismissDirection.endToStart,
      onDismissed: (_) => onRemove?.call(),
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 24),
        decoration: BoxDecoration(
          color: AppColors.error500,
          borderRadius: BorderRadius.circular(16),
        ),
        child: const Icon(Icons.delete_outline, color: Colors.white),
      ),
      child: Card(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: AppColors.neutral200),
        ),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Photo
              Expanded(
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    Container(
                      decoration: BoxDecoration(
                        color: AppColors.neutral200,
                        borderRadius: const BorderRadius.vertical(
                          top: Radius.circular(16),
                        ),
                      ),
                      child: photoUrl != null
                          ? ClipRRect(
                              borderRadius: const BorderRadius.vertical(
                                top: Radius.circular(16),
                              ),
                              child: Image.network(
                                photoUrl,
                                fit: BoxFit.cover,
                                errorBuilder: (context, error, stackTrace) {
                                  return Center(
                                    child: Icon(Icons.image, color: AppColors.neutral400),
                                  );
                                },
                              ),
                            )
                          : Center(
                              child: Icon(Icons.restaurant, color: AppColors.neutral400, size: 40),
                            ),
                    ),
                    // Favorite button
                    Positioned(
                      top: 8,
                      right: 8,
                      child: GestureDetector(
                        onTap: onRemove,
                        child: Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.1),
                                blurRadius: 4,
                              ),
                            ],
                          ),
                          child: Icon(
                            Icons.favorite,
                            color: AppColors.error500,
                            size: 18,
                          ),
                        ),
                      ),
                    ),
                    // Rating badge
                    Positioned(
                      top: 8,
                      left: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(8),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.1),
                              blurRadius: 4,
                            ),
                          ],
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.star, size: 12, color: AppColors.secondary500),
                            const SizedBox(width: 2),
                            Text(
                              '${ratingAvg is num ? ratingAvg.toStringAsFixed(1) : '0'}',
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Info
              Padding(
                padding: const EdgeInsets.all(10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      place['name'] ?? '',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    if (category.isNotEmpty)
                      Text(
                        category['name'] ?? '',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.neutral500,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
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
