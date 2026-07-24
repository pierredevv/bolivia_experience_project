import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../config/colors.dart';
import '../providers/trips_provider.dart';

class TripsListScreen extends ConsumerStatefulWidget {
  const TripsListScreen({super.key});

  @override
  ConsumerState<TripsListScreen> createState() => _TripsListScreenState();
}

class _TripsListScreenState extends ConsumerState<TripsListScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(tripsProvider.notifier).loadTrips();
    });
  }

  @override
  Widget build(BuildContext context) {
    final tripsState = ref.watch(tripsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mis Viajes'),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.go('/trips/create'),
        backgroundColor: AppColors.primary700,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('Crear viaje'),
      ),
      body: _buildBody(context, ref, tripsState),
    );
  }

  Widget _buildBody(BuildContext context, WidgetRef ref, TripsState state) {
    if (state.status == TripsStatus.loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (state.status == TripsStatus.error) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: AppColors.error500),
              const SizedBox(height: 16),
              Text(
                state.errorMessage ?? 'Error al cargar viajes',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: () => ref.read(tripsProvider.notifier).loadTrips(),
                icon: const Icon(Icons.refresh),
                label: const Text('Reintentar'),
              ),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () => ref.read(tripsProvider.notifier).loadTrips(),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (state.trips.isNotEmpty) ...[
              const SizedBox(height: 8),
              ...state.trips.map((trip) => _TripCard(
                    trip: trip,
                    onTap: () => context.push('/trips/${trip['id']}'),
                  )),
              const SizedBox(height: 24),
            ] else ...[
              const SizedBox(height: 80),
              Center(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        Icons.map_outlined,
                        size: 80,
                        color: AppColors.neutral300,
                      ),
                      const SizedBox(height: 24),
                      Text(
                        'Planifica tu primer viaje por Bolivia',
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              color: AppColors.neutral700,
                            ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Crea itinerarios personalizados segun tu presupuesto',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: AppColors.neutral500,
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton.icon(
                        onPressed: () => context.go('/trips/create'),
                        icon: const Icon(Icons.add),
                        label: const Text('Crear mi primer viaje'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary700,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(
                            horizontal: 24,
                            vertical: 12,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
            _buildUpcomingDestinations(context),
            const SizedBox(height: 100),
          ],
        ),
      ),
    );
  }

  Widget _buildUpcomingDestinations(BuildContext context) {
    final upcoming = [
      {'name': 'Uyuni', 'icon': Icons.water},
      {'name': 'La Paz', 'icon': Icons.terrain},
      {'name': 'Sucre', 'icon': Icons.museum},
      {'name': 'Samaipata', 'icon': Icons.forest},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Text(
            'Proximos destinos',
            style: Theme.of(context).textTheme.titleLarge,
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 120,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: upcoming.length,
            itemBuilder: (context, index) {
              final dest = upcoming[index];
              return Container(
                width: 160,
                margin: const EdgeInsets.only(right: 12),
                decoration: BoxDecoration(
                  color: AppColors.neutral100,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.neutral200),
                ),
                child: Stack(
                  children: [
                    Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            dest['icon'] as IconData,
                            size: 32,
                            color: AppColors.neutral300,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            dest['name'] as String,
                            style: const TextStyle(
                              fontWeight: FontWeight.w600,
                              color: AppColors.neutral500,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.neutral300,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Text(
                          'Proximamente',
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

class _TripCard extends StatelessWidget {
  final Map<String, dynamic> trip;
  final VoidCallback? onTap;

  const _TripCard({required this.trip, this.onTap});

  @override
  Widget build(BuildContext context) {
    final name = trip['name'] as String? ?? '';
    final destination = trip['destination'] as String? ?? '';
    final budgetType = trip['budgetType'] as String?;
    final startDate = trip['startDate'] as String?;
    final endDate = trip['endDate'] as String?;
    final days = (trip['days'] as List<dynamic>?) ?? [];

    final budgetColor = _getBudgetColor(budgetType);
    final budgetLabel = _getBudgetLabel(budgetType);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: Card(
        margin: EdgeInsets.zero,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        name,
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                    ),
                    if (budgetType != null)
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: budgetColor.withAlpha(30),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          budgetLabel,
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: budgetColor,
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 8),
                if (destination.isNotEmpty)
                  Row(
                    children: [
                      const Icon(Icons.place, size: 14, color: AppColors.neutral400),
                      const SizedBox(width: 4),
                      Text(
                        destination,
                        style: const TextStyle(
                          fontSize: 13,
                          color: AppColors.neutral600,
                        ),
                      ),
                    ],
                  ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    const Icon(Icons.calendar_today, size: 14, color: AppColors.neutral400),
                    const SizedBox(width: 4),
                    Text(
                      '${_formatDate(startDate)} - ${_formatDate(endDate)}',
                      style: const TextStyle(
                        fontSize: 13,
                        color: AppColors.neutral600,
                      ),
                    ),
                    const Spacer(),
                    const Icon(Icons.today, size: 14, color: AppColors.neutral400),
                    const SizedBox(width: 4),
                    Text(
                      '${days.length} dias',
                      style: const TextStyle(
                        fontSize: 13,
                        color: AppColors.neutral600,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Color _getBudgetColor(String? type) {
    switch (type) {
      case 'low_cost':
        return Colors.green;
      case 'medium':
        return Colors.blue;
      case 'luxury':
        return const Color(0xFFD4AF37);
      default:
        return AppColors.neutral500;
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
}
