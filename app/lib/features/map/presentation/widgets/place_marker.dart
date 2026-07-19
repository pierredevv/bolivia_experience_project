import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../config/colors.dart';
import '../../data/map_service.dart';

class PlaceMarker {
  static BitmapDescriptor _defaultIcon = BitmapDescriptor.defaultMarker;
  static BitmapDescriptor _selectedIcon = BitmapDescriptor.defaultMarker;
  static bool _iconsLoaded = false;

  static Future<void> loadIcons() async {
    if (_iconsLoaded) return;

    _defaultIcon = await _createMarkerIcon(
      color: AppColors.primary700,
      icon: Icons.place,
      size: 60,
    );
    _selectedIcon = await _createMarkerIcon(
      color: AppColors.secondary700,
      icon: Icons.place,
      size: 70,
    );

    _iconsLoaded = true;
  }

  static Future<BitmapDescriptor> _createMarkerIcon({
    required Color color,
    required IconData icon,
    required int size,
  }) async {
    final pictureRecorder = ui.PictureRecorder();
    final canvas = Canvas(pictureRecorder);
    final paint = Paint()..color = color;

    // Draw circle background
    canvas.drawCircle(
      Offset(size / 2, size / 2),
      size / 2,
      paint,
    );

    // Draw inner circle
    final innerPaint = Paint()..color = Colors.white;
    canvas.drawCircle(
      Offset(size / 2, size / 2),
      size / 3,
      innerPaint,
    );

    // Draw icon
    final textPainter = TextPainter(textDirection: TextDirection.ltr);
    textPainter.text = TextSpan(
      text: String.fromCharCode(icon.codePoint),
      style: TextStyle(
        fontSize: size / 3,
        color: color,
        fontFamily: icon.fontFamily,
      ),
    );
    textPainter.layout();
    textPainter.paint(
      canvas,
      Offset(
        (size - textPainter.width) / 2,
        (size - textPainter.height) / 2,
      ),
    );

    final image = await pictureRecorder.endRecording().toImage(size, size);
    final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
    final buffer = byteData!.buffer.asUint8List();

    return BitmapDescriptor.bytes(buffer);
  }

  static Marker createMarker({
    required MapPlace place,
    required VoidCallback onTap,
    bool isSelected = false,
  }) {
    return Marker(
      markerId: MarkerId(place.id),
      position: LatLng(place.latitude, place.longitude),
      icon: isSelected ? _selectedIcon : _defaultIcon,
      onTap: onTap,
      infoWindow: InfoWindow(
        title: place.name,
        snippet: place.categoryName,
      ),
    );
  }

  static Set<Marker> createMarkers({
    required List<MapPlace> places,
    required Function(MapPlace) onTap,
    String? selectedPlaceId,
  }) {
    return places.map((place) {
      return createMarker(
        place: place,
        onTap: () => onTap(place),
        isSelected: place.id == selectedPlaceId,
      );
    }).toSet();
  }
}
