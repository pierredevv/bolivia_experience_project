import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:share_plus/share_plus.dart';
import '../../../../config/colors.dart';
import '../../../../core/services/deep_link_service.dart';
import '../providers/events_provider.dart';

class EventDetailScreen extends ConsumerWidget {
  final String eventId;

  const EventDetailScreen({super.key, required this.eventId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final eventAsync = ref.watch(eventDetailProvider(eventId));

    return Scaffold(
      body: eventAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 64, color: AppColors.error500),
              const SizedBox(height: 16),
              Text('Error al cargar evento', style: Theme.of(context).textTheme.bodyLarge),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: () => ref.invalidate(eventDetailProvider(eventId)),
                icon: const Icon(Icons.refresh),
                label: const Text('Reintentar'),
              ),
            ],
          ),
        ),
        data: (event) => CustomScrollView(
          slivers: [
            SliverAppBar(
              expandedHeight: 250,
              pinned: true,
              flexibleSpace: FlexibleSpaceBar(
                background: event.photoUrl != null
                    ? Image.network(event.photoUrl!, fit: BoxFit.cover)
                    : Container(
                        color: AppColors.primary100,
                        child: Center(
                          child: Icon(Icons.event, size: 80, color: AppColors.primary700),
                        ),
                      ),
              ),
              actions: [
                IconButton(
                  icon: const Icon(Icons.share),
                  onPressed: () => Share.share(
                    'Evento: ${event.name}\nhttps://boliviaexperience.app/events/${event.id}',
                    subject: event.name,
                  ),
                ),
              ],
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      event.name,
                      style: Theme.of(context).textTheme.headlineLarge,
                    ),

                    if (event.category != null) ...[
                      const SizedBox(height: 8),
                      Chip(
                        label: Text(event.category!),
                        backgroundColor: AppColors.primary100,
                      ),
                    ],

                    const SizedBox(height: 16),

                    // Date and Time
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          children: [
                            Icon(Icons.calendar_today, color: AppColors.primary700),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    _formatDateRange(event.dateStart, event.dateEnd),
                                    style: Theme.of(context).textTheme.titleMedium,
                                  ),
                                  if (event.dateStart != null)
                                    Text(
                                      DateFormat('HH:mm').format(DateTime.parse(event.dateStart!)),
                                      style: Theme.of(context).textTheme.bodyMedium,
                                    ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 8),

                    // Location
                    if (event.location != null)
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Row(
                            children: [
                              Icon(Icons.location_on, color: AppColors.error700),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      event.location!,
                                      style: Theme.of(context).textTheme.titleMedium,
                                    ),
                                    const Text('Santa Cruz de la Sierra'),
                                  ],
                                ),
                              ),
                              if (event.latitude != null && event.longitude != null)
                                IconButton(
                                  icon: const Icon(Icons.directions),
                                  onPressed: () => DeepLinkService.openDirections(
                                    latitude: event.latitude!,
                                    longitude: event.longitude!,
                                    label: event.name,
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ),

                    const SizedBox(height: 24),

                    // Description
                    if (event.description != null && event.description!.isNotEmpty) ...[
                      Text(
                        'Descripción',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        event.description!,
                        style: Theme.of(context).textTheme.bodyLarge,
                      ),
                    ],

                    const SizedBox(height: 80),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatDateRange(String? start, String? end) {
    if (start == null) return 'Fecha por definir';
    final startDate = DateTime.parse(start);
    if (end == null) return DateFormat('dd MMMM yyyy', 'es').format(startDate);
    final endDate = DateTime.parse(end);
    if (startDate.month == endDate.month) {
      return '${startDate.day} - ${endDate.day} ${DateFormat('MMMM yyyy', 'es').format(startDate)}';
    }
    return '${DateFormat('dd MMM', 'es').format(startDate)} - ${DateFormat('dd MMM yyyy', 'es').format(endDate)}';
  }
}
