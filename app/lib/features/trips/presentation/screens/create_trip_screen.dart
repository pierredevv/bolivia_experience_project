import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../config/colors.dart';
import '../providers/trips_provider.dart';

class CreateTripScreen extends ConsumerStatefulWidget {
  const CreateTripScreen({super.key});

  @override
  ConsumerState<CreateTripScreen> createState() => _CreateTripScreenState();
}

class _CreateTripScreenState extends ConsumerState<CreateTripScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _descriptionController = TextEditingController();

  String _selectedDestination = 'Santa Cruz';
  String? _selectedBudgetType;
  DateTime? _startDate;
  DateTime? _endDate;

  final _destinations = [
    {'name': 'Santa Cruz', 'enabled': true},
    {'name': 'La Paz', 'enabled': false},
    {'name': 'Cochabamba', 'enabled': false},
    {'name': 'Sucre', 'enabled': false},
    {'name': 'Uyuni', 'enabled': false},
    {'name': 'Samaipata', 'enabled': false},
    {'name': 'Tarija', 'enabled': false},
    {'name': 'Potosi', 'enabled': false},
  ];

  @override
  void dispose() {
    _nameController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final tripsState = ref.watch(tripsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Crear viaje'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(
                  labelText: 'Nombre del viaje',
                  hintText: 'Ej: Aventura en Santa Cruz',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Ingresa un nombre para el viaje';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                initialValue: _selectedDestination,
                decoration: const InputDecoration(
                  labelText: 'Destino',
                  border: OutlineInputBorder(),
                ),
                items: _destinations.map((dest) {
                  return DropdownMenuItem(
                    value: dest['name'] as String,
                    enabled: dest['enabled'] as bool,
                    child: Row(
                      children: [
                        Text(dest['name'] as String),
                        if (!(dest['enabled'] as bool)) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 6,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.neutral200,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Text(
                              'Proximamente',
                              style: TextStyle(
                                fontSize: 9,
                                color: AppColors.neutral500,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  );
                }).toList(),
                onChanged: (value) {
                  if (value != null) {
                    setState(() => _selectedDestination = value);
                  }
                },
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: _buildDateField(
                      label: 'Fecha inicio',
                      date: _startDate,
                      onTap: () => _pickDate(isStart: true),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildDateField(
                      label: 'Fecha fin',
                      date: _endDate,
                      onTap: () => _pickDate(isStart: false),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              const Text(
                'Tipo de presupuesto',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 12),
              _buildBudgetButtons(),
              const SizedBox(height: 16),
              TextFormField(
                controller: _descriptionController,
                decoration: const InputDecoration(
                  labelText: 'Descripcion (opcional)',
                  hintText: 'Cuentanos sobre tu viaje...',
                  border: OutlineInputBorder(),
                ),
                maxLines: 3,
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: FilledButton(
                  onPressed: tripsState.isCreating ? null : _createTrip,
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.primary700,
                    foregroundColor: Colors.white,
                  ),
                  child: tripsState.isCreating
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Text(
                          'Crear viaje',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDateField({
    required String label,
    required DateTime? date,
    required VoidCallback onTap,
  }) {
    final text = date != null
        ? '${date.day}/${date.month}/${date.year}'
        : 'Seleccionar';

    return GestureDetector(
      onTap: onTap,
      child: InputDecorator(
        decoration: InputDecoration(
          labelText: label,
          border: const OutlineInputBorder(),
          suffixIcon: const Icon(Icons.calendar_today),
        ),
        child: Text(
          text,
          style: TextStyle(
            color: date != null ? null : AppColors.neutral400,
          ),
        ),
      ),
    );
  }

  Widget _buildBudgetButtons() {
    return Row(
      children: [
        Expanded(
          child: _BudgetButton(
            label: 'Low Cost',
            icon: Icons.savings,
            color: Colors.green,
            isSelected: _selectedBudgetType == 'low_cost',
            onTap: () => setState(() => _selectedBudgetType = 'low_cost'),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _BudgetButton(
            label: 'Medio',
            icon: Icons.account_balance_wallet,
            color: Colors.blue,
            isSelected: _selectedBudgetType == 'medium',
            onTap: () => setState(() => _selectedBudgetType = 'medium'),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _BudgetButton(
            label: 'Premium',
            icon: Icons.diamond,
            color: const Color(0xFFD4AF37),
            isSelected: _selectedBudgetType == 'luxury',
            onTap: () => setState(() => _selectedBudgetType = 'luxury'),
          ),
        ),
      ],
    );
  }

  Future<void> _pickDate({required bool isStart}) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: isStart
          ? (_startDate ?? DateTime.now())
          : (_endDate ?? _startDate ?? DateTime.now()),
      firstDate: DateTime.now().subtract(const Duration(days: 365)),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );

    if (picked != null) {
      setState(() {
        if (isStart) {
          _startDate = picked;
          if (_endDate != null && _endDate!.isBefore(picked)) {
            _endDate = null;
          }
        } else {
          _endDate = picked;
        }
      });
    }
  }

  Future<void> _createTrip() async {
    if (!_formKey.currentState!.validate()) return;

    if (_startDate == null || _endDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Selecciona las fechas del viaje')),
      );
      return;
    }

    if (_endDate!.isBefore(_startDate!)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('La fecha fin no puede ser antes de la fecha inicio')),
      );
      return;
    }

    final success = await ref.read(tripsProvider.notifier).createTrip(
          name: _nameController.text.trim(),
          startDate: _startDate!.toIso8601String().split('T')[0],
          endDate: _endDate!.toIso8601String().split('T')[0],
          description: _descriptionController.text.isNotEmpty
              ? _descriptionController.text
              : null,
          destination: _selectedDestination,
          budgetType: _selectedBudgetType,
        );

    if (success && mounted) {
      final trips = ref.read(tripsProvider).trips;
      if (trips.isNotEmpty) {
        context.push('/trips/${trips.first['id']}');
      } else {
        context.go('/trips');
      }
    } else if (mounted) {
      final error = ref.read(tripsProvider).errorMessage;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error ?? 'Error al crear viaje')),
      );
    }
  }
}

class _BudgetButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color color;
  final bool isSelected;
  final VoidCallback onTap;

  const _BudgetButton({
    required this.label,
    required this.icon,
    required this.color,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: isSelected ? color.withAlpha(30) : AppColors.neutral50,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? color : AppColors.neutral200,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              size: 28,
              color: isSelected ? color : AppColors.neutral400,
            ),
            const SizedBox(height: 8),
            Text(
              label,
              style: TextStyle(
                fontWeight: FontWeight.w600,
                color: isSelected ? color : AppColors.neutral600,
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
