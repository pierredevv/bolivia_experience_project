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

String formatCurrency(double amount, {String currency = 'BOB'}) {
  return '$currency ${amount.toStringAsFixed(amount == amount.roundToDouble() ? 0 : 2)}';
}
