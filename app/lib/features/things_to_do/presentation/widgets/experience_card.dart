import 'package:flutter/material.dart';
import '../../../../config/colors.dart';
import '../../../../core/currency/currency.dart';
import '../../../home/data/home_experience.dart';

/// Card de experiencia (mismo diseño que la del home): imagen 130px con score,
/// badge Verificado/Recomendado, nombre, categoría, precio "por persona" y
/// contador de reseñas.
class ExperienceCard extends StatelessWidget {
  const ExperienceCard({super.key, required this.experience, this.onTap});

  final HomeExperience experience;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final photoUrl = experience.photoUrl;
    final ratingStr = experience.ratingAvg.toStringAsFixed(1);
    final price = experience.pricePerAdult ?? experience.price;
    final priceStr = price > 0 ? formatPrice(price) : null;
    final badge = experience.verified
        ? 'Verificado'
        : (experience.recommended ? 'Recomendado' : null);
    final badgeColor =
        experience.verified ? AppColors.brandEmerald : AppColors.brandGold;
    final badgeIcon = experience.verified
        ? Icons.verified
        : Icons.thumb_up_alt_rounded;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 210,
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
            // Image with score + badge
            Stack(
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.vertical(
                      top: Radius.circular(18)),
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
                // Score badge (top-right)
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
                // Verified / Recommended badge (top-left, with tooltip)
                if (badge != null)
                  Positioned(
                    top: 10,
                    left: 10,
                    child: Tooltip(
                      message: experience.recommendedReason ?? badge,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: badgeColor,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(badgeIcon, size: 12, color: Colors.white),
                            const SizedBox(width: 3),
                            Text(
                              badge,
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
                      experience.name,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: AppColors.brandDark,
                        letterSpacing: -0.1,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    if (experience.experienceCategory != null &&
                        experience.experienceCategory!.isNotEmpty)
                      Text(
                        experience.experienceCategory!,
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        if (priceStr != null) ...[
                          Text(
                            priceStr,
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: AppColors.brandEmerald,
                            ),
                          ),
                          const SizedBox(width: 6),
                          const Text(
                            'por persona',
                            style: TextStyle(
                              fontSize: 11,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                        if (experience.ratingCount > 0) ...[
                          const Spacer(),
                          Text(
                            '(${experience.ratingCount})',
                            style: const TextStyle(
                              fontSize: 11,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ],
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
