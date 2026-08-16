import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../config/colors.dart';
import '../../../../core/currency/currency.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../hotels/data/hotel_distance.dart';
import '../../data/restaurant.dart';
import '../../data/restaurant_catalogs.dart';

/// Card de restaurante — el orden de la información sigue la especificación:
/// 1. Nombre · 2. Score + reseñas + distancia a la Plaza · 3. Tipo de cocina ·
/// 4. Nivel de precio ($/$$/$$$/$$$$) · 5. Características · 6. Comodidades ·
/// 7. Badge cashback · 8. Estado de reserva · 9. Precio por persona.
class RestaurantCard extends ConsumerWidget {
  final Restaurant restaurant;
  final VoidCallback? onTap;

  const RestaurantCard({super.key, required this.restaurant, this.onTap});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isAuthenticated =
        ref.watch(authProvider).status == AuthStatus.authenticated;
    final distance = restaurant.distanceFromReferenceKm;
    final cashbackPct = restaurant.cashbackPorcentaje;

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
                    restaurant.name,
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

                  // 2. Score + reseñas + distancia a la Plaza
                  Row(
                    children: [
                      _ScoreBadge(restaurant: restaurant),
                      const SizedBox(width: 8),
                      Text(
                        '${restaurant.ratingCount} reseñas',
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
                          '${HotelDistance.formatKm(distance)} de la Plaza',
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ],
                  ),
                  if (distance == null) const SizedBox(height: 4),

                  // 3. Tipo de cocina + 4. Nivel de precio
                  if (restaurant.cocinaName != null ||
                      restaurant.priceLevelText.isNotEmpty) ...[
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        if (restaurant.cocinaName != null)
                          Flexible(
                            child: Text(
                              restaurant.cocinaName!,
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: AppColors.neutral600,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        if (restaurant.priceLevelText.isNotEmpty) ...[
                          const SizedBox(width: 8),
                          Text(
                            restaurant.priceLevelText,
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: AppColors.brandEmerald,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],

                  // 5. Características del socio
                  if (restaurant.caracteristicas != null &&
                      restaurant.caracteristicas!.isNotEmpty) ...[
                    const SizedBox(height: 10),
                    Text(
                      restaurant.caracteristicas!,
                      style: const TextStyle(
                        fontSize: 13,
                        height: 1.3,
                        color: AppColors.neutral600,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],

                  // 6. Comodidades destacadas
                  if (restaurant.comodidades.isNotEmpty) ...[
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: restaurant.comodidades
                          .take(4)
                          .map((id) => _AmenityPill(id: id))
                          .toList(),
                    ),
                  ],

                  // 7. Badge cashback (solo si hay % acordado)
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

                  // 8. Estado de reserva / aviso de sesión
                  const SizedBox(height: 10),
                  if (restaurant.canReserve)
                    const Row(
                      children: [
                        Icon(Icons.check_circle_rounded,
                            size: 14, color: AppColors.brandEmerald),
                        SizedBox(width: 6),
                        Text(
                          'Reserva disponible online',
                          style: TextStyle(
                            fontSize: 12,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    )
                  else
                    const Row(
                      children: [
                        Icon(Icons.info_outline_rounded,
                            size: 14, color: AppColors.textSecondary),
                        SizedBox(width: 6),
                        Text(
                          'Solo información, sin reserva online',
                          style: TextStyle(
                            fontSize: 12,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  if (!isAuthenticated) ...[
                    const SizedBox(height: 8),
                    const Row(
                      children: [
                        Icon(Icons.lock_outline_rounded,
                            size: 14, color: AppColors.textSecondary),
                        SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            'Inicia sesión para reservar con BoliviaExperience',
                            style: TextStyle(
                              fontSize: 12,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],

                  const SizedBox(height: 12),
                  const Divider(height: 1, color: AppColors.borderSubtle),
                  const SizedBox(height: 12),

                  // 9. Precio por persona (desde la mesa)
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
                        restaurant.priceFrom.round() <= 0
                            ? ''
                            : formatPrice(restaurant.priceFrom.round()),
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
                          '/persona',
                          style: TextStyle(
                            fontSize: 12,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ),
                    ],
                  ),
                  if (restaurant.mesa.textoPrecio != null &&
                      restaurant.mesa.textoPrecio!.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(
                      restaurant.mesa.textoPrecio!,
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
    final photoUrl = restaurant.photoUrl;
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
  final Restaurant restaurant;

  const _ScoreBadge({required this.restaurant});

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
            restaurant.ratingAvgValue.toStringAsFixed(1),
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
    final amenity = restaurantAmenityById(id);
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
        child: Icon(Icons.restaurant_rounded,
            color: AppColors.textSecondary, size: 40),
      ),
    );
  }
}
