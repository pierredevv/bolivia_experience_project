import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../config/colors.dart';
import '../providers/hotels_provider.dart';

/// Selector de habitaciones, adultos y niños.
class HotelGuestsSheet extends ConsumerStatefulWidget {
  const HotelGuestsSheet({super.key});

  @override
  ConsumerState<HotelGuestsSheet> createState() => _HotelGuestsSheetState();
}

class _HotelGuestsSheetState extends ConsumerState<HotelGuestsSheet> {
  late int _rooms;
  late int _adults;
  late int _children;

  @override
  void initState() {
    super.initState();
    final f = ref.read(hotelsProvider).filters;
    _rooms = f.rooms;
    _adults = f.adults;
    _children = f.children;
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
                'Habitaciones y huéspedes',
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
          _StepperRow(
            label: 'Habitaciones',
            value: _rooms,
            min: 1,
            max: 8,
            onChanged: (v) => setState(() => _rooms = v),
          ),
          _StepperRow(
            label: 'Adultos',
            value: _adults,
            min: 1,
            max: 12,
            onChanged: (v) => setState(() => _adults = v),
          ),
          _StepperRow(
            label: 'Niños',
            value: _children,
            min: 0,
            max: 8,
            onChanged: (v) => setState(() => _children = v),
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                ref.read(hotelsProvider.notifier).setGuests(
                      rooms: _rooms,
                      adults: _adults,
                      children: _children,
                    );
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
              child: const Text(
                'Aplicar',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _StepperRow extends StatelessWidget {
  final String label;
  final int value;
  final int min;
  final int max;
  final ValueChanged<int> onChanged;

  const _StepperRow({
    required this.label,
    required this.value,
    required this.min,
    required this.max,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w600,
              color: AppColors.neutral800,
            ),
          ),
          Row(
            children: [
              _RoundIconButton(
                icon: Icons.remove_rounded,
                onTap: value > min ? () => onChanged(value - 1) : null,
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Text(
                  '$value',
                  style: const TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                    color: AppColors.neutral900,
                  ),
                ),
              ),
              _RoundIconButton(
                icon: Icons.add_rounded,
                onTap: value < max ? () => onChanged(value + 1) : null,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _RoundIconButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback? onTap;

  const _RoundIconButton({required this.icon, this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 34,
        height: 34,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: onTap != null ? AppColors.brandDark : AppColors.neutral200,
        ),
        child: Icon(icon, size: 18, color: Colors.white),
      ),
    );
  }
}
