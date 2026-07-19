import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:intl/intl.dart';
import '../../../../config/colors.dart';
import '../providers/place_detail_provider.dart';

class PlaceDetailScreen extends ConsumerStatefulWidget {
  final String placeId;

  const PlaceDetailScreen({super.key, required this.placeId});

  @override
  ConsumerState<PlaceDetailScreen> createState() => _PlaceDetailScreenState();
}

class _PlaceDetailScreenState extends ConsumerState<PlaceDetailScreen> {
  int _currentPhotoIndex = 0;
  bool _isDescriptionExpanded = false;

  @override
  Widget build(BuildContext context) {
    final placeDetailState = ref.watch(placeDetailProvider(widget.placeId));

    return Scaffold(
      body: _buildBody(context, ref, placeDetailState),
      bottomNavigationBar: _buildBottomBar(context, ref, placeDetailState),
    );
  }

  Widget _buildBody(BuildContext context, WidgetRef ref, PlaceDetailState state) {
    if (state.status == PlaceDetailStatus.loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (state.status == PlaceDetailStatus.error) {
      return _buildErrorState(context, ref, state);
    }

    final place = state.place;
    if (place == null) {
      return const Center(child: Text('No se encontró el lugar'));
    }

    return CustomScrollView(
      slivers: [
        // Photo Gallery with Hero
        _buildPhotoGallery(state),

        SliverToBoxAdapter(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Info
              _buildHeaderInfo(context, place),

              // Quick Actions
              _buildQuickActions(context, ref, place, state),

              const Divider(height: 1),

              // Description
              if (place.description != null && place.description!.isNotEmpty)
                _buildDescriptionSection(context, place),

              // Operating Hours
              _buildOperatingHours(context, place),

              // Contact Info
              _buildContactSection(context, place),

              // Social Media
              _buildSocialMediaSection(context, place),

              // Location Map
              _buildLocationSection(context, place),

              // Reviews Section
              _buildReviewsSection(context, ref, state),

              const SizedBox(height: 100),
            ],
          ),
        ),
      ],
    );
  }

  // ============================================================================
  // Photo Gallery
  // ============================================================================
  Widget _buildPhotoGallery(PlaceDetailState state) {
    final photos = state.photos;

    return SliverAppBar(
      expandedHeight: 350,
      pinned: true,
      stretch: true,
      backgroundColor: AppColors.neutral900,
      flexibleSpace: FlexibleSpaceBar(
        background: Stack(
          fit: StackFit.expand,
          children: [
            // Photo PageView
            if (photos.isNotEmpty)
              PageView.builder(
                itemCount: photos.length,
                onPageChanged: (index) {
                  setState(() => _currentPhotoIndex = index);
                },
                itemBuilder: (context, index) {
                  final photo = photos[index];
                  return Hero(
                    tag: 'place_photo_${photo['id']}',
                    child: Image.network(
                      photo['url'] ?? '',
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          color: AppColors.neutral200,
                          child: const Center(
                            child: Icon(Icons.image, size: 80, color: AppColors.neutral400),
                          ),
                        );
                      },
                    ),
                  );
                },
              )
            else
              Container(
                color: AppColors.neutral200,
                child: const Center(
                  child: Icon(Icons.image, size: 80, color: AppColors.neutral400),
                ),
              ),

            // Gradient overlay
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              height: 100,
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.transparent,
                      Colors.black.withOpacity(0.7),
                    ],
                  ),
                ),
              ),
            ),

            // Photo indicators
            if (photos.length > 1)
              Positioned(
                bottom: 16,
                left: 0,
                right: 0,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(
                    photos.length,
                    (index) => AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      width: _currentPhotoIndex == index ? 24 : 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: _currentPhotoIndex == index
                            ? Colors.white
                            : Colors.white.withOpacity(0.5),
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                  ),
                ),
              ),

            // Photo counter
            if (photos.length > 1)
              Positioned(
                top: MediaQuery.of(context).padding.top + 56,
                right: 16,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.6),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Text(
                    '${_currentPhotoIndex + 1}/${photos.length}',
                    style: const TextStyle(color: Colors.white, fontSize: 12),
                  ),
                ),
              ),
          ],
        ),
      ),
      actions: [
        // Favorite button
        Consumer(
          builder: (context, ref, _) {
            final state = ref.watch(placeDetailProvider(widget.placeId));
            return IconButton(
              icon: AnimatedSwitcher(
                duration: const Duration(milliseconds: 300),
                child: Icon(
                  state.isFavorite ? Icons.favorite : Icons.favorite_border,
                  key: ValueKey(state.isFavorite),
                  color: state.isFavorite ? AppColors.error500 : Colors.white,
                ),
              ),
              onPressed: () {
                ref.read(placeDetailProvider(widget.placeId).notifier).toggleFavorite();
              },
            );
          },
        ),
        // Share button
        IconButton(
          icon: const Icon(Icons.share, color: Colors.white),
          onPressed: () => _sharePlace(),
        ),
      ],
    );
  }

  // ============================================================================
  // Header Info
  // ============================================================================
  Widget _buildHeaderInfo(BuildContext context, dynamic place) {
    final rating = place.ratingAvg is num ? place.ratingAvg.toDouble() : 0.0;
    final ratingCount = place.ratingCount ?? 0;
    final category = place.category as Map<String, dynamic>? ?? {};

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Category badge
          if (category.isNotEmpty)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: AppColors.primary100,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.category, size: 14, color: AppColors.primary700),
                  const SizedBox(width: 6),
                  Text(
                    category['name'] ?? '',
                    style: TextStyle(
                      color: AppColors.primary700,
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          const SizedBox(height: 12),

          // Place name
          Text(
            place.name,
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),

          // Rating and address
          Row(
            children: [
              // Rating
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.secondary500,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.star, size: 16, color: Colors.white),
                    const SizedBox(width: 4),
                    Text(
                      rating.toStringAsFixed(1),
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Text(
                '($ratingCount reseñas)',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.neutral600,
                ),
              ),
              const Spacer(),
              if (place.isFeatured == true)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.warning100,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.verified, size: 14, color: AppColors.warning700),
                      const SizedBox(width: 4),
                      Text(
                        'Destacado',
                        style: TextStyle(
                          color: AppColors.warning700,
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),

          // Address
          if (place.address != null) ...[
            const SizedBox(height: 12),
            Row(
              children: [
                Icon(Icons.location_on, size: 18, color: AppColors.neutral500),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    place.address!,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppColors.neutral700,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  // ============================================================================
  // Quick Actions
  // ============================================================================
  Widget _buildQuickActions(BuildContext context, WidgetRef ref, dynamic place, PlaceDetailState state) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _QuickActionButton(
            icon: Icons.directions,
            label: 'Cómo llegar',
            color: AppColors.primary700,
            onTap: () => _openMaps(place),
          ),
          _QuickActionButton(
            icon: Icons.phone,
            label: 'Llamar',
            color: AppColors.success700,
            onTap: () => _callPlace(place),
          ),
          _QuickActionButton(
            icon: Icons.share,
            label: 'Compartir',
            color: AppColors.secondary700,
            onTap: () => _sharePlace(),
          ),
          _QuickActionButton(
            icon: Icons.rate_review,
            label: 'Reseña',
            color: AppColors.primary600,
            onTap: () => context.push('/places/${widget.placeId}/review'),
          ),
        ],
      ),
    );
  }

  // ============================================================================
  // Description Section
  // ============================================================================
  Widget _buildDescriptionSection(BuildContext context, dynamic place) {
    final description = place.description ?? '';
    final isLong = description.length > 200;

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.info_outline, size: 20, color: AppColors.primary600),
              const SizedBox(width: 8),
              Text(
                'Descripción',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          AnimatedCrossFade(
            firstChild: Text(
              description,
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                height: 1.6,
              ),
              maxLines: 4,
              overflow: TextOverflow.ellipsis,
            ),
            secondChild: Text(
              description,
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                height: 1.6,
              ),
            ),
            crossFadeState: _isDescriptionExpanded
                ? CrossFadeState.showSecond
                : CrossFadeState.showFirst,
            duration: const Duration(milliseconds: 300),
          ),
          if (isLong)
            GestureDetector(
              onTap: () {
                setState(() {
                  _isDescriptionExpanded = !_isDescriptionExpanded;
                });
              },
              child: Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Text(
                  _isDescriptionExpanded ? 'Ver menos' : 'Ver más',
                  style: TextStyle(
                    color: AppColors.primary700,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  // ============================================================================
  // Operating Hours
  // ============================================================================
  Widget _buildOperatingHours(BuildContext context, dynamic place) {
    // Placeholder - would need hours data from API
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.access_time, size: 20, color: AppColors.primary600),
              const SizedBox(width: 8),
              Text(
                'Horarios',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.success100,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Icon(Icons.check_circle, color: AppColors.success700, size: 20),
                const SizedBox(width: 8),
                Text(
                  'Abierto ahora',
                  style: TextStyle(
                    color: AppColors.success700,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const Spacer(),
                Text(
                  'Cierra a las 23:00',
                  style: TextStyle(color: AppColors.success700),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          // Weekly hours
          ..._buildWeeklyHours(context),
        ],
      ),
    );
  }

  List<Widget> _buildWeeklyHours(BuildContext context) {
    final days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    final now = DateTime.now();
    final currentDayIndex = now.weekday - 1;

    return days.asMap().entries.map((entry) {
      final index = entry.key;
      final day = entry.value;
      final isToday = index == currentDayIndex;

      return Container(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
        decoration: isToday
            ? BoxDecoration(
                color: AppColors.primary50,
                borderRadius: BorderRadius.circular(8),
              )
            : null,
        child: Row(
          children: [
            SizedBox(
              width: 80,
              child: Text(
                day,
                style: TextStyle(
                  fontWeight: isToday ? FontWeight.bold : FontWeight.normal,
                  color: isToday ? AppColors.primary700 : null,
                ),
              ),
            ),
            const Spacer(),
            Text(
              index < 5 ? '11:00 - 23:00' : '11:00 - 00:00',
              style: TextStyle(
                color: isToday ? AppColors.primary700 : AppColors.neutral600,
                fontWeight: isToday ? FontWeight.w500 : null,
              ),
            ),
          ],
        ),
      );
    }).toList();
  }

  // ============================================================================
  // Contact Section
  // ============================================================================
  Widget _buildContactSection(BuildContext context, dynamic place) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.contact_phone, size: 20, color: AppColors.primary600),
              const SizedBox(width: 8),
              Text(
                'Contacto',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (place.phone != null)
            _ContactTile(
              icon: Icons.phone,
              title: place.phone!,
              subtitle: 'Llamar ahora',
              onTap: () => _callPlace(place),
              color: AppColors.success700,
            ),
          if (place.website != null)
            _ContactTile(
              icon: Icons.language,
              title: place.website!,
              subtitle: 'Visitar sitio web',
              onTap: () => _launchUrl(place.website!),
              color: AppColors.primary700,
            ),
          if (place.address != null)
            _ContactTile(
              icon: Icons.location_on,
              title: place.address!,
              subtitle: 'Ver en mapa',
              onTap: () => _openMaps(place),
              color: AppColors.secondary700,
            ),
        ],
      ),
    );
  }

  // ============================================================================
  // Social Media Section
  // ============================================================================
  Widget _buildSocialMediaSection(BuildContext context, dynamic place) {
    final socialLinks = <Map<String, dynamic>>[];

    if (place.instagram != null) {
      socialLinks.add({
        'icon': Icons.camera_alt,
        'label': 'Instagram',
        'url': 'https://instagram.com/${place.instagram}',
        'color': const Color(0xFFE4405F),
      });
    }

    if (place.facebook != null) {
      socialLinks.add({
        'icon': Icons.facebook,
        'label': 'Facebook',
        'url': 'https://facebook.com/${place.facebook}',
        'color': const Color(0xFF1877F2),
      });
    }

    if (place.tiktok != null) {
      socialLinks.add({
        'icon': Icons.music_note,
        'label': 'TikTok',
        'url': 'https://tiktok.com/@${place.tiktok}',
        'color': const Color(0xFF000000),
      });
    }

    if (socialLinks.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.social_distance, size: 20, color: AppColors.primary600),
              const SizedBox(width: 8),
              Text(
                'Redes Sociales',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: socialLinks.map((social) {
              return InkWell(
                onTap: () => _launchUrl(social['url']),
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  decoration: BoxDecoration(
                    color: social['color'].withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: social['color'].withOpacity(0.3),
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(social['icon'], color: social['color'], size: 20),
                      const SizedBox(width: 8),
                      Text(
                        social['label'],
                        style: TextStyle(
                          color: social['color'],
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  // ============================================================================
  // Location Section
  // ============================================================================
  Widget _buildLocationSection(BuildContext context, dynamic place) {
    if (place.latitude == null || place.longitude == null) {
      return const SizedBox.shrink();
    }

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.map, size: 20, color: AppColors.primary600),
              const SizedBox(width: 8),
              Text(
                'Ubicación',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          GestureDetector(
            onTap: () => _openMaps(place),
            child: Container(
              height: 180,
              decoration: BoxDecoration(
                color: AppColors.neutral200,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.neutral300),
              ),
              child: Stack(
                children: [
                  Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.map, size: 48, color: AppColors.neutral400),
                        const SizedBox(height: 8),
                        Text(
                          'Toca para abrir en Google Maps',
                          style: TextStyle(color: AppColors.neutral500),
                        ),
                      ],
                    ),
                  ),
                  Positioned(
                    bottom: 12,
                    right: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: AppColors.primary700,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.directions, color: Colors.white, size: 16),
                          SizedBox(width: 4),
                          Text(
                            'Abrir',
                            style: TextStyle(color: Colors.white, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ============================================================================
  // Reviews Section
  // ============================================================================
  Widget _buildReviewsSection(BuildContext context, WidgetRef ref, PlaceDetailState state) {
    final reviews = state.reviews;
    final place = state.place;
    final rating = place?.ratingAvg is num ? place!.ratingAvg.toDouble() : 0.0;
    final ratingCount = place?.ratingCount ?? 0;

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(Icons.reviews, size: 20, color: AppColors.primary600),
                  const SizedBox(width: 8),
                  Text(
                    'Reseñas',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              TextButton.icon(
                onPressed: () => context.push('/places/${widget.placeId}/review'),
                icon: const Icon(Icons.edit, size: 18),
                label: const Text('Escribir'),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Rating Summary Card
          _buildRatingSummary(context, rating, ratingCount),

          const SizedBox(height: 16),

          // Reviews List
          if (reviews.isEmpty)
            Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    Icon(Icons.reviews, size: 48, color: AppColors.neutral300),
                    const SizedBox(height: 12),
                    Text(
                      'No hay reseñas aún',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: AppColors.neutral500,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Sé el primero en escribir una reseña',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.neutral400,
                      ),
                    ),
                  ],
                ),
              ),
            )
          else
            ...reviews.map((review) => _buildReviewCard(context, review)),
        ],
      ),
    );
  }

  Widget _buildRatingSummary(BuildContext context, double rating, int ratingCount) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.primary50,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          // Big rating number
          Column(
            children: [
              Text(
                rating.toStringAsFixed(1),
                style: Theme.of(context).textTheme.displaySmall?.copyWith(
                  color: AppColors.primary700,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Row(
                children: List.generate(5, (index) {
                  return Icon(
                    index < rating.round() ? Icons.star : Icons.star_border,
                    color: AppColors.secondary500,
                    size: 18,
                  );
                }),
              ),
              const SizedBox(height: 4),
              Text(
                '$ratingCount reseñas',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: AppColors.neutral600,
                ),
              ),
            ],
          ),
          const SizedBox(width: 24),
          // Rating bars
          Expanded(
            child: Column(
              children: [
                _RatingBar(label: '5', percentage: 0.7, color: AppColors.success500),
                _RatingBar(label: '4', percentage: 0.2, color: AppColors.success300),
                _RatingBar(label: '3', percentage: 0.05, color: AppColors.warning500),
                _RatingBar(label: '2', percentage: 0.03, color: AppColors.secondary500),
                _RatingBar(label: '1', percentage: 0.02, color: AppColors.error500),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReviewCard(BuildContext context, dynamic review) {
    final user = review['user'] as Map<String, dynamic>? ?? {};
    final replies = review['replies'] as List<dynamic>? ?? [];
    final userName = user['name'] ?? 'Usuario';
    final userPhoto = user['photoUrl'];
    final rating = review['rating'] ?? 0;
    final comment = review['comment'] ?? '';
    final createdAt = review['createdAt'];

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: AppColors.neutral200),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // User info
            Row(
              children: [
                CircleAvatar(
                  radius: 20,
                  backgroundColor: AppColors.primary100,
                  backgroundImage: userPhoto != null ? NetworkImage(userPhoto) : null,
                  child: userPhoto == null
                      ? Text(
                          userName.isNotEmpty ? userName[0].toUpperCase() : 'U',
                          style: TextStyle(
                            color: AppColors.primary700,
                            fontWeight: FontWeight.bold,
                          ),
                        )
                      : null,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        userName,
                        style: Theme.of(context).textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        _formatDate(createdAt),
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.neutral500,
                        ),
                      ),
                    ],
                  ),
                ),
                // Rating
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: _getRatingColor(rating).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.star, size: 14, color: _getRatingColor(rating)),
                      const SizedBox(width: 4),
                      Text(
                        '$rating',
                        style: TextStyle(
                          color: _getRatingColor(rating),
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            // Comment
            if (comment.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text(
                comment,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  height: 1.5,
                ),
              ),
            ],

            // Replies
            if (replies.isNotEmpty) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.neutral50,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.reply, size: 16, color: AppColors.primary600),
                        const SizedBox(width: 4),
                        Text(
                          'Respuesta del negocio',
                          style: TextStyle(
                            color: AppColors.primary700,
                            fontWeight: FontWeight.w600,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    ...replies.map((reply) {
                      final replyUser = reply['user'] as Map<String, dynamic>? ?? {};
                      return Text(
                        reply['comment'] ?? '',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.neutral700,
                        ),
                      );
                    }),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  // ============================================================================
  // Bottom Bar
  // ============================================================================
  Widget _buildBottomBar(BuildContext context, WidgetRef ref, PlaceDetailState state) {
    final place = state.place;
    if (place == null) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: Row(
          children: [
            // Favorite button
            Container(
              decoration: BoxDecoration(
                border: Border.all(color: AppColors.neutral300),
                borderRadius: BorderRadius.circular(12),
              ),
              child: IconButton(
                icon: Icon(
                  state.isFavorite ? Icons.favorite : Icons.favorite_border,
                  color: state.isFavorite ? AppColors.error500 : AppColors.neutral600,
                ),
                onPressed: () {
                  ref.read(placeDetailProvider(widget.placeId).notifier).toggleFavorite();
                },
              ),
            ),
            const SizedBox(width: 12),
            // Call button
            Expanded(
              child: OutlinedButton.icon(
                onPressed: place.phone != null ? () => _callPlace(place) : null,
                icon: const Icon(Icons.phone, size: 18),
                label: const Text('Llamar'),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  side: BorderSide(color: AppColors.primary700),
                  foregroundColor: AppColors.primary700,
                ),
              ),
            ),
            const SizedBox(width: 12),
            // Directions button
            Expanded(
              child: ElevatedButton.icon(
                onPressed: () => _openMaps(place),
                icon: const Icon(Icons.directions, size: 18),
                label: const Text('Cómo llegar'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary700,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  elevation: 0,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ============================================================================
  // Error State
  // ============================================================================
  Widget _buildErrorState(BuildContext context, WidgetRef ref, PlaceDetailState state) {
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
              onPressed: () => ref.read(placeDetailProvider(widget.placeId).notifier).loadPlaceDetail(),
              icon: const Icon(Icons.refresh),
              label: const Text('Reintentar'),
            ),
          ],
        ),
      ),
    );
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================
  Color _getRatingColor(int rating) {
    if (rating >= 4) return AppColors.success700;
    if (rating >= 3) return AppColors.warning700;
    if (rating >= 2) return AppColors.secondary700;
    return AppColors.error700;
  }

  String _formatDate(dynamic date) {
    if (date == null) return '';
    try {
      final dateTime = DateTime.parse(date.toString());
      return DateFormat('dd MMM yyyy', 'es').format(dateTime);
    } catch (e) {
      return date.toString();
    }
  }

  void _openMaps(dynamic place) async {
    final lat = place.latitude;
    final lng = place.longitude;
    if (lat != null && lng != null) {
      final url = 'https://www.google.com/maps/search/?api=1&query=$lat,$lng';
      if (await canLaunchUrl(Uri.parse(url))) {
        await launchUrl(Uri.parse(url));
      }
    }
  }

  void _callPlace(dynamic place) async {
    if (place.phone != null) {
      final url = 'tel:${place.phone}';
      if (await canLaunchUrl(Uri.parse(url))) {
        await launchUrl(Uri.parse(url));
      }
    }
  }

  void _launchUrl(String url) async {
    final uri = Uri.parse(url.startsWith('http') ? url : 'https://$url');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  void _sharePlace() {
    final place = ref.read(placeDetailProvider(widget.placeId)).place;
    if (place != null) {
      final text = 'Mira ${place.name} en BoliviaExperience: ${place.address ?? ''}';
      Clipboard.setData(ClipboardData(text: text));
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Enlace copiado al portapapeles'),
          backgroundColor: AppColors.success700,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
      );
    }
  }
}

// ============================================================================
// Quick Action Button
// ============================================================================
class _QuickActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _QuickActionButton({
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
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: AppColors.neutral700,
            ),
          ),
        ],
      ),
    );
  }
}

// ============================================================================
// Contact Tile
// ============================================================================
class _ContactTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;
  final Color color;

  const _ContactTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: color, size: 22),
      ),
      title: Text(
        title,
        style: const TextStyle(fontWeight: FontWeight.w500),
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
      ),
      subtitle: Text(
        subtitle,
        style: TextStyle(color: color, fontSize: 12),
      ),
      trailing: Icon(Icons.chevron_right, color: AppColors.neutral400),
      onTap: onTap,
    );
  }
}

// ============================================================================
// Rating Bar
// ============================================================================
class _RatingBar extends StatelessWidget {
  final String label;
  final double percentage;
  final Color color;

  const _RatingBar({
    required this.label,
    required this.percentage,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        children: [
          SizedBox(
            width: 12,
            child: Text(
              label,
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500),
            ),
          ),
          const SizedBox(width: 6),
          Expanded(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: percentage,
                backgroundColor: AppColors.neutral200,
                valueColor: AlwaysStoppedAnimation(color),
                minHeight: 8,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
