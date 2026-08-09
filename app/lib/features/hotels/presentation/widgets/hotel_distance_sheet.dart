import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../config/colors.dart';
import '../../data/hotel.dart';
import '../providers/hotels_provider.dart';

/// Filtro "Distancia desde": elige un lugar turístico del catálogo `Place`
/// y limita el radio (km o millas). Independiente de la distancia GPS que
/// se muestra en cada card.
class HotelDistanceSheet extends ConsumerStatefulWidget {
  const HotelDistanceSheet({super.key});

  @override
  ConsumerState<HotelDistanceSheet> createState() => _HotelDistanceSheetState();
}

class _HotelDistanceSheetState extends ConsumerState<HotelDistanceSheet> {
  final TextEditingController _searchController = TextEditingController();
  late double _radius;
  late bool _useMiles;
  PlaceReference? _selected;
  List<PlaceReference> _suggestions = [];
  bool _showSuggestions = false;

  static const double _maxRadiusKm = 50;
  static const double _maxRadiusMi = 30;

  @override
  void initState() {
    super.initState();
    final f = ref.read(hotelsProvider).filters;
    _selected = f.distancePlace;
    _radius = f.maxDistanceKm ?? (_maxRadiusKm / 2);
    _useMiles = f.useMiles;
    _updateSuggestions('');
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  double get _maxRadius => _useMiles ? _maxRadiusMi : _maxRadiusKm;

  void _updateSuggestions(String query) {
    final catalog = ref.read(hotelsProvider).placesCatalog;
    final q = query.trim().toLowerCase();
    setState(() {
      _suggestions = catalog
          .where((p) => q.isEmpty || p.name.toLowerCase().contains(q))
          .take(8)
          .toList();
    });
  }

  void _selectPlace(PlaceReference place) {
    setState(() {
      _selected = place;
      _searchController.text = place.name;
      _showSuggestions = false;
    });
  }

  void _clearPlace() {
    setState(() {
      _selected = null;
      _searchController.clear();
      _showSuggestions = false;
    });
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
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Distancia desde',
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
          const SizedBox(height: 4),
          const Text(
            'Busca un lugar turístico y fija el radio máximo.',
            style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
          ),
          const SizedBox(height: 16),
          // Buscador con autocompletado
          TextField(
            controller: _searchController,
            decoration: InputDecoration(
              hintText: 'Buscar lugar (ej. Ventura Mall)…',
              prefixIcon: const Icon(Icons.search_rounded, size: 20),
              suffixIcon: _selected != null
                  ? IconButton(
                      icon: const Icon(Icons.close, size: 18),
                      onPressed: _clearPlace,
                    )
                  : null,
              filled: true,
              fillColor: AppColors.neutral100,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide.none,
              ),
            ),
            onChanged: (v) {
              setState(() {
                _showSuggestions = true;
                _selected = null;
              });
              _updateSuggestions(v);
            },
            onTap: () => setState(() => _showSuggestions = true),
          ),
          if (_showSuggestions && _suggestions.isNotEmpty) ...[
            const SizedBox(height: 8),
            Flexible(
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.borderSubtle),
                ),
                child: ListView(
                  shrinkWrap: true,
                  children: _suggestions.map((p) {
                    return ListTile(
                      dense: true,
                      leading: const Icon(Icons.place_outlined,
                          size: 18, color: AppColors.brandEmerald),
                      title: Text(
                        p.name,
                        style: const TextStyle(fontSize: 14),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      onTap: () => _selectPlace(p),
                    );
                  }).toList(),
                ),
              ),
            ),
          ],
          const SizedBox(height: 16),
          // Toggle km / millas
          Row(
            children: [
              const Text('Unidad:',
                  style: TextStyle(
                      fontSize: 13, color: AppColors.textSecondary)),
              const SizedBox(width: 12),
              SegmentedButton<bool>(
                segments: const [
                  ButtonSegment(value: false, label: Text('km')),
                  ButtonSegment(value: true, label: Text('millas')),
                ],
                selected: {_useMiles},
                style: SegmentedButton.styleFrom(
                  selectedBackgroundColor: AppColors.brandDark,
                  selectedForegroundColor: Colors.white,
                ),
                onSelectionChanged: (s) =>
                    setState(() => _useMiles = s.first),
              ),
            ],
          ),
          const SizedBox(height: 8),
          // Slider de radio
          Text(
            _selected == null
                ? 'Elige un lugar primero'
                : 'Radio máximo: ${_radiusLabel(_radius, _useMiles)}',
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AppColors.neutral700,
            ),
          ),
          Slider(
            value: _radius.clamp(1, _maxRadius),
            min: 1,
            max: _maxRadius,
            activeColor: AppColors.brandEmerald,
            inactiveColor: AppColors.borderSubtle,
            label: _radiusLabel(_radius, _useMiles),
            onChanged: (v) => setState(() => _radius = v),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () {
                    ref.read(hotelsProvider.notifier).clearDistanceFilter();
                    Navigator.pop(context);
                  },
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.brandDark,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    side: const BorderSide(color: AppColors.borderSubtle),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text('Borrar',
                      style: TextStyle(fontWeight: FontWeight.w600)),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                flex: 2,
                child: ElevatedButton(
                  onPressed: _selected == null
                      ? null
                      : () {
                          final notifier =
                              ref.read(hotelsProvider.notifier);
                          notifier.setUseMiles(_useMiles);
                          notifier.setDistanceFilter(
                            _selected,
                            _radius,
                          );
                          Navigator.pop(context);
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.brandDark,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    disabledBackgroundColor: AppColors.neutral300,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text('Aplicar',
                      style: TextStyle(
                          fontSize: 16, fontWeight: FontWeight.w600)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _radiusLabel(double v, bool miles) {
    if (miles) {
      return '${v.toStringAsFixed(v >= 10 ? 0 : 1)} mi';
    }
    return v < 1 ? '${(v * 1000).round()} m' : '${v.round()} km';
  }
}
