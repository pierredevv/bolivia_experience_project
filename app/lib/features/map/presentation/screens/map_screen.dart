import 'dart:async';
import 'dart:typed_data';
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../../../config/colors.dart';
import '../../data/map_service.dart';
import '../providers/map_provider.dart';
import '../widgets/map_filter_sheet.dart';
import '../widgets/place_preview_sheet.dart';

// ── Brand tokens ──────────────────────────────────────────────────────────────
const _brandDark = Color(0xFF0F172A);
const _brandEmerald = Color(0xFF10B981);
const _borderSubtle = Color(0xFFE2E8F0);
const _textSecondary = Color(0xFF64748B);

// Quick-filter category definitions (label + optional slug for filtering)
const _quickFilters = [
  _QuickFilter(label: 'Todos', slug: null),
  _QuickFilter(label: 'Restaurantes', slug: 'restaurantes'),
  _QuickFilter(label: 'Hoteles', slug: 'hoteles'),
  _QuickFilter(label: 'Cultura', slug: 'museos'),
  _QuickFilter(label: 'Parques', slug: 'parques'),
];

class _QuickFilter {
  final String label;
  final String? slug;
  const _QuickFilter({required this.label, required this.slug});
}

class MapScreen extends ConsumerStatefulWidget {
  const MapScreen({super.key});

  @override
  ConsumerState<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends ConsumerState<MapScreen> {
  // ── Map controller & bounds ──────────────────────────────────────────────
  final Completer<GoogleMapController> _mapController = Completer();
  LatLngBounds? _lastBounds;

  // Active quick-filter index (0 = Todos)
  int _activeFilterIndex = 0;

  // Custom generated TripAdvisor/Google Maps style markers
  Set<Marker> _customMarkers = {};
  List<MapPlace>? _lastProcessedPlaces;
  bool _showSearchThisArea = false;

  // Event markers layer (fecha/hora)
  Set<Marker> _eventMarkers = {};
  List<MapEvent>? _lastProcessedEvents;

  // Santa Cruz de la Sierra center
  static const CameraPosition _santaCruz = CameraPosition(
    target: LatLng(-17.7833, -63.1821),
    zoom: 13,
  );

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadMarkersForCurrentView();
      ref.read(mapProvider.notifier).loadUserLocation();
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final mapState = ref.read(mapProvider);
    if (mapState.lastTappedMarkerId != null) {
      _showPlacePreview(mapState.lastTappedMarkerId!);
      ref.read(mapProvider.notifier).clearLastTappedMarker();
    }
  }

  // ── Reactive Custom Marker Generation ─────────────────────────────────────
  void _updateCustomMarkersIfNeeded(List<MapPlace> places) {
    if (identical(places, _lastProcessedPlaces)) return;
    _lastProcessedPlaces = places;
    _generateCustomMarkers(places);
  }

  void _updateEventMarkersIfNeeded(List<MapEvent> events) {
    if (identical(events, _lastProcessedEvents)) return;
    _lastProcessedEvents = events;
    _generateEventMarkers(events);
  }

  Future<void> _generateEventMarkers(List<MapEvent> events) async {
    final Set<Marker> newMarkers = {};
    for (final event in events) {
      try {
        final bitmap = await _createEventMarkerBitmap(event);
        if (!mounted) return;
        newMarkers.add(
          Marker(
            markerId: MarkerId('event-${event.id}'),
            position: LatLng(event.latitude, event.longitude),
            icon: bitmap,
            anchor: const Offset(0.5, 0.36),
            infoWindow: InfoWindow(
              title: event.name,
              snippet: _eventDateLabel(event),
              onTap: () => _showEventPreview(event),
            ),
          ),
        );
      } catch (_) {
        if (!mounted) return;
        newMarkers.add(
          Marker(
            markerId: MarkerId('event-${event.id}'),
            position: LatLng(event.latitude, event.longitude),
            icon: BitmapDescriptor.defaultMarkerWithHue(
              BitmapDescriptor.hueRose,
            ),
            infoWindow: InfoWindow(
              title: event.name,
              snippet: _eventDateLabel(event),
            ),
          ),
        );
      }
    }
    if (mounted) {
      setState(() => _eventMarkers = newMarkers);
    }
  }

