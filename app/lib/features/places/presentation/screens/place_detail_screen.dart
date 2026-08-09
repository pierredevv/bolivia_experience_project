import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../config/colors.dart';
import '../../../../core/network/dio_provider.dart';
import '../../../trips/data/trips_service.dart';
import '../providers/place_detail_provider.dart';

class PlaceDetailScreen extends ConsumerWidget {
  final String placeId;

  const PlaceDetailScreen({super.key, required this.placeId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final placeDetailState = ref.watch(placeDetailProvider(placeId));

    return Scaffold(
      body: _buildBody(context, ref, placeDetailState),
    );
  }

  Widget _buildBody(BuildContext context, WidgetRef ref, PlaceDetailState state) {
    if (state.status == PlaceDetailStatus.loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (state.status == PlaceDetailStatus.error) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: AppColors.error500),
              const SizedBox(height: 16),
              Text(
                state.errorMessage ?? 'Error al cargar detalles',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: () => ref.read(placeDetailProvider(placeId).notifier).loadPlaceDetail(),
                icon: const Icon(Icons.refresh),
                label: const Text('Reintentar'),
              ),
            ],
          ),
        ),
      );
    }

    final place = state.place;
    if (place == null) {
      return const Center(child: Text('No se encontró el lugar'));
    }

    final photos = state.photos;
    final reviews = state.reviews;
    final averageRating = place.ratingAvg ?? 0;
    final ratingCount = place.ratingCount ?? 0;
    final category = place.category ?? {};

    return CustomScrollView(
      slivers: [
        SliverAppBar(
          expandedHeight: 300,
          pinned: true,
          flexibleSpace: FlexibleSpaceBar(
            background: photos.isNotEmpty
                ? PageView.builder(
                    itemCount: photos.length,
                    itemBuilder: (context, index) {
                      final photo = photos[index];
                      return Image.network(
                        photo['url'] ?? '',
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return Container(
                            color: AppColors.neutral200,
                            child: const Center(
                              child: Icon(Icons.image, size: 80, color: AppColors.neutral400),
                            ),
                          );
                        },
                      );
                    },
                  )
                : Container(
                    color: AppColors.neutral200,
                    child: const Center(
                      child: Icon(Icons.image, size: 80, color: AppColors.neutral400),
                    ),
                  ),
          ),
          actions: [
            IconButton(
              icon: Icon(
                state.isFavorite ? Icons.favorite : Icons.favorite_outline,
                color: state.isFavorite ? AppColors.error500 : null,
              ),
              onPressed: () {
                ref.read(placeDetailProvider(placeId).notifier).toggleFavorite();
              },
            ),
            IconButton(
              icon: const Icon(Icons.share),
              onPressed: () {
                Share.share(
                  '¡Mira este lugar en BoliviaExperience! 🇧🇴\n\n${place.name}\nhttps://boliviaexperience.app/places/$placeId',
                  subject: place.name,
                );
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
                Text(
                  place.name,
                  style: Theme.of(context).textTheme.headlineLarge,
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    if (category.isNotEmpty)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.primary100,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          category['name'] ?? '',
                          style: const TextStyle(color: AppColors.primary700, fontSize: 12),
                        ),
                      ),
                    const SizedBox(width: 8),
                    const Icon(Icons.star, size: 16, color: AppColors.secondary500),
                    const SizedBox(width: 4),
                    Text('${averageRating is double ? averageRating.toStringAsFixed(1) : averageRating} ($ratingCount reseñas)'),
                  ],
                ),

                const SizedBox(height: 16),

                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    _ActionButton(
                      icon: Icons.directions,
                      label: 'Cómo llegar',
                      color: AppColors.primary700,
                      onTap: () async {
                        final lat = place.latitude;
                        final lng = place.longitude;
                        if (lat != null && lng != null) {
                          final url = 'https://www.google.com/maps/search/?api=1&query=$lat,$lng';
                          if (await canLaunchUrl(Uri.parse(url))) {
                            await launchUrl(Uri.parse(url));
                          }
                        }
                      },
                    ),
                    _ActionButton(
                      icon: Icons.phone,
                      label: 'Llamar',
                      color: AppColors.success700,
                      onTap: () async {
                        if (place.phone != null) {
                          final url = 'tel:${place.phone}';
                          if (await canLaunchUrl(Uri.parse(url))) {
                            await launchUrl(Uri.parse(url));
                          }
                        }
                      },
                    ),
                    _ActionButton(
                      icon: Icons.share,
                      label: 'Compartir',
                      color: AppColors.secondary700,
                      onTap: () {
                        Share.share(
                          '¡Mira este lugar en BoliviaExperience! 🇧🇴\n\n${place.name}\nhttps://boliviaexperience.app/places/$placeId',
                          subject: place.name,
                        );
                      },
                    ),
                    _ActionButton(
                      icon: Icons.map_outlined,
                      label: 'Agregar a viaje',
                      color: AppColors.primary500,
                      onTap: () => _showAddToTripSheet(context, ref, place),
                    ),
                  ],
                ),

                const SizedBox(height: 24),

                if (place.canReserve) ...[
                  SizedBox(
                    width: double.infinity,
                    height: 54,
                    child: FilledButton.icon(
                      onPressed: () => context.push('/places/$placeId/reserve', extra: {
                        'placeName': place.name,
                        'priceLevel': place.priceLevel,
                        'products': place.products,
                      }),
                      icon: const Icon(Icons.event_available_outlined, size: 20),
                      label: const Text(
                        'Reservar con pago QR',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                      ),
                      style: FilledButton.styleFrom(
                        backgroundColor: AppColors.brandDark,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                ],

                if (place.description != null) ...[
                  Text(
                    'Descripción',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    place.description!,
                    style: Theme.of(context).textTheme.bodyLarge,
                  ),
                  const SizedBox(height: 24),
                ],

                Text(
                  'Contacto',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 8),
                if (place.address != null)
                  _ContactRow(icon: Icons.location_on, text: place.address!),
                if (place.phone != null)
                  _ContactRow(icon: Icons.phone, text: place.phone!),
                if (place.website != null)
                  _ContactRow(icon: Icons.language, text: place.website!),

                const SizedBox(height: 24),

                if (place.latitude != null && place.longitude != null) ...[
                  Text(
                    'Ubicación',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 8),
                  Container(
                    height: 200,
                    decoration: BoxDecoration(
                      color: AppColors.neutral200,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Center(
                      child: Icon(Icons.map, size: 50, color: AppColors.neutral400),
                    ),
                  ),
                  const SizedBox(height: 24),
                ],

                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Reseñas',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    TextButton(
                      onPressed: () => context.push('/places/$placeId/review', extra: place.name),
                      child: const Text('Escribir reseña'),
                    ),
                  ],
                ),
                const SizedBox(height: 8),

                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        Column(
                          children: [
                            Text(
                              '${averageRating is double ? averageRating.toStringAsFixed(1) : averageRating}',
                              style: Theme.of(context).textTheme.displayLarge?.copyWith(
                                color: AppColors.primary700,
                              ),
                            ),
                            Row(
                              children: List.generate(5, (index) {
                                final rating = double.tryParse(averageRating.toString()) ?? 0;
                                final roundedRating = rating.round();
                                IconData icon;
                                if (index < roundedRating) {
                                  icon = Icons.star;
                                } else if (index < rating.ceil() && index >= roundedRating) {
                                  icon = Icons.star_half;
                                } else {
                                  icon = Icons.star_outline;
                                }
                                return Icon(
                                  icon,
                                  color: AppColors.secondary500,
                                  size: 20,
                                );
                              }),
                            ),
                            Text('$ratingCount reseñas'),
                          ],
                        ),
                        const SizedBox(width: 24),
                        Expanded(
                          child: Column(
                            children: List.generate(5, (index) {
                              final starValue = 5 - index;
                              final count = reviews.where((r) => (r['rating'] ?? 0) == starValue).length;
                              final total = reviews.length;
                              final value = total > 0 ? count / total : 0.0;
                              return _RatingBar(label: '$starValue', value: value);
                            }),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                ...reviews.map((review) {
                  return _ReviewCard(
                    userName: review['user']?['name'] ?? 'Usuario',
                    rating: review['rating'] ?? 0,
                    comment: review['comment'] ?? '',
                    date: review['createdAt'] ?? '',
                  );
                }),

                const SizedBox(height: 80),
              ],
            ),
          ),
        ),
      ],
    );
  }

  void _showAddToTripSheet(BuildContext context, WidgetRef ref, dynamic place) {
    final dio = ref.read(dioProvider);
    final tripsService = TripsService(dio);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (ctx) => _AddToTripSheet(
        tripsService: tripsService,
        placeId: placeId,
        placeName: place.name ?? '',
      ),
    );
  }

}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _ActionButton({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color),
          ),
          const SizedBox(height: 4),
          Text(label, style: Theme.of(context).textTheme.bodySmall),
        ],
      ),
    );
  }
}

