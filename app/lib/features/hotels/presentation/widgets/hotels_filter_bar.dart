import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../config/colors.dart';
import '../../data/hotel_catalogs.dart';
import '../../data/hotel_filters.dart';
import '../providers/hotels_provider.dart';
import 'hotel_amenities_sheet.dart';
import 'hotel_distance_sheet.dart';
import 'hotel_guests_sheet.dart';
import 'hotel_more_filters_sheet.dart';
import 'hotel_price_sheet.dart';

/// Barra horizontal de filtros de la vista Hoteles.
class HotelsFilterBar extends ConsumerWidget {
  const HotelsFilterBar({super.key});

  String _shortDate(DateTime d) => DateFormat('d MMM').format(d);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(hotelsProvider);
    final f = state.filters;

    final dateLabel =
        '${_shortDate(f.checkIn)} – ${_shortDate(f.checkOut)}';
    final guestsLabel =
        '${f.rooms} ${f.rooms == 1 ? 'hab' : 'habs'} · ${f.totalGuests} ${f.totalGuests == 1 ? 'huésped' : 'huéspedes'}';

    final moreFiltersActive = f.sort != HotelSort.recommended ||
        f.tieneOfertaOnly ||
        f.reembolsableOnly ||
        f.pagoDiferidoOnly ||
        f.altamenteConcurrido ||
        f.estrellas != null ||
        f.premiadoOnly ||
        f.tipoPropiedad.isNotEmpty;

    return SizedBox(
      height: 46,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        children: [
          _FilterPill(
            icon: Icons.calendar_today_rounded,
            label: dateLabel,
            active: true,
            onTap: () => _openDateRange(context, ref),
          ),
          _FilterPill(
            icon: Icons.king_bed_rounded,
            label: guestsLabel,
            active: true,
            onTap: () => _openGuests(context, ref),
          ),
          _FilterPill(
            icon: Icons.percent_rounded,
            label: 'Cashback',
            active: f.cashbackOnly,
            onTap: () =>
                ref.read(hotelsProvider.notifier).toggleCashbackOnly(),
          ),
          _FilterPill(
            icon: Icons.payments_rounded,
            label: f.maxPrice != null
                ? 'Hasta Bs ${f.maxPrice!.round()}'
                : 'Precio',
            active: f.maxPrice != null,
            onTap: () => _openPrice(context, ref),
          ),
          _FilterPill(
            icon: Icons.checklist_rounded,
            label: f.amenities.isNotEmpty
                ? 'Comodidades · ${f.amenities.length}'
                : 'Comodidades',
            active: f.amenities.isNotEmpty,
            onTap: () => _openAmenities(context, ref),
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

  String _distanceLabel(HotelFilters f) {
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

  Future<void> _openDateRange(BuildContext context, WidgetRef ref) async {
    final f = ref.read(hotelsProvider).filters;
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final picked = await showDateRangePicker(
      context: context,
      firstDate: today,
      lastDate: today.add(const Duration(days: 365)),
      initialDateRange: DateTimeRange(start: f.checkIn, end: f.checkOut),
      builder: (context, child) => Theme(
        data: Theme.of(context).copyWith(
          colorScheme: const ColorScheme.light(primary: AppColors.brandDark),
        ),
        child: child!,
      ),
    );
    if (picked != null) {
      ref.read(hotelsProvider.notifier).setDates(picked.start, picked.end);
    }
  }

  Future<void> _openGuests(BuildContext context, WidgetRef ref) async {
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => const HotelGuestsSheet(),
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
      builder: (context) => const HotelPriceSheet(),
    );
  }

  Future<void> _openAmenities(BuildContext context, WidgetRef ref) async {
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => const HotelAmenitiesSheet(),
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
      builder: (context) => const HotelDistanceSheet(),
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
      builder: (context) => const HotelMoreFiltersSheet(),
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