  Future<void> _generateCustomMarkers(List<MapPlace> places) async {
    final Set<Marker> newMarkers = {};
    for (final place in places) {
      try {
        final bitmap = await _createCustomMarkerBitmap(place);
        if (!mounted) return;
        newMarkers.add(
          Marker(
            markerId: MarkerId(place.id),
            position: LatLng(place.latitude, place.longitude),
            icon: bitmap,
            anchor: const Offset(0.5, 0.36), // Center of circle pin anchor
            onTap: () => _showPlacePreview(place.id),
          ),
        );
      } catch (_) {
        // Fallback to default marker if bitmap drawing fails for any reason
        if (!mounted) return;
        newMarkers.add(
          Marker(
            markerId: MarkerId(place.id),
            position: LatLng(place.latitude, place.longitude),
            icon: BitmapDescriptor.defaultMarkerWithHue(
              place.isUrban
                  ? BitmapDescriptor.hueAzure
                  : BitmapDescriptor.hueGreen,
            ),
            onTap: () => _showPlacePreview(place.id),
          ),
        );
      }
    }
    if (mounted) {
      setState(() {
        _customMarkers = newMarkers;
      });
    }
  }

  // ── Canvas-based Custom Marker Bitmap Generator (TripAdvisor/Google Maps Style)
  Future<BitmapDescriptor> _createCustomMarkerBitmap(MapPlace place) async {
    const double canvasWidth = 200.0;
    const double canvasHeight = 110.0;
    final ui.PictureRecorder recorder = ui.PictureRecorder();
    final Canvas canvas = Canvas(recorder);

    // Center of circle pin
    const Offset circleCenter = Offset(100.0, 38.0);
    const double radius = 22.0;

    // 1. Shadow under white circle
    final Paint shadowPaint = Paint()
      ..color = Colors.black.withValues(alpha: 0.18)
      ..maskFilter = const ui.MaskFilter.blur(ui.BlurStyle.normal, 5.0);
    canvas.drawCircle(circleCenter.translate(0, 3), radius, shadowPaint);

    // 2. White circle container
    final Paint circlePaint = Paint()..color = Colors.white;
    canvas.drawCircle(circleCenter, radius, circlePaint);

    // Subtle border
    final Paint borderPaint = Paint()
      ..color = const Color(0xFFE2E8F0)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;
    canvas.drawCircle(circleCenter, radius, borderPaint);

    // 3. Category icon inside circle
    final String? slug = place.categorySlug;
    final IconData iconData = (slug != null && slug.isNotEmpty)
        ? _getCategoryIconData(slug)
        : _getCategoryIconFromString(place.category?['icon'] as String?);
    final TextPainter iconPainter = TextPainter(
      text: TextSpan(
        text: String.fromCharCode(iconData.codePoint),
        style: TextStyle(
          fontSize: 22.0,
          fontFamily: iconData.fontFamily,
          package: iconData.fontPackage,
          color: _brandDark,
        ),
      ),
      textDirection: TextDirection.ltr,
    );
    iconPainter.layout();
    iconPainter.paint(
      canvas,
      Offset(
        circleCenter.dx - iconPainter.width / 2,
        circleCenter.dy - iconPainter.height / 2,
      ),
    );

    // 4. Floating Emerald Rating Badge
    if (place.ratingAvg != null && _parseDouble(place.ratingAvg) > 0) {
      final double ratingVal = _parseDouble(place.ratingAvg);
      final String ratingText = ratingVal.toStringAsFixed(1);
      final TextPainter badgeTextPainter = TextPainter(
        text: TextSpan(
          text: ratingText,
          style: const TextStyle(
            fontSize: 11.0,
            fontWeight: FontWeight.w800,
            color: Colors.white,
          ),
        ),
        textDirection: TextDirection.ltr,
      );
      badgeTextPainter.layout();

      final double badgeWidth = badgeTextPainter.width + 10.0;
      const double badgeHeight = 18.0;
      // Attached to top-right of circle pin
      const Offset badgeCenter = Offset(118.0, 20.0);
      final Rect badgeRect = Rect.fromCenter(
        center: badgeCenter,
        width: badgeWidth,
        height: badgeHeight,
      );
      final RRect badgeRRect = RRect.fromRectAndRadius(
        badgeRect,
        const Radius.circular(9.0),
      );

      // Badge shadow
      final Paint badgeShadow = Paint()
        ..color = Colors.black.withValues(alpha: 0.20)
        ..maskFilter = const ui.MaskFilter.blur(ui.BlurStyle.normal, 3.0);
      canvas.drawRRect(badgeRRect.shift(const Offset(0, 2)), badgeShadow);

      // Badge background
      final Paint badgeFill = Paint()..color = _brandEmerald;
      canvas.drawRRect(badgeRRect, badgeFill);

      // Badge border
      final Paint badgeBorder = Paint()
        ..color = Colors.white
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.5;
      canvas.drawRRect(badgeRRect, badgeBorder);

      badgeTextPainter.paint(
        canvas,
        Offset(
          badgeCenter.dx - badgeTextPainter.width / 2,
          badgeCenter.dy - badgeTextPainter.height / 2,
        ),
      );
    }

    // 5. Place Name Text Label below circle
    final TextPainter namePainter = TextPainter(
      text: TextSpan(
        text: place.name,
        style: const TextStyle(
          fontSize: 12.0,
          fontWeight: FontWeight.w700,
          color: _brandDark,
        ),
      ),
      maxLines: 1,
      ellipsis: '...',
      textDirection: TextDirection.ltr,
    );
    namePainter.layout(maxWidth: 160.0);

    final double labelWidth = namePainter.width + 16.0;
    const double labelHeight = 22.0;
    const Offset labelCenter = Offset(100.0, 76.0);
    final Rect labelRect = Rect.fromCenter(
      center: labelCenter,
      width: labelWidth,
      height: labelHeight,
    );
    final RRect labelRRect = RRect.fromRectAndRadius(
      labelRect,
      const Radius.circular(11.0),
    );

    // Label shadow
    final Paint labelShadow = Paint()
      ..color = Colors.black.withValues(alpha: 0.14)
      ..maskFilter = const ui.MaskFilter.blur(ui.BlurStyle.normal, 4.0);
    canvas.drawRRect(labelRRect.shift(const Offset(0, 2)), labelShadow);

    // Label white background
    final Paint labelFill = Paint()..color = Colors.white;
    canvas.drawRRect(labelRRect, labelFill);

    // Label thin border
    final Paint labelBorder = Paint()
      ..color = const Color(0xFFE2E8F0)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;
    canvas.drawRRect(labelRRect, labelBorder);

    namePainter.paint(
      canvas,
      Offset(
        labelCenter.dx - namePainter.width / 2,
        labelCenter.dy - namePainter.height / 2,
      ),
    );

    final ui.Image image = await recorder.endRecording().toImage(
      canvasWidth.toInt(),
      canvasHeight.toInt(),
    );
    final ByteData? byteData = await image.toByteData(
      format: ui.ImageByteFormat.png,
    );
    final Uint8List bytes = byteData!.buffer.asUint8List();

    return BitmapDescriptor.bytes(bytes);
  }