class _ContactRow extends StatelessWidget {
  final IconData icon;
  final String text;

  const _ContactRow({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppColors.neutral500),
          const SizedBox(width: 12),
          Expanded(child: Text(text)),
        ],
      ),
    );
  }
}

class _RatingBar extends StatelessWidget {
  final String label;
  final double value;

  const _RatingBar({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        children: [
          Text(label, style: const TextStyle(fontSize: 12)),
          const SizedBox(width: 8),
          Expanded(
            child: LinearProgressIndicator(
              value: value,
              backgroundColor: AppColors.neutral200,
              valueColor: const AlwaysStoppedAnimation(AppColors.secondary500),
            ),
          ),
        ],
      ),
    );
  }
}

class _ReviewCard extends StatelessWidget {
  final String userName;
  final int rating;
  final String comment;
  final String date;

  const _ReviewCard({
    required this.userName,
    required this.rating,
    required this.comment,
    required this.date,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 16,
                  backgroundColor: AppColors.primary100,
                  child: Text(userName.isNotEmpty ? userName[0] : 'U'),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(userName, style: Theme.of(context).textTheme.titleSmall),
                      Text(date, style: Theme.of(context).textTheme.bodySmall),
                    ],
                  ),
                ),
                Row(
                  children: List.generate(5, (index) {
                    return Icon(
                      index < rating ? Icons.star : Icons.star_outline,
                      color: AppColors.secondary500,
                      size: 16,
                    );
                  }),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(comment),
          ],
        ),
      ),
    );
  }
}

