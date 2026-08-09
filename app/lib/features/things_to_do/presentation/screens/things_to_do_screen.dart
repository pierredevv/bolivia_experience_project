import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../config/colors.dart';
import '../providers/things_to_do_provider.dart';
import '../widgets/category_top_bar.dart';
import '../widgets/experience_card.dart';
import '../widgets/place_card.dart';
import '../widgets/recommended_tour_card.dart';
import '../widgets/tour_card.dart';

/// Vista "Cosas que hacer en Santa Cruz".
class ThingsToDoScreen extends ConsumerStatefulWidget {
  const ThingsToDoScreen({super.key});

  @override
  ConsumerState<ThingsToDoScreen> createState() => _ThingsToDoScreenState();
}

class _ThingsToDoScreenState extends ConsumerState<ThingsToDoScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(thingsToDoProvider.notifier).load());
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(thingsToDoProvider);

    return Scaffold(
      backgroundColor: AppColors.backgroundCanvas,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Header (sin AppBar) ─────────────────────────────────────────
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
                      'Cosas que hacer en Santa Cruz',
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
            // ── Top bar de categorías (sticky) ──────────────────────────────
            const CategoryTopBar(),
            const SizedBox(height: 12),
            Expanded(child: _buildBody(state)),
          ],
        ),
      ),
    );
  }

  Widget _buildBody(ThingsToDoState state) {
    switch (state.status) {
      case ThingsToDoStatus.initial:
      case ThingsToDoStatus.loading:
        return const Center(
          child: CircularProgressIndicator(color: AppColors.brandEmerald),
        );
      case ThingsToDoStatus.error:
        return _buildError(state);
      case ThingsToDoStatus.loaded:
        return _buildLoaded(state);
    }
  }

  Widget _buildError(ThingsToDoState state) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.cloud_off_rounded,
                size: 64, color: AppColors.neutral400),
            const SizedBox(height: 16),
            Text(
              state.errorMessage ?? 'No se pudieron cargar las actividades.',
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 15,
                color: AppColors.neutral600,
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () =>
                  ref.read(thingsToDoProvider.notifier).load(),
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
    );
  }

  Widget _buildLoaded(ThingsToDoState state) {
    if (!state.filter.isCategory &&
        state.filter.type != ThingsToDoFilterType.all) {
      return _buildFilteredTours(state);
    }
    if (state.filter.isCategory) {
      return _buildFeedPlaces(state);
    }
    return _buildAll(state);
  }

  /// Vista completa (filtro "Todo"): todas las secciones.
  Widget _buildAll(ThingsToDoState state) {
    return RefreshIndicator(
      color: AppColors.brandEmerald,
      onRefresh: () => ref.read(thingsToDoProvider.notifier).refresh(),
      child: ListView(
        padding: const EdgeInsets.only(bottom: 24),
        physics: const AlwaysScrollableScrollPhysics(),
        children: [
          // ── 1. Experiencias imprescindibles en Santa Cruz ────────────────
          if (state.experiences.isNotEmpty) ...[
            const _SectionHeader(
                title: 'Experiencias imprescindibles en Santa Cruz',
                onSeeAll: true),
            const SizedBox(height: 14),
            SizedBox(
              height: 250,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                itemCount: state.experiences.length,
                itemBuilder: (context, index) {
                  final exp = state.experiences[index];
                  return ExperienceCard(
                    experience: exp,
                    onTap: () => context.push('/experiences/${exp.id}',
                        extra: exp),
                  );
                },
              ),
            ),
            const SizedBox(height: 28),
          ],

          // ── 2. Recomendado para ti ────────────────────────────────────────
          if (state.recommended.isNotEmpty) ...[
            const _SectionHeader(title: 'Recomendado para ti'),
            const SizedBox(height: 4),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 20),
              child: Text(
                'Tours y actividades hechos a tu medida, según tu interés',
                style: TextStyle(
                  fontSize: 13,
                  color: AppColors.textSecondary,
                ),
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              height: 248,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                itemCount: state.recommended.length,
                itemBuilder: (context, index) {
                  final tour = state.recommended[index];
                  return RecommendedTourCard(
                    tour: tour,
                    onTap: () => context.push('/experiences/${tour.id}'),
                  );
                },
              ),
            ),
            const SizedBox(height: 28),
          ],

          // ── 3. Top atracciones ────────────────────────────────────────────
          if (state.topAttractions.isNotEmpty) ...[
            const _SectionHeader(title: 'Top atracciones'),
            const SizedBox(height: 14),
            SizedBox(
              height: 240,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                itemCount: state.topAttractions.length,
                itemBuilder: (context, index) {
                  final place = state.topAttractions[index];
                  return PlaceCard(
                    place: place,
                    onTap: () => context.push('/places/${place['id']}'),
                  );
                },
              ),
            ),
            const SizedBox(height: 28),
          ],

          // ── 4-11. Secciones de tours por subcategoría ────────────────────
          for (final (subcat, title) in kTourSectionOrder) ...[
            if (state.toursOf(subcat).isNotEmpty) ...[
              _SectionHeader(title: title),
              const SizedBox(height: 8),
              for (final tour in state.toursOf(subcat)) ...[
                const SizedBox(height: 8),
                TourCard(
                  tour: tour,
                  onTap: () => context.push('/experiences/${tour.id}'),
                ),
              ],
              const SizedBox(height: 20),
            ],
          ],

          // ── Caminatas sin guía (siempre visible: Próximamente) ───────────
          const _SectionHeader(title: 'Caminatas sin guía'),
          const SizedBox(height: 8),
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16),
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: AppColors.borderSubtle),
            ),
            child: const Column(
              children: [
                Icon(Icons.hiking_rounded,
                    size: 48, color: AppColors.neutral400),
                SizedBox(height: 12),
                Text(
                  'Próximamente',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: AppColors.brandDark,
                  ),
                ),
                SizedBox(height: 6),
                Text(
                  'Pronto podrás explorar rutas de caminata sin guía por Santa Cruz.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 13,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  /// Vista filtrada por tours (Tours / Excursiones de un día / Aire libre).
  Widget _buildFilteredTours(ThingsToDoState state) {
    final tours = state.filteredTours;
    return RefreshIndicator(
      color: AppColors.brandEmerald,
      onRefresh: () => ref.read(thingsToDoProvider.notifier).refresh(),
      child: tours.isEmpty
          ? ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              children: const [
                SizedBox(height: 120),
                _EmptyState(
                  icon: Icons.tour_rounded,
                  title: 'Sin actividades',
                  message: 'No hay actividades para este filtro por ahora.',
                ),
              ],
            )
          : ListView(
              padding: const EdgeInsets.only(bottom: 24),
              physics: const AlwaysScrollableScrollPhysics(),
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 8, 20, 8),
                  child: Text(
                    state.filterTitle,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: AppColors.brandDark,
                      letterSpacing: -0.2,
                    ),
                  ),
                ),
                for (final tour in tours) ...[
                  const SizedBox(height: 8),
                  TourCard(
                    tour: tour,
                    onTap: () => context.push('/experiences/${tour.id}'),
                  ),
                ],
              ],
            ),
    );
  }

  /// Vista filtrada por categoría: feed de lugares de esa categoría.
  Widget _buildFeedPlaces(ThingsToDoState state) {
    return RefreshIndicator(
      color: AppColors.brandEmerald,
      onRefresh: () async {
        await ref.read(thingsToDoProvider.notifier).refresh();
        await ref
            .read(thingsToDoProvider.notifier)
            .selectFilter(state.filter);
      },
      child: state.feedLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.brandEmerald),
            )
          : state.feedItems.isEmpty
              ? ListView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  children: const [
                    SizedBox(height: 120),
                    _EmptyState(
                      icon: Icons.place_outlined,
                      title: 'Sin resultados',
                      message: 'No encontramos lugares para esta categoría.',
                    ),
                  ],
                )
              : ListView(
                  padding: const EdgeInsets.only(bottom: 24),
                  physics: const AlwaysScrollableScrollPhysics(),
                  children: [
                    Padding(
                      padding: const EdgeInsets.fromLTRB(20, 8, 20, 8),
                      child: Text(
                        state.filterTitle,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: AppColors.brandDark,
                          letterSpacing: -0.2,
                        ),
                      ),
                    ),
                    for (final place in state.feedItems)
                      _FeedPlaceCard(
                        place: place,
                        onTap: () => context.push('/places/${place['id']}'),
                      ),
                  ],
                ),
    );
  }
}