  double _parseDouble(dynamic val) {
    if (val == null) return 0.0;
    if (val is double) return val;
    if (val is int) return val.toDouble();
    return double.tryParse(val.toString()) ?? 0.0;
  }

  IconData _getCategoryIconData(String? slug) {
    switch (slug) {
      case 'restaurantes':
        return Icons.restaurant_rounded;
      case 'hoteles':
        return Icons.hotel_rounded;
      case 'cafeterias':
        return Icons.local_cafe_rounded;
      case 'atracciones':
        return Icons.landscape_rounded;
      case 'parques':
        return Icons.park_rounded;
      case 'centros-comerciales':
        return Icons.shopping_bag_rounded;
      case 'bares':
        return Icons.nightlife_rounded;
      case 'museos':
        return Icons.museum_rounded;
      case 'deportes':
        return Icons.sports_soccer_rounded;
      case 'gastronomia':
        return Icons.restaurant_menu_rounded;
      default:
        return Icons.place_rounded;
    }
  }

  // Mapea el string de ícono enviado por el backend (campo category_icon)
  // como fallback cuando el slug no está disponible.
  IconData _getCategoryIconFromString(String? icon) {
    switch (icon) {
      case 'restaurant':
        return Icons.restaurant_rounded;
      case 'hotel':
        return Icons.hotel_rounded;
      case 'nightlife':
        return Icons.nightlife_rounded;
      case 'coffee':
        return Icons.local_cafe_rounded;
      case 'landscape':
        return Icons.landscape_rounded;
      case 'park':
        return Icons.park_rounded;
      case 'museum':
        return Icons.museum_rounded;
      case 'shopping_bag':
        return Icons.shopping_bag_rounded;
      case 'sports_soccer':
        return Icons.sports_soccer_rounded;
      case 'restaurant_menu':
        return Icons.restaurant_menu_rounded;
      default:
        return Icons.place_rounded;
    }
  }

