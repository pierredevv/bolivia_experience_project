import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../config/colors.dart';
import '../providers/favorites_provider.dart';

// ── Brand tokens ──────────────────────────────────────────────────────────────
const _brandDark = Color(0xFF0F172A);
const _brandEmerald = Color(0xFF10B981);
const _brandGold = Color(0xFFF59E0B);
const _borderSubtle = Color(0xFFE2E8F0);
const _textSecondary = Color(0xFF64748B);
const _canvas = Color(0xFFFAFAFA);

class FavoritesScreen extends ConsumerStatefulWidget {
  const FavoritesScreen({super.key});

  @override
  ConsumerState<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends ConsumerState<FavoritesScreen> {
  // ── Filter state — untouched ──────────────────────────────────────────────
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
      backgroundColor: _canvas,
      body: _buildBody(context, favoritesState),
    );
  }

  Widget _buildBody(BuildContext context, FavoritesState state) {
    // ── Loading ──────────────────────────────────────────────────────────────
    if (state.status == FavoritesStatus.loading) {
      return const Center(
        child: CircularProgressIndicator(
          color: _brandEmerald,
          strokeWidth: 2.5,
        ),
      );
    }

    // ── Error ────────────────────────────────────────────────────────────────
    if (state.status == FavoritesStatus.error) {
      return SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(28),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 72,
                  height: 72,
                  decoration: BoxDecoration(
                    color: AppColors.error500.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Icon(Icons.error_outline,
                      size: 36, color: AppColors.error500),
                ),
                const SizedBox(height: 20),
                Text(
                  state.errorMessage ?? 'Error al cargar favoritos',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 15,
                    color: _textSecondary,
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  height: 46,
                  child: ElevatedButton.icon(
                    onPressed: () =>
                        ref.read(favoritesProvider.notifier).loadFavorites(),
                    icon: const Icon(Icons.refresh, size: 18),
                    label: const Text('Reintentar'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _brandDark,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    // ── Empty state ──────────────────────────────────────────────────────────
    if (state.favorites.isEmpty) {
      return _buildEmptyState(context);
    }

    // ── Loaded ───────────────────────────────────────────────────────────────
    final categories = _extractCategories(state.favorites);
    final filtered = _filterFavorites(state.favorites, _selectedCategory);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // ── Custom header ──────────────────────────────────────────────────
        SafeArea(
          bottom: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Mis Favoritos',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w700,
                          color: _brandDark,
                          letterSpacing: -0.4,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        '${state.favorites.length} '
                        '${state.favorites.length == 1 ? 'lugar guardado' : 'lugares guardados'}',
                        style: const TextStyle(
                          fontSize: 13,
                          color: _textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                // Trip shortcut button
                GestureDetector(
                  onTap: () => context.push('/trips/create'),
                  child: Container(
                    height: 42,
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    decoration: BoxDecoration(
                      color: _brandDark,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.flight_takeoff_rounded,
                            size: 16, color: Colors.white),
                        SizedBox(width: 6),
                        Text(
                          'Crear viaje',
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
              ],
            ),
          ),
        ),

        // ── Category pill filters ──────────────────────────────────────────
        if (categories.isNotEmpty) ...[
          const SizedBox(height: 18),
          SizedBox(
            height: 44,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 20),
              children: [
                // "Todos" pill
                _FilterPill(
                  label: 'Todos',
                  isActive: _selectedCategory == null,
                  onTap: () => setState(() => _selectedCategory = null),
                ),
                ...categories.map((cat) => _FilterPill(
                      label: cat,
                      isActive: _selectedCategory == cat,
                      onTap: () => setState(
                        () => _selectedCategory =
                            _selectedCategory == cat ? null : cat,
                      ),
                    )),
              ],
            ),
          ),
        ],

        const SizedBox(height: 14),

        // ── Favorites list ─────────────────────────────────────────────────
        Expanded(
          child: RefreshIndicator(
            color: _brandEmerald,
            onRefresh: () =>
                ref.read(favoritesProvider.notifier).loadFavorites(),
            child: filtered.isEmpty
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(28),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            width: 64,
                            height: 64,
                            decoration: BoxDecoration(
                              color: _borderSubtle,
                              borderRadius: BorderRadius.circular(18),
                            ),
                            child: const Icon(Icons.filter_list_off_rounded,
                                size: 30, color: _textSecondary),
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'No hay favoritos en esta categoría',
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                              color: _brandDark,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
                    itemCount: filtered.length,
                    itemBuilder: (context, index) {
                      final favorite = filtered[index];
                      final place = favorite['place'] ?? favorite;
                      return _FavoritePlaceCard(
                        place: place,
                        onTap: () =>
                            context.push('/places/${place['id']}'),
                        onRemove: () {
                          ref
                              .read(favoritesProvider.notifier)
                              .removeFavorite(place['id']);
                        },
                        onShare: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(
                                  'Compartir ${place['name']} (próximamente)'),
                              duration: const Duration(seconds: 2),
                              behavior: SnackBarBehavior.floating,
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10)),
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

  // ── Empty state ────────────────────────────────────────────────────────────
  Widget _buildEmptyState(BuildContext context) {
    return SafeArea(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header still visible on empty state
          const Padding(
            padding: EdgeInsets.fromLTRB(20, 24, 20, 0),
            child: Text(
              'Mis Favoritos',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w700,
                color: _brandDark,
                letterSpacing: -0.4,
              ),
            ),
          ),
          Expanded(
            child: Center(
              child: Padding(
                padding: const EdgeInsets.all(28),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Heart icon in soft rounded container
                    Container(
                      width: 96,
                      height: 96,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(28),
                        border: Border.all(color: _borderSubtle),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.04),
                            blurRadius: 16,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.favorite_rounded,
                        size: 44,
                        color: Color(0xFFFC7B7B),
                      ),
                    ),
                    const SizedBox(height: 28),
                    const Text(
                      'Aún no tienes guardados',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: _brandDark,
                        letterSpacing: -0.3,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 10),
                    const Text(
                      'Guarda los lugares que más te gusten\npara visitarlos después',
                      style: TextStyle(
                        fontSize: 14,
                        color: _textSecondary,
                        height: 1.55,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 32),
                    SizedBox(
                      height: 52,
                      child: ElevatedButton.icon(
                        onPressed: () => context.go('/explore'),
                        icon: const Icon(Icons.explore_rounded, size: 19),
                        label: const Text('Explorar lugares'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _brandDark,
                          foregroundColor: Colors.white,
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(
                              horizontal: 28, vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                          textStyle: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
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

// ─────────────────────────────────────────────────────────────────────────────
// Filter pill — active: emerald fill / inactive: white + subtle border
// ─────────────────────────────────────────────────────────────────────────────
class _FilterPill extends StatelessWidget {
  const _FilterPill({
    required this.label,
    required this.isActive,
    required this.onTap,
  });

  final String label;
  final bool isActive;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 11),
        decoration: BoxDecoration(
          color: isActive ? _brandDark : Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: isActive ? _brandDark : _borderSubtle,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.03),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: isActive ? Colors.white : _textSecondary,
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Favorite place card — horizontal layout, white floating card
// ─────────────────────────────────────────────────────────────────────────────
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

  @override
  Widget build(BuildContext context) {
    final photos = place['photos'] as List<dynamic>? ?? [];
    final photoUrl = photos.isNotEmpty ? photos[0]['url'] : null;
    final rating = place['ratingAvg'] ?? 0;
    final ratingStr =
        rating is double ? rating.toStringAsFixed(1) : rating.toString();
    final category = place['category'] as Map<String, dynamic>? ?? {};
    final address = place['address'] as String?;
    final categoryName = category['name'] as String? ?? '';
    final categorySlug = category['slug'] as String?;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: _borderSubtle),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 10,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // ── Photo ──────────────────────────────────────────────────
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: SizedBox(
                  width: 80,
                  height: 80,
                  child: photoUrl != null
                      ? Image.network(
                          photoUrl,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) =>
                              _PhotoPlaceholder(),
                        )
                      : _PhotoPlaceholder(),
                ),
              ),
              const SizedBox(width: 14),

              // ── Info ────────────────────────────────────────────────────
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      place['name'] ?? '',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: _brandDark,
                        letterSpacing: -0.1,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 5),
                    // Category pill + rating row
                    Row(
                      children: [
                        if (categoryName.isNotEmpty) ...[
                          Icon(
                            _getCategoryIcon(categorySlug),
                            size: 12,
                            color: _brandEmerald,
                          ),
                          const SizedBox(width: 4),
                          Flexible(
                            child: Text(
                              categoryName,
                              style: const TextStyle(
                                fontSize: 12,
                                color: _brandEmerald,
                                fontWeight: FontWeight.w500,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 8),
                        ],
                        const Icon(Icons.star_rounded,
                            size: 13, color: _brandGold),
                        const SizedBox(width: 3),
                        Text(
                          ratingStr,
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: _brandDark,
                          ),
                        ),
                      ],
                    ),
                    if (address != null && address.isNotEmpty) ...[
                      const SizedBox(height: 5),
                      Row(
                        children: [
                          const Icon(Icons.location_on_outlined,
                              size: 12, color: _textSecondary),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              address,
                              style: const TextStyle(
                                fontSize: 11,
                                color: _textSecondary,
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

              // ── Action buttons ───────────────────────────────────────────
              const SizedBox(width: 8),
              Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Share
                  _ActionIcon(
                    icon: Icons.share_outlined,
                    color: _textSecondary,
                    onTap: onShare,
                  ),
                  const SizedBox(height: 6),
                  // Remove from favorites
                  _ActionIcon(
                    icon: Icons.favorite_rounded,
                    color: const Color(0xFFFC7B7B),
                    onTap: onRemove,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
class _PhotoPlaceholder extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      color: _borderSubtle,
      child: const Center(
        child: Icon(Icons.image_outlined, color: _textSecondary, size: 28),
      ),
    );
  }
}

class _ActionIcon extends StatelessWidget {
  const _ActionIcon({
    required this.icon,
    required this.color,
    this.onTap,
  });

  final IconData icon;
  final Color color;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 34,
        height: 34,
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, size: 18, color: color),
      ),
    );
  }
}
