import 'package:flutter/material.dart';
import '../../../../config/colors.dart';

/// Card de lugar (mismo diseño que la del home) usada en "Top atracciones".
/// Muestra: foto, score con contador de reseñas al lado, nombre y categoría
/// (categoria_place definida por el administrador).
class PlaceCard extends StatelessWidget {
  const PlaceCard({super.key, required this.place, this.onTap});

  final Map<String, dynamic> place;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final photos = place['photos'];
    final photoUrl = (photos is List && photos.isNotEmpty && photos[0] is Map)
        ? photos[0]['url']?.toString()
        : null;
    final rating = place['ratingAvg'];
    final ratingStr = rating is double
        ? rating.toStringAsFixed(1)
        : (rating ?? 0).toString();
    final ratingCount = place['ratingCount'];
    final reviewCount = ratingCount is num ? ratingCount.toInt() : 0;
    final category = place['category'];
    final categoryName =
        (category is Map) ? (category['name'] ?? '') : '';
    final categoriaPlace = place['categoriaPlace']?.toString();
    final displayCategory = (categoriaPlace != null && categoriaPlace.isNotEmpty)
        ? categoriaPlace
        : categoryName;
    final isFeatured = place['isFeatured'] == true;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 185,
        margin: const EdgeInsets.only(right: 14),
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
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image with floating badges
            Stack(
              children: [
                ClipRRect(
                  borderRadius:
                      const BorderRadius.vertical(top: Radius.circular(18)),
                  child: SizedBox(
                    height: 130,
                    width: double.infinity,
                    child: photoUrl != null
                        ? Image.network(
                            photoUrl,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => Container(
                              color: AppColors.borderSubtle,
                              child: const Center(
                                child: Icon(Icons.image_outlined,
                                    color: AppColors.textSecondary, size: 32),
                              ),
                            ),
                          )
                        : Container(
                            color: AppColors.borderSubtle,
                            child: const Center(
                              child: Icon(Icons.image_outlined,
                                  color: AppColors.textSecondary, size: 32),
                            ),
                          ),
                  ),
                ),
                // Score badge
                Positioned(
                  top: 10,
                  right: 10,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.brandGold,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.star_rounded,
                            size: 12, color: Colors.white),
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
                // Featured badge
                if (isFeatured)
                  Positioned(
                    top: 10,
                    left: 10,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.brandDark,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Text(
                        'Destacado',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            // Info (Expanded: comprime con ellipsis si el alto del carrusel es corto)
            Expanded(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      place['name'] ?? '',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: AppColors.brandDark,
                        letterSpacing: -0.1,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 5),
                    // Score + review count
                    Row(
                      children: [
                        const Icon(Icons.star_rounded,
                            size: 14, color: AppColors.brandGold),
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
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 4),
                    if (displayCategory.isNotEmpty)
                      Text(
                        displayCategory,
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
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
}
