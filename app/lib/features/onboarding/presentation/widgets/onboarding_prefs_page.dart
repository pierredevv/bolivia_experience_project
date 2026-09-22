import 'package:flutter/material.dart';
import '../../../../config/colors.dart';

class OnboardingPrefsPage extends StatelessWidget {
  final String? tourismType;
  final String? budgetType;
  final List<String> selectedInterests;
  final ValueChanged<String?> onTourismTypeChanged;
  final ValueChanged<String?> onBudgetTypeChanged;
  final ValueChanged<String> onInterestToggled;

  const OnboardingPrefsPage({
    super.key,
    required this.tourismType,
    required this.budgetType,
    required this.selectedInterests,
    required this.onTourismTypeChanged,
    required this.onBudgetTypeChanged,
    required this.onInterestToggled,
  });

  static const List<({String value, String label, IconData icon})>
      tourismOptions = [
    (value: 'aventura', label: 'Aventura', icon: Icons.hiking),
    (value: 'cultura', label: 'Cultura', icon: Icons.museum),
    (value: 'gastronomia', label: 'Gastronomía', icon: Icons.restaurant),
    (value: 'naturaleza', label: 'Naturaleza', icon: Icons.eco),
    (value: 'relax', label: 'Relax', icon: Icons.spa),
  ];

  static const List<({String value, String label, IconData icon})>
      budgetOptions = [
    (value: 'mochilero', label: 'Mochilero', icon: Icons.backpack),
    (value: 'medio', label: 'Medio', icon: Icons.account_balance_wallet),
    (value: 'premium', label: 'Premium', icon: Icons.workspace_premium),
  ];

  static const List<({String value, String label})> interestOptions = [
    (value: 'restaurantes', label: 'Restaurantes'),
    (value: 'cafeterias', label: 'Cafeterías'),
    (value: 'bares', label: 'Bares y tragos'),
    (value: 'parques', label: 'Parques'),
    (value: 'museos', label: 'Museos'),
    (value: 'atracciones', label: 'Atracciones'),
    (value: 'deportes', label: 'Deportes'),
    (value: 'centros-comerciales', label: 'Centros comerciales'),
  ];

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 16),
          Icon(
            Icons.tune,
            size: 56,
            color: AppColors.primary700.withValues(alpha: 0.9),
          ),
          const SizedBox(height: 20),
          Text(
            'Personalizá tu experiencia',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: AppColors.neutral900,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            'Contanos qué te gusta para recomendarte los mejores lugares',
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: AppColors.neutral600,
                ),
          ),
          const SizedBox(height: 28),
          _sectionTitle(context, '¿Cómo te gusta viajar?', Icons.explore),
          const SizedBox(height: 12),
          _chipGrid(tourismOptions, tourismType, onTourismTypeChanged),
          const SizedBox(height: 24),
          _sectionTitle(context, '¿Cuál es tu presupuesto?', Icons.payments),
          const SizedBox(height: 12),
          _chipGrid(budgetOptions, budgetType, onBudgetTypeChanged),
          const SizedBox(height: 24),
          _sectionTitle(context, 'Tus intereses', Icons.favorite),
          const SizedBox(height: 12),
          ...interestOptions.map(
            (option) => CheckboxListTile(
              value: selectedInterests.contains(option.value),
              onChanged: (_) => onInterestToggled(option.value),
              title: Text(
                option.label,
                style: const TextStyle(
                  color: AppColors.neutral800,
                  fontSize: 15,
                ),
              ),
              contentPadding: EdgeInsets.zero,
              controlAffinity: ListTileControlAffinity.leading,
              activeColor: AppColors.primary700,
              dense: true,
            ),
          ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }

  Widget _sectionTitle(BuildContext context, String text, IconData icon) {
    return Row(
      children: [
        Icon(icon, size: 20, color: AppColors.primary700),
        const SizedBox(width: 8),
        Text(
          text,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.neutral900,
          ),
        ),
      ],
    );
  }

  Widget _chipGrid(
    List<({String value, String label, IconData icon})> options,
    String? selected,
    ValueChanged<String?> onChanged,
  ) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: options.map((option) {
        final isSelected = selected == option.value;
        return ChoiceChip(
          selected: isSelected,
          onSelected: (isSel) => onChanged(isSel ? option.value : null),
          avatar: Icon(
            option.icon,
            size: 18,
            color: isSelected ? Colors.white : AppColors.neutral500,
          ),
          label: Text(option.label),
          selectedColor: AppColors.primary700,
          backgroundColor: AppColors.neutral100,
          labelStyle: TextStyle(
            color: isSelected ? Colors.white : AppColors.neutral800,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
          ),
          showCheckmark: false,
          side: BorderSide(
            color: isSelected ? AppColors.primary700 : AppColors.neutral300,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24),
          ),
        );
      }).toList(),
    );
  }
}