  // ── Event marker bitmap (calendar pin + fecha) ────────────────────────────
  Future<BitmapDescriptor> _createEventMarkerBitmap(MapEvent event) async {
    const double canvasWidth = 200.0;
    const double canvasHeight = 110.0;
    final ui.PictureRecorder recorder = ui.PictureRecorder();
    final Canvas canvas = Canvas(recorder);

    const Offset circleCenter = Offset(100.0, 38.0);
    const double radius = 22.0;
    const Color eventColor = Color(0xFFEC4899);

    final Paint shadowPaint = Paint()
      ..color = Colors.black.withValues(alpha: 0.18)
      ..maskFilter = const ui.MaskFilter.blur(ui.BlurStyle.normal, 5.0);
    canvas.drawCircle(circleCenter.translate(0, 3), radius, shadowPaint);

    final Paint fillPaint = Paint()..color = eventColor;
    canvas.drawCircle(circleCenter, radius, fillPaint);

    final Paint borderPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;
    canvas.drawCircle(circleCenter, radius, borderPaint);

    const IconData iconData = Icons.event_rounded;
    final TextPainter iconPainter = TextPainter(
      text: TextSpan(
        text: String.fromCharCode(iconData.codePoint),
        style: TextStyle(
          fontSize: 22.0,
          fontFamily: iconData.fontFamily,
          package: iconData.fontPackage,
          color: Colors.white,
        ),
      ),
      textDirection: TextDirection.ltr,
    );
    iconPainter.layout();
    iconPainter.paint(
      canvas,
      Offset(
        circleCenter.dx - iconPainter.width / 2,
        circleCenter.dy - iconPainter.height / 2,
      ),
    );

    final TextPainter labelPainter = TextPainter(
      text: TextSpan(
        text: _eventDayLabel(event),
        style: const TextStyle(
          fontSize: 12.0,
          fontWeight: FontWeight.w800,
          color: _brandDark,
        ),
      ),
      textDirection: TextDirection.ltr,
    );
    labelPainter.layout();

    final double labelWidth = labelPainter.width + 16.0;
    const double labelHeight = 22.0;
    const Offset labelCenter = Offset(100.0, 76.0);
    final Rect labelRect = Rect.fromCenter(
      center: labelCenter,
      width: labelWidth,
      height: labelHeight,
    );
    final RRect labelRRect = RRect.fromRectAndRadius(
      labelRect,
      const Radius.circular(11.0),
    );

    final Paint labelShadow = Paint()
      ..color = Colors.black.withValues(alpha: 0.14)
      ..maskFilter = const ui.MaskFilter.blur(ui.BlurStyle.normal, 4.0);
    canvas.drawRRect(labelRRect.shift(const Offset(0, 2)), labelShadow);

    final Paint labelFill = Paint()..color = Colors.white;
    canvas.drawRRect(labelRRect, labelFill);

    final Paint labelBorder = Paint()
      ..color = const Color(0xFFE2E8F0)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;
    canvas.drawRRect(labelRRect, labelBorder);

    labelPainter.paint(
      canvas,
      Offset(
        labelCenter.dx - labelPainter.width / 2,
        labelCenter.dy - labelPainter.height / 2,
      ),
    );

    final ui.Image image = await recorder.endRecording().toImage(
      canvasWidth.toInt(),
      canvasHeight.toInt(),
    );
    final ByteData? byteData = await image.toByteData(
      format: ui.ImageByteFormat.png,
    );
    return BitmapDescriptor.bytes(byteData!.buffer.asUint8List());
  }

