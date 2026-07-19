import 'package:flutter_test/flutter_test.dart';
import 'package:bolivia_experience/features/promotions/data/promotion_service.dart';

void main() {
  group('Promotion', () {
    test('fromJson parses complete promotion', () {
      final json = {
        'id': 'promo123',
        'title': '20% en comidas',
        'description': 'Descuento especial',
        'photoUrl': 'https://example.com/promo.jpg',
        'discountPercentage': 20.0,
        'startDate': '2026-07-01',
        'endDate': '2026-07-31',
        'place': {'id': 'p1', 'name': 'Restaurante A'},
      };

      final promo = Promotion.fromJson(json);

      expect(promo.id, 'promo123');
      expect(promo.title, '20% en comidas');
      expect(promo.description, 'Descuento especial');
      expect(promo.photoUrl, 'https://example.com/promo.jpg');
      expect(promo.discountPercentage, 20.0);
      expect(promo.startDate, '2026-07-01');
      expect(promo.endDate, '2026-07-31');
      expect(promo.place, isNotNull);
      expect(promo.place!['name'], 'Restaurante A');
    });

    test('fromJson handles null optional fields', () {
      final json = {
        'id': 'promo456',
        'title': 'Oferta básica',
      };

      final promo = Promotion.fromJson(json);

      expect(promo.id, 'promo456');
      expect(promo.title, 'Oferta básica');
      expect(promo.description, isNull);
      expect(promo.photoUrl, isNull);
      expect(promo.discountPercentage, isNull);
      expect(promo.startDate, isNull);
      expect(promo.endDate, isNull);
      expect(promo.place, isNull);
    });

    test('fromJson handles discountPercentage as int', () {
      final json = {
        'id': 'promo789',
        'title': 'Test',
        'discountPercentage': 15,
      };

      final promo = Promotion.fromJson(json);
      expect(promo.discountPercentage, 15.0);
    });
  });
}
