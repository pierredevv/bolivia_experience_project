import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../config/colors.dart';
import '../../data/restaurant.dart';
import '../providers/restaurants_provider.dart';
import '../widgets/restaurant_card.dart';
import '../widgets/restaurants_filter_bar.dart';

/// Vista "Restaurantes en Santa Cruz para comer".
class RestaurantsScreen extends ConsumerStatefulWidget {
  const RestaurantsScreen({super.key});

  @override
  ConsumerState<RestaurantsScreen> createState() => _RestaurantsScreenState();
}

class _RestaurantsScreenState extends ConsumerState<RestaurantsScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(restaurantsProvider.notifier).load());
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(restaurantsProvider);

    return Scaffold(
      backgroundColor: AppColors.backgroundCanvas,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 16),
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
                      'Restaurantes en Santa Cruz para comer',
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
            const RestaurantsFilterBar(),
            const SizedBox(height: 16),
            Expanded(child: _buildBody(state)),
          ],
        ),
      ),
    );
  }

  Widget _buildBody(RestaurantsState state) {
    switch (state.status) {
      case RestaurantsStatus.initial:
      case RestaurantsStatus.loading:
        return const Center(child: CircularProgressIndicator());
      case RestaurantsStatus.error:
        return _buildError(state);
      case RestaurantsStatus.loaded:
        return _buildLoaded(state);
    }
  }

  Widget _buildError(RestaurantsState state) {
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
              state.errorMessage ?? 'No se pudieron cargar los restaurantes.',
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 15,
                color: AppColors.neutral600,
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => ref.read(restaurantsProvider.notifier).load(),
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

  Widget _buildLoaded(RestaurantsState state) {
    final restaurants = state.restaurantIds
        .map((id) => state.allRestaurants.firstWhere(
              (r) => r.id == id,
              orElse: () => Restaurant(id: '', name: ''),
            ))
        .where((r) => r.id.isNotEmpty)
        .toList();

    if (restaurants.isEmpty) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.restaurant_outlined,
                  size: 64, color: AppColors.neutral400),
              SizedBox(height: 16),
              Text(
                'No hay restaurantes que coincidan con tus filtros',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 15,
                  color: AppColors.neutral600,
                ),
              ),
              SizedBox(height: 4),
              Text(
                'Probá ajustando la fecha, hora o los filtros.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 13,
                  color: AppColors.neutral400,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      color: AppColors.brandEmerald,
      onRefresh: () => ref.read(restaurantsProvider.notifier).load(),
      child: ListView.builder(
        padding: const EdgeInsets.only(top: 4, bottom: 24),
        itemCount: restaurants.length,
        itemBuilder: (context, index) {
          final restaurant = restaurants[index];
          return RestaurantCard(
            restaurant: restaurant,
            onTap: () => context.push('/places/${restaurant.id}'),
          );
        },
      ),
    );
  }
}