  String _eventDateLabel(MapEvent event) {
    final start = event.dateStart;
    final location = event.location;
    final where = location != null && location.isNotEmpty ? location : 'Evento';
    if (start == null) return where;
    final time =
        '${start.hour.toString().padLeft(2, '0')}:${start.minute.toString().padLeft(2, '0')}';
    return '$where • ${_eventDayLabel(event)} • $time';
  }

  String _eventDayLabel(MapEvent event) {
    final start = event.dateStart;
    if (start == null) return 'Evento';
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final date = DateTime(start.year, start.month, start.day);
    if (date == today) return 'HOY';
    const months = [
      'ene', 'feb', 'mar', 'abr', 'may', 'jun',
      'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
    ];
    return '${start.day} ${months[start.month - 1]}';
  }

  void _showEventPreview(MapEvent event) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _EventPreviewSheet(event: event, dateLabel: _eventDateLabel(event)),
    );
  }

  // ── Map actions ───────────────────────────────────────────────────────────
  void _loadMarkersForCurrentView() async {
    if (_lastBounds == null) return;
    final notifier = ref.read(mapProvider.notifier);
    await notifier.loadMarkers(_lastBounds!);
  }

  void _onCameraIdle() async {
    final controller = await _mapController.future;
    final bounds = await controller.getVisibleRegion();
    if (mounted) {
      setState(() => _lastBounds = bounds);
      final notifier = ref.read(mapProvider.notifier);
      await notifier.loadMarkers(bounds);
    }
  }

  void _searchInThisArea() async {
    setState(() => _showSearchThisArea = false);
    if (_lastBounds != null) {
      await ref.read(mapProvider.notifier).loadMarkers(_lastBounds!);
    }
  }

  void _showFilterSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const MapFilterSheet(),
    );
  }

  void _showPlacePreview(String placeId) {
    final place = ref.read(mapProvider.notifier).getPlaceById(placeId);
    if (place == null) return;

    final mapState = ref.read(mapProvider);
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => PlacePreviewSheet(
        place: place,
        userLocation: mapState.userLocation,
      ),
    );
  }

  Future<void> _goToMyLocation() async {
    final mapState = ref.read(mapProvider);
    if (mapState.userLocation != null) {
      final controller = await _mapController.future;
      controller.animateCamera(
        CameraUpdate.newCameraPosition(
          CameraPosition(target: mapState.userLocation!, zoom: 15),
        ),
      );
    } else {
      await ref.read(mapProvider.notifier).loadUserLocation();
      final newState = ref.read(mapProvider);
      if (newState.userLocation != null) {
        final controller = await _mapController.future;
        controller.animateCamera(
          CameraUpdate.newCameraPosition(
            CameraPosition(target: newState.userLocation!, zoom: 15),
          ),
        );
      }
    }
  }

  Future<void> _loadNearbyPlaces() async {
    final mapState = ref.read(mapProvider);
    if (mapState.userLocation == null) {
      await ref.read(mapProvider.notifier).loadUserLocation();
    }
    final newState = ref.read(mapProvider);
    if (newState.userLocation == null) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('No se pudo obtener tu ubicación'),
            duration: Duration(seconds: 2),
          ),
        );
      }
      return;
    }
    final controller = await _mapController.future;
    controller.animateCamera(
      CameraUpdate.newCameraPosition(
        CameraPosition(target: newState.userLocation!, zoom: 14),
      ),
    );
    await ref.read(mapProvider.notifier).loadNearbyFromUser();
  }

  // ── Quick filter tap ──────────────────────────────────────────────────────
  void _onQuickFilter(int index) {
    setState(() => _activeFilterIndex = index);
    final slug = _quickFilters[index].slug;
    ref.read(mapProvider.notifier).setSelectedCategory(slug);
    _loadMarkersForCurrentView();
  }

  @override
  Widget build(BuildContext context) {
    final mapState = ref.watch(mapProvider);

    // Trigger reactive generation of custom markers whenever places update
    _updateCustomMarkersIfNeeded(mapState.places);
    _updateEventMarkersIfNeeded(mapState.events);

    return Scaffold(
      extendBodyBehindAppBar: true,
      body: Stack(
        children: [
          // ── Google Map ──────────────────────────────────────────────────
          GoogleMap(
            initialCameraPosition: _santaCruz,
            markers: _customMarkers.isNotEmpty
                ? {..._customMarkers, ..._eventMarkers}
                : mapState.markers,
            circles: mapState.safetyCircles,
            myLocationEnabled: true,
            myLocationButtonEnabled: false,
            zoomControlsEnabled: false,
            onMapCreated: (controller) {
              if (!_mapController.isCompleted) {
                _mapController.complete(controller);
              }
            },
            onCameraMoveStarted: () {
              if (!_showSearchThisArea && mounted) {
                setState(() => _showSearchThisArea = true);
              }
            },
            onCameraIdle: _onCameraIdle,
          ),

          // ── Top overlay: search bar + pill filters ───────────────────────
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: SafeArea(
              bottom: false,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Search bar
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                    child: GestureDetector(
                      onTap: () => context.go('/search'),
                      child: Container(
                        height: 50,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(14),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.10),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            const SizedBox(width: 14),
                            const Icon(
                              Icons.search_rounded,
                              size: 20,
                              color: _textSecondary,
                            ),
                            const SizedBox(width: 10),
                            const Expanded(
                              child: Text(
                                'Buscar en el mapa...',
                                style: TextStyle(
                                  fontSize: 14,
                                  color: Color(0xFF64748B),
                                ),
                              ),
                            ),
                            // Filters icon button
                            GestureDetector(
                              onTap: _showFilterSheet,
                              child: Container(
                                margin: const EdgeInsets.only(right: 8),
                                width: 34,
                                height: 34,
                                decoration: BoxDecoration(
                                  color: _brandDark,
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: const Icon(
                                  Icons.tune_rounded,
                                  size: 17,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 10),

                  // ── Horizontal pill filter strip ─────────────────────────
                  SizedBox(
                    height: 44,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: _quickFilters.length,
                      itemBuilder: (context, index) {
                        final filter = _quickFilters[index];
                        final isActive = _activeFilterIndex == index;
                        return GestureDetector(
                          onTap: () => _onQuickFilter(index),
                          child: Container(
                            margin: const EdgeInsets.only(right: 8),
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 11,
                            ),
                            decoration: BoxDecoration(
                              color: isActive ? _brandEmerald : Colors.white,
                              borderRadius: BorderRadius.circular(24),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.08),
                                  blurRadius: 6,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: Text(
                              filter.label,
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: isActive ? Colors.white : _textSecondary,
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ── "Buscar en esta área" Pill Button (Top Center) ──────────────
          if (_showSearchThisArea)
            Positioned(
              top: 115,
              left: 0,
              right: 0,
              child: Center(
                child: GestureDetector(
                  onTap: _searchInThisArea,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: _borderSubtle),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.12),
                          blurRadius: 8,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.refresh_rounded,
                          size: 16,
                          color: _brandDark,
                        ),
                        SizedBox(width: 6),
                        Text(
                          'Buscar en esta área',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: _brandDark,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),

          // ── Floating GPS / Mi Ubicación Button (Top Right) ──────────────
          Positioned(
            top: 115,
            right: 16,
            child: _MapControlButton(
              icon: Icons.my_location_rounded,
              onPressed: _goToMyLocation,
              tooltip: 'Mi ubicación',
            ),
          ),

          // ── Loading spinner ──────────────────────────────────────────────
          if (mapState.status == MapStatus.loading)
            const Positioned(
              top: 130,
              right: 16,
              child: SizedBox(
                width: 22,
                height: 22,
                child: CircularProgressIndicator(
                  strokeWidth: 2.5,
                  color: _brandEmerald,
                ),
              ),
            ),

          // ── Safety zones legend ─────────────────────────────────────────
          if (mapState.safetyZones.isNotEmpty)
            Positioned(
              bottom: 140,
              left: 16,
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 8,
                ),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: _borderSubtle),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.07),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _RiskLegendDot(color: Color(0xFF10B981), label: 'Bajo'),
                    SizedBox(width: 10),
                    _RiskLegendDot(color: Color(0xFFF59E0B), label: 'Medio'),
                    SizedBox(width: 10),
                    _RiskLegendDot(color: Color(0xFFEF4444), label: 'Alto'),
                  ],
                ),
              ),
            ),

          // ── Place count badge ────────────────────────────────────────────
          if (mapState.status == MapStatus.loaded)
            Positioned(
              bottom: 100,
              left: 16,
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: _borderSubtle),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.07),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.location_on_rounded,
                      size: 13,
                      color: _brandEmerald,
                    ),
                    const SizedBox(width: 5),
                    Text(
                      '${mapState.places.length} lugares',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: _brandDark,
                      ),
                    ),
                  ],
                ),
              ),
            ),

          // ── Error banner ─────────────────────────────────────────────────
          if (mapState.status == MapStatus.error &&
              mapState.errorMessage != null)
            Positioned(
              bottom: 100,
              left: 16,
              right: 16,
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 12,
                ),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.error300),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.06),
                      blurRadius: 8,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.error_outline,
                      size: 16,
                      color: AppColors.error500,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        mapState.errorMessage!,
                        style: const TextStyle(
                          fontSize: 13,
                          color: AppColors.error700,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

          // ── Zoom + Near Me controls (Bottom Right) ──────────────────────
          Positioned(
            bottom: 100,
            right: 16,
            child: Column(
              children: [
                _MapControlButton(
                  icon: Icons.near_me_rounded,
                  onPressed: _loadNearbyPlaces,
                  tooltip: 'Cercanos a mí',
                ),
                const SizedBox(height: 8),
                _MapControlButton(
                  icon: Icons.add,
                  onPressed: () async {
                    final controller = await _mapController.future;
                    controller.animateCamera(CameraUpdate.zoomIn());
                  },
                  tooltip: 'Acercar',
                ),
                const SizedBox(height: 8),
                _MapControlButton(
                  icon: Icons.remove,
                  onPressed: () async {
                    final controller = await _mapController.future;
                    controller.animateCamera(CameraUpdate.zoomOut());
                  },
                  tooltip: 'Alejar',
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Map control floating button — white circle with brand icon
// ─────────────────────────────────────────────────────────────────────────────
class _MapControlButton extends StatelessWidget {
  const _MapControlButton({
    required this.icon,
    required this.onPressed,
    this.tooltip,
  });

  final IconData icon;
  final VoidCallback onPressed;
  final String? tooltip;

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip ?? '',
      child: GestureDetector(
        onTap: onPressed,
        child: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: Colors.white,
            shape: BoxShape.circle,
            border: Border.all(color: _borderSubtle),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.09),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Icon(icon, size: 20, color: _brandDark),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Safety legend dot (riesgo bajo/medio/alto)
// ─────────────────────────────────────────────────────────────────────────────
class _RiskLegendDot extends StatelessWidget {
  const _RiskLegendDot({required this.color, required this.label});

  final Color color;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 4),
        Text(
          label,
          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: _brandDark),
        ),
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Event preview bottom sheet
// ─────────────────────────────────────────────────────────────────────────────
class _EventPreviewSheet extends StatelessWidget {
  const _EventPreviewSheet({required this.event, required this.dateLabel});

  final MapEvent event;
  final String dateLabel;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: _borderSubtle,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: const Color(0xFFEC4899).withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.event_rounded,
                    color: Color(0xFFEC4899),
                    size: 22,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        event.name,
                        style: const TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w700,
                          color: _brandDark,
                        ),
                      ),
                      if (event.category != null && event.category!.isNotEmpty)
                        Text(
                          event.category!,
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: _textSecondary,
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                const Icon(
                  Icons.calendar_month_rounded,
                  size: 16,
                  color: _textSecondary,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    dateLabel,
                    style: const TextStyle(
                      fontSize: 13,
                      color: _brandDark,
                    ),
                  ),
                ),
              ],
            ),
            if (event.location != null && event.location!.isNotEmpty) ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(
                    Icons.place_rounded,
                    size: 16,
                    color: _textSecondary,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      event.location!,
                      style: const TextStyle(fontSize: 13, color: _brandDark),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}
