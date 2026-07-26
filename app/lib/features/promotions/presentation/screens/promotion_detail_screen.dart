import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:share_plus/share_plus.dart';
import '../../../../config/api_constants.dart';
import '../../../../config/colors.dart';
import '../../../../core/network/dio_provider.dart';
import '../../../../core/services/deep_link_service.dart';

final promotionDetailProvider = FutureProvider.family<Map<String, dynamic>, String>((ref, id) async {
  final dio = ref.read(dioProvider);
  final response = await dio.get('${ApiConstants.promotions}/$id');
  return response.data['data'] ?? response.data;
});

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
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: AppColors.error500),
              const SizedBox(height: 16),
              Text('Error al cargar promoción', style: Theme.of(context).textTheme.bodyLarge),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: () => ref.invalidate(promotionDetailProvider(promotionId)),
                icon: const Icon(Icons.refresh),
                label: const Text('Reintentar'),
              ),
            ],
          ),
        ),
        data: (promo) => _buildContent(context, ref, promo),
      ),
    );
  }

  Widget _buildContent(BuildContext context, WidgetRef ref, Map<String, dynamic> promo) {
    final place = promo['place'];
    final placeName = place is Map ? (place['name'] ?? '') : '';
    final placeAddress = place is Map ? (place['address'] ?? '') : '';
    final placeLat = place is Map ? place['latitude'] : null;
    final placeLng = place is Map ? place['longitude'] : null;
    final discountPercentage = promo['discountPercentage'] ?? 0;
    final title = promo['title'] ?? '';
    final description = promo['description'] ?? '';
    final termsAndConditions = promo['termsAndConditions'] ?? '';
    final startDate = promo['startDate'] ?? '';
    final endDate = promo['endDate'] ?? '';
    final photoUrl = place is Map
        ? ((place['photos'] is List && (place['photos'] as List).isNotEmpty)
            ? place['photos'][0]['url']?.toString()
            : null)
        : null;

    return CustomScrollView(
      slivers: [
        SliverAppBar(
          expandedHeight: 250,
          pinned: true,
          flexibleSpace: FlexibleSpaceBar(
            background: photoUrl != null
                ? Image.network(photoUrl, fit: BoxFit.cover)
                : Container(
                    color: AppColors.secondary100,
                    child: const Center(
                      child: Icon(Icons.local_offer, size: 80, color: AppColors.secondary700),
                    ),
                  ),
          ),
          actions: [
            IconButton(
              icon: const Icon(Icons.share),
              onPressed: () => Share.share(
                'Promoción: $title\nhttps://boliviaexperience.app/promotions/${promo['id']}',
                subject: title,
              ),
            ),
          ],
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Discount badge
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.secondary700,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Text(
                    '$discountPercentage% OFF',
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ),

                const SizedBox(height: 12),

                // Title
                Text(
                  title,
                  style: Theme.of(context).textTheme.headlineLarge,
                ),

                const SizedBox(height: 8),

                // Place name
                if (placeName.isNotEmpty)
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Row(
                        children: [
                          const Icon(Icons.store, color: AppColors.primary700),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  placeName,
                                  style: Theme.of(context).textTheme.titleMedium,
                                ),
                                if (placeAddress.isNotEmpty)
                                  Text(
                                    placeAddress,
                                    style: Theme.of(context).textTheme.bodySmall,
                                  ),
                              ],
                            ),
                          ),
                          if (placeLat != null && placeLng != null)
                            IconButton(
                              icon: const Icon(Icons.directions),
                              onPressed: () => DeepLinkService.openDirections(
                                latitude: double.parse(placeLat.toString()),
                                longitude: double.parse(placeLng.toString()),
                                label: placeName,
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),

                const SizedBox(height: 12),

                // Validity period
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        const Icon(Icons.calendar_today, color: AppColors.success700),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Período de validez',
                                style: Theme.of(context).textTheme.titleMedium,
                              ),
                              Text(
                                _formatDateRange(startDate, endDate),
                                style: Theme.of(context).textTheme.bodyMedium,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 24),

                // Description
                if (description.isNotEmpty) ...[
                  Text(
                    'Descripción',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    description,
                    style: Theme.of(context).textTheme.bodyLarge,
                  ),
                  const SizedBox(height: 24),
                ],

                // Terms and Conditions
                if (termsAndConditions.isNotEmpty) ...[
                  Text(
                    'Términos y Condiciones',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    termsAndConditions,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppColors.neutral600,
                    ),
                  ),
                  const SizedBox(height: 24),
                ],

                const SizedBox(height: 80),
              ],
            ),
          ),
        ),
      ],
    );
  }

  String _formatDateRange(String start, String end) {
    if (start.isEmpty) return 'Fecha por definir';
    final startDate = DateTime.parse(start);
    if (end.isEmpty) return 'Desde el ${DateFormat('dd MMMM yyyy', 'es').format(startDate)}';
    final endDate = DateTime.parse(end);
    return '${DateFormat('dd MMM', 'es').format(startDate)} - ${DateFormat('dd MMM yyyy', 'es').format(endDate)}';
  }
}
