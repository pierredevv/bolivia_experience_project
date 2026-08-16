import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../config/colors.dart';
import '../providers/recommendations_provider.dart';
import '../../domain/recommendations.dart';

class RecommendationsScreen extends ConsumerStatefulWidget {
  const RecommendationsScreen({super.key});

  @override
  ConsumerState<RecommendationsScreen> createState() =>
      _RecommendationsScreenState();
}

class _RecommendationsScreenState extends ConsumerState<RecommendationsScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(
      () => ref.read(recommendationsProvider.notifier).loadRecommendations(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(recommendationsProvider);

    return Scaffold(
      backgroundColor: AppColors.backgroundCanvas,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Header ──────────────────────────────────────────────────────
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
                      'Recomendado para ti',
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
            // ── Preferencias activas ────────────────────────────────────────
            if (state.data?.basedOn.preferences.budgetType != null ||
                state.data?.basedOn.preferences.tourismType != null)
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 4, 20, 8),
                child: _PreferencesChip(state: state.data!.basedOn),
              ),
            Expanded(child: _buildBody(state)),
          ],
        ),
      ),
    );
  }

  Widget _buildBody(RecommendationsState state) {
    switch (state.status) {
      case RecommendationsStatus.initial:
      case RecommendationsStatus.loading:
        return const Center(
          child: CircularProgressIndicator(color: AppColors.brandEmerald),
        );
      case RecommendationsStatus.error:
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
                  child: const Icon(Icons.recommend_outlined,
                      size: 36, color: AppColors.error500),
                ),
                const SizedBox(height: 18),
                Text(
                  state.errorMessage ?? 'Error al cargar recomendaciones',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 15,
                    color: AppColors.textSecondary,
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  height: 46,
                  child: ElevatedButton.icon(
                    onPressed: () => ref
                        .read(recommendationsProvider.notifier)
                        .loadRecommendations(),
                    icon: const Icon(Icons.refresh, size: 18),
                    label: const Text('Reintentar'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.brandDark,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      case RecommendationsStatus.loaded:
        final recs = state.data?.recommendations ?? [];
        if (recs.isEmpty) {
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
                      color: AppColors.borderSubtle,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Icon(Icons.explore_outlined,
                        size: 36, color: AppColors.textSecondary),
                  ),
                  const SizedBox(height: 18),
                  const Text(
                    'Todavía no tenemos recomendaciones para vos.\nGuardá favoritos o creá un viaje.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 15,
                      color: AppColors.textSecondary,
                      height: 1.5,
                    ),
                  ),
                ],
              ),
            ),
          );
        }
        return RefreshIndicator(
          color: AppColors.brandEmerald,
          onRefresh: () async =>
              ref.read(recommendationsProvider.notifier).loadRecommendations(),
          child: ListView.separated(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
            itemCount: recs.length,
            separatorBuilder: (_, __) => const SizedBox(height: 14),
            itemBuilder: (context, index) {
              final place = recs[index];
              return _RecommendationTile(
                place: place,
                onTap: () => context.push('/places/${place['id']}'),
              );
            },
          ),
        );
    }
  }
}

class _PreferencesChip extends StatelessWidget {
  const _PreferencesChip({required this.state});

  final RecommendationBasedOn state;

  String get _budgetLabel {
    switch (state.preferences.budgetType) {
      case 'low_cost':
        return 'Presupuesto bajo';
      case 'medio':
        return 'Presupuesto medio';
      case 'premium':
      case 'luxury':
        return 'Alta gama';
      default:
        return '';
    }
  }

  String get _tourismLabel {
    switch (state.preferences.tourismType) {
      case 'urbano':
        return 'Urbano';
      case 'rural':
        return 'Naturaleza';
      default:
        return '';
    }
  }

  @override
  Widget build(BuildContext context) {
    final parts = [
      if (_budgetLabel.isNotEmpty) _budgetLabel,
      if (_tourismLabel.isNotEmpty) _tourismLabel,
    ];
    if (parts.isEmpty) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.brandEmerald.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: AppColors.brandEmerald.withValues(alpha: 0.3),
        ),
      ),
      child: Row(
        children: [
          const Icon(Icons.auto_awesome,
              size: 16, color: AppColors.brandEmerald),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              'Según tus preferencias: ${parts.join(' · ')}',
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: AppColors.brandDark,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _RecommendationTile extends StatelessWidget {
  const _RecommendationTile({required this.place, this.onTap});

  final Map<String, dynamic> place;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final score = place['matchScore'];
    final scoreNum = score is num ? score.toInt() : null;
    final priceVerified = place['priceVerified'] == true;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 10,
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
              child: _PlacePhoto(place: place),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 12, 14, 14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          place['name'] ?? '',
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: AppColors.brandDark,
                            letterSpacing: -0.2,
                          ),
                        ),
                      ),
                      if (scoreNum != null)
                        _ScoreBadge(score: scoreNum),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(Icons.star_rounded,
                          size: 15, color: AppColors.brandGold),
                      const SizedBox(width: 3),
                      Text(
                        _ratingText(),
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: AppColors.brandDark,
                        ),
                      ),
                      if (priceVerified) ...[
                        const SizedBox(width: 10),
                        const Icon(Icons.price_check,
                            size: 14, color: AppColors.brandEmerald),
                        const SizedBox(width: 3),
                        const Text(
                          'Precio verificado',
                          style: TextStyle(
                            fontSize: 11,
                            color: AppColors.textSecondary,
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

  String _ratingText() {
    final rating = place['ratingAvg'];
    return rating is double
        ? rating.toStringAsFixed(1)
        : (rating ?? 0).toString();
  }
}

class _ScoreBadge extends StatelessWidget {
  const _ScoreBadge({required this.score});

  final int score;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.brandGold,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        '$score% match',
        style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: Colors.white,
        ),
      ),
    );
  }
}

class _PlacePhoto extends StatelessWidget {
  const _PlacePhoto({required this.place});

  final Map<String, dynamic> place;

  @override
  Widget build(BuildContext context) {
    final photos = place['photos'];
    final photoUrl =
        (photos is List && photos.isNotEmpty && photos[0] is Map)
            ? photos[0]['url']?.toString()
            : null;

    return SizedBox(
      height: 160,
      width: double.infinity,
      child: photoUrl != null
          ? Image.network(
              photoUrl,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => const _PhotoPlaceholder(),
            )
          : const _PhotoPlaceholder(),
    );
  }
}

class _PhotoPlaceholder extends StatelessWidget {
  const _PhotoPlaceholder();

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.borderSubtle,
      child: const Center(
        child: Icon(Icons.image_outlined,
            color: AppColors.textSecondary, size: 40),
      ),
    );
  }
}
