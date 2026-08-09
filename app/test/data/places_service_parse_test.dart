import 'package:flutter_test/flutter_test.dart';
import 'package:bolivia_experience/features/places/data/places_service.dart';

void main() {
  group('Place.fromJson', () {
    test('parses a full detail payload (hotel) without throwing', () {
      final json = <String, dynamic>{
        'id': 'cmsjioz86000kzkjv0v45dlf9',
        'name': 'Hotel Buganvilia',
        'description': 'Hotel boutique.',
        'descriptionEn': 'Boutique hotel.',
        'address': 'Av. San Martín 789',
        'latitude': -17.7801,
        'longitude': -63.1789,
        'ratingAvg': 5,
        'ratingCount': 1,
        'category': {'id': 'c1', 'name': 'Hoteles', 'icon': 'hotel'},
        'photos': [
          {'id': 'p1', 'url': 'https://example.com/a.jpg'},
        ],
        'phone': '+591 3 342 0000',
        'website': 'https://hotelbuganvilia.com.bo',
        'isFeatured': true,
        'isActive': true,
        'priceLevel': 4,
        'canReserve': false,
        'products': <Map<String, dynamic>>[],
      };

      final place = Place.fromJson(json);

      expect(place.id, 'cmsjioz86000kzkjv0v45dlf9');
      expect(place.name, 'Hotel Buganvilia');
      expect(place.ratingAvg, 5);
      expect(place.ratingCount, 1);
      expect(place.category?['name'], 'Hoteles');
      expect(place.photos, isNotNull);
      expect(place.canReserve, isFalse);
    });

    test('parses a detail payload with reservable products', () {
      final json = <String, dynamic>{
        'id': 'cmsjiozgh000mzkjva2dku9cw',
        'name': 'Parque Municipal Lomas de Arena',
        'ratingAvg': 4.8,
        'ratingCount': 3,
        'category': {'id': 'c2', 'name': 'Naturaleza', 'icon': 'tree'},
        'photos': <Map<String, dynamic>>[],
        'canReserve': true,
        'products': [
          {
            'id': 'prod1',
            'name': 'Senderismo Lomas de Arena',
            'description': 'Ruta guiada.',
            'price': 45,
            'currency': 'BOB',
            'capacity': null,
            'modalidadReserva': 'instantanea',
            'type': 'experiencia',
          },
        ],
      };

      final place = Place.fromJson(json);

      expect(place.canReserve, isTrue);
      expect(place.products, hasLength(1));
      expect(place.products.first.price, 45);
      expect(place.products.first.isInstantanea, isTrue);
    });

    test('is null-safe when fields are missing', () {
      final place = Place.fromJson(const <String, dynamic>{});
      expect(place.id, '');
      expect(place.name, '');
      expect(place.ratingAvg, 0);
      expect(place.ratingCount, 0);
      expect(place.products, isEmpty);
    });
  });
}
