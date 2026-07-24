import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../config/colors.dart';
import '../providers/places_provider.dart';

class PlacesListScreen extends ConsumerStatefulWidget {
  final String categorySlug;
  final String categoryName;

  const PlacesListScreen({
    super.key,
    required this.categorySlug,
    required this.categoryName,
  });

  @override
  ConsumerState<PlacesListScreen> createState() => _PlacesListScreenState();
}

class _PlacesListScreenState extends ConsumerState<PlacesListScreen> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    ref.read(placesProvider.notifier).loadPlacesByCategory(widget.categorySlug);

    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      ref.read(placesProvider.notifier).loadMorePlaces();
    }
  }

  @override
  Widget build(BuildContext context) {
    final placesState = ref.watch(placesProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.categoryName),
      ),
      body: _buildBody(context, placesState),
    );
  }

  Widget _buildBody(BuildContext context, PlacesState state) {
    if (state.status == PlacesStatus.loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (state.status == PlacesStatus.error) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: AppColors.error500),
              const SizedBox(height: 16),
              Text(
                state.errorMessage ?? 'Error al cargar lugares',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: () {
                  ref.read(placesProvider.notifier).loadPlacesByCategory(widget.categorySlug);
                },
                icon: const Icon(Icons.refresh),
                label: const Text('Reintentar'),
              ),
            ],
          ),
        ),
      );
    }

    if (state.places.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.place_outlined, size: 64, color: AppColors.neutral400),
              const SizedBox(height: 16),
              Text(
                'No se encontraron lugares',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 8),
              Text(
                'No hay lugares disponibles en esta categoría',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ],
          ),
        ),
      );
    }

    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.all(16),
      itemCount: state.places.length + (state.hasNext ? 1 : 0),
      itemBuilder: (context, index) {
        if (index == state.places.length) {
          return const Center(
            child: Padding(
              padding: EdgeInsets.all(16),
              child: CircularProgressIndicator(),
            ),
          );
        }

        final place = state.places[index];
        return _PlaceListCard(
          place: place,
          onTap: () => context.push('/places/${place.id}'),
        );
      },
    );
  }
}

class _PlaceListCard extends StatelessWidget {
  final dynamic place;
  final VoidCallback? onTap;

  const _PlaceListCard({required this.place, this.onTap});

  @override
  Widget build(BuildContext context) {
    final photos = place.photos as List<dynamic>? ?? [];
    final photoUrl = photos.isNotEmpty ? photos[0]['url'] : null;
    final averageRating = place.ratingAvg ?? 0;
    final ratingCount = place.ratingCount ?? 0;
    final category = place.category as Map<String, dynamic>? ?? {};

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
                width: 80,
                height: 80,
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
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      place.name,
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
                        const Icon(Icons.star, size: 14, color: AppColors.secondary500),
                        const SizedBox(width: 4),
                        Text(
                          '$averageRating ($ratingCount)',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                    if (place.address != null) ...[
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.location_on, size: 14, color: AppColors.neutral500),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              place.address!,
                              style: Theme.of(context).textTheme.bodySmall,
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
            ],
          ),
        ),
      ),
    );
  }
}