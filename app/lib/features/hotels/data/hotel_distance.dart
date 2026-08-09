import 'dart:math' as math;

/// Cálculos de distancia puros (sin dependencia de plugins de plataforma),
/// ideales para filtros y tests unitarios.
class HotelDistance {
  HotelDistance._();

  /// Distancia en kilómetros entre dos coordenadas (fórmula de Haversine).
  static double calculateDistanceKm({
    required double lat1,
    required double lon1,
    required double lat2,
    required double lon2,
  }) {
    const earthRadiusKm = 6371.0;
    final dLat = _deg2rad(lat2 - lat1);
    final dLon = _deg2rad(lon2 - lon1);
    final a = math.sin(dLat / 2) * math.sin(dLat / 2) +
        math.cos(_deg2rad(lat1)) *
            math.cos(_deg2rad(lat2)) *
            math.sin(dLon / 2) *
            math.sin(dLon / 2);
    final c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));
    return earthRadiusKm * c;
  }

  /// Formato corto para distancias en km.
  static String formatKm(double km) {
    if (km < 1) {
      return '${(km * 1000).round()} m';
    }
    return '${km.toStringAsFixed(1)} km';
  }

  static double kmToMi(double km) => km / 1.609344;
  static double miToKm(double mi) => mi * 1.609344;

  static double _deg2rad(double deg) => deg * math.pi / 180.0;
}
