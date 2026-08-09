import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../config/colors.dart';
import '../providers/home_provider.dart';
import '../../data/home_experience.dart';
import '../../../weather/presentation/widgets/weather_widget.dart';
import '../../../traveler_photos/presentation/providers/traveler_photos_provider.dart';
import '../../../traveler_photos/presentation/widgets/traveler_photos_carousel.dart';

// ── Brand tokens (shared across all private widgets) ──────────────────────────
const _brandDark = Color(0xFF0F172A);
const _brandEmerald = Color(0xFF10B981);
const _brandGold = Color(0xFFF59E0B);
const _borderSubtle = Color(0xFFE2E8F0);
const _textSecondary = Color(0xFF64748B);
const _canvas = Color(0xFFFAFAFA);

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final homeState = ref.watch(homeProvider);

    return Scaffold(
      backgroundColor: _canvas,
      body: _buildBody(context, ref, homeState),
    );
  }

  Widget _buildBody(BuildContext context, WidgetRef ref, HomeState state) {
    // ── Loading ──────────────────────────────────────────────────────────────
    if (state.status == HomeStatus.loading) {
      return const Center(
        child: CircularProgressIndicator(
          color: _brandEmerald,
          strokeWidth: 2.5,
        ),
      );
    }

    // ── Error ────────────────────────────────────────────────────────────────
    if (state.status == HomeStatus.error) {
      return Center(
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
                state.errorMessage ?? 'Error al cargar datos',
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
                      ref.read(homeProvider.notifier).loadHomeData(),
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
      );
    }

    // ── Loaded ───────────────────────────────────────────────────────────────
    return RefreshIndicator(
      color: _brandEmerald,
      onRefresh: () => ref.read(homeProvider.notifier).loadHomeData(),
      child: CustomScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        slivers: [
          // ── Custom header ──────────────────────────────────────────────────
          SliverToBoxAdapter(
            child: SafeArea(
              bottom: false,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Greeting row
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '¡Hola, Explorador! 👋',
                                style: TextStyle(
                                  fontSize: 22,
                                  fontWeight: FontWeight.w700,
                                  color: _brandDark,
                                  letterSpacing: -0.3,
                                ),
                              ),
                              SizedBox(height: 3),
                              Text(
                                '¿Qué exploramos hoy en Santa Cruz? 🌴',
                                style: TextStyle(
                                  fontSize: 13,
                                  color: _textSecondary,
                                  height: 1.4,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 12),
                        // Notification + avatar cluster
                        GestureDetector(
                          onTap: () => context.push('/notifications'),
                          child: Container(
                            width: 42,
                            height: 42,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(13),
                              border: Border.all(color: _borderSubtle),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.04),
                                  blurRadius: 8,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: const Icon(
                              Icons.notifications_outlined,
                              size: 20,
                              color: _brandDark,
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        // Avatar with emerald ring — taps to profile
                        GestureDetector(
                          onTap: () => context.push('/profile'),
                          child: Container(
                            width: 42,
                            height: 42,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(
                                  color: _brandEmerald, width: 2),
                            ),
                            child: ClipOval(
                              child: Container(
                                color: _brandDark,
                                child: const Center(
                                  child: Icon(Icons.person_outline,
                                      color: Colors.white, size: 22),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 18),

                    // ── Floating search bar ──────────────────────────
                    GestureDetector(
                      onTap: () => context.go('/explore'),
                      child: Container(
                        height: 50,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: _borderSubtle),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.04),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
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
                                  color: Color(0xFFCBD5E1),
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
                    const SizedBox(height: 18),

                    // ── Fotos de Viajeros carousel ────────────────────
                    const _TravelerPhotosSection(),
                    const SizedBox(height: 18),

                    // ── Weather widget ───────────────────────────────
                    const WeatherWidget(),
                    const SizedBox(height: 20),

                    // ── Hero banner ──────────────────────────────────
                    GestureDetector(
                      onTap: () => context.go('/trips'),
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(22),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [_brandDark, _brandEmerald],
                            begin: Alignment.centerLeft,
                            end: Alignment.centerRight,
                          ),
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: _brandDark.withValues(alpha: 0.18),
                              blurRadius: 20,
                              offset: const Offset(0, 8),
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.map_outlined,
                                size: 38, color: Colors.white),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    'Crea tu Itinerario Perfecto',
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w700,
                                      color: Colors.white,
                                      letterSpacing: -0.2,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Según tu presupuesto y preferencias',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: Colors.white.withValues(alpha: 0.72),
                                      height: 1.4,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 12),
                            // Pill CTA
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 16, vertical: 9),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(24),
                              ),
                              child: const Text(
                                'Empezar',
                                style: TextStyle(
                                  color: _brandDark,
                                  fontWeight: FontWeight.w700,
                                  fontSize: 13,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
          ),

          // ── Category pills ─────────────────────────────────────────────────
          if (state.categories.isNotEmpty)
            SliverToBoxAdapter(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Padding(
                    padding: EdgeInsets.fromLTRB(20, 0, 20, 12),
                    child: Text(
                      'Explorar por categoría',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: _brandDark,
                        letterSpacing: -0.2,
                      ),
                    ),
                  ),
                  SizedBox(
                    height: 42,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding:
                          const EdgeInsets.symmetric(horizontal: 20),
                      itemCount: state.categories.length,
                      itemBuilder: (context, index) {
                        final category = state.categories[index];
                        return _CategoryPill(
                          label: category['name'] ?? '',
                          icon: _getCategoryIcon(category['icon']),
                          onTap: () {
                            final slug = category['slug'] ?? '';
                            final name = category['name'] ?? '';
                            context.push(
                                '/places/category/$slug?name=$name');
                          },
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 28),
                ],
              ),
            ),

          // ── Hoteles ────────────────────────────────────────────────────────
          if (state.hotels.isNotEmpty)
            SliverToBoxAdapter(
              child: Column(
                children: [
                  _SectionHeader(
                    title: 'Hoteles',
                    onSeeAll: () => context.push('/hotels'),
                  ),
                  const SizedBox(height: 14),
                  SizedBox(
                    height: 240,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding:
                          const EdgeInsets.symmetric(horizontal: 20),
                      itemCount: state.hotels.length,
                      itemBuilder: (context, index) {
                        final place = state.hotels[index];
                        return _PlaceCard(
                          place: place,
                          onTap: () =>
                              context.push('/places/${place['id']}'),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 28),
                ],
              ),
            ),

          // ── Cosas que Hacer (todo menos hoteles) ───────────────────────────
          if (state.thingsToDo.isNotEmpty)
            SliverToBoxAdapter(
              child: Column(
                children: [
                  _SectionHeader(
                    title: 'Cosas que Hacer',
                    onSeeAll: () => context.push('/things-to-do'),
                  ),
                  const SizedBox(height: 14),
                  SizedBox(
                    height: 240,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding:
                          const EdgeInsets.symmetric(horizontal: 20),
                      itemCount: state.thingsToDo.length,
                      itemBuilder: (context, index) {
                        final place = state.thingsToDo[index];
                        return _PlaceCard(
                          place: place,
                          onTap: () =>
                              context.push('/places/${place['id']}'),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 28),
                ],
              ),
            ),

          // ── Experiencias imprescindibles ───────────────────────────────────
          if (state.experiences.isNotEmpty)
            SliverToBoxAdapter(
              child: Column(
                children: [
                  _SectionHeader(
                    title: 'Experiencias imprescindibles',
                    onSeeAll: () => context.push('/experiences/essential'),
                  ),
                  const SizedBox(height: 14),
                  SizedBox(
                    height: 250,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding:
                          const EdgeInsets.symmetric(horizontal: 20),
                      itemCount: state.experiences.length,
                      itemBuilder: (context, index) {
                        final exp = state.experiences[index];
                        return _ExperienceCard(
                          experience: exp,
                          onTap: () =>
                              context.push('/experiences/${exp.id}'),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 28),
                ],
              ),
            ),

          // ── Restaurantes ───────────────────────────────────────────────────
          if (state.restaurants.isNotEmpty)
            SliverToBoxAdapter(
              child: Column(
                children: [
                  _SectionHeader(
                    title: 'Restaurantes',
                    onSeeAll: () => context.push('/restaurants'),
                  ),
                  const SizedBox(height: 14),
                  SizedBox(
                    height: 240,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding:
                          const EdgeInsets.symmetric(horizontal: 20),
                      itemCount: state.restaurants.length,
                      itemBuilder: (context, index) {
                        final place = state.restaurants[index];
                        return _PlaceCard(
                          place: place,
                          onTap: () =>
                              context.push('/places/${place['id']}'),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 28),
                ],
              ),
            ),

          // ── Today's events ─────────────────────────────────────────────────
          if (state.todayEvents.isNotEmpty)
            SliverToBoxAdapter(
              child: Column(
                children: [
                  _SectionHeader(
                    title: 'Eventos de Hoy',
                    onSeeAll: () => context.push('/events'),
                  ),
                  const SizedBox(height: 14),
                  SizedBox(
                    height: 170,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding:
                          const EdgeInsets.symmetric(horizontal: 20),
                      itemCount: state.todayEvents.length,
                      itemBuilder: (context, index) {
                        final event = state.todayEvents[index];
                        return _EventCard(
                          event: event,
                          onTap: () => context
                              .push('/events/${event['id']}'),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 28),
                ],
              ),
            ),

          // ── Promotions ─────────────────────────────────────────────────────
          if (state.promotions.isNotEmpty)
            SliverToBoxAdapter(
              child: Column(
                children: [
                  _SectionHeader(
                    title: 'Promociones',
                    onSeeAll: () => context.push('/promotions'),
                  ),
                  const SizedBox(height: 14),
                  SizedBox(
                    height: 150,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding:
                          const EdgeInsets.symmetric(horizontal: 20),
                      itemCount: state.promotions.length,
                      itemBuilder: (context, index) {
                        final promo = state.promotions[index];
                        return _PromoCard(
                          promotion: promo,
                          onTap: () => context
                              .push('/promotions/${promo['id']}'),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 28),
                ],
              ),
            ),

          // ── Empty state ────────────────────────────────────────────────────
          if (state.featuredPlaces.isEmpty &&
              state.categories.isEmpty &&
              state.todayEvents.isEmpty &&
              state.promotions.isEmpty &&
              state.hotels.isEmpty &&
              state.thingsToDo.isEmpty &&
              state.experiences.isEmpty &&
              state.restaurants.isEmpty &&
              state.status == HomeStatus.loaded)
            SliverFillRemaining(
              hasScrollBody: false,
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
                          color: _borderSubtle,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Icon(Icons.explore_outlined,
                            size: 36, color: _textSecondary),
                      ),
                      const SizedBox(height: 18),
                      const Text(
                        'No hay contenido disponible',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: _brandDark,
                        ),
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'Desliza hacia abajo para recargar',
                        style: TextStyle(
                            fontSize: 13, color: _textSecondary),
                      ),
                    ],
                  ),
                ),
              ),
            ),

          // Bottom safe-area padding
          const SliverToBoxAdapter(child: SizedBox(height: 24)),
        ],
      ),
    );
  }

  IconData _getCategoryIcon(String? iconName) {
    switch (iconName) {
      case 'restaurant':
        return Icons.restaurant;
      case 'hotel':
        return Icons.hotel;
      case 'coffee':
        return Icons.coffee;
      case 'landscape':
        return Icons.landscape;
      case 'park':
        return Icons.park;
      case 'shopping':
        return Icons.shopping_bag;
      case 'nightlife':
        return Icons.nightlife;
      case 'culture':
        return Icons.museum;
      case 'beach':
        return Icons.beach_access;
      case 'mountain':
        return Icons.terrain;
      default:
        return Icons.place;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Fotos de Viajeros section — carrusel en el home
// ─────────────────────────────────────────────────────────────────────────────
class _TravelerPhotosSection extends ConsumerWidget {
  const _TravelerPhotosSection();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(travelerPhotosProvider);
    final loading = state.status == TravelerPhotosStatus.loading;
    return TravelerPhotosCarousel(
      photos: state.photos,
      loading: loading,
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Section header — title + "Ver todos" link
// ─────────────────────────────────────────────────────────────────────────────
class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.title, required this.onSeeAll});
  final String title;
  final VoidCallback onSeeAll;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: _brandDark,
              letterSpacing: -0.2,
            ),
          ),
          GestureDetector(
            onTap: onSeeAll,
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
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Category pill button — active: emerald fill / inactive: white+border
// ─────────────────────────────────────────────────────────────────────────────
class _CategoryPill extends StatelessWidget {
  const _CategoryPill({
    required this.label,
    required this.icon,
    this.onTap,
  });

  final String label;
  final IconData icon;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: _borderSubtle,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.03),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 16,
              color: _textSecondary,
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: _textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Experience card — larger card with score, verified/recommended badge + price
// ─────────────────────────────────────────────────────────────────────────────
class _ExperienceCard extends StatelessWidget {
  const _ExperienceCard({required this.experience, this.onTap});
  final HomeExperience experience;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final photoUrl = experience.photoUrl;
    final ratingStr =
        experience.ratingAvg.toStringAsFixed(1);
    final price = experience.pricePerAdult ?? experience.price;
    final priceStr = price > 0
        ? '${experience.currency == 'USD' ? 'US\$' : 'Bs'} ${price.toStringAsFixed(0)}'
        : null;
    final badge = experience.verified
        ? 'Verificado'
        : (experience.recommended ? 'Recomendado' : null);
    final badgeColor =
        experience.verified ? _brandEmerald : _brandGold;
    final badgeIcon = experience.verified
        ? Icons.verified
        : Icons.thumb_up_alt_rounded;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 210,
        margin: const EdgeInsets.only(right: 14),
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
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image with score + badge
            Stack(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.vertical(
                      top: Radius.circular(18)),
                  child: SizedBox(
                    height: 130,
                    width: double.infinity,
                    child: photoUrl != null
                        ? Image.network(
                            photoUrl,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => Container(
                              color: _borderSubtle,
                              child: const Center(
                                child: Icon(Icons.image_outlined,
                                    color: _textSecondary, size: 32),
                              ),
                            ),
                          )
                        : Container(
                            color: _borderSubtle,
                            child: const Center(
                              child: Icon(Icons.image_outlined,
                                  color: _textSecondary, size: 32),
                            ),
                          ),
                  ),
                ),
                // Score badge (top-right)
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
                // Verified / Recommended badge (top-left, with tooltip)
                if (badge != null)
                  Positioned(
                    top: 10,
                    left: 10,
                    child: Tooltip(
                      message: experience.recommendedReason ?? badge,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: badgeColor,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(badgeIcon,
                                size: 12, color: Colors.white),
                            const SizedBox(width: 3),
                            Text(
                              badge,
                              style: const TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
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
            // Info
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    experience.name,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: _brandDark,
                      letterSpacing: -0.1,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  if (experience.experienceCategory != null &&
                      experience.experienceCategory!.isNotEmpty)
                    Text(
                      experience.experienceCategory!,
                      style: const TextStyle(
                        fontSize: 12,
                        color: _textSecondary,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      if (priceStr != null) ...[
                        Text(
                          priceStr,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: _brandEmerald,
                          ),
                        ),
                        const SizedBox(width: 6),
                        const Text(
                          'por persona',
                          style: TextStyle(
                            fontSize: 11,
                            color: _textSecondary,
                          ),
                        ),
                      ],
                      if (experience.ratingCount > 0) ...[
                        const Spacer(),
                        Text(
                          '(${experience.ratingCount})',
                          style: const TextStyle(
                            fontSize: 11,
                            color: _textSecondary,
                          ),
                        ),
                      ],
                    ],
                  ),
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
// Place card — floating white card, hero image, gold rating badge
// ─────────────────────────────────────────────────────────────────────────────
class _PlaceCard extends StatelessWidget {
  const _PlaceCard({required this.place, this.onTap});
  final Map<String, dynamic> place;
  final VoidCallback? onTap;

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
    final isFeatured = place['isFeatured'] == true;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 175,
        margin: const EdgeInsets.only(right: 14),
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
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image with floating badges
            Stack(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.vertical(
                      top: Radius.circular(18)),
                  child: SizedBox(
                    height: 130,
                    width: double.infinity,
                    child: photoUrl != null
                        ? Image.network(
                            photoUrl,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => Container(
                              color: _borderSubtle,
                              child: const Center(
                                child: Icon(Icons.image_outlined,
                                    color: _textSecondary, size: 32),
                              ),
                            ),
                          )
                        : Container(
                            color: _borderSubtle,
                            child: const Center(
                              child: Icon(Icons.image_outlined,
                                  color: _textSecondary, size: 32),
                            ),
                          ),
                  ),
                ),
                // Rating badge
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
                // Featured badge
                if (isFeatured)
                  Positioned(
                    top: 10,
                    left: 10,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: _brandDark,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Text(
                        'Destacado',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
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
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: _brandDark,
                      letterSpacing: -0.1,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  if (categoryName.isNotEmpty)
                    Text(
                      categoryName,
                      style: const TextStyle(
                        fontSize: 12,
                        color: _textSecondary,
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
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Event card — white floating card with top image strip
// ─────────────────────────────────────────────────────────────────────────────
class _EventCard extends StatelessWidget {
  const _EventCard({required this.event, this.onTap});
  final Map<String, dynamic> event;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final photoUrl = event['photoUrl'] as String?;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 210,
        margin: const EdgeInsets.only(right: 14),
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
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius:
                  const BorderRadius.vertical(top: Radius.circular(18)),
              child: SizedBox(
                height: 90,
                width: double.infinity,
                child: photoUrl != null
                    ? Image.network(
                        photoUrl,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Container(
                          color: _brandDark.withValues(alpha: 0.06),
                          child: const Center(
                            child: Icon(Icons.event_outlined,
                                color: _brandDark, size: 30),
                          ),
                        ),
                      )
                    : Container(
                        color: _brandDark.withValues(alpha: 0.06),
                        child: const Center(
                          child: Icon(Icons.event_outlined,
                              color: _brandDark, size: 30),
                        ),
                      ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    event['name'] ?? '',
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: _brandDark,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 5),
                  Row(
                    children: [
                      const Icon(Icons.access_time_rounded,
                          size: 12, color: _textSecondary),
                      const SizedBox(width: 4),
                      Text(
                        event['dateStart'] ?? '',
                        style: const TextStyle(
                            fontSize: 11, color: _textSecondary),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    event['location'] ?? '',
                    style: const TextStyle(
                        fontSize: 11, color: _textSecondary),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
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
// Promo card — navy/emerald accent with discount pill badge
// ─────────────────────────────────────────────────────────────────────────────
class _PromoCard extends StatelessWidget {
  const _PromoCard({required this.promotion, this.onTap});
  final Map<String, dynamic> promotion;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 190,
        margin: const EdgeInsets.only(right: 14),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: _borderSubtle),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 10,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Discount badge
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: _brandEmerald,
                borderRadius: BorderRadius.circular(24),
              ),
              child: Text(
                '${promotion['discountPercentage'] ?? 0}% OFF',
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                  fontSize: 12,
                ),
              ),
            ),
            const Spacer(),
            Text(
              promotion['title'] ?? '',
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: _brandDark,
                height: 1.3,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 4),
            Text(
              (promotion['place']?['name']) ?? '',
              style: const TextStyle(fontSize: 11, color: _textSecondary),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}