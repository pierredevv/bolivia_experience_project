import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../config/colors.dart';
import '../../data/hotel_catalogs.dart';
import '../../data/hotel_filters.dart';
import '../providers/hotels_provider.dart';

/// Panel "Más filtros": ordenamiento, ofertas, popular, premios y tipo.
/// El precio NO se repite aquí: usa el filtro principal compartido.
class HotelMoreFiltersSheet extends ConsumerStatefulWidget {
  const HotelMoreFiltersSheet({super.key});

  @override
  ConsumerState<HotelMoreFiltersSheet> createState() =>
      _HotelMoreFiltersSheetState();
}

class _HotelMoreFiltersSheetState extends ConsumerState<HotelMoreFiltersSheet> {
  late HotelFilters _f;

  @override
  void initState() {
    super.initState();
    _f = ref.read(hotelsProvider).filters;
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Más filtros',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppColors.neutral900,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const SizedBox(height: 8),

            // ── Ordenar por ────────────────────────────────────────────────
            _sectionTitle('Ordenar por'),
            const SizedBox(height: 8),
            RadioGroup<HotelSort>(
              groupValue: _f.sort,
              onChanged: (v) {
                if (v != null) setState(() => _f = _f.copyWith(sort: v));
              },
              child: Column(
                children: [
                  _RadioTile<HotelSort>(
                    value: HotelSort.recommended,
                    label: 'Recomendados',
                    onTap: () => setState(() => _f = _f.copyWith(sort: HotelSort.recommended)),
                  ),
                  _RadioTile<HotelSort>(
                    value: HotelSort.bestRating,
                    label: 'Mejor valoración',
                    onTap: () => setState(() => _f = _f.copyWith(sort: HotelSort.bestRating)),
                  ),
                  _RadioTile<HotelSort>(
                    value: HotelSort.travelerRanking,
                    label: 'Ranking de viajeros',
                    onTap: () => setState(() => _f = _f.copyWith(sort: HotelSort.travelerRanking)),
                  ),
                  _RadioTile<HotelSort>(
                    value: HotelSort.priceAsc,
                    label: 'Precio (menor a mayor)',
                    onTap: () => setState(() => _f = _f.copyWith(sort: HotelSort.priceAsc)),
                  ),
                  _RadioTile<HotelSort>(
                    value: HotelSort.distanceFromPlaza,
                    label: 'Distancia desde la Plaza 24 de Septiembre',
                    onTap: () => setState(() => _f = _f.copyWith(sort: HotelSort.distanceFromPlaza)),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),
            // ── Ofertas ────────────────────────────────────────────────────
            _sectionTitle('Ofertas'),
            const SizedBox(height: 8),
            _CheckTile(
              value: _f.tieneOfertaOnly,
              label: 'Ofertas especiales',
              onChanged: (v) =>
                  setState(() => _f = _f.copyWith(tieneOfertaOnly: v)),
            ),
            _CheckTile(
              value: _f.reembolsableOnly,
              label: 'Totalmente reembolsable',
              onChanged: (v) =>
                  setState(() => _f = _f.copyWith(reembolsableOnly: v)),
            ),
            _CheckTile(
              value: _f.pagoDiferidoOnly,
              label: 'Reserva ahora, paga después',
              onChanged: (v) =>
                  setState(() => _f = _f.copyWith(pagoDiferidoOnly: v)),
            ),

            const SizedBox(height: 16),
            // ── Popular ────────────────────────────────────────────────────
            _sectionTitle('Popular'),
            const SizedBox(height: 8),
            _CheckTile(
              value: _f.estrellas == 5,
              label: '5 estrellas',
              onChanged: (v) => setState(() {
                _f = v
                    ? _f.copyWith(estrellas: 5)
                    : _f.copyWith(clearEstrellas: true);
              }),
            ),
            _CheckTile(
              value: _f.amenities.contains('desayuno'),
              label: 'Desayuno incluido',
              onChanged: (v) => setState(() {
                final next = Set<String>.from(_f.amenities);
                if (v) {
                  next.add('desayuno');
                } else {
                  next.remove('desayuno');
                }
                _f = _f.copyWith(amenities: next);
              }),
            ),
            _CheckTile(
              value: _f.altamenteConcurrido,
              label: 'Altamente concurrido',
              onChanged: (v) =>
                  setState(() => _f = _f.copyWith(altamenteConcurrido: v)),
            ),
            const SizedBox(height: 8),
            // Selector de estrellas
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Número de estrellas:',
                    style: TextStyle(
                        fontSize: 14, color: AppColors.neutral700)),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    ChoiceChip(
                      label: const Text('Todas'),
                      selected: _f.estrellas == null,
                      onSelected: (_) =>
                          setState(() => _f = _f.copyWith(clearEstrellas: true)),
                      selectedColor: AppColors.primary100,
                      checkmarkColor: AppColors.primary700,
                    ),
                    for (var i = 1; i <= 5; i++)
                      ChoiceChip(
                        label: Text('$i'),
                        selected: _f.estrellas == i,
                        onSelected: (_) =>
                            setState(() => _f = _f.copyWith(estrellas: i)),
                        selectedColor: AppColors.brandDark,
                        labelStyle: TextStyle(
                          color: _f.estrellas == i
                              ? Colors.white
                              : AppColors.neutral700,
                        ),
                        checkmarkColor: Colors.white,
                      ),
                  ],
                ),
              ],
            ),

            const SizedBox(height: 16),
            // ── Premios ────────────────────────────────────────────────────
            _sectionTitle('Premios'),
            const SizedBox(height: 8),
            _CheckTile(
              value: _f.premiadoOnly,
              label: 'El mejor de Bolivia',
              onChanged: (v) =>
                  setState(() => _f = _f.copyWith(premiadoOnly: v)),
            ),

            const SizedBox(height: 16),
            // ── Tipo de propiedad ──────────────────────────────────────────
            _sectionTitle('Tipo de propiedad'),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              children: kTipoPropiedadLabels.entries.map((entry) {
                final selected = _f.tipoPropiedad.contains(entry.key);
                return FilterChip(
                  label: Text(entry.value),
                  selected: selected,
                  onSelected: (_) {
                    setState(() {
                      final next = Set<String>.from(_f.tipoPropiedad);
                      if (selected) {
                        next.remove(entry.key);
                      } else {
                        next.add(entry.key);
                      }
                      _f = _f.copyWith(tipoPropiedad: next);
                    });
                  },
                  selectedColor: AppColors.brandDark,
                  labelStyle: TextStyle(
                    color: selected ? Colors.white : AppColors.neutral700,
                  ),
                  checkmarkColor: Colors.white,
                );
              }).toList(),
            ),

            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  ref.read(hotelsProvider.notifier).setFilters(_f);
                  Navigator.pop(context);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.brandDark,
                  foregroundColor: Colors.white,
                  elevation: 0,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text('Aplicar filtros',
                    style:
                        TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _sectionTitle(String text) => Text(
        text,
        style: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w700,
          color: AppColors.neutral800,
        ),
      );
}

class _RadioTile<T> extends StatelessWidget {
  final T value;
  final String label;
  final VoidCallback onTap;

  const _RadioTile({
    required this.value,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Row(
          children: [
            Radio<T>(
              value: value,
              activeColor: AppColors.brandDark,
            ),
            const SizedBox(width: 4),
            Text(
              label,
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.neutral800,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CheckTile extends StatelessWidget {
  final bool value;
  final String label;
  final ValueChanged<bool> onChanged;

  const _CheckTile({
    required this.value,
    required this.label,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return CheckboxListTile(
      contentPadding: EdgeInsets.zero,
      controlAffinity: ListTileControlAffinity.leading,
      dense: true,
      activeColor: AppColors.brandEmerald,
      value: value,
      title: Text(
        label,
        style: const TextStyle(fontSize: 14, color: AppColors.neutral800),
      ),
      onChanged: (v) => onChanged(v ?? false),
    );
  }
}