class _AddToTripSheet extends StatefulWidget {
  final TripsService tripsService;
  final String placeId;
  final String placeName;

  const _AddToTripSheet({
    required this.tripsService,
    required this.placeId,
    required this.placeName,
  });

  @override
  State<_AddToTripSheet> createState() => _AddToTripSheetState();
}

class _AddToTripSheetState extends State<_AddToTripSheet> {
  List<dynamic> _trips = [];
  bool _isLoading = true;
  String? _selectedTripId;
  List<dynamic> _days = [];
  String? _selectedDayId;
  String? _selectedTimeSlot;
  bool _isAdding = false;

  @override
  void initState() {
    super.initState();
    _loadTrips();
  }

  Future<void> _loadTrips() async {
    try {
      final trips = await widget.tripsService.getTrips();
      setState(() {
        _trips = trips;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  void _onTripSelected(String tripId) {
    final trip = _trips.firstWhere((t) => t['id'] == tripId, orElse: () => null);
    setState(() {
      _selectedTripId = tripId;
      _days = (trip?['days'] as List<dynamic>?) ?? [];
      _selectedDayId = null;
    });
  }

  Future<void> _addItem() async {
    if (_selectedDayId == null) return;
    setState(() => _isAdding = true);
    try {
      await widget.tripsService.addItem(
        _selectedDayId!,
        title: widget.placeName,
        placeId: widget.placeId,
        timeSlot: _selectedTimeSlot,
      );
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('${widget.placeName} agregado al viaje')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error al agregar: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isAdding = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.6,
      minChildSize: 0.3,
      maxChildSize: 0.9,
      expand: false,
      builder: (ctx, scrollController) {
        return Padding(
          padding: const EdgeInsets.all(16),
          child: ListView(
            controller: scrollController,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.neutral300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Agregar a mi viaje',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 4),
              Text(
                widget.placeName,
                style: const TextStyle(color: AppColors.neutral500),
              ),
              const SizedBox(height: 20),

              if (_isLoading)
                const Center(child: CircularProgressIndicator())
              else if (_trips.isEmpty) ...[
                const Icon(Icons.map_outlined, size: 48, color: AppColors.neutral300),
                const SizedBox(height: 12),
                const Text(
                  'No tenés viajes creados',
                  style: TextStyle(color: AppColors.neutral500),
                ),
                const SizedBox(height: 12),
                ElevatedButton.icon(
                  onPressed: () {
                    Navigator.pop(context);
                    context.push('/trips/create');
                  },
                  icon: const Icon(Icons.add),
                  label: const Text('Crear viaje'),
                ),
              ] else ...[
                const Text(
                  'Seleccioná un viaje',
                  style: TextStyle(fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 8),
                ..._trips.map((trip) {
                  final isSelected = trip['id'] == _selectedTripId;
                  final budgetType = trip['budgetType'] as String?;
                  final budgetLabel = budgetType == 'low_cost'
                      ? 'Low Cost'
                      : budgetType == 'luxury'
                          ? 'Premium'
                          : budgetType == 'medium'
                              ? 'Medio'
                              : '';
                  return Card(
                    color: isSelected ? AppColors.primary50 : null,
                    child: ListTile(
                      title: Text(trip['name'] ?? ''),
                      subtitle: Text(
                        '${trip['destination'] ?? ''} $budgetLabel',
                        style: const TextStyle(fontSize: 12),
                      ),
                      trailing: isSelected
                          ? const Icon(Icons.check_circle, color: AppColors.primary700)
                          : const Icon(Icons.chevron_right),
                      onTap: () => _onTripSelected(trip['id']),
                    ),
                  );
                }),
              ],

              if (_selectedTripId != null && _days.isNotEmpty) ...[
                const SizedBox(height: 20),
                const Text(
                  'Seleccioná el día',
                  style: TextStyle(fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: _days.map((day) {
                    final isSelected = day['id'] == _selectedDayId;
                    return ChoiceChip(
                      label: Text('Día ${day['dayNumber']}'),
                      selected: isSelected,
                      onSelected: (_) {
                        setState(() => _selectedDayId = day['id']);
                      },
                    );
                  }).toList(),
                ),
              ],

              if (_selectedDayId != null) ...[
                const SizedBox(height: 20),
                const Text(
                  'Horario (opcional)',
                  style: TextStyle(fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  initialValue: _selectedTimeSlot,
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                    hintText: 'Seleccionar horario',
                  ),
                  items: const [
                    DropdownMenuItem(value: 'manana', child: Text('Mañana')),
                    DropdownMenuItem(value: 'mediodia', child: Text('Mediodía')),
                    DropdownMenuItem(value: 'tarde', child: Text('Tarde')),
                    DropdownMenuItem(value: 'noche', child: Text('Noche')),
                  ],
                  onChanged: (v) => setState(() => _selectedTimeSlot = v),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: _isAdding ? null : _addItem,
                    child: _isAdding
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : const Text('Agregar al viaje'),
                  ),
                ),
              ],
              const SizedBox(height: 32),
            ],
          ),
        );
      },
    );
  }
}