/// Encabezado de sección con "Ver todos" opcional.
class _SectionHeader extends StatelessWidget {
  final String title;
  final bool onSeeAll;

  const _SectionHeader({required this.title, this.onSeeAll = false});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Row(
        children: [
          Expanded(
            child: Text(
              title,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: AppColors.brandDark,
                letterSpacing: -0.2,
              ),
            ),
          ),
          if (onSeeAll)
            GestureDetector(
              onTap: () => context.push('/experiences/essential'),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'Ver todos',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppColors.brandEmerald,
                    ),
                  ),
                  SizedBox(width: 2),
                  Icon(Icons.chevron_right_rounded,
                      size: 18, color: AppColors.brandEmerald),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

/// Estado vacío reutilizable.
class _EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String message;

  const _EmptyState({
    required this.icon,
    required this.title,
    required this.message,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, size: 56, color: AppColors.neutral400),
        const SizedBox(height: 14),
        Text(
          title,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: AppColors.brandDark,
          ),
        ),
        const SizedBox(height: 6),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 40),
          child: Text(
            message,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
          ),
        ),
      ],
    );
  }
}

/// Card vertical de lugar (fila foto + info) para el feed por categoría.
class _FeedPlaceCard extends StatelessWidget {
  final Map<String, dynamic> place;
  final VoidCallback? onTap;

