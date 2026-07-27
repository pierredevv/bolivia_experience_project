import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../config/colors.dart';
import '../../../home/presentation/providers/home_provider.dart';
import '../../data/categories_service.dart';
import '../providers/categories_provider.dart';

// ── Brand tokens ──────────────────────────────────────────────────────────────
const _brandDark = Color(0xFF0F172A);
const _brandEmerald = Color(0xFF10B981);
const _brandGold = Color(0xFFF59E0B);
const _borderSubtle = Color(0xFFE2E8F0);
const _textSecondary = Color(0xFF64748B);
const _canvas = Color(0xFFFAFAFA);

class ExploreScreen extends ConsumerStatefulWidget {
  const ExploreScreen({super.key});

  @override
  ConsumerState<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends ConsumerState<ExploreScreen> {
  // ── Data state — untouched ────────────────────────────────────────────────
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
      backgroundColor: _canvas,
      body: RefreshIndicator(
        color: _brandEmerald,
        onRefresh: () async {
          ref.invalidate(categoriesProvider);
          await _loadFeaturedPlaces();
        },
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            // ── Header ──────────────────────────────────────────────────────
            SliverToBoxAdapter(
              child: SafeArea(
                bottom: false,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Page title
                      const Text(
                        'Explorar Santa Cruz',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w700,
                          color: _brandDark,
                          letterSpacing: -0.4,
                        ),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Descubrí los mejores lugares 🗺️',
                        style: TextStyle(
                          fontSize: 13,
                          color: _textSecondary,
                          height: 1.4,
                        ),
                      ),
                      const SizedBox(height: 18),

                      // ── Floating search bar ──────────────────────────────
                      GestureDetector(
                        onTap: () => context.push('/search'),
                        child: Container(
                          height: 50,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: _borderSubtle),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.04),
                                blurRadius: 8,
                                offset: const Offset(0, 3),
                              ),
                            ],
                          ),
                          child: Row(
                            children: [
                              const SizedBox(width: 14),
                              const Icon(Icons.search_rounded,
                                  size: 20, color: _textSecondary),
                              const SizedBox(width: 10),
                              const Expanded(
                                child: Text(
                                  '¿Qué estás buscando?',
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: Color(0xFF64748B),
                                  ),
                                ),
                              ),
                              Container(
                                margin: const EdgeInsets.only(right: 8),
                                width: 34,
                                height: 34,
                                decoration: BoxDecoration(
                                  color: _brandDark,
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: const Icon(
                                  Icons.tune_rounded,
                                  size: 17,
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 28),
                    ],
                  ),
                ),
              ),
            ),

            // ── Categories section ───────────────────────────────────────────
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Categorías',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: _brandDark,
                        letterSpacing: -0.2,
                      ),
                    ),
                    categoriesAsync.maybeWhen(
                      data: (cats) => Text(
                        '${cats.length} tipos',
                        style: const TextStyle(
                            fontSize: 12, color: _textSecondary),
                      ),
                      orElse: () => const SizedBox.shrink(),
                    ),
                  ],
                ),
              ),
            ),
            const SliverToBoxAdapter(child: SizedBox(height: 14)),

            // Categories grid or loading/error
            SliverToBoxAdapter(
              child: categoriesAsync.when(
                loading: () => const SizedBox(
                  height: 120,
                  child: Center(
                    child: CircularProgressIndicator(
                        color: _brandEmerald, strokeWidth: 2.5),
                  ),
                ),
                error: (error, stack) => Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: _borderSubtle),
                    ),
                    child: Column(
                      children: [
                        const Icon(Icons.error_outline,
                            size: 32, color: AppColors.error500),
                        const SizedBox(height: 8),
                        const Text(
                          'Error al cargar categorías',
                          style: TextStyle(
                              fontSize: 14, color: _textSecondary),
                        ),
                        const SizedBox(height: 12),
                        SizedBox(
                          height: 40,
                          child: ElevatedButton(
                            onPressed: () => ref.refresh(categoriesProvider),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: _brandDark,
                              foregroundColor: Colors.white,
                              elevation: 0,
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10)),
                            ),
                            child: const Text('Reintentar',
                                style: TextStyle(fontSize: 13)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                data: (categories) {
                  if (categories.isEmpty) {
                    return const SizedBox(
                      height: 80,
                      child: Center(
                        child: Text(
                          'No hay categorías disponibles',
                          style: TextStyle(
                              fontSize: 14, color: _textSecondary),
                        ),
                      ),
                    );
                  }
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount:
                            MediaQuery.of(context).size.width > 600 ? 4 : 3,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                        childAspectRatio: 0.88,
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
            ),

            const SliverToBoxAdapter(child: SizedBox(height: 32)),

            // ── Featured places section ──────────────────────────────────────
            if (_loadingFeatured && _featuredPlaces.isEmpty)
              const SliverToBoxAdapter(
                child: SizedBox(
                  height: 200,
                  child: Center(
                    child: CircularProgressIndicator(
                        color: _brandEmerald, strokeWidth: 2.5),
                  ),
                ),
              ),

            if (_featuredPlaces.isNotEmpty) ...[
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Lugares Destacados',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: _brandDark,
                          letterSpacing: -0.2,
                        ),
                      ),
                      GestureDetector(
                        onTap: () => context.go('/'),
                        child: const Text(
                          'Ver todos',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: _brandEmerald,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SliverToBoxAdapter(child: SizedBox(height: 14)),
              SliverToBoxAdapter(
                child: SizedBox(
                  height: 230,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    itemCount: _featuredPlaces.length,
                    itemBuilder: (context, index) {
                      final place = _featuredPlaces[index];
                      return _FeaturedPlaceCard(place: place);
                    },
                  ),
                ),
              ),
            ],

            // Bottom padding
            const SliverToBoxAdapter(child: SizedBox(height: 28)),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Category card — white floating card, icon + name + place count
// ─────────────────────────────────────────────────────────────────────────────
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
        return Icons.category_outlined;
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        context.push(
            '/places/category/${category.slug}?name=${category.name}');
      },
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: _borderSubtle),
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
              // Icon container
              Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                  color: _brandDark.withValues(alpha: 0.06),
                  borderRadius: BorderRadius.circular(13),
                ),
                child: Icon(
                  _getIcon(category.icon),
                  size: 24,
                  color: _brandDark,
                ),
              ),
              const SizedBox(height: 8),
              Flexible(
                child: Text(
                  category.name,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: _brandDark,
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
                    color: _textSecondary,
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

// ─────────────────────────────────────────────────────────────────────────────
// Featured place card — floating white card, hero image, gold rating badge
// ─────────────────────────────────────────────────────────────────────────────
class _FeaturedPlaceCard extends StatelessWidget {
  final Map<String, dynamic> place;

  const _FeaturedPlaceCard({required this.place});

  @override
  Widget build(BuildContext context) {
    final photos = place['photos'];
    final photoUrl = (photos is List && photos.isNotEmpty && photos[0] is Map)
        ? photos[0]['url']?.toString()
        : null;
    final rating = place['ratingAvg'];
    final ratingStr = rating is double
        ? rating.toStringAsFixed(1)
        : (rating ?? 0).toString();
    final category = place['category'];
    final categoryName =
        (category is Map) ? (category['name'] ?? '') : '';

    return GestureDetector(
      onTap: () => context.push('/places/${place['id']}'),
      child: Container(
        width: 175,
        margin: const EdgeInsets.only(right: 14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image + rating badge
            Stack(
              children: [
                ClipRRect(
                  borderRadius:
                      const BorderRadius.vertical(top: Radius.circular(16)),
                  child: SizedBox(
                    height: 130,
                    width: double.infinity,
                    child: photoUrl != null
                        ? Image.network(
                            photoUrl,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => _ImagePlaceholder(),
                          )
                        : _ImagePlaceholder(),
                  ),
                ),
                // Gold rating badge
                Positioned(
                  top: 10,
                  right: 10,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: _brandGold,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.star_rounded,
                            size: 12, color: Colors.white),
                        const SizedBox(width: 3),
                        Text(
                          ratingStr,
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            // Info
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    place['name'] ?? '',
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: _brandDark,
                      letterSpacing: -0.1,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (categoryName.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    // Category pill
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: _brandDark.withValues(alpha: 0.06),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        categoryName,
                        style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w500,
                          color: _brandDark,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Image placeholder for missing / errored images
// ─────────────────────────────────────────────────────────────────────────────
class _ImagePlaceholder extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      color: _borderSubtle,
      child: const Center(
        child: Icon(Icons.image_outlined, color: _textSecondary, size: 32),
      ),
    );
  }
}
