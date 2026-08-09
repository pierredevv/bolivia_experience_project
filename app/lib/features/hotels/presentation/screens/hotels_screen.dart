import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../config/colors.dart';
import '../../data/hotel.dart';
import '../providers/hotels_provider.dart';
import '../widgets/hotel_card.dart';
import '../widgets/hotels_filter_bar.dart';

/// Vista "Hoteles y alojamientos en Santa Cruz para quedarse".
class HotelsScreen extends ConsumerStatefulWidget {
  const HotelsScreen({super.key});

  @override
  ConsumerState<HotelsScreen> createState() => _HotelsScreenState();
}

class _HotelsScreenState extends ConsumerState<HotelsScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(hotelsProvider.notifier).load());
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(hotelsProvider);

    return Scaffold(
      backgroundColor: AppColors.backgroundCanvas,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 16),
              child: Row(
                children: [
                  IconButton(
                    onPressed: () => context.pop(),
                    icon: const Icon(Icons.arrow_back_rounded),
                    color: AppColors.brandDark,
                    visualDensity: VisualDensity.compact,
                  ),
                  const SizedBox(width: 4),
                  const Expanded(
                    child: Text(
                      'Hoteles y alojamientos en Santa Cruz para quedarse',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: AppColors.brandDark,
                        letterSpacing: -0.3,
                        height: 1.2,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const HotelsFilterBar(),
            const SizedBox(height: 16),
            Expanded(child: _buildBody(state)),
          ],
        ),
      ),
    );
  }

  Widget _buildBody(HotelsState state) {
    switch (state.status) {
      case HotelsStatus.initial:
      case HotelsStatus.loading:
        return const Center(child: CircularProgressIndicator());
      case HotelsStatus.error:
        return _buildError(state);
      case HotelsStatus.loaded:
        return _buildLoaded(state);
    }
  }

  Widget _buildError(HotelsState state) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.cloud_off_rounded,
                size: 64, color: AppColors.neutral400),
            const SizedBox(height: 16),
            Text(
              state.errorMessage ?? 'No se pudieron cargar los hoteles.',
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 15,
                color: AppColors.neutral600,
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => ref.read(hotelsProvider.notifier).load(),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.brandDark,
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text('Reintentar'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLoaded(HotelsState state) {
    final hotels = state.hotelIds
        .map((id) => state.allHotels.firstWhere(
              (h) => h.id == id,
              orElse: () => Hotel(id: '', name: ''),
            ))
        .where((h) => h.id.isNotEmpty)
        .toList();

    if (hotels.isEmpty) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.hotel_outlined,
                  size: 64, color: AppColors.neutral400),
              SizedBox(height: 16),
              Text(
                'No hay hoteles que coincidan con tus filtros',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 15,
                  color: AppColors.neutral600,
                ),
              ),
              SizedBox(height: 4),
              Text(
                'Probá ajustando las fechas o los filtros.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 13,
                  color: AppColors.neutral400,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      color: AppColors.brandEmerald,
      onRefresh: () => ref.read(hotelsProvider.notifier).load(),
      child: ListView.builder(
        padding: const EdgeInsets.only(top: 4, bottom: 24),
        itemCount: hotels.length,
        itemBuilder: (context, index) {
          final hotel = hotels[index];
          return HotelCard(
            hotel: hotel,
            onTap: () => context.push('/places/${hotel.id}'),
          );
        },
      ),
    );
  }
}