  const _FeedPlaceCard({required this.place, this.onTap});

  @override
  Widget build(BuildContext context) {
    final photos = place['photos'];
    final photoUrl = (photos is List && photos.isNotEmpty && photos[0] is Map)
        ? photos[0]['url']?.toString()
        : null;
    final rating = place['ratingAvg'];
    final ratingStr =
        rating is double ? rating.toStringAsFixed(1) : (rating ?? 0).toString();
    final ratingCount = place['ratingCount'];
    final reviewCount = ratingCount is num ? ratingCount.toInt() : 0;
    final category = place['category'];
    final categoryName = (category is Map) ? (category['name'] ?? '') : '';
    final categoriaPlace = place['categoriaPlace']?.toString();
    final displayCategory = (categoriaPlace != null && categoriaPlace.isNotEmpty)
        ? categoriaPlace
        : categoryName;

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(18),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: SizedBox(
                  width: 84,
                  height: 84,
                  child: photoUrl != null
                      ? Image.network(
                          photoUrl,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(
                            color: AppColors.borderSubtle,
                            child: const Center(
                              child: Icon(Icons.image_outlined,
                                  color: AppColors.textSecondary, size: 28),
                            ),
                          ),
                        )
                      : Container(
                          color: AppColors.borderSubtle,
                          child: const Center(
                            child: Icon(Icons.image_outlined,
                                color: AppColors.textSecondary, size: 28),
                          ),
                        ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      place['name'] ?? '',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: AppColors.brandDark,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        const Icon(Icons.star_rounded,
                            size: 14, color: AppColors.brandGold),
                        const SizedBox(width: 3),
                        Text(
                          ratingStr,
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: AppColors.brandDark,
                          ),
                        ),
                        if (reviewCount > 0) ...[
                          const SizedBox(width: 5),
                          Text(
                            '($reviewCount)',
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ],
                    ),
                    if (displayCategory.isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Text(
                        displayCategory,
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
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
