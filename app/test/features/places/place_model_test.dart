import 'package:flutter_test/flutter_test.dart';
import 'package:bolivia_experience/features/places/data/places_service.dart';

void main() {
  group('Place', () {
    test('fromJson parses complete place', () {
      final json = {
        'id': 'place123',
        'name': 'Restaurante Sol',
        'description': 'Comida típica',
        'address': 'Av. Principal 123',
        'latitude': -17.7833,
        'longitude': -63.1833,
        'ratingAvg': 4.5,
        'ratingCount': 120,
        'category': {'id': 'c1', 'name': 'Restaurantes'},
        'photos': [{'url': 'https://example.com/photo.jpg'}],
        'hours': [
          {'dayOfWeek': 0, 'openTime': '11:00', 'closeTime': '23:00', 'isClosed': false},
        ],
        'phone': '+591 3 123456',
        'website': 'https://example.com',
        'isFeatured': true,
        'isActive': true,
      };

      final place = Place.fromJson(json);

      expect(place.id, 'place123');
      expect(place.name, 'Restaurante Sol');
      expect(place.description, 'Comida típica');
      expect(place.address, 'Av. Principal 123');
      expect(place.latitude, -17.7833);
      expect(place.longitude, -63.1833);
      expect(place.ratingAvg, 4.5);
      expect(place.ratingCount, 120);
      expect(place.category, isNotNull);
      expect(place.category!['name'], 'Restaurantes');
      expect(place.photos, isNotNull);
      expect(place.photos!.length, 1);
      expect(place.hours, isNotNull);
      expect(place.hours!.length, 1);
      expect(place.phone, '+591 3 123456');
      expect(place.website, 'https://example.com');
      expect(place.isFeatured, true);
      expect(place.isActive, true);
    });

    test('fromJson handles null optional fields', () {
      final json = {
        'id': 'place456',
        'name': 'Lugar Básico',
      };

      final place = Place.fromJson(json);

      expect(place.id, 'place456');
      expect(place.name, 'Lugar Básico');
      expect(place.description, isNull);
      expect(place.address, isNull);
      expect(place.latitude, isNull);
      expect(place.longitude, isNull);
      expect(place.category, isNull);
      expect(place.photos, isNull);
      expect(place.hours, isNull);
      expect(place.phone, isNull);
      expect(place.website, isNull);
      expect(place.isFeatured, isNull);
      expect(place.isActive, isNull);
    });
  });

  group('PaginatedResponse', () {
    test('stores pagination data correctly', () {
      final response = PaginatedResponse<Place>(
        data: [],
        total: 50,
        page: 2,
        perPage: 10,
        totalPages: 5,
        hasNext: true,
        hasPrevious: true,
      );

      expect(response.data, isEmpty);
      expect(response.total, 50);
      expect(response.page, 2);
      expect(response.perPage, 10);
      expect(response.totalPages, 5);
      expect(response.hasNext, true);
      expect(response.hasPrevious, true);
    });
  });
}
