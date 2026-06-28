import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../config/colors.dart';
import '../providers/place_detail_provider.dart';

class PlaceDetailScreen extends ConsumerWidget {
  final String placeId;

  const PlaceDetailScreen({super.key, required this.placeId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final placeDetailState = ref.watch(placeDetailProvider(placeId));

    return Scaffold(
      body: _buildBody(context, ref, placeDetailState),
    );
  }

  Widget _buildBody(BuildContext context, WidgetRef ref, PlaceDetailState state) {
    if (state.status == PlaceDetailStatus.loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (state.status == PlaceDetailStatus.error) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 64, color: AppColors.error500),
              const SizedBox(height: 16),
              Text(
                state.errorMessage ?? 'Error al cargar detalles',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: () => ref.read(placeDetailProvider(placeId).notifier).loadPlaceDetail(),
                icon: const Icon(Icons.refresh),
                label: const Text('Reintentar'),
              ),
            ],
          ),
        ),
      );
    }

    final place = state.place;
    if (place == null) {
      return const Center(child: Text('No se encontró el lugar'));
    }

    final photos = state.photos;
    final reviews = state.reviews;
    final averageRating = place.ratingAvg ?? 0;
    final ratingCount = place.ratingCount ?? 0;
    final category = place.category ?? {};

    return CustomScrollView(
      slivers: [
        SliverAppBar(
          expandedHeight: 300,
          pinned: true,
          flexibleSpace: FlexibleSpaceBar(
            background: photos.isNotEmpty
                ? PageView.builder(
                    itemCount: photos.length,
                    itemBuilder: (context, index) {
                      final photo = photos[index];
                      return Image.network(
                        photo['url'] ?? '',
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return Container(
                            color: AppColors.neutral200,
                            child: Center(
                              child: Icon(Icons.image, size: 80, color: AppColors.neutral400),
                            ),
                          );
                        },
                      );
                    },
                  )
                : Container(
                    color: AppColors.neutral200,
                    child: Center(
                      child: Icon(Icons.image, size: 80, color: AppColors.neutral400),
                    ),
                  ),
          ),
          actions: [
            IconButton(
              icon: Icon(
                state.isFavorite ? Icons.favorite : Icons.favorite_outline,
                color: state.isFavorite ? AppColors.error500 : null,
              ),
              onPressed: () {
                // TODO: Toggle favorite
              },
            ),
            IconButton(
              icon: const Icon(Icons.share),
              onPressed: () {
                // TODO: Share place
              },
            ),
          ],
        ),

        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  place.name,
                  style: Theme.of(context).textTheme.headlineLarge,
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    if (category.isNotEmpty)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.primary100,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          category['name'] ?? '',
                          style: TextStyle(color: AppColors.primary700, fontSize: 12),
                        ),
                      ),
                    const SizedBox(width: 8),
                    Icon(Icons.star, size: 16, color: AppColors.secondary500),
                    const SizedBox(width: 4),
                    Text('$averageRating ($ratingCount reseñas)'),
                  ],
                ),

                const SizedBox(height: 16),

                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    _ActionButton(
                      icon: Icons.directions,
                      label: 'Cómo llegar',
                      color: AppColors.primary700,
                      onTap: () async {
                        final lat = place.latitude;
                        final lng = place.longitude;
                        if (lat != null && lng != null) {
                          final url = 'https://www.google.com/maps/search/?api=1&query=$lat,$lng';
                          if (await canLaunchUrl(Uri.parse(url))) {
                            await launchUrl(Uri.parse(url));
                          }
                        }
                      },
                    ),
                    _ActionButton(
                      icon: Icons.phone,
                      label: 'Llamar',
                      color: AppColors.success700,
                      onTap: () async {
                        if (place.phone != null) {
                          final url = 'tel:${place.phone}';
                          if (await canLaunchUrl(Uri.parse(url))) {
                            await launchUrl(Uri.parse(url));
                          }
                        }
                      },
                    ),
                    _ActionButton(
                      icon: Icons.share,
                      label: 'Compartir',
                      color: AppColors.secondary700,
                      onTap: () {
                        // TODO: Share
                      },
                    ),
                  ],
                ),

                const SizedBox(height: 24),

                if (place.description != null) ...[
                  Text(
                    'Descripción',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    place.description!,
                    style: Theme.of(context).textTheme.bodyLarge,
                  ),
                  const SizedBox(height: 24),
                ],

                Text(
                  'Contacto',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 8),
                if (place.address != null)
                  _ContactRow(icon: Icons.location_on, text: place.address!),
                if (place.phone != null)
                  _ContactRow(icon: Icons.phone, text: place.phone!),
                if (place.website != null)
                  _ContactRow(icon: Icons.language, text: place.website!),

                const SizedBox(height: 24),

                if (place.latitude != null && place.longitude != null) ...[
                  Text(
                    'Ubicación',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 8),
                  Container(
                    height: 200,
                    decoration: BoxDecoration(
                      color: AppColors.neutral200,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Center(
                      child: Icon(Icons.map, size: 50, color: AppColors.neutral400),
                    ),
                  ),
                  const SizedBox(height: 24),
                ],

                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Reseñas',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    TextButton(
                      onPressed: () => context.push('/places/$placeId/review'),
                      child: const Text('Escribir reseña'),
                    ),
                  ],
                ),
                const SizedBox(height: 8),

                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        Column(
                          children: [
                            Text(
                              '$averageRating',
                              style: Theme.of(context).textTheme.displayLarge?.copyWith(
                                color: AppColors.primary700,
                              ),
                            ),
                            Row(
                              children: List.generate(5, (index) {
                                return Icon(
                                   index < (double.tryParse(averageRating.toString()) ?? 0).round()
                                      ? Icons.star
                                      : Icons.star_half,
                                  color: AppColors.secondary500,
                                  size: 20,
                                );
                              }),
                            ),
                            Text('$ratingCount reseñas'),
                          ],
                        ),
                        const SizedBox(width: 24),
                        Expanded(
                          child: Column(
                            children: [
                              _RatingBar(label: '5', value: 0.7),
                              _RatingBar(label: '4', value: 0.2),
                              _RatingBar(label: '3', value: 0.05),
                              _RatingBar(label: '2', value: 0.03),
                              _RatingBar(label: '1', value: 0.02),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                ...reviews.map((review) {
                  return _ReviewCard(
                    userName: review['user']?['name'] ?? 'Usuario',
                    rating: review['rating'] ?? 0,
                    comment: review['comment'] ?? '',
                    date: review['createdAt'] ?? '',
                  );
                }),

                const SizedBox(height: 80),
              ],
            ),
          ),
        ),
      ],
    );
  }

}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _ActionButton({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color),
          ),
          const SizedBox(height: 4),
          Text(label, style: Theme.of(context).textTheme.bodySmall),
        ],
      ),
    );
  }
}

