import 'restaurant.dart';

/// Disponibilidad simulada de una mesa por restaurante + fecha + hora.
///
/// Determinista y pura (testeable): mismo restaurante + fecha + hora => mismo
/// resultado. ~25% de los slots se muestran "sin cupo" y la probabilidad crece
/// en horarios pico (20:00-22:00).
///
/// TODO: reemplazar por disponibilidad real del backend cuando exista.
class RestaurantAvailability {
  RestaurantAvailability._();

  static bool isAvailable(
    Restaurant restaurant,
    DateTime date,
    String time,
  ) {
    return bookedFraction(restaurant.id, date, time) < 1;
  }

  /// Fracción de cupo ocupado (0..1). 1 = sin cupo.
  static double bookedFraction(String restaurantId, DateTime date, String time) {
    final base = (_hash('$restaurantId-${_dayKey(date)}-$time') % 100) / 100;
    final isPeak = time.compareTo('20:00') >= 0;
    final baseBooked = 0.25 + (isPeak ? 0.12 : 0.0);
    return base < baseBooked ? 1 : 0;
  }

  static String _dayKey(DateTime date) =>
      '${date.year}-${date.month}-${date.day}';

  static int _hash(String input) {
    var h = 0;
    for (var i = 0; i < input.length; i++) {
      h = (h * 31 + input.codeUnitAt(i)) & 0x7fffffff;
    }
    return h;
  }
}
