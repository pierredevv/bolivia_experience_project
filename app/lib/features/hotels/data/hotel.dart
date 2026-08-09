/// Producto hospedaje de un hotel con los campos de la tarjeta.
class HotelProduct {
  final String id;
  final String name;
  final double price;
  final String currency;
  final int? capacity;
  final String modalidadReserva;
  final String type;
  final String? caracteristicas;
  final List<String> comodidades;
  final String? tipoPropiedad;
  final int? estrellas;
  final String? textoPrecio;
  final bool cashbackActivo;
  final int? cashbackPorcentaje;
  final bool premiado;
  final bool tieneOferta;
  final bool reembolsable;
  final bool pagoDiferido;

  const HotelProduct({
    required this.id,
    required this.name,
    this.price = 0,
    this.currency = 'BOB',
    this.capacity,
    this.modalidadReserva = 'ninguna',
    this.type = 'actividad',
    this.caracteristicas,
    this.comodidades = const [],
    this.tipoPropiedad,
    this.estrellas,
    this.textoPrecio,
    this.cashbackActivo = false,
    this.cashbackPorcentaje,
    this.premiado = false,
    this.tieneOferta = false,
    this.reembolsable = false,
    this.pagoDiferido = false,
  });

  factory HotelProduct.fromJson(Map<String, dynamic> json) {
    return HotelProduct(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      price: _asDouble(json['price']),
      currency: json['currency']?.toString() ?? 'BOB',
      capacity: _asNullableInt(json['capacity']),
      modalidadReserva: json['modalidadReserva']?.toString() ?? 'ninguna',
      type: json['type']?.toString() ?? 'actividad',
      caracteristicas: json['caracteristicas']?.toString(),
      comodidades: json['comodidades'] is List
          ? (json['comodidades'] as List).map((e) => e.toString()).toList()
          : const [],
      tipoPropiedad: json['tipoPropiedad']?.toString(),
      estrellas: _asNullableInt(json['estrellas']),
      textoPrecio: json['textoPrecio']?.toString(),
      cashbackActivo: json['cashbackActivo'] == true,
      cashbackPorcentaje: _asNullableInt(json['cashbackPorcentaje']),
      premiado: json['premiado'] == true,
      tieneOferta: json['tieneOferta'] == true,
      reembolsable: json['reembolsable'] == true,
      pagoDiferido: json['pagoDiferido'] == true,
    );
  }
}

/// Un hotel en la vista de Hoteles (place + su producto hospedaje más barato).
class Hotel {
  final String id;
  final String name;
  final String? description;
  final String? descriptionEn;
  final String address;
  final double? latitude;
  final double? longitude;
  final dynamic ratingAvg;
  final int ratingCount;
  final String? specialFeature;
  final Map<String, dynamic>? category;
  final List<dynamic> photos;
  final double minPrice;
  final int? maxCapacity;
  final List<HotelProduct> products;

  /// Distancia GPS del usuario (km). Se setea una vez al cargar.
  double? distanceFromUserKm;

  /// Distancia a la Plaza 24 de Septiembre (km). Se setea una vez al cargar.
  double? distanceFromReferenceKm;

  Hotel({
    required this.id,
    required this.name,
    this.description,
    this.descriptionEn,
    this.address = '',
    this.latitude,
    this.longitude,
    this.ratingAvg = 0,
    this.ratingCount = 0,
    this.specialFeature,
    this.category,
    this.photos = const [],
    this.minPrice = 0,
    this.maxCapacity,
    this.products = const [],
    this.distanceFromUserKm,
    this.distanceFromReferenceKm,
  });

