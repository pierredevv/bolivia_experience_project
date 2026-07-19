import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../config/colors.dart';
import '../providers/promotions_provider.dart';
import '../widgets/promotion_card.dart';

class PromotionsScreen extends ConsumerWidget {
  const PromotionsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(promotionsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Promociones')),
      body: _buildBody(context, ref, state),
    );
  }

  Widget _buildBody(BuildContext context, WidgetRef ref, PromotionsState state) {
    if (state.status == PromotionsStatus.loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (state.status == PromotionsStatus.error) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 64, color: AppColors.error500),
              const SizedBox(height: 16),
              Text(
                state.errorMessage ?? 'Error al cargar promociones',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: () => ref.read(promotionsProvider.notifier).loadPromotions(),
                icon: const Icon(Icons.refresh),
                label: const Text('Reintentar'),
              ),
            ],
          ),
        ),
      );
    }

    if (state.promotions.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.local_offer_outlined, size: 64, color: AppColors.neutral400),
              const SizedBox(height: 16),
              Text(
                'Sin promociones',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 8),
              Text(
                'No hay promociones disponibles',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () => ref.read(promotionsProvider.notifier).loadPromotions(),
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: state.promotions.length,
        itemBuilder: (context, index) {
          final promo = state.promotions[index];
          return PromotionCard(
            promotion: promo,
            onTap: () => context.go('/promotions/${promo.id}'),
          );
        },
      ),
    );
  }
}
