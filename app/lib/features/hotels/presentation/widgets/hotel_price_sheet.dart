import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../config/colors.dart';
import '../../../../core/currency/currency.dart';
import '../providers/hotels_provider.dart';

/// Rango de precio por noche. El máximo es dinámico:
/// `MAX(precio_minimo)` de los hoteles activos (viene del backend).
class HotelPriceSheet extends ConsumerStatefulWidget {
  const HotelPriceSheet({super.key});

  @override
  ConsumerState<HotelPriceSheet> createState() => _HotelPriceSheetState();
}

class _HotelPriceSheetState extends ConsumerState<HotelPriceSheet> {
  late double _max;
  late double _value;

  @override
  void initState() {
    super.initState();
    final state = ref.read(hotelsProvider);
    _max = state.maxMinPrice > 0 ? state.maxMinPrice : 1000;
    _value = state.filters.maxPrice ?? _max;
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
                'Precio por noche',
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
          const SizedBox(height: 16),
          Text(
            '${currencySymbol(effectiveCurrencyCode())} 0 – ${_value.round()}',
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w800,
              color: AppColors.brandDark,
            ),
          ),
          const SizedBox(height: 8),
          Slider(
            value: _value.clamp(0, _max),
            min: 0,
            max: _max,
            activeColor: AppColors.brandEmerald,
            inactiveColor: AppColors.borderSubtle,
            onChanged: (v) => setState(() => _value = v),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('${currencySymbol(effectiveCurrencyCode())} 0',
                  style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
              Text('${currencySymbol(effectiveCurrencyCode())} ${_max.round()}',
                  style: const TextStyle(
                      fontSize: 12, color: AppColors.textSecondary)),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () {
                    ref.read(hotelsProvider.notifier).clearMaxPrice();
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
                  onPressed: () {
                    final applied = _value >= _max ? null : _value;
                    ref
                        .read(hotelsProvider.notifier)
                        .setMaxPrice(applied);
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
