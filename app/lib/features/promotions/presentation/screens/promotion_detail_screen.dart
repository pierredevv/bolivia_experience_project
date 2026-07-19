import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../config/colors.dart';
import '../providers/promotions_provider.dart';

class PromotionDetailScreen extends ConsumerWidget {
  final String promotionId;

  const PromotionDetailScreen({super.key, required this.promotionId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final promoAsync = ref.watch(promotionDetailProvider(promotionId));

    return Scaffold(
      body: promoAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.error_outline, size: 64, color: AppColors.error500),
                const SizedBox(height: 16),
                Text('Error al cargar la promoción', style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: 16),
                ElevatedButton.icon(
                  onPressed: () => ref.invalidate(promotionDetailProvider(promotionId)),
                  icon: const Icon(Icons.refresh),
                  label: const Text('Reintentar'),
                ),
              ],
            ),
          ),
        ),
        data: (promo) => _PromotionDetailBody(promotion: promo),
      ),
    );
  }
}

class _PromotionDetailBody extends StatelessWidget {
  final dynamic promotion;

  const _PromotionDetailBody({required this.promotion});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 280,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              title: Text(
                promotion.title,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  shadows: [Shadow(blurRadius: 8, color: Colors.black54)],
                ),
              ),
              background: promotion.photoUrl != null
                  ? CachedNetworkImage(
                      imageUrl: promotion.photoUrl!,
                      fit: BoxFit.cover,
                      placeholder: (_, __) => Container(color: AppColors.secondary100),
                      errorWidget: (_, __, ___) => _buildPlaceholder(),
                    )
                  : _buildPlaceholder(),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Discount badge
                  if (promotion.discountPercentage != null)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: AppColors.secondary700,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        '${promotion.discountPercentage!.toInt()}% OFF',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                        ),
                      ),
                    ),

                  const SizedBox(height: 16),

                  // Dates
                  if (promotion.startDate != null || promotion.endDate != null)
                    Card(
                      child: ListTile(
                        leading: Icon(Icons.calendar_today, color: AppColors.primary700),
                        title: Text(
                          _formatDateRange(promotion.startDate, promotion.endDate),
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                      ),
                    ),

                  const SizedBox(height: 8),

                  // Place
                  if (promotion.place != null)
                    Card(
                      child: ListTile(
                        leading: Icon(Icons.store, color: AppColors.secondary700),
                        title: Text(
                          promotion.place!['name'] ?? 'Negocio',
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        subtitle: promotion.place!['address'] != null
                            ? Text(promotion.place!['address'])
                            : null,
                      ),
                    ),

                  const SizedBox(height: 24),

                  // Description
                  if (promotion.description != null && promotion.description!.isNotEmpty) ...[
                    Text('Descripción', style: Theme.of(context).textTheme.titleLarge),
                    const SizedBox(height: 8),
                    Text(
                      promotion.description!,
                      style: Theme.of(context).textTheme.bodyLarge,
                    ),
                  ],

                  const SizedBox(height: 80),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: ElevatedButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.local_offer),
            label: const Text('Aprovechar oferta'),
          ),
        ),
      ),
    );
  }

  Widget _buildPlaceholder() {
    return Container(
      color: AppColors.secondary100,
      child: Center(
        child: Icon(Icons.local_offer, size: 80, color: AppColors.secondary700),
      ),
    );
  }

  String _formatDateRange(String? start, String? end) {
    if (start != null && end != null) return '$start — $end';
    return start ?? end ?? 'Fechas por confirmar';
  }
}
