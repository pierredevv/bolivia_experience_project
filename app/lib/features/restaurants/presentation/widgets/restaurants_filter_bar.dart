import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../config/colors.dart';
import '../../data/restaurant_catalogs.dart';
import '../../data/restaurant_filters.dart';
import '../providers/restaurants_provider.dart';
import 'restaurant_cocina_sheet.dart';
import 'restaurant_comodidades_sheet.dart';
import 'restaurant_datetime_sheet.dart';
import 'restaurant_distance_sheet.dart';
import 'restaurant_more_filters_sheet.dart';
import 'restaurant_persons_sheet.dart';
import 'restaurant_price_sheet.dart';

/// Barra horizontal de filtros de la vista Restaurantes.
class RestaurantsFilterBar extends ConsumerWidget {
  const RestaurantsFilterBar({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(restaurantsProvider);
    final f = state.filters;

    final dateLabel = DateFormat('d MMM').format(f.date);
    final dateTimeLabel = '$dateLabel · ${f.time}';
    final personsLabel = '${f.persons} ${f.persons == 1 ? 'persona' : 'personas'}';
    final cocinaLabel = f.cocinaSlugs.isNotEmpty
        ? 'Cocina · ${f.cocinaSlugs.length}'
        : 'Cocina';

    final moreFiltersActive = f.sort != RestaurantSort.recommended;

    return SizedBox(
      height: 46,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        children: [
          _FilterPill(
            icon: Icons.event_available_rounded,
            label: dateTimeLabel,
            active: true,
            onTap: () => _openDateTime(context, ref),
          ),
          _FilterPill(
            icon: Icons.group_rounded,
            label: personsLabel,
            active: true,
            onTap: () => _openPersons(context, ref),
          ),
          _FilterPill(
            icon: Icons.restaurant_menu_rounded,
            label: cocinaLabel,
            active: f.cocinaSlugs.isNotEmpty,
            onTap: () => _openCocina(context, ref),
          ),
          _FilterPill(
            icon: Icons.payments_rounded,
            label: f.priceLevels.isNotEmpty ? 'Precio · ${f.priceLevels.length}' : 'Precio',
            active: f.priceLevels.isNotEmpty,
            onTap: () => _openPrice(context, ref),
          ),
          _FilterPill(
            icon: Icons.percent_rounded,
            label: 'Cashback',
            active: f.cashbackOnly,
            onTap: () => ref.read(restaurantsProvider.notifier).toggleCashbackOnly(),
          ),
          _FilterPill(
            icon: Icons.checklist_rounded,
            label: f.comodidades.isNotEmpty
                ? 'Comodidades · ${f.comodidades.length}'
                : 'Comodidades',
            active: f.comodidades.isNotEmpty,
            onTap: () => _openComodidades(context, ref),
          ),
          _FilterPill(
            icon: Icons.place_rounded,
            label: _distanceLabel(f),
            active: f.distancePlace != null,
            onTap: () => _openDistance(context, ref),
          ),
          _FilterPill(
            icon: Icons.tune_rounded,
            label: 'Más filtros',
            active: moreFiltersActive,
            onTap: () => _openMoreFilters(context, ref),
          ),
        ],
      ),
    );
  }

  String _distanceLabel(RestaurantFilters f) {
    final place = f.distancePlace;
    if (place == null) return 'Distancia desde';
    final value = f.maxDistanceKm;
    if (value == null) return 'Distancia desde ${place.name}';
    final unit = f.useMiles ? 'mi' : 'km';
    final label = f.useMiles
        ? (value < 1 ? '${(value * 10).round() / 10}' : value.round().toString())
        : (value < 1 ? '${(value * 1000).round()} m' : value.round().toString());
    return '$label $unit · ${place.name}';
  }

  Future<void> _openDateTime(BuildContext context, WidgetRef ref) async {
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => const RestaurantDateTimeSheet(),
    );
  }

  Future<void> _openPersons(BuildContext context, WidgetRef ref) async {
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => const RestaurantPersonsSheet(),
    );
  }

  Future<void> _openCocina(BuildContext context, WidgetRef ref) async {
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => const RestaurantCocinaSheet(),
    );
  }

  Future<void> _openPrice(BuildContext context, WidgetRef ref) async {
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => const RestaurantPriceSheet(),
    );
  }

  Future<void> _openComodidades(BuildContext context, WidgetRef ref) async {
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => const RestaurantComodidadesSheet(),
    );
  }

  Future<void> _openDistance(BuildContext context, WidgetRef ref) async {
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => const RestaurantDistanceSheet(),
    );
  }

  Future<void> _openMoreFilters(BuildContext context, WidgetRef ref) async {
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => const RestaurantMoreFiltersSheet(),
    );
  }
}

/// Pill de filtro: blanco con borde por defecto; relleno oscuro si está activo.
class _FilterPill extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool active;
  final VoidCallback onTap;

  const _FilterPill({
    required this.icon,
    required this.label,
    required this.active,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14),
          decoration: BoxDecoration(
            color: active ? AppColors.brandDark : Colors.white,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(
              color: active ? AppColors.brandDark : AppColors.borderSubtle,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.03),
                blurRadius: 6,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                icon,
                size: 16,
                color: active ? Colors.white : AppColors.textSecondary,
              ),
              const SizedBox(width: 6),
              Text(
                label,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: active ? Colors.white : AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
