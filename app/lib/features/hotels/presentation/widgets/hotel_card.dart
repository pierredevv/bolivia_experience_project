import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../config/colors.dart';
import '../../../../core/currency/currency.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../data/hotel.dart';
import '../../data/hotel_catalogs.dart';
import '../../data/hotel_distance.dart';

/// Card de hotel — el orden de la información sigue la especificación:
/// 1. Nombre · 2. Score + reseñas + distancia GPS · 3. Características ·
/// 4. Comodidades destacadas · 5. Badge cashback · 6. Aviso de sesión ·
/// 7. Precio mínimo · 8. Texto aclaratorio del precio.
class HotelCard extends ConsumerWidget {
  final Hotel hotel;
  final VoidCallback? onTap;

  const HotelCard({super.key, required this.hotel, this.onTap});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isAuthenticated =
        ref.watch(authProvider).status == AuthStatus.authenticated;
    final distance = hotel.distanceFromUserKm;
    final cashbackPct = hotel.cashbackPorcentaje;

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
                    hotel.name,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: AppColors.brandDark,
                      letterSpacing: -0.2,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8),

                  // 2. Score + reseñas + distancia GPS
                  Row(
                    children: [
                      _ScoreBadge(hotel: hotel),
                      const SizedBox(width: 8),
                      Text(
                        '${hotel.ratingCount} reseñas',
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                      ),
                      const Spacer(),
                      if (distance != null) ...[
                        const Icon(Icons.location_on_rounded,
                            size: 15, color: AppColors.textSecondary),
                        const SizedBox(width: 3),
                        Text(
                          '${HotelDistance.formatKm(distance)} del usuario',
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ],
                  ),
                  if (distance == null) const SizedBox(height: 4),

                  // 3. Características del socio
                  if (hotel.caracteristicas != null &&
                      hotel.caracteristicas!.isNotEmpty) ...[
                    const SizedBox(height: 10),
                    Text(
                      hotel.caracteristicas!,
                      style: const TextStyle(
                        fontSize: 13,
                        height: 1.3,
                        color: AppColors.neutral600,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],

                  // 4. Comodidades destacadas
                  if (hotel.allAmenities.isNotEmpty) ...[
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: hotel.allAmenities
                          .take(4)
                          .map((id) => _AmenityPill(id: id))
                          .toList(),
                    ),
                  ],

                  // 5. Badge cashback (solo si hay % acordado)
                  if (cashbackPct != null) ...[
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppColors.brandEmerald.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.percent_rounded,
                              size: 14, color: AppColors.brandEmerald),
                          const SizedBox(width: 5),
                          Text(
                            'Obtén $cashbackPct% de cashback en BoliviaExperience',
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: AppColors.brandEmerald,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],

                  // 6. Aviso si no hay sesión
                  if (!isAuthenticated) ...[
                    const SizedBox(height: 10),
                    const Row(
                      children: [
                        Icon(Icons.lock_outline_rounded,
                            size: 14, color: AppColors.textSecondary),
                        SizedBox(width: 6),
                        Text(
                          'Inicia sesión para reservar con BoliviaExperience',
                          style: TextStyle(
                            fontSize: 12,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ],

                  const SizedBox(height: 12),
                  const Divider(height: 1, color: AppColors.borderSubtle),
                  const SizedBox(height: 12),

                  // 7. Precio mínimo por noche
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      const Text(
                        'Desde ',
                        style: TextStyle(
                          fontSize: 13,
                          color: AppColors.textSecondary,
                        ),
                      ),
                      Text(
                        formatPrice(hotel.minPrice.round()),
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w800,
                          color: AppColors.brandDark,
                        ),
                      ),
                      const SizedBox(width: 4),
                      const Padding(
                        padding: EdgeInsets.only(bottom: 2),
                        child: Text(
                          '/noche',
                          style: TextStyle(
                            fontSize: 12,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ),
                    ],
                  ),

                  // 8. Texto aclaratorio del precio (set controlado)
                  if (hotel.textoPrecio != null &&
                      hotel.textoPrecio!.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(
                      hotel.textoPrecio!,
                      style: const TextStyle(
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
    final photoUrl = hotel.photoUrl;
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
  final Hotel hotel;

  const _ScoreBadge({required this.hotel});

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
            hotel.ratingAvgValue.toStringAsFixed(1),
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

class _AmenityPill extends StatelessWidget {
  final String id;

  const _AmenityPill({required this.id});

  @override
  Widget build(BuildContext context) {
    final amenity = amenityById(id);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.neutral100,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            amenity?.icon ?? Icons.check_circle_outline_rounded,
            size: 12,
            color: AppColors.textSecondary,
          ),
          const SizedBox(width: 4),
          Text(
            amenity?.label ?? id,
            style: const TextStyle(
              fontSize: 11,
              color: AppColors.neutral700,
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
        child: Icon(Icons.hotel_rounded,
            color: AppColors.textSecondary, size: 40),
      ),
    );
  }
}
