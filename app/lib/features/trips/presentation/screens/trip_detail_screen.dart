import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../config/colors.dart';
import '../providers/trips_provider.dart';
import '../widgets/trip_day_card.dart';

class TripDetailScreen extends ConsumerStatefulWidget {
  final String tripId;

  const TripDetailScreen({super.key, required this.tripId});

  @override
  ConsumerState<TripDetailScreen> createState() => _TripDetailScreenState();
}

class _TripDetailScreenState extends ConsumerState<TripDetailScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(tripsProvider.notifier).loadTripDetail(widget.tripId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final tripsState = ref.watch(tripsProvider);
    final trip = tripsState.selectedTrip;

    return Scaffold(
      appBar: AppBar(
        title: Text(trip?['name'] ?? 'Detalle del viaje'),
        actions: [
          if (trip != null) ...[
            IconButton(
              icon: const Icon(Icons.auto_awesome),
              tooltip: 'Generar itinerario',
              onPressed: tripsState.isGenerating
                  ? null
                  : () => _generateItinerary(context, ref),
            ),
            IconButton(
              icon: const Icon(Icons.share),
              onPressed: () => _shareTrip(trip),
            ),
            IconButton(
              icon: const Icon(Icons.delete_outline),
              onPressed: () => _confirmDelete(context, ref),
            ),
          ],
        ],
      ),
      body: _buildBody(context, ref, tripsState),
    );
  }

  Widget _buildBody(BuildContext context, WidgetRef ref, TripsState state) {
    if (state.isLoadingDetail) {
      return const Center(child: CircularProgressIndicator());
    }

    if (state.selectedTrip == null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: AppColors.error500),
              const SizedBox(height: 16),
              Text(
                state.errorMessage ?? 'No se pudo cargar el viaje',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: () => context.go('/trips'),
                icon: const Icon(Icons.arrow_back),
                label: const Text('Volver a viajes'),
              ),
            ],
          ),
        ),
      );
    }

    final trip = state.selectedTrip!;
    final days = (trip['days'] as List<dynamic>?) ?? [];
    final startDate = trip['startDate'] as String?;
    final endDate = trip['endDate'] as String?;
    final budgetType = trip['budgetType'] as String?;
    final budgetMin = trip['budgetMin'];
    final budgetMax = trip['budgetMax'];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(context, trip, startDate, endDate, budgetType),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Itinerario',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              if (budgetMin != null || budgetMax != null)
                Text(
                  _budgetSummary(budgetMin, budgetMax),
                  style: const TextStyle(
                    fontSize: 13,
                    color: AppColors.neutral500,
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16),
          if (days.isEmpty) ...[
            Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 40),
                child: Column(
                  children: [
                    const Icon(
                      Icons.event_note,
                      size: 48,
                      color: AppColors.neutral300,
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'Sin dias programados',
                      style: TextStyle(
                        color: AppColors.neutral500,
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton.icon(
                      onPressed: state.isGenerating
                          ? null
                          : () => _generateItinerary(context, ref),
                      icon: state.isGenerating
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Icon(Icons.auto_awesome),
                      label: Text(
                        state.isGenerating
                            ? 'Generando...'
                            : 'Generar itinerario',
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary700,
                        foregroundColor: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 8),
                    OutlinedButton.icon(
                      onPressed: () => _addDay(context, ref),
                      icon: const Icon(Icons.add),
                      label: const Text('O crear manualmente'),
                    ),
                  ],
                ),
              ),
            ),
          ] else ...[
            _buildTimeline(context, ref, days, trip['id']),
          ],
          const SizedBox(height: 24),
          if (days.isNotEmpty)
            Center(
              child: OutlinedButton.icon(
                onPressed: () => _addDay(context, ref),
                icon: const Icon(Icons.add),
                label: const Text('Agregar otro dia'),
              ),
            ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _buildHeader(
    BuildContext context,
    Map<String, dynamic> trip,
    String? startDate,
    String? endDate,
    String? budgetType,
  ) {
    final destination = trip['destination'] as String? ?? '';
    final description = trip['description'] as String?;
    final budgetLabel = _getBudgetLabel(budgetType);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [
            AppColors.primary700,
            AppColors.primary500,
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (budgetType != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.white.withAlpha(40),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                budgetLabel,
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
            ),
          const SizedBox(height: 12),
          Text(
            trip['name'] as String? ?? '',
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          if (destination.isNotEmpty) ...[
            const SizedBox(height: 6),
            Row(
              children: [
                const Icon(Icons.place, size: 16, color: Colors.white70),
                const SizedBox(width: 4),
                Text(
                  destination,
                  style: const TextStyle(
                    fontSize: 14,
                    color: Colors.white70,
                  ),
                ),
              ],
            ),
          ],
          const SizedBox(height: 6),
          Row(
            children: [
              const Icon(Icons.calendar_today, size: 14, color: Colors.white70),
              const SizedBox(width: 4),
              Text(
                '${_formatDate(startDate)} - ${_formatDate(endDate)}',
                style: const TextStyle(
                  fontSize: 13,
                  color: Colors.white70,
                ),
              ),
            ],
          ),
          if (description != null && description.isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(
              description,
              style: const TextStyle(
                fontSize: 13,
                color: Colors.white60,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildTimeline(
    BuildContext context,
    WidgetRef ref,
    List<dynamic> days,
    String tripId,
  ) {
    return Column(
      children: List.generate(days.length, (index) {
        final day = days[index];
        final isLast = index == days.length - 1;

        return IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Column(
                children: [
                  Container(
                    width: 2,
                    height: 20,
                    color: AppColors.primary200,
                  ),
                  Container(
                    width: 14,
                    height: 14,
                    decoration: BoxDecoration(
                      color: AppColors.primary700,
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: Colors.white,
                        width: 2,
                      ),
                    ),
                  ),
                  if (!isLast)
                    Expanded(
                      child: Container(
                        width: 2,
                        color: AppColors.primary200,
                      ),
                    ),
                  if (isLast)
                    Container(
                      width: 2,
                      height: 20,
                      color: AppColors.primary200,
                    ),
                ],
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.only(bottom: 24),
                  child: TripDayCard(
                    day: day,
                    onAddItem: () => _addItemToDay(context, ref, day['id']),
                    onDeleteItem: (itemId) =>
                        _removeItem(context, ref, tripId, itemId),
                  ),
                ),
              ),
            ],
          ),
        );
      }),
    );
  }

  Future<void> _addDay(BuildContext context, WidgetRef ref) async {
    final days = ref.read(tripsProvider).selectedTrip?['days'] as List<dynamic>? ?? [];
    final nextDayNumber = days.length + 1;

    final dateController = TextEditingController();
    final descController = TextEditingController();

    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now().subtract(const Duration(days: 365)),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );

    if (picked == null || !context.mounted) return;

    dateController.text = picked.toIso8601String().split('T')[0];

    await showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Dia $nextDayNumber'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Fecha: ${dateController.text}'),
            const SizedBox(height: 12),
            TextField(
              controller: descController,
              decoration: const InputDecoration(
                labelText: 'Descripcion (opcional)',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            onPressed: () async {
              Navigator.pop(ctx);
              await ref.read(tripsProvider.notifier).loadTripDetail(
                    ref.read(tripsProvider).selectedTrip!['id'],
                  );
              // Call API directly for adding day
              final tripsService = ref.read(tripsServiceProvider);
              try {
                await tripsService.addDay(
                  ref.read(tripsProvider).selectedTrip!['id'],
                  dayNumber: nextDayNumber,
                  date: dateController.text,
                  description: descController.text.isNotEmpty
                      ? descController.text
                      : null,
                );
                if (context.mounted) {
                  await ref.read(tripsProvider.notifier).loadTripDetail(
                        ref.read(tripsProvider).selectedTrip!['id'],
                      );
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Error al agregar dia: $e')),
                  );
                }
              }
            },
            child: const Text('Agregar'),
          ),
        ],
      ),
    );
  }

  Future<void> _addItemToDay(
      BuildContext context, WidgetRef ref, String dayId) async {
    final titleController = TextEditingController();
    final descController = TextEditingController();

    String? selectedTimeSlot;

    await showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          title: const Text('Agregar actividad'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: titleController,
                  decoration: const InputDecoration(
                    labelText: 'Nombre del lugar',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: selectedTimeSlot,
                  decoration: const InputDecoration(
                    labelText: 'Horario (opcional)',
                    border: OutlineInputBorder(),
                  ),
                  items: const [
                    DropdownMenuItem(value: 'manana', child: Text('Manana')),
                    DropdownMenuItem(value: 'mediodia', child: Text('Mediodia')),
                    DropdownMenuItem(value: 'tarde', child: Text('Tarde')),
                    DropdownMenuItem(value: 'noche', child: Text('Noche')),
                  ],
                  onChanged: (value) {
                    setDialogState(() {
                      selectedTimeSlot = value;
                    });
                  },
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: descController,
                  decoration: const InputDecoration(
                    labelText: 'Descripcion (opcional)',
                    border: OutlineInputBorder(),
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancelar'),
            ),
            FilledButton(
              onPressed: () async {
                if (titleController.text.trim().isEmpty) return;
                Navigator.pop(ctx);

                final tripsService = ref.read(tripsServiceProvider);
                try {
                  await tripsService.addItem(
                    dayId,
                    title: titleController.text.trim(),
                    description: descController.text.isNotEmpty
                        ? descController.text
                        : null,
                    timeSlot: selectedTimeSlot,
                  );
                  if (context.mounted) {
                    await ref.read(tripsProvider.notifier).loadTripDetail(
                          ref.read(tripsProvider).selectedTrip!['id'],
                        );
                  }
                } catch (e) {
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Error al agregar actividad: $e')),
                    );
                  }
                }
              },
              child: const Text('Agregar'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _removeItem(
      BuildContext context, WidgetRef ref, String tripId, String itemId) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Eliminar actividad'),
        content: const Text('Estas seguro de eliminar esta actividad?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: FilledButton.styleFrom(backgroundColor: AppColors.error500),
            child: const Text('Eliminar'),
          ),
        ],
      ),
    );

    if (confirmed != true || !context.mounted) return;

    final tripsService = ref.read(tripsServiceProvider);
    try {
      await tripsService.removeItem(tripId, itemId);
      if (context.mounted) {
        await ref.read(tripsProvider.notifier).loadTripDetail(tripId);
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error al eliminar: $e')),
        );
      }
    }
  }

  Future<void> _confirmDelete(BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Eliminar viaje'),
        content: const Text(
            'Estas seguro de eliminar este viaje? Esta accion no se puede deshacer.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: FilledButton.styleFrom(backgroundColor: AppColors.error500),
            child: const Text('Eliminar'),
          ),
        ],
      ),
    );

    if (confirmed == true && context.mounted) {
      await ref.read(tripsProvider.notifier).deleteTrip(widget.tripId);
      if (context.mounted) {
        context.go('/trips');
      }
    }
  }

  void _shareTrip(Map<String, dynamic> trip) {
    final name = trip['name'] ?? 'Mi viaje';
    final destination = trip['destination'] ?? '';
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Compartir viaje: $name - $destination')),
    );
  }

  Future<void> _generateItinerary(
      BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Generar itinerario'),
        content: const Text(
            'Esto creará un itinerario automático según tus preferencias y fechas. ¿Deseas continuar?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancelar'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.primary700,
            ),
            child: const Text('Generar'),
          ),
        ],
      ),
    );

    if (confirmed != true || !context.mounted) return;

    final error = await ref
        .read(tripsProvider.notifier)
        .generateItinerary(widget.tripId);
    if (!context.mounted) return;

    if (error != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error)),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Itinerario generado correctamente'),
        ),
      );
    }
  }

  String _getBudgetLabel(String? type) {
    switch (type) {
      case 'low_cost':
        return 'Low Cost';
      case 'medium':
        return 'Medio';
      case 'luxury':
        return 'Premium';
      default:
        return type ?? '';
    }
  }

  String _formatDate(String? dateStr) {
    if (dateStr == null || dateStr.isEmpty) return '--';
    try {
      final date = DateTime.parse(dateStr);
      return '${date.day}/${date.month}/${date.year}';
    } catch (_) {
      return dateStr;
    }
  }

  String _budgetSummary(dynamic min, dynamic max) {
    if (min != null && max != null) {
      return 'Bs. $min - $max';
    } else if (min != null) {
      return 'Desde Bs. $min';
    } else if (max != null) {
      return 'Hasta Bs. $max';
    }
    return '';
  }
}
