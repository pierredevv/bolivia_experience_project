import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../config/colors.dart';
import '../../data/events_service.dart';
import '../providers/events_provider.dart';

final eventDetailProvider = FutureProvider.family<Event, String>((ref, eventId) async {
  final service = ref.read(eventsServiceProvider);
  return service.getEventById(eventId);
});

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
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.error_outline, size: 64, color: AppColors.error500),
                const SizedBox(height: 16),
                Text(
                  'Error al cargar el evento',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 8),
                Text(
                  '$e',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(height: 16),
                ElevatedButton.icon(
                  onPressed: () => ref.invalidate(eventDetailProvider(eventId)),
                  icon: const Icon(Icons.refresh),
                  label: const Text('Reintentar'),
                ),
              ],
            ),
          ),
        ),
        data: (event) => _EventDetailBody(event: event),
      ),
    );
  }
}

class _EventDetailBody extends StatelessWidget {
  final Event event;

  const _EventDetailBody({required this.event});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 280,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              title: Text(
                event.name,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  shadows: [Shadow(blurRadius: 8, color: Colors.black54)],
                ),
              ),
              background: event.photoUrl != null
                  ? CachedNetworkImage(
                      imageUrl: event.photoUrl!,
                      fit: BoxFit.cover,
                      placeholder: (_, __) => Container(color: AppColors.primary100),
                      errorWidget: (_, __, ___) => Container(
                        color: AppColors.primary100,
                        child: Center(
                          child: Icon(Icons.event, size: 80, color: AppColors.primary700),
                        ),
                      ),
                    )
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
                onPressed: () => _shareEvent(context),
              ),
            ],
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Category
                  if (event.category != null && event.category!.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Chip(
                        label: Text(event.category!),
                        backgroundColor: AppColors.secondary100,
                        labelStyle: TextStyle(color: AppColors.secondary700),
                      ),
                    ),

                  // Dates
                  if (event.dateStart != null || event.dateEnd != null)
                    _InfoCard(
                      icon: Icons.calendar_today,
                      iconColor: AppColors.primary700,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _formatDateRange(event.dateStart, event.dateEnd),
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                        ],
                      ),
                    ),

                  const SizedBox(height: 8),

                  // Location
                  if (event.location != null && event.location!.isNotEmpty)
                    _InfoCard(
                      icon: Icons.location_on,
                      iconColor: AppColors.error700,
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  event.location!,
                                  style: Theme.of(context).textTheme.titleMedium,
                                ),
                                if (event.latitude != null && event.longitude != null)
                                  Text(
                                    'Coordenadas: ${event.latitude!.toStringAsFixed(4)}, ${event.longitude!.toStringAsFixed(4)}',
                                    style: Theme.of(context).textTheme.bodySmall,
                                  ),
                              ],
                            ),
                          ),
                          if (event.latitude != null && event.longitude != null)
                            IconButton(
                              icon: const Icon(Icons.directions),
                              onPressed: () => _openDirections(
                                event.latitude!,
                                event.longitude!,
                              ),
                            ),
                        ],
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
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              if (event.latitude != null && event.longitude != null)
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _openDirections(
                      event.latitude!,
                      event.longitude!,
                    ),
                    icon: const Icon(Icons.directions),
                    label: const Text('Cómo llegar'),
                  ),
                ),
              if (event.latitude != null && event.longitude != null)
                const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => _shareEvent(context),
                  icon: const Icon(Icons.share),
                  label: const Text('Compartir'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatDateRange(String? start, String? end) {
    if (start != null && end != null) {
      return '$start — $end';
    }
    return start ?? end ?? 'Fecha por confirmar';
  }

  Future<void> _openDirections(double lat, double lng) async {
    final url = Uri.parse('https://www.google.com/maps/dir/?api=1&destination=$lat,$lng');
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    }
  }

  void _shareEvent(BuildContext context) {
    final text = '${event.name}\n';
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Compartir: $text')),
    );
  }
}

class _InfoCard extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final Widget child;

  const _InfoCard({
    required this.icon,
    required this.iconColor,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Icon(icon, color: iconColor),
            const SizedBox(width: 12),
            Expanded(child: child),
          ],
        ),
      ),
    );
  }
}
