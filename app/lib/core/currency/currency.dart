import 'package:hive_flutter/hive_flutter.dart';

const kCurrencyPreferenceKey = 'currency_preference';

class SupportedCurrency {
  final String code;
  final String label;
  final bool comingSoon;

  const SupportedCurrency({
    required this.code,
    required this.label,
    this.comingSoon = false,
  });
}

/// Opciones del selector de moneda en preferencias.
/// Hoy solo USD es funcional: BOB muestra un aviso amigable y no se aplica;
/// EUR y BRL están marcados como "Próximamente".
const supportedCurrencies = [
  SupportedCurrency(code: 'USD', label: 'Dólar estadounidense (USD)'),
  SupportedCurrency(code: 'BOB', label: 'Boliviano (BOB)'),
  SupportedCurrency(code: 'EUR', label: 'Euro (EUR)', comingSoon: true),
  SupportedCurrency(code: 'BRL', label: 'Real brasileño (BRL)', comingSoon: true),
];

/// Monedas realmente aplicables hoy (solo USD). Cualquier otra preferencia
/// cae a USD, por lo que los precios se muestran consistentemente en USD.
const _functionalCurrencies = {'USD'};

String effectiveCurrencyCode() {
  try {
    final box = Hive.box('settings');
    final saved = box.get(kCurrencyPreferenceKey, defaultValue: 'USD');
    final code = saved?.toString() ?? 'USD';
    return _functionalCurrencies.contains(code) ? code : 'USD';
  } catch (_) {
    // Hive no inicializado (tests, arranque): el default efectivo es USD.
    return 'USD';
  }
}

String currencySymbol(String code) {
  switch (code) {
    case 'USD':
      return 'US\$';
    case 'BOB':
      return 'Bs';
    case 'EUR':
      return '€';
    case 'BRL':
      return 'R\$';
    default:
      return code;
  }
}

/// Formatea un monto con la moneda efectiva del usuario (hoy siempre USD).
String formatPrice(num amount) {
  return '${currencySymbol(effectiveCurrencyCode())} ${amount.toStringAsFixed(0)}';
}

/// Formatea un rango de precios, ej. "US$ 150 - 400".
String formatPriceRange(num min, num max) {
  final symbol = currencySymbol(effectiveCurrencyCode());
  return '$symbol ${min.toStringAsFixed(0)} - ${max.toStringAsFixed(0)}';
}

/// Formatea un precio con una unidad, ej. "US$ 150 por persona".
String formatPricePerUnit(num amount, String unit) {
  return '${formatPrice(amount)} $unit';
}
