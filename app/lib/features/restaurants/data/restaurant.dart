/// Mesa (producto tipo "mesa") reservable de un restaurante.
class RestaurantMesa {
  final String id;
  final String name;
  final double price;
  final String currency;
  final int? capacity;
  final String modalidadReserva;
  final String? caracteristicas;
  final String? textoPrecio;
  final bool cashbackActivo;
  final int? cashbackPorcentaje;
  final String? tipoCocinaId;
  final Map<String, dynamic>? cocina;

  const RestaurantMesa({
    required this.id,
    required this.name,
    this.price = 0,
    this.currency = 'BOB',
    this.capacity,
    this.modalidadReserva = 'ninguna',
    this.caracteristicas,
    this.textoPrecio,
    this.cashbackActivo = false,
    this.cashbackPorcentaje,
    this.tipoCocinaId,
    this.cocina,
  });

  factory RestaurantMesa.fromJson(Map<String, dynamic> json) {
    return RestaurantMesa(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      price: _asDouble(json['price']),
      currency: json['currency']?.toString() ?? 'BOB',
      capacity: _asNullableInt(json['capacity']),
      modalidadReserva: json['modalidadReserva']?.toString() ?? 'ninguna',
      caracteristicas: json['caracteristicas']?.toString(),
      textoPrecio: json['textoPrecio']?.toString(),
      cashbackActivo: json['cashbackActivo'] == true,
      cashbackPorcentaje: _asNullableInt(json['cashbackPorcentaje']),
      tipoCocinaId: json['tipoCocinaId']?.toString(),
      cocina: json['cocina'] is Map<String, dynamic>
          ? json['cocina'] as Map<String, dynamic>
          : null,
    );
  }

  /// Slug de la categoría de cocina (ej. "cocina-boliviana").
  String? get cocinaSlug => cocina?['slug']?.toString();

  /// Nombre legible de la cocina.
  String? get cocinaName => cocina?['name']?.toString();

  /// Icono de la categoría de cocina.
  String? get cocinaIcon => cocina?['icon']?.toString();
}

/// Un restaurante en la vista "Restaurantes en Santa Cruz para comer".
/// Representa el lugar con su mesa reservable y el nivel de precio calculado
/// por cuartiles ($/$$/$$$/$$$$) por el backend.
class Restaurant {
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
  final RestaurantMesa mesa;
  final double? precioPromedio;
  final int? nivelPrecio;
  final List<String> comodidades;
  final bool canReserve;

  /// Distancia a la Plaza 24 de Septiembre (km). Se setea una vez al cargar.
  double? distanceFromReferenceKm;

  Restaurant({
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
    RestaurantMesa? mesa,
    this.precioPromedio,
    this.nivelPrecio,
    this.comodidades = const [],
    this.canReserve = false,
    this.distanceFromReferenceKm,
  }) : mesa = mesa ?? const RestaurantMesa(id: '', name: '');

  factory Restaurant.fromJson(Map<String, dynamic> json) {
    return Restaurant(
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
      mesa: json['mesa'] is Map<String, dynamic>
          ? RestaurantMesa.fromJson(json['mesa'] as Map<String, dynamic>)
          : const RestaurantMesa(id: '', name: ''),
      precioPromedio: _asNullableDouble(json['precioPromedio']),
      nivelPrecio: _asNullableInt(json['nivelPrecio']),
      comodidades: json['comodidades'] is List
          ? (json['comodidades'] as List).map((e) => e.toString()).toList()
          : const [],
      canReserve: json['canReserve'] == true,
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

  String? get cocinaSlug => mesa.cocinaSlug;
  String? get cocinaName => mesa.cocinaName;
  String? get caracteristicas => mesa.caracteristicas;

  bool get hasCashback =>
      mesa.cashbackActivo && (mesa.cashbackPorcentaje ?? 0) > 0;

  int? get cashbackPorcentaje {
    if (mesa.cashbackActivo && (mesa.cashbackPorcentaje ?? 0) > 0) {
      return mesa.cashbackPorcentaje;
    }
    return null;
  }

  /// Nivel de precio como símbolos: 1 → "$", 2 → "$$", 3 → "$$$", 4 → "$$$$".
  String get priceLevelText {
    final n = nivelPrecio;
    if (n == null || n <= 0) return '';
    return List.filled(n.clamp(1, 4), '\$').join();
  }

  double get priceFrom => mesa.price;
}

/// Punto de referencia para el filtro/sort por distancia (ej. Plaza 24 Sep).
class RestaurantReference {
  final String id;
  final String name;
  final double? latitude;
  final double? longitude;

  const RestaurantReference({
    required this.id,
    required this.name,
    this.latitude,
    this.longitude,
  });

  factory RestaurantReference.fromJson(Map<String, dynamic> json) {
    return RestaurantReference(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      latitude: _asNullableDouble(json['latitude']),
      longitude: _asNullableDouble(json['longitude']),
    );
  }
}

class RestaurantsResult {
  final List<Restaurant> restaurants;
  final RestaurantReference? referencePlace;
  final List<Map<String, dynamic>> cocinaCategories;

  const RestaurantsResult({
    this.restaurants = const [],
    this.referencePlace,
    this.cocinaCategories = const [],
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
