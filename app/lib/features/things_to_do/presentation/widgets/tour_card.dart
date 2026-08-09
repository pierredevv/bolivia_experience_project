import 'package:flutter/material.dart';
import '../../../../config/colors.dart';
import '../../data/tour.dart';

/// Card de tour — mismo patrón que la card de hotel, adaptada a tours:
/// foto, nombre, score + reseñas, tipo de producto (experienceCategory) y
/// precio por adulto (variable según tramos de tamaño de grupo).
class TourCard extends StatelessWidget {
  const TourCard({super.key, required this.tour, this.onTap});

  final Tour tour;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final priceText = tour.priceRangeText();
    final badge = tour.verified
        ? 'Verificado'
        : (tour.recommended ? 'Recomendado' : null);
    final badgeColor =
        tour.verified ? AppColors.brandEmerald : AppColors.brandGold;
    final badgeIcon = tour.verified
        ? Icons.verified
        : Icons.thumb_up_alt_rounded;

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 16),
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
            _buildPhoto(context),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 1. Nombre
                  Text(
                    tour.name,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: AppColors.brandDark,
                      letterSpacing: -0.2,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8),

                  // 2. Score + reseñas
                  Row(
                    children: [
                      _ScoreBadge(tour: tour),
                      const SizedBox(width: 8),
                      Text(
                        '${tour.ratingCount} reseñas',
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),

                  // 3. Tipo / categoría del producto (definida por el socio)
                  if (tour.experienceCategory != null &&
                      tour.experienceCategory!.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Text(
                      tour.experienceCategory!,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.neutral600,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],

                  // Badge Verificado / Recomendado
                  if (badge != null) ...[
                    const SizedBox(height: 10),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: badgeColor.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(badgeIcon,
                              size: 14, color: badgeColor),
                          const SizedBox(width: 5),
                          Text(
                            badge,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: badgeColor,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],

                  const SizedBox(height: 12),
                  const Divider(height: 1, color: AppColors.borderSubtle),
                  const SizedBox(height: 12),

                  // 4. Precio por adulto (desde tramos)
                  if (priceText != null) ...[
                    Text(
                      priceText,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: AppColors.brandDark,
                      ),
                    ),
                    const SizedBox(height: 2),
                    const Text(
                      'Precio variable según el tamaño del grupo',
                      style: TextStyle(
                        fontSize: 11,
                        color: AppColors.neutral500,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPhoto(BuildContext context) {
    final photoUrl = tour.photoUrl;
    return ClipRRect(
      borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
      child: SizedBox(
        height: 160,
        width: double.infinity,
        child: photoUrl != null
            ? Image.network(
                photoUrl,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => const _ImagePlaceholder(),
              )
            : const _ImagePlaceholder(),
      ),
    );
  }
}

class _ScoreBadge extends StatelessWidget {
  final Tour tour;

  const _ScoreBadge({required this.tour});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.brandGold,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.star_rounded, size: 13, color: Colors.white),
          const SizedBox(width: 3),
          Text(
            tour.ratingAvg.toStringAsFixed(1),
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: Colors.white,
            ),
          ),
        ],
      ),
    );
  }
}

class _ImagePlaceholder extends StatelessWidget {
  const _ImagePlaceholder();

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.borderSubtle,
      child: const Center(
        child: Icon(Icons.tour_rounded,
            color: AppColors.textSecondary, size: 40),
      ),
    );
  }
}
