import 'package:flutter_test/flutter_test.dart';
import 'package:bolivia_experience/features/hotels/data/hotel.dart';

void main() {
  group('Hotel.fromJson', () {
    test('parses a full hotels payload without throwing', () {
      final json = <String, dynamic>{
        'id': 'h1',
        'name': 'Hotel Buganvilia',
        'description': 'Hotel boutique.',
        'descriptionEn': 'Boutique hotel.',
        'address': 'Av. San Martín 789',
        'latitude': -17.7801,
        'longitude': -63.1789,
        'ratingAvg': 4.5,
        'ratingCount': 12,
        'specialFeature': 'El mejor de Bolivia',
        'category': {'id': 'c1', 'name': 'Hoteles', 'icon': 'hotel'},
        'photos': [
          {'id': 'p1', 'url': 'https://example.com/a.jpg'},
        ],
        'minPrice': 250,
        'maxCapacity': 4,
        'products': <Map<String, dynamic>>[
          {
            'id': 'prod1',
            'name': 'Habitación doble',
            'price': 250,
            'currency': 'BOB',
            'capacity': 2,
            'modalidadReserva': 'instantanea',
            'type': 'hospedaje',
            'caracteristicas': 'Cama king, balcón',
            'comodidades': ['wifi', 'desayuno'],
            'tipoPropiedad': 'hotel',
            'estrellas': 4,
            'textoPrecio': 'Precio por noche (incluye comisiones)',
            'cashbackActivo': true,
            'cashbackPorcentaje': 7,
            'premiado': false,
            'tieneOferta': true,
            'reembolsable': true,
            'pagoDiferido': false,
          },
        ],
      };

      final hotel = Hotel.fromJson(json);

      expect(hotel.id, 'h1');
      expect(hotel.name, 'Hotel Buganvilia');
      expect(hotel.latitude, -17.7801);
      expect(hotel.ratingAvgValue, 4.5);
      expect(hotel.ratingCount, 12);
      expect(hotel.minPrice, 250);
      expect(hotel.photoUrl, 'https://example.com/a.jpg');
      expect(hotel.products, hasLength(1));
      expect(hotel.bestProduct?.price, 250);
      expect(hotel.hasCashback, isTrue);
      expect(hotel.cashbackPorcentaje, 7);
      expect(hotel.tieneOferta, isTrue);
      expect(hotel.reembolsable, isTrue);
      expect(hotel.pagoDiferido, isFalse);
      expect(hotel.estrellas, 4);
      expect(hotel.tipoPropiedad, 'hotel');
      expect(hotel.allAmenities, containsAll(['wifi', 'desayuno']));
    });

    test('tolerates missing product fields', () {
      final json = <String, dynamic>{
        'id': 'h2',
        'name': 'Hostal Simple',
        'minPrice': 80,
        'products': <Map<String, dynamic>>[
          {'id': 'prod1', 'name': 'Cama compartida', 'price': 80},
        ],
      };

      final hotel = Hotel.fromJson(json);

      expect(hotel.id, 'h2');
      expect(hotel.products, hasLength(1));
      expect(hotel.bestProduct?.price, 80);
      expect(hotel.hasCashback, isFalse);
      expect(hotel.cashbackPorcentaje, isNull);
      expect(hotel.estrellas, isNull);
      expect(hotel.allAmenities, isEmpty);
    });

    test('no products => no bestProduct', () {
      final json = <String, dynamic>{'id': 'h3', 'name': 'Sin productos'};
      final hotel = Hotel.fromJson(json);
      expect(hotel.products, isEmpty);
      expect(hotel.bestProduct, isNull);
    });
  });

  group('PlaceReference.fromJson', () {
    test('parses coordinates as numbers or strings', () {
      final ref = PlaceReference.fromJson({
        'id': 'plaza',
        'name': 'Plaza 24 de Septiembre',
        'latitude': -17.7833,
        'longitude': '-63.1821',
      });

      expect(ref.latitude, closeTo(-17.7833, 1e-6));
      expect(ref.longitude, closeTo(-63.1821, 1e-6));
    });
  });
}
