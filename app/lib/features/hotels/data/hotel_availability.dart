import 'hotel.dart';

/// Disponibilidad nocturna por hotel.
///
/// Determinista y pura (testeable): mismo hotel + misma noche => mismo
/// resultado. ~30% de las noches se muestran "sin cupo".
///
/// TODO: reemplazar por disponibilidad real del backend (calendario por
/// producto/hotel) cuando exista.
class HotelAvailability {
  HotelAvailability._();

  static const int _bookedPercent = 30;

  /// Un hotel es "disponible" si al menos una noche del rango tiene cupo.
  /// Sin fechas válidas (checkout <= checkin) se considera disponible.
  static bool isAvailableForRange(
    Hotel hotel,
    DateTime checkIn,
    DateTime checkOut,
  ) {
    return bookedFraction(hotel.id, checkIn, checkOut) < 1;
  }

  /// Fracción de noches sin cupo en el rango (0..1). 0 si el rango no es válido.
  static double bookedFraction(
    String hotelId,
    DateTime checkIn,
    DateTime checkOut,
  ) {
    final from = DateTime(checkIn.year, checkIn.month, checkIn.day);
    final to = DateTime(checkOut.year, checkOut.month, checkOut.day);
    if (!to.isAfter(from)) return 0;

    var nights = 0;
    var booked = 0;
    for (var d = from; d.isBefore(to); d = d.add(const Duration(days: 1))) {
      nights++;
      if (_isBooked(hotelId, d)) booked++;
    }
    return nights == 0 ? 0 : booked / nights;
  }

  static bool _isBooked(String hotelId, DateTime date) {
    final key = '$hotelId-${date.year}-${date.month}-${date.day}';
    return (_hash(key) % 100) < _bookedPercent;
  }

  static int _hash(String input) {
    var h = 0;
    for (var i = 0; i < input.length; i++) {
      h = (h * 31 + input.codeUnitAt(i)) & 0x7fffffff;
    }
    return h;
  }
}
