import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../config/colors.dart';
import '../providers/events_provider.dart';

class CreateEventScreen extends ConsumerStatefulWidget {
  const CreateEventScreen({super.key});

  @override
  ConsumerState<CreateEventScreen> createState() => _CreateEventScreenState();
}

class _CreateEventScreenState extends ConsumerState<CreateEventScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _organizerController = TextEditingController();
  final _locationController = TextEditingController();
  final _priceController = TextEditingController();
  String? _category;
  DateTime? _dateStart;
  DateTime? _dateEnd;
  bool _isFree = true;
  bool _submitting = false;

  static const List<String> _categories = [
    'Festival',
    'Música',
    'Gastronomía',
    'Deporte',
    'Feria',
    'Cultura',
    'Cine',
    'Teatro',
    'Religioso',
    'Otro',
  ];

  @override
  void dispose() {
    _nameController.dispose();
    _descriptionController.dispose();
    _organizerController.dispose();
    _locationController.dispose();
    _priceController.dispose();
    super.dispose();
  }

  Future<void> _pickDate({required bool isEnd}) async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: isEnd && _dateStart != null && _dateStart!.isAfter(now)
          ? _dateStart!
          : now,
      firstDate: now,
      lastDate: now.add(const Duration(days: 365 * 3)),
    );
    if (picked == null || !mounted) return;

    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(isEnd && _dateStart != null ? _dateStart! : now),
    );
    if (time == null || !mounted) return;

    final combined = DateTime(
      picked.year,
      picked.month,
      picked.day,
      time.hour,
      time.minute,
    );
    setState(() {
      if (isEnd) {
        _dateEnd = combined;
      } else {
        _dateStart = combined;
      }
    });
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _submitting = true);
    try {
      await ref.read(eventsServiceProvider).createEvent({
        'name': _nameController.text.trim(),
        'description': _descriptionController.text.trim().isEmpty
            ? null
            : _descriptionController.text.trim(),
        'organizer': _organizerController.text.trim().isEmpty
            ? null
            : _organizerController.text.trim(),
        'location': _locationController.text.trim(),
        'category': _category,
        'dateStart': _dateStart!.toUtc().toIso8601String(),
        if (_dateEnd != null) 'dateEnd': _dateEnd!.toUtc().toIso8601String(),
        if (!_isFree && _priceController.text.trim().isNotEmpty)
          'price': double.parse(_priceController.text.trim()),
      });
      await ref.read(eventsProvider.notifier).loadEvents();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Evento enviado. Está pendiente de aprobación.')),
      );
      context.go('/events');
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('No se pudo crear el evento, intentá de nuevo.')),
      );
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  String _formatDate(DateTime? date) {
    if (date == null) return 'Seleccionar';
    return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year} '
        '${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundCanvas,
      appBar: AppBar(
        backgroundColor: AppColors.brandDark,
        foregroundColor: Colors.white,
        title: const Text('Crear evento'),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(
                  labelText: 'Nombre del evento *',
                  prefixIcon: Icon(Icons.event),
                ),
                validator: (v) =>
                    (v == null || v.trim().isEmpty) ? 'Ingresá el nombre' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _descriptionController,
                decoration: const InputDecoration(
                  labelText: 'Descripción (opcional)',
                  prefixIcon: Icon(Icons.notes),
                ),
                maxLines: 3,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _organizerController,
                decoration: const InputDecoration(
                  labelText: 'Organizador (opcional)',
                  prefixIcon: Icon(Icons.person_outline),
                ),
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String?>(
                initialValue: _category,
                decoration: const InputDecoration(
                  labelText: 'Tipo de evento (opcional)',
                  prefixIcon: Icon(Icons.category_outlined),
                ),
                items: _categories
                    .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                    .toList(),
                onChanged: (v) => setState(() => _category = v),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _locationController,
                decoration: const InputDecoration(
                  labelText: 'Ubicación *',
                  prefixIcon: Icon(Icons.place_outlined),
                ),
                validator: (v) =>
                    (v == null || v.trim().isEmpty) ? 'Ingresá la ubicación' : null,
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _pickDate(isEnd: false),
                      icon: const Icon(Icons.edit_calendar_outlined, size: 20),
                      label: Text('Inicio: ${_formatDate(_dateStart)}'),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _pickDate(isEnd: true),
                      icon: const Icon(Icons.event_available_outlined, size: 20),
                      label: Text('Fin: ${_formatDate(_dateEnd)}'),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              SwitchListTile(
                value: _isFree,
                onChanged: (free) => setState(() => _isFree = free),
                title: const Text('Gratuito'),
                subtitle: Text(_isFree ? 'Entrada libre' : 'Evento de pago'),
                secondary: const Icon(Icons.payments_outlined),
              ),
              const SizedBox(height: 8),
              if (!_isFree)
                TextFormField(
                  controller: _priceController,
                  decoration: const InputDecoration(
                    labelText: 'Precio en Bs.',
                    prefixIcon: Icon(Icons.attach_money),
                  ),
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  validator: (v) {
                    if (_isFree) return null;
                    final value = double.tryParse(v ?? '');
                    if (value == null || value <= 0) {
                      return 'Ingresá un precio válido';
                    }
                    return null;
                  },
                ),
              const SizedBox(height: 32),
              SizedBox(
                height: 48,
                child: ElevatedButton(
                  onPressed: _submitting ? null : _submit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary700,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: _submitting
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: Colors.white),
                        )
                      : const Text('Publicar evento',
                          style: TextStyle(
                              fontSize: 16, fontWeight: FontWeight.w600)),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Tu evento se publicará tras la aprobación de un administrador.',
                style: Theme.of(context)
                    .textTheme
                    .bodySmall
                    ?.copyWith(color: AppColors.neutral500),
              ),
            ],
          ),
        ),
      ),
    );
  }
}