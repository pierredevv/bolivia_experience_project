import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../config/api_constants.dart';
import '../../../../config/colors.dart';
import '../../../../core/network/dio_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class PromotionsScreen extends ConsumerStatefulWidget {
  const PromotionsScreen({super.key});

  @override
  ConsumerState<PromotionsScreen> createState() => _PromotionsScreenState();
}

class _PromotionsScreenState extends ConsumerState<PromotionsScreen> {
  List<dynamic> _promotions = [];
  bool _isLoading = true;
  String? _error;
  int _currentPage = 1;
  bool _hasMore = true;
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _loadPromotions();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >= _scrollController.position.maxScrollExtent - 200) {
      _loadMore();
    }
  }

  Future<void> _loadPromotions() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final dio = ref.read(dioProvider);
      final response = await dio.get(
        ApiConstants.promotions,
        queryParameters: {'page': 1, 'limit': 20},
      );
      final data = response.data;
      // TransformInterceptor wraps: { success, data: { data: [...], meta: {...} }, timestamp }
      final inner = data['data'];
      final List<dynamic> promotions = (inner is Map<String, dynamic> && inner['data'] is List)
          ? inner['data'] as List<dynamic>
          : (inner is List ? inner : []);
      final meta = (inner is Map<String, dynamic>) ? inner['meta'] : null;
      final totalPages = meta?['totalPages'] ?? 1;

      setState(() {
        _promotions = promotions;
        _isLoading = false;
        _currentPage = 1;
        _hasMore = totalPages > 1;
      });
    } catch (e) {
      setState(() {
        _error = 'Error al cargar promociones';
        _isLoading = false;
      });
    }
  }

  Future<void> _loadMore() async {
    if (!_hasMore || _isLoading) return;

    try {
      final dio = ref.read(dioProvider);
      final nextPage = _currentPage + 1;
      final response = await dio.get(
        ApiConstants.promotions,
        queryParameters: {'page': nextPage, 'limit': 20},
      );
      final data = response.data;
      final inner = data['data'];
      final List<dynamic> newPromotions = (inner is Map<String, dynamic> && inner['data'] is List)
          ? inner['data'] as List<dynamic>
          : (inner is List ? inner : []);
      final meta = (inner is Map<String, dynamic>) ? inner['meta'] : null;
      final totalPages = meta?['totalPages'] ?? 1;

      setState(() {
        _promotions.addAll(newPromotions);
        _currentPage = nextPage;
        _hasMore = totalPages > nextPage;
      });
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Promociones'),
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading && _promotions.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null && _promotions.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: AppColors.error500),
              const SizedBox(height: 16),
              Text(
                _error!,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: _loadPromotions,
                icon: const Icon(Icons.refresh),
                label: const Text('Reintentar'),
              ),
            ],
          ),
        ),
      );
    }

    if (_promotions.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.local_offer_outlined, size: 64, color: AppColors.neutral400),
              const SizedBox(height: 16),
              Text(
                'No hay promociones disponibles',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 8),
              Text(
                'Vuelve pronto para ver nuevas ofertas',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadPromotions,
      child: ListView.builder(
        controller: _scrollController,
        padding: const EdgeInsets.all(16),
        itemCount: _promotions.length + (_hasMore ? 1 : 0),
        itemBuilder: (context, index) {
          if (index == _promotions.length) {
            return const Center(
              child: Padding(
                padding: EdgeInsets.all(16),
                child: CircularProgressIndicator(),
              ),
            );
          }

          final promotion = _promotions[index];
          return _PromotionCard(
            promotion: promotion,
            onTap: () => context.push('/promotions/${promotion['id']}'),
          );
        },
      ),
    );
  }
}

class _PromotionCard extends StatelessWidget {
  final Map<String, dynamic> promotion;
  final VoidCallback? onTap;

  const _PromotionCard({required this.promotion, this.onTap});

  @override
  Widget build(BuildContext context) {
    final place = promotion['place'];
    final placeName = place is Map ? (place['name'] ?? '') : '';
    final discountPercentage = promotion['discountPercentage'] ?? 0;
    final title = promotion['title'] ?? '';
    final endDate = promotion['endDate'] ?? '';
    final photoUrl = place is Map
        ? ((place['photos'] is List && (place['photos'] as List).isNotEmpty)
            ? place['photos'][0]['url']?.toString()
            : null)
        : null;

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
                  color: AppColors.secondary50,
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
                              child: Icon(Icons.local_offer, color: AppColors.secondary700, size: 32),
                            );
                          },
                        ),
                      )
                    : const Center(
                        child: Icon(Icons.local_offer, color: AppColors.secondary700, size: 32),
                      ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.secondary700,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            '$discountPercentage% OFF',
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 11,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      title,
                      style: Theme.of(context).textTheme.titleMedium,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      placeName,
                      style: Theme.of(context).textTheme.bodySmall,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (endDate.isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.calendar_today, size: 12, color: AppColors.neutral500),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              'Válido hasta $endDate',
                              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: AppColors.neutral500,
                              ),
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
              const Icon(Icons.chevron_right, color: AppColors.neutral400),
            ],
          ),
        ),
      ),
    );
  }
}
