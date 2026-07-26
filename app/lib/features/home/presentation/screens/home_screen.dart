import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../config/colors.dart';
import '../providers/home_provider.dart';
import '../../../weather/presentation/widgets/weather_widget.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final homeState = ref.watch(homeProvider);

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'BoliviaExperience',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            Text(
              'Santa Cruz de la Sierra',
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () => context.push('/notifications'),
          ),
        ],
      ),
      body: _buildBody(context, ref, homeState),
    );
  }

  Widget _buildBody(BuildContext context, WidgetRef ref, HomeState state) {
    if (state.status == HomeStatus.loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (state.status == HomeStatus.error) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: AppColors.error500),
              const SizedBox(height: 16),
              Text(
                state.errorMessage ?? 'Error al cargar datos',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: () => ref.read(homeProvider.notifier).loadHomeData(),
                icon: const Icon(Icons.refresh),
                label: const Text('Reintentar'),
              ),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () => ref.read(homeProvider.notifier).loadHomeData(),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: GestureDetector(
                onTap: () => context.go('/explore'),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: AppColors.neutral100,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.neutral300),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.search, color: AppColors.neutral500),
                      SizedBox(width: 12),
                      Text(
                        '¿Qué estás buscando?',
                        style: TextStyle(color: AppColors.neutral500),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16),
              child: WeatherWidget(),
            ),
            const SizedBox(height: 16),

            GestureDetector(
              onTap: () => context.go('/trips'),
              child: Container(
                margin: const EdgeInsets.symmetric(horizontal: 16),
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppColors.primary700, AppColors.primary400],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.map_outlined,
                      size: 40,
                      color: Colors.white,
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Crea tu itinerario perfecto',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Segun tu presupuesto y preferencias',
                            style: TextStyle(
                              fontSize: 13,
                              color: Colors.white.withAlpha(200),
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Text(
                        'Empezar',
                        style: TextStyle(
                          color: AppColors.primary700,
                          fontWeight: FontWeight.w600,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            if (state.categories.isNotEmpty) ...[
              SizedBox(
                height: 40,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: state.categories.length,
                  itemBuilder: (context, index) {
                    final category = state.categories[index];
                    return _CategoryChip(
                      label: category['name'] ?? '',
                      icon: _getCategoryIcon(category['icon']),
                      onTap: () {
                        final slug = category['slug'] ?? '';
                        final name = category['name'] ?? '';
                        context.push('/places/category/$slug?name=$name');
                      },
                    );
                  },
                ),
              ),
              const SizedBox(height: 24),
            ],

            if (state.featuredPlaces.isNotEmpty) ...[
              _SectionHeader(
                title: 'Lugares Destacados',
                onSeeAll: () => context.go('/explore'),
              ),
              SizedBox(
                height: 220,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: state.featuredPlaces.length,
                  itemBuilder: (context, index) {
                    final place = state.featuredPlaces[index];
                    return _PlaceCard(
                      place: place,
                      onTap: () => context.push('/places/${place['id']}'),
                    );
                  },
                ),
              ),
              const SizedBox(height: 24),
            ],

            if (state.todayEvents.isNotEmpty) ...[
              _SectionHeader(
                title: 'Eventos de Hoy',
                onSeeAll: () => context.push('/events'),
              ),
              SizedBox(
                height: 160,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: state.todayEvents.length,
                  itemBuilder: (context, index) {
                    final event = state.todayEvents[index];
                    return _EventCard(
                      event: event,
                      onTap: () => context.push('/events/${event['id']}'),
                    );
                  },
                ),
              ),
              const SizedBox(height: 24),
            ],

            if (state.promotions.isNotEmpty) ...[
              _SectionHeader(
                title: 'Promociones',
                onSeeAll: () => context.push('/promotions'),
              ),
              SizedBox(
                height: 140,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: state.promotions.length,
                  itemBuilder: (context, index) {
                    final promo = state.promotions[index];
                    return _PromoCard(
                      promotion: promo,
                      onTap: () => context.push('/promotions/${promo['id']}'),
                    );
                  },
                ),
              ),
              const SizedBox(height: 24),
            ],

            if (state.featuredPlaces.isEmpty &&
                state.categories.isEmpty &&
                state.todayEvents.isEmpty &&
                state.promotions.isEmpty &&
                state.status == HomeStatus.loaded)
              Center(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.explore_outlined, size: 64, color: AppColors.neutral400),
                      const SizedBox(height: 16),
                      Text(
                        'No hay contenido disponible',
                        style: Theme.of(context).textTheme.bodyLarge,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Desliza hacia abajo para recargar',
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
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

class _CategoryChip extends StatelessWidget {
  final String label;
  final IconData icon;
  final VoidCallback? onTap;

  const _CategoryChip({
    required this.label,
    required this.icon,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ActionChip(
        avatar: Icon(icon, size: 18),
        label: Text(label),
        onPressed: onTap,
        backgroundColor: AppColors.primary50,
        labelStyle: const TextStyle(color: AppColors.primary700),
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  final VoidCallback onSeeAll;

  const _SectionHeader({required this.title, required this.onSeeAll});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: Theme.of(context).textTheme.titleLarge,
          ),
          TextButton(
            onPressed: onSeeAll,
            child: const Text('Ver todos'),
          ),
        ],
      ),
    );
  }
}

