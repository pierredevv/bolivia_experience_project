import 'package:flutter_test/flutter_test.dart';
import 'package:bolivia_experience/features/hotels/data/hotel.dart';
import 'package:bolivia_experience/features/hotels/data/hotel_availability.dart';
import 'package:bolivia_experience/features/hotels/data/hotel_catalogs.dart';
import 'package:bolivia_experience/features/hotels/data/hotel_distance.dart';
import 'package:bolivia_experience/features/hotels/data/hotel_filters.dart';
import 'package:bolivia_experience/features/hotels/data/hotels_filter_engine.dart';

Hotel _hotel({
  required String id,
  String name = '',
  double minPrice = 100,
  double ratingAvg = 4,
  int ratingCount = 10,
  double? latitude,
  double? longitude,
  List<HotelProduct> products = const [],
}) {
  return Hotel(
    id: id,
    name: name,
    latitude: latitude,
    longitude: longitude,
    ratingAvg: ratingAvg,
    ratingCount: ratingCount,
    minPrice: minPrice,
    products: products,
  );
}

HotelProduct _product({
  String id = 'p',
  double price = 100,
  int? capacity,
  bool cashbackActivo = false,
  int? cashbackPorcentaje,
  bool premiado = false,
  bool tieneOferta = false,
  bool reembolsable = false,
  bool pagoDiferido = false,
  int? estrellas,
  String? tipoPropiedad,
  List<String> comodidades = const [],
}) {
  return HotelProduct(
    id: id,
    name: 'Hospedaje',
    price: price,
    capacity: capacity,
    cashbackActivo: cashbackActivo,
    cashbackPorcentaje: cashbackPorcentaje,
    premiado: premiado,
    tieneOferta: tieneOferta,
    reembolsable: reembolsable,
    pagoDiferido: pagoDiferido,
    estrellas: estrellas,
    tipoPropiedad: tipoPropiedad,
    comodidades: comodidades,
  );
}

