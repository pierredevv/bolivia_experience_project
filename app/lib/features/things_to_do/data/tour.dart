/// Tramo de precio por tamaño de grupo (definido por el socio).
class PriceTramo {
  final int min;
  final int max;
  final double precio;

  const PriceTramo({required this.min, required this.max, required this.precio});

  factory PriceTramo.fromJson(Map<String, dynamic> json) {
    return PriceTramo(
      min: (json['min'] is num ? json['min'] as num : 0).toInt(),
      max: (json['max'] is num ? json['max'] as num : 0).toInt(),
      precio: (json['precio'] is num ? json['precio'] as num : 0).toDouble(),
    );
  }
}

/// Producto-tour ofrecido por un socio (type="experiencia" con subcategoría).
class Tour {
  final String id;
  final String name;
  final String? description;
  final String? experienceCategory;
  final String? subcategoriaTour;
  final List<PriceTramo> tramosPrecio;
  final double price;
  final double? pricePerAdult;
  final bool priceVarByGroup;
  final String currency;
  final String? photoUrl;
  final double ratingAvg;
  final int ratingCount;
  final String? tourismType;
  final String? budgetRange;
  final bool recommended;
  final bool verified;
  final int? duracionDias;
  final bool esImprescindible;
  final TourPlace? place;

  const Tour({
    required this.id,
    required this.name,
    this.description,
    this.experienceCategory,
    this.subcategoriaTour,
    this.tramosPrecio = const [],
    this.price = 0,
    this.pricePerAdult,
    this.priceVarByGroup = false,
    this.currency = 'BOB',
    this.photoUrl,
    this.ratingAvg = 0,
    this.ratingCount = 0,
    this.tourismType,
    this.budgetRange,
    this.recommended = false,
    this.verified = false,
    this.duracionDias,
    this.esImprescindible = false,
    this.place,
  });

  factory Tour.fromJson(Map<String, dynamic> json) {
    final tramos = <PriceTramo>[];
    final rawTramos = json['tramosPrecio'];
    if (rawTramos is List) {
      for (final t in rawTramos) {
        if (t is Map<String, dynamic>) {
          tramos.add(PriceTramo.fromJson(t));
        }
      }
    }

    return Tour(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      description: json['description']?.toString(),
      experienceCategory: json['experienceCategory']?.toString(),
      subcategoriaTour: json['subcategoriaTour']?.toString(),
      tramosPrecio: tramos,
      price: (json['price'] is num ? json['price'] as num : 0).toDouble(),
      pricePerAdult: json['pricePerAdult'] is num
          ? (json['pricePerAdult'] as num).toDouble()
          : null,
      priceVarByGroup: json['priceVarByGroup'] == true,
      currency: json['currency']?.toString() ?? 'BOB',
      photoUrl: json['photoUrl']?.toString(),
      ratingAvg: (json['ratingAvg'] is num ? json['ratingAvg'] as num : 0)
          .toDouble(),
      ratingCount: json['ratingCount'] is num
          ? (json['ratingCount'] as num).toInt()
          : 0,
      tourismType: json['tourismType']?.toString(),
      budgetRange: json['budgetRange']?.toString(),
      recommended: json['recommended'] == true,
      verified: json['verified'] == true,
      duracionDias: json['duracionDias'] is num
          ? (json['duracionDias'] as num).toInt()
          : null,
      esImprescindible: json['esImprescindible'] == true,
      place: json['place'] is Map<String, dynamic>
          ? TourPlace.fromJson(json['place'] as Map<String, dynamic>)
          : null,
    );
  }

  /// Precio desde (por adulto): prioriza el primer tramo; si no hay, pricePerAdult.
  double get priceFrom {
    if (tramosPrecio.isNotEmpty) {
      final ordered = [...tramosPrecio]..sort((a, b) => a.precio.compareTo(b.precio));
      return ordered.first.precio;
    }
    return pricePerAdult ?? price;
  }

  /// Rango de precio legible según los tramos, ej. "Bs 320 - 400 por persona".
  String? priceRangeText() {
    if (tramosPrecio.isEmpty) {
      final p = pricePerAdult ?? price;
      if (p <= 0) return null;
      return '${currency == 'USD' ? 'US\$' : 'Bs'} ${p.toStringAsFixed(0)} por persona';
    }
    final ordered = [...tramosPrecio]..sort((a, b) => a.precio.compareTo(b.precio));
    final minP = ordered.first.precio;
    final maxP = ordered.last.precio;
    final prefix = currency == 'USD' ? 'US\$' : 'Bs';
    if (minP == maxP) {
      return '$prefix ${minP.toStringAsFixed(0)} por persona';
    }
    return '$prefix ${minP.toStringAsFixed(0)} - ${maxP.toStringAsFixed(0)} por persona';
  }
}

class TourPlace {
  final String id;
  final String name;
  final String? address;
  final String? city;
  final String? categorySlug;

  const TourPlace({
    required this.id,
    required this.name,
    this.address,
    this.city,
    this.categorySlug,
  });

  factory TourPlace.fromJson(Map<String, dynamic> json) {
    return TourPlace(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      address: json['address']?.toString(),
      city: json['city']?.toString(),
      categorySlug: json['categorySlug']?.toString(),
    );
  }
}
