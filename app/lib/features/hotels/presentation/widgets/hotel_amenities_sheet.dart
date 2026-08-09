import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../config/colors.dart';
import '../../data/hotel_catalogs.dart';
import '../providers/hotels_provider.dart';

/// Checkboxes de comodidades desde el catálogo controlado `kAmenityCatalog`.
class HotelAmenitiesSheet extends ConsumerStatefulWidget {
  const HotelAmenitiesSheet({super.key});

  @override
  ConsumerState<HotelAmenitiesSheet> createState() => _HotelAmenitiesSheetState();
}

class _HotelAmenitiesSheetState extends ConsumerState<HotelAmenitiesSheet> {
  late Set<String> _selected;

  @override
  void initState() {
    super.initState();
    _selected = Set<String>.from(ref.read(hotelsProvider).filters.amenities);
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
                'Comodidades',
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
          Flexible(
            child: ListView(
              shrinkWrap: true,
              children: kAmenityCatalog.map((amenity) {
                final checked = _selected.contains(amenity.id);
                return CheckboxListTile(
                  contentPadding: EdgeInsets.zero,
                  controlAffinity: ListTileControlAffinity.leading,
                  dense: true,
                  activeColor: AppColors.brandEmerald,
                  value: checked,
                  title: Row(
                    children: [
                      Icon(amenity.icon,
                          size: 18,
                          color: checked
                              ? AppColors.brandEmerald
                              : AppColors.textSecondary),
                      const SizedBox(width: 10),
                      Text(
                        amenity.label,
                        style: const TextStyle(
                          fontSize: 15,
                          color: AppColors.neutral800,
                        ),
                      ),
                    ],
                  ),
                  onChanged: (v) {
                    setState(() {
                      if (v == true) {
                        _selected.add(amenity.id);
                      } else {
                        _selected.remove(amenity.id);
                      }
                    });
                  },
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () {
                    setState(() => _selected.clear());
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
                  onPressed: () {
                    final notifier = ref.read(hotelsProvider.notifier);
                    final current = ref.read(hotelsProvider).filters.amenities;
                    for (final id in _selected) {
                      if (!current.contains(id)) {
                        notifier.toggleAmenity(id);
                      }
                    }
                    for (final id in current) {
                      if (!_selected.contains(id)) {
                        notifier.toggleAmenity(id);
                      }
                    }
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
}