  factory Hotel.fromJson(Map<String, dynamic> json) {
    return Hotel(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      description: json['description']?.toString(),
      descriptionEn: json['descriptionEn']?.toString(),
      address: json['address']?.toString() ?? '',
      latitude: _asNullableDouble(json['latitude']),
      longitude: _asNullableDouble(json['longitude']),
      ratingAvg: json['ratingAvg'] ?? 0,
      ratingCount: _asInt(json['ratingCount']),
      specialFeature: json['specialFeature']?.toString(),
      category: json['category'] is Map<String, dynamic>
          ? json['category'] as Map<String, dynamic>
          : null,
      photos: json['photos'] is List ? json['photos'] as List : const [],
      minPrice: _asDouble(json['minPrice']),
      maxCapacity: _asNullableInt(json['maxCapacity']),
      products: json['products'] is List
          ? (json['products'] as List)
              .whereType<Map<String, dynamic>>()
              .map((item) => HotelProduct.fromJson(item))
              .toList()
          : const [],
    );
  }

  String? get photoUrl {
    if (photos.isNotEmpty && photos.first is Map) {
      final first = photos.first as Map;
      final url = first['url'];
      if (url != null) return url.toString();
    }
    return null;
  }

  double get ratingAvgValue =>
      _asDouble(ratingAvg is num ? ratingAvg : ratingAvg?.toString());

  /// Producto de menor precio (representa el "Desde Bs X" de la card).
  HotelProduct? get bestProduct {
    if (products.isEmpty) return null;
    var best = products.first;
    for (final p in products) {
      if (p.price < best.price) best = p;
    }
    return best;
  }

  bool get hasCashback =>
      products.any((p) => p.cashbackActivo && (p.cashbackPorcentaje ?? 0) > 0);

  int? get cashbackPorcentaje {
    for (final p in products) {
      if (p.cashbackActivo && (p.cashbackPorcentaje ?? 0) > 0) {
        return p.cashbackPorcentaje;
      }
    }
    return null;
  }

  bool get tieneOferta => products.any((p) => p.tieneOferta);
  bool get reembolsable => products.any((p) => p.reembolsable);
  bool get pagoDiferido => products.any((p) => p.pagoDiferido);
  bool get premiado => products.any((p) => p.premiado);

  int? get estrellas {
    for (final p in products) {
      if (p.estrellas != null) return p.estrellas;
    }
    return null;
  }

  String? get tipoPropiedad {
    for (final p in products) {
      if (p.tipoPropiedad != null && p.tipoPropiedad!.isNotEmpty) {
        return p.tipoPropiedad;
      }
    }
    return null;
  }

  String? get caracteristicas => bestProduct?.caracteristicas;
  String? get textoPrecio => bestProduct?.textoPrecio;

  Set<String> get allAmenities {
    final s = <String>{};
    for (final p in products) {
      s.addAll(p.comodidades);
    }
    return s;
  }
}

/// Punto de referencia para el filtro/sort por distancia (ej. Plaza 24 Sep).
class PlaceReference {
  final String id;
  final String name;
  final double? latitude;
  final double? longitude;

  const PlaceReference({
    required this.id,
    required this.name,
    this.latitude,
    this.longitude,
  });

  factory PlaceReference.fromJson(Map<String, dynamic> json) {
    return PlaceReference(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      latitude: _asNullableDouble(json['latitude']),
      longitude: _asNullableDouble(json['longitude']),
    );
  }
}

class HotelsResult {
  final List<Hotel> hotels;
  final double maxMinPrice;
  final PlaceReference? referencePlace;

  const HotelsResult({
    this.hotels = const [],
    this.maxMinPrice = 0,
    this.referencePlace,
  });
}

int _asInt(dynamic value) {
  if (value is num) return value.toInt();
  return int.tryParse(value?.toString() ?? '') ?? 0;
}

int? _asNullableInt(dynamic value) {
  if (value == null) return null;
  if (value is num) return value.toInt();
  return int.tryParse(value.toString());
}

double _asDouble(dynamic value) {
  if (value is num) return value.toDouble();
  return double.tryParse(value?.toString() ?? '') ?? 0;
}

double? _asNullableDouble(dynamic value) {
  if (value == null) return null;
  if (value is num) return value.toDouble();
  return double.tryParse(value.toString());
}