class _ContactRow extends StatelessWidget {
  final IconData icon;
  final String text;

  const _ContactRow({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppColors.neutral500),
          const SizedBox(width: 12),
          Expanded(child: Text(text)),
        ],
      ),
    );
  }
}

class _RatingBar extends StatelessWidget {
  final String label;
  final double value;

  const _RatingBar({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        children: [
          Text(label, style: const TextStyle(fontSize: 12)),
          const SizedBox(width: 8),
          Expanded(
            child: LinearProgressIndicator(
              value: value,
              backgroundColor: AppColors.neutral200,
              valueColor: AlwaysStoppedAnimation(AppColors.secondary500),
            ),
          ),
        ],
      ),
    );
  }
}

class _ReviewCard extends StatelessWidget {
  final String userName;
  final int rating;
  final String comment;
  final String date;

  const _ReviewCard({
    required this.userName,
    required this.rating,
    required this.comment,
    required this.date,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 16,
                  backgroundColor: AppColors.primary100,
                  child: Text(userName.isNotEmpty ? userName[0] : 'U'),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(userName, style: Theme.of(context).textTheme.titleSmall),
                      Text(date, style: Theme.of(context).textTheme.bodySmall),
                    ],
                  ),
                ),
                Row(
                  children: List.generate(5, (index) {
                    return Icon(
                      index < rating ? Icons.star : Icons.star_outline,
                      color: AppColors.secondary500,
                      size: 16,
                    );
                  }),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(comment),
          ],
        ),
      ),
    );
  }
}