class _PlaceCard extends StatelessWidget {
  final Map<String, dynamic> place;
  final VoidCallback? onTap;

  const _PlaceCard({required this.place, this.onTap});

  @override
  Widget build(BuildContext context) {
    final photos = place['photos'];
    final photoUrl = (photos is List && photos.isNotEmpty && photos[0] is Map)
        ? photos[0]['url']?.toString()
        : null;
    final averageRating = place['ratingAvg'] ?? 0;
    final category = place['category'];

    return GestureDetector(
      onTap: onTap,
      child: Card(
        margin: const EdgeInsets.only(right: 12),
        child: SizedBox(
          width: 160,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                height: 100,
                decoration: const BoxDecoration(
                  color: AppColors.neutral200,
                  borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
                ),
                child: photoUrl != null
                    ? ClipRRect(
                        borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                        child: Image.network(
                          photoUrl,
                          fit: BoxFit.cover,
                          width: double.infinity,
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
              Padding(
                padding: const EdgeInsets.all(8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      place['name'] ?? '',
                      style: Theme.of(context).textTheme.titleMedium,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    Text(
                      (category is Map) ? (category['name'] ?? '') : '',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(Icons.star, size: 14, color: AppColors.secondary500),
                        const SizedBox(width: 4),
                        Text('${averageRating is double ? averageRating.toStringAsFixed(1) : averageRating}', style: Theme.of(context).textTheme.bodySmall),
                      ],
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

class _EventCard extends StatelessWidget {
  final Map<String, dynamic> event;
  final VoidCallback? onTap;

  const _EventCard({required this.event, this.onTap});

  @override
  Widget build(BuildContext context) {
    final photoUrl = event['photoUrl'] as String?;

    return GestureDetector(
      onTap: onTap,
      child: Card(
        margin: const EdgeInsets.only(right: 12),
        child: SizedBox(
          width: 200,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                height: 80,
                decoration: const BoxDecoration(
                  color: AppColors.primary100,
                  borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
                ),
                child: photoUrl != null
                    ? ClipRRect(
                        borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                        child: Image.network(
                          photoUrl,
                          fit: BoxFit.cover,
                          width: double.infinity,
                          errorBuilder: (context, error, stackTrace) {
                            return const Center(
                              child: Icon(Icons.event, color: AppColors.primary700, size: 32),
                            );
                          },
                        ),
                      )
                    : const Center(
                        child: Icon(Icons.event, color: AppColors.primary700, size: 32),
                      ),
              ),
              Padding(
                padding: const EdgeInsets.all(8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      event['name'] ?? '',
                      style: Theme.of(context).textTheme.titleMedium,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    Row(
                      children: [
                        const Icon(Icons.access_time, size: 14, color: AppColors.neutral500),
                        const SizedBox(width: 4),
                        Text(
                          event['dateStart'] ?? '',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                    Text(
                      event['location'] ?? '',
                      style: Theme.of(context).textTheme.bodySmall,
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

class _PromoCard extends StatelessWidget {
  final Map<String, dynamic> promotion;
  final VoidCallback? onTap;

  const _PromoCard({required this.promotion, this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Card(
        margin: const EdgeInsets.only(right: 12),
        color: AppColors.secondary50,
        child: SizedBox(
          width: 180,
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.secondary700,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '${promotion['discountPercentage'] ?? 0}% OFF',
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const Spacer(),
                Text(
                  promotion['title'] ?? '',
                  style: Theme.of(context).textTheme.titleMedium,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  (promotion['place']?['name']) ?? '',
                  style: Theme.of(context).textTheme.bodySmall,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}