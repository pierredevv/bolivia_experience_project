import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import '../../../../config/colors.dart';
import '../../../../core/widgets/empty_state.dart';
import '../../../../l10n/app_localizations.dart';
import '../providers/favorites_provider.dart';

class FavoritesScreen extends ConsumerWidget {
  const FavoritesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final favoritesState = ref.watch(favoritesProvider);
    final l10n = AppLocalizations.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.favoritesTitle),
      ),
      body: _buildBody(context, ref, favoritesState),
    );
  }

  Widget _buildBody(BuildContext context, WidgetRef ref, FavoritesState state) {
    final l10n = AppLocalizations.of(context);

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
              Icon(Icons.error_outline, size: 64, color: AppColors.error500),
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
                label: Text(l10n.retry),
              ),
            ],
          ),
        ),
      );
    }

    if (state.favorites.isEmpty) {
      return EmptyState(
        icon: Icons.favorite_outline,
        title: l10n.favoritesEmpty,
        subtitle: l10n.favoritesEmptySubtitle,
        actionLabel: l10n.exploreTitle,
        onAction: () => context.go('/explore'),
      );
    }

    return RefreshIndicator(
      onRefresh: () => ref.read(favoritesProvider.notifier).loadFavorites(),
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: state.favorites.length,
        itemBuilder: (context, index) {
          final favorite = state.favorites[index];
          final place = favorite['place'] ?? favorite;
          return _FavoritePlaceCard(
            place: place,
            onTap: () => context.go('/places/${place['id']}'),
            onRemove: () {
              ref.read(favoritesProvider.notifier).removeFavorite(place['id']);
            },
          );
        },
      ),
    );
  }
}

class _FavoritePlaceCard extends StatelessWidget {
  final dynamic place;
  final VoidCallback? onTap;
  final VoidCallback? onRemove;

  const _FavoritePlaceCard({
    required this.place,
    this.onTap,
    this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    final photos = place['photos'] as List<dynamic>? ?? [];
    final photoUrl = photos.isNotEmpty ? photos[0]['url'] : null;
    final rating = place['rating'] as Map<String, dynamic>? ?? {};
    final averageRating = rating['average'] ?? 0;
    final category = place['category'] as Map<String, dynamic>? ?? {};

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
              Container(
                width: 60,
                height: 60,
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
                            return Center(
                              child: Icon(Icons.image, color: AppColors.neutral400),
                            );
                          },
                        ),
                      )
                    : Center(
                        child: Icon(Icons.image, color: AppColors.neutral400),
                      ),
              ),
              const SizedBox(width: 12),
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
                    if (category.isNotEmpty)
                      Text(
                        category['name'] ?? '',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(Icons.star, size: 14, color: AppColors.secondary500),
                        const SizedBox(width: 4),
                        Text(
                          '$averageRating',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              IconButton(
                icon: Icon(Icons.favorite, color: AppColors.error500),
                onPressed: onRemove,
              ),
            ],
          ),
        ),
      ),
    );
  }
}