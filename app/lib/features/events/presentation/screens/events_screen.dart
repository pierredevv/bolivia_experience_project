import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import '../../../../config/api_constants.dart';
import '../../../../config/colors.dart';
import '../../../../core/network/dio_provider.dart';
import '../providers/events_provider.dart';

class EventsScreen extends ConsumerStatefulWidget {
  const EventsScreen({super.key});

  @override
  ConsumerState<EventsScreen> createState() => _EventsScreenState();
}

class _EventsScreenState extends ConsumerState<EventsScreen> {
  bool _showTodayOnly = false;
  List<dynamic> _todayEvents = [];
  bool _loadingToday = false;

  @override
  void initState() {
    super.initState();
    _loadTodayEvents();
  }

  Future<void> _loadTodayEvents() async {
    setState(() => _loadingToday = true);
    try {
      final dio = ref.read(dioProvider);
      final response = await dio.get(ApiConstants.todayEvents);
      final data = response.data;
      setState(() {
        _todayEvents = data['data'] ?? [];
        _loadingToday = false;
      });
    } catch (_) {
      setState(() => _loadingToday = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final eventsState = ref.watch(eventsProvider);
    final displayEvents = _showTodayOnly ? _todayEvents : eventsState.events;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Eventos'),
      ),
      body: Column(
        children: [
          // Filter chips
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                FilterChip(
                  label: const Text('Todos'),
                  selected: !_showTodayOnly,
                  onSelected: (selected) => setState(() => _showTodayOnly = false),
                  selectedColor: AppColors.primary100,
                  checkmarkColor: AppColors.primary700,
                ),
                const SizedBox(width: 8),
                FilterChip(
                  label: const Text('Hoy'),
                  selected: _showTodayOnly,
                  onSelected: (selected) => setState(() => _showTodayOnly = true),
                  selectedColor: AppColors.primary100,
                  checkmarkColor: AppColors.primary700,
                  avatar: const Icon(Icons.today, size: 16),
                ),
              ],
            ),
          ),
          // Events list
          Expanded(
            child: _buildBody(displayEvents),
          ),
        ],
      ),
    );
  }

  Widget _buildBody(List<dynamic> events) {
    if (_loadingToday || events.isEmpty && ref.watch(eventsProvider).status == EventsStatus.loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (events.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.event_outlined, size: 64, color: AppColors.neutral400),
              const SizedBox(height: 16),
              Text(
                _showTodayOnly ? 'No hay eventos hoy' : 'No hay eventos disponibles',
                style: Theme.of(context).textTheme.titleLarge,
              ),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () async {
        ref.read(eventsProvider.notifier).loadEvents();
        await _loadTodayEvents();
      },
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: events.length,
        itemBuilder: (context, index) {
          final event = events[index];
          return _EventCard(
            event: event,
            onTap: () => context.go('/events/${event.id}'),
          );
        },
      ),
    );
  }
}

class _EventCard extends StatelessWidget {
  final dynamic event;
  final VoidCallback? onTap;

  const _EventCard({required this.event, this.onTap});

  @override
  Widget build(BuildContext context) {
    final photoUrl = event.photoUrl;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: AppColors.primary100,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: photoUrl != null
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.network(
                          photoUrl,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                            return Center(
                              child: Icon(Icons.event, color: AppColors.primary700, size: 32),
                            );
                          },
                        ),
                      )
                    : Center(
                        child: Icon(Icons.event, color: AppColors.primary700, size: 32),
                      ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      event.name,
                      style: Theme.of(context).textTheme.titleMedium,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    if (event.location != null)
                      Text(
                        event.location!,
                        style: Theme.of(context).textTheme.bodySmall,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(Icons.access_time, size: 14, color: AppColors.neutral500),
                        const SizedBox(width: 4),
                        Text(
                          event.dateStart ?? '',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}