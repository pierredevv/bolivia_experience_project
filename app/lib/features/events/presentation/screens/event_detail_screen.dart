import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../config/colors.dart';

class EventDetailScreen extends ConsumerWidget {
  final String eventId;

  const EventDetailScreen({super.key, required this.eventId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 250,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                color: AppColors.primary100,
                child: Center(
                  child: Icon(Icons.event, size: 80, color: AppColors.primary700),
                ),
              ),
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.share),
                onPressed: () {
                  // TODO: Share event
                },
              ),
            ],
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Event Name
                  Text(
                    'Feria Exposición de Santa Cruz',
                    style: Theme.of(context).textTheme.headlineLarge,
                  ),

                  const SizedBox(height: 16),

                  // Date and Time
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        children: [
                          Icon(Icons.calendar_today, color: AppColors.primary700),
                          const SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '15 - 28 Septiembre 2026',
                                style: Theme.of(context).textTheme.titleMedium,
                              ),
                              Text(
                                '10:00 - 22:00',
                                style: Theme.of(context).textTheme.bodyMedium,
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 8),

                  // Location
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
                                  'Fexpocruz',
                                  style: Theme.of(context).textTheme.titleMedium,
                                ),
                                Text(
                                  'Santa Cruz de la Sierra',
                                  style: Theme.of(context).textTheme.bodyMedium,
                                ),
                              ],
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.directions),
                            onPressed: () {
                              // TODO: Open directions
                            },
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Description
                  Text(
                    'Descripción',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'La feria más importante de Bolivia. Ganadería, agricultura, industria y entretenimiento. Un evento imperdible para conocer la cultura y producción del oriente boliviano.',
                    style: Theme.of(context).textTheme.bodyLarge,
                  ),

                  const SizedBox(height: 24),

                  // Category
                  Wrap(
                    spacing: 8,
                    children: [
                      Chip(
                        label: Text('Feria'),
                        backgroundColor: AppColors.secondary100,
                      ),
                      Chip(
                        label: Text('Cultural'),
                        backgroundColor: AppColors.primary100,
                      ),
                    ],
                  ),

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
          child: ElevatedButton.icon(
            onPressed: () {
              // TODO: Add to calendar
            },
            icon: const Icon(Icons.calendar_today),
            label: const Text('Agregar al Calendario'),
          ),
        ),
      ),
    );
  }
}
