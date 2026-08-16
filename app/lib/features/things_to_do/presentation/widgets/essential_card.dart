import 'package:flutter/material.dart';
import '../../../../config/colors.dart';
import '../../../../core/currency/currency.dart';

/// Card de un item de "Experiencias imprescindibles". Mismo patrón vertical
/// que las cards de las demás secciones (ExperienceCard/PlaceCard): foto arriba
/// con score y badge, y abajo nombre, categoría y precio (productos) o
/// categoría y dirección (lugares). Soporta dos tipos:
/// - `place`   → foto, score, nombre, categoría y dirección del lugar.
/// - `product` → foto, score, badge Verificado/Recomendado, nombre, categoría
///   del producto y precio por persona.
class EssentialCard extends StatelessWidget {
  const EssentialCard({super.key, required this.item, this.onTap});

  final Map<String, dynamic> item;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final isPlace = item['tipo'] == 'place';
    final photoUrl = item['photoUrl']?.toString();
    final rating = item['ratingAvg'];
    final ratingStr =
        rating is double ? rating.toStringAsFixed(1) : (rating ?? 0).toString();
    final ratingCount = item['ratingCount'];
    final reviewCount = ratingCount is num ? ratingCount.toInt() : 0;

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildPhoto(photoUrl, ratingStr, isPlace),
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 12, 12, 14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item['name'] ?? '',
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: AppColors.brandDark,
                      letterSpacing: -0.1,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 6),
                  _buildScoreRow(reviewCount),
                  const SizedBox(height: 4),
                  if (isPlace)
                    _buildPlaceSub()
                  else
                    _buildProductSub(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPhoto(String? photoUrl, String ratingStr, bool isPlace) {
    return Stack(
      children: [
        ClipRRect(
          borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
          child: SizedBox(
            height: 160,
            width: double.infinity,
            child: photoUrl != null && photoUrl.isNotEmpty
                ? Image.network(
                    photoUrl,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => _imagePlaceholder(isPlace),
                  )
                : _imagePlaceholder(isPlace),
          ),
        ),
        // Score badge (top-right)
        Positioned(
          top: 10,
          right: 10,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.brandGold,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.star_rounded, size: 12, color: Colors.white),
                const SizedBox(width: 3),
                Text(
                  ratingStr,
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        ),
        // Verified / Recommended badge (top-left, solo productos)
        if (!isPlace && _badge != null)
          Positioned(
            top: 10,
            left: 10,
            child: Tooltip(
              message: item['recommendedReason']?.toString() ?? _badge!,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: _badgeColor,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(_badgeIcon, size: 12, color: Colors.white),
                    const SizedBox(width: 3),
                    Text(
                      _badge!,
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildScoreRow(int reviewCount) {
    final rating = item['ratingAvg'];
    final ratingStr =
        rating is double ? rating.toStringAsFixed(1) : (rating ?? 0).toString();
    return Row(
      children: [
        const Icon(Icons.star_rounded, size: 14, color: AppColors.brandGold),
        const SizedBox(width: 3),
        Text(
          ratingStr,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: AppColors.brandDark,
          ),
        ),
        if (reviewCount > 0) ...[
          const SizedBox(width: 5),
          Text(
            '($reviewCount)',
            style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
          ),
        ],
      ],
    );
  }

  Widget _buildPlaceSub() {
    final category = item['category'];
    final categoryName = (category is Map) ? (category['name'] ?? '') : '';
    final address = item['address']?.toString();
    final subtitle = [
      if (categoryName.isNotEmpty) categoryName,
      if (address != null && address.isNotEmpty) address,
    ].join(' · ');
    if (subtitle.isEmpty) return const SizedBox.shrink();
    return Text(
      subtitle,
      style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
      maxLines: 1,
      overflow: TextOverflow.ellipsis,
    );
  }

  Widget _buildProductSub() {
    final experienceCategory = item['experienceCategory']?.toString();
    final price = item['pricePerAdult'];
    final fallbackPrice = item['price'];
    final p = (price is num ? price : fallbackPrice);
    final priceStr = (p is num && p > 0) ? formatPrice(p.toInt()) : null;
    final cat = (experienceCategory != null && experienceCategory.isNotEmpty)
        ? experienceCategory
        : 'Experiencia';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          cat,
          style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        if (priceStr != null) ...[
          const SizedBox(height: 4),
          Text(
            '$priceStr por persona',
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: AppColors.brandEmerald,
            ),
          ),
        ],
      ],
    );
  }

  String? get _badge {
    if (item['verified'] == true) return 'Verificado';
    if (item['recommended'] == true) return 'Recomendado';
    return null;
  }

  Color get _badgeColor =>
      item['verified'] == true ? AppColors.brandEmerald : AppColors.brandGold;

  IconData get _badgeIcon => item['verified'] == true
      ? Icons.verified
      : Icons.thumb_up_alt_rounded;

  Widget _imagePlaceholder(bool isPlace) {
    return Container(
      color: AppColors.borderSubtle,
      child: Center(
        child: Icon(
          isPlace ? Icons.place_outlined : Icons.explore_outlined,
          color: AppColors.textSecondary,
          size: 40,
        ),
      ),
    );
  }
}