void main() {
  final from = DateTime(2026, 8, 8);
  final to = DateTime(2026, 8, 12);

  HotelFilters defaults() => HotelFilters.defaults().copyWith(
        checkIn: from,
        checkOut: to,
      );

  group('HotelFilters defaults', () {
    test('fechas por defecto: hoy + 4 noches', () {
      final f = HotelFilters.defaults();
      expect(f.nights, 4);
      expect(f.totalGuests, 2);
    });

    test('copyWith mantiene valores no indicados', () {
      final f = defaults().copyWith(maxPrice: 500);
      expect(f.maxPrice, 500);
      expect(f.checkIn, from);
    });

    test('clearMaxPrice limpia el precio máximo', () {
      final f = defaults().copyWith(maxPrice: 500).copyWith(clearMaxPrice: true);
      expect(f.maxPrice, isNull);
    });
  });

  group('HotelsFilterEngine.apply', () {
    test('filtra por cashback', () {
      final h1 = _hotel(id: 'a', products: [
        _product(price: 100, cashbackActivo: true, cashbackPorcentaje: 7),
      ]);
      final h2 = _hotel(id: 'b', products: [_product(price: 90)]);

      final ids = HotelsFilterEngine.apply(
        defaults().copyWith(cashbackOnly: true),
        [h1, h2],
      );

      expect(ids, ['a']);
    });

    test('filtra por precio máximo', () {
      final h1 = _hotel(id: 'a', minPrice: 200);
      final h2 = _hotel(id: 'b', minPrice: 100);

      final ids = HotelsFilterEngine.apply(
        defaults().copyWith(maxPrice: 150),
        [h1, h2],
      );

      expect(ids, ['b']);
    });

    test('filtra por estrellas', () {
      final h1 = _hotel(id: 'a', products: [_product(estrellas: 5)]);
      final h2 = _hotel(id: 'b', products: [_product(estrellas: 3)]);

      final ids = HotelsFilterEngine.apply(
        defaults().copyWith(estrellas: 5),
        [h1, h2],
      );

      expect(ids, ['a']);
    });

    test('filtra por comodidades (requiere todas)', () {
      final h1 = _hotel(id: 'a', products: [
        _product(comodidades: ['wifi', 'piscina']),
      ]);
      final h2 = _hotel(id: 'b', products: [_product(comodidades: ['wifi'])]);

      final ids = HotelsFilterEngine.apply(
        defaults().copyWith(amenities: {'wifi', 'piscina'}),
        [h1, h2],
      );

      expect(ids, ['a']);
    });

    test('filtra por capacidad de huéspedes', () {
      final h1 = _hotel(id: 'a', products: [_product(capacity: 2)]);
      final h2 = _hotel(id: 'b', products: [_product(capacity: 4)]);
      final h3 = _hotel(id: 'c', products: [_product(capacity: null)]);

      // 4 huéspedes en 1 habitación: solo cabe h2 (cap 4) y h3 (sin límite).
      final ids = HotelsFilterEngine.apply(
        defaults().copyWith(adults: 4, children: 0, rooms: 1),
        [h1, h2, h3],
      );

      expect(ids, ['b', 'c']);
    });

    test('filtro de capacidad reparte huéspedes entre habitaciones', () {
      final h1 = _hotel(id: 'a', products: [_product(capacity: 2)]);
      final h2 = _hotel(id: 'b', products: [_product(capacity: 3)]);

      // 4 huéspedes en 2 habitaciones: 2 por cuarto => ambos caben.
      final ids = HotelsFilterEngine.apply(
        defaults().copyWith(adults: 4, children: 0, rooms: 2),
        [h1, h2],
      );

      expect(ids, ['a', 'b']);
    });

    test('hotel sin productos se considera sin límite de capacidad', () {
      final h1 = _hotel(id: 'a', products: []);
      final h2 = _hotel(id: 'b', products: [_product(capacity: 1)]);

      final ids = HotelsFilterEngine.apply(
        defaults().copyWith(adults: 4, children: 0, rooms: 1),
        [h1, h2],
      );

      expect(ids, ['a']);
    });

    test('filtra por tipo de propiedad', () {
      final h1 = _hotel(id: 'a', products: [_product(tipoPropiedad: 'hotel')]);
      final h2 = _hotel(id: 'b', products: [_product(tipoPropiedad: 'bnb')]);

      final ids = HotelsFilterEngine.apply(
        defaults().copyWith(tipoPropiedad: {'hotel'}),
        [h1, h2],
      );

      expect(ids, ['a']);
    });

    test('filtro premiado (El mejor de Bolivia)', () {
      final h1 = _hotel(id: 'a', products: [_product(premiado: true)]);
      final h2 = _hotel(id: 'b', products: [_product()]);

      final ids = HotelsFilterEngine.apply(
        defaults().copyWith(premiadoOnly: true),
        [h1, h2],
      );

      expect(ids, ['a']);
    });

    test('ordena por precio asc', () {
      final h1 = _hotel(id: 'a', minPrice: 300);
      final h2 = _hotel(id: 'b', minPrice: 100);
      final h3 = _hotel(id: 'c', minPrice: 200);

      final ids = HotelsFilterEngine.apply(
        defaults().copyWith(sort: HotelSort.priceAsc),
        [h1, h2, h3],
      );

      expect(ids, ['b', 'c', 'a']);
    });

    test('ordena por mejor valoración', () {
      final h1 = _hotel(id: 'a', ratingAvg: 4.5);
      final h2 = _hotel(id: 'b', ratingAvg: 4.9);
      final h3 = _hotel(id: 'c', ratingAvg: 3.8);

      final ids = HotelsFilterEngine.apply(
        defaults().copyWith(sort: HotelSort.bestRating),
        [h1, h2, h3],
      );

      expect(ids, ['b', 'a', 'c']);
    });

    test('filtra por distancia desde un lugar elegido', () {
      // Ventura Mall como lugar de referencia del filtro.
      const mall = PlaceReference(
        id: 'mall',
        name: 'Ventura Mall',
        latitude: -17.7400,
        longitude: -63.1900,
      );
      final near = _hotel(id: 'near', latitude: -17.7410, longitude: -63.1905);
      final far = _hotel(id: 'far', latitude: -17.8500, longitude: -63.2400);

      final ids = HotelsFilterEngine.apply(
        defaults().copyWith(distancePlace: mall, maxDistanceKm: 3),
        [near, far],
      );

      expect(ids, ['near']);
    });

    test('ordena por distancia desde la plaza', () {
      // Plaza 24 de Septiembre en Santa Cruz.
      const plaza = PlaceReference(
        id: 'plaza',
        name: 'Plaza 24 de Septiembre',
        latitude: -17.7833,
        longitude: -63.1821,
      );
      final near = _hotel(
        id: 'near',
        latitude: -17.7840,
        longitude: -63.1830,
      );
      final far = _hotel(
        id: 'far',
        latitude: -17.8100,
        longitude: -63.2200,
      );

      final ids = HotelsFilterEngine.apply(
        defaults()
            .copyWith(sort: HotelSort.distanceFromPlaza, referencePlace: plaza),
        [far, near],
      );

      expect(ids, ['near', 'far']);
    });
  });

  group('HotelAvailability', () {
    test('misma noche da el mismo resultado (determinista)', () {
      final d = DateTime(2026, 8, 10);
      final r1 = HotelAvailability.bookedFraction('x', d, d.add(const Duration(days: 1)));
      final r2 = HotelAvailability.bookedFraction('x', d, d.add(const Duration(days: 1)));
      expect(r1, r2);
    });

    test('rango inválido devuelve 0', () {
      final f = HotelAvailability.bookedFraction('x', DateTime(2026, 8, 12), DateTime(2026, 8, 12));
      expect(f, 0);
    });

    test('isAvailableForRange con rango inválido es true', () {
      final hotel = Hotel(id: 'x', name: 'x');
      expect(
        HotelAvailability.isAvailableForRange(hotel, DateTime(2026, 8, 12), DateTime(2026, 8, 12)),
        isTrue,
      );
    });
  });

  group('HotelDistance', () {
    test('kmToMi / miToKm son inversos', () {
      expect(HotelDistance.kmToMi(HotelDistance.miToKm(10)), closeTo(10, 1e-9));
    });

    test('formato corto', () {
      expect(HotelDistance.formatKm(0.5), '500 m');
      expect(HotelDistance.formatKm(3.25), '3.3 km');
    });

    test('distancia entre dos puntos conocidos (~km)', () {
      // Santa Cruz (plaza) vs. Montero (aprox. 50 km al norte).
      final km = HotelDistance.calculateDistanceKm(
        lat1: -17.7833,
        lon1: -63.1821,
        lat2: -17.3400,
        lon2: -63.2500,
      );
      expect(km, closeTo(50, 6));
    });
  });
}
