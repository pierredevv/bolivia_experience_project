import '../../../core/currency/currency.dart';

/// Mapea el nivel de precio de un lugar (1..4) a un monto base por persona
/// en BOB para la reserva con pago QR demo.
double estimatePricePerPerson(int? priceLevel) {
  switch (priceLevel) {
    case 1:
      return 50;
    case 2:
      return 90;
    case 3:
      return 150;
    case 4:
      return 220;
    default:
      return 80;
  }
}

/// Formatea un monto con la moneda efectiva del usuario. Si se pasa una
/// moneda explícita (ej. la del pago), respeta esa; si no, usa la preferencia
/// (hoy siempre USD).
String formatCurrency(double amount, {String? currency}) {
  final code = currency ?? effectiveCurrencyCode();
  final symbol = currencySymbol(code);
  return '$symbol ${amount.toStringAsFixed(amount == amount.roundToDouble() ? 0 : 2)}';
}
