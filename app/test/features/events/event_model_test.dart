import 'package:flutter_test/flutter_test.dart';
import 'package:bolivia_experience/features/events/data/events_service.dart';

void main() {
  group('Event', () {
    test('fromJson parses complete event', () {
      final json = {
        'id': 'evt123',
        'name': 'Feria Exposición',
        'description': 'La feria más importante',
        'dateStart': '2026-09-15',
        'dateEnd': '2026-09-28',
        'location': 'Fexpocruz',
        'latitude': -17.7833,
        'longitude': -63.1833,
        'photoUrl': 'https://example.com/photo.jpg',
        'category': 'Feria',
      };

      final event = Event.fromJson(json);

      expect(event.id, 'evt123');
      expect(event.name, 'Feria Exposición');
      expect(event.description, 'La feria más importante');
      expect(event.dateStart, '2026-09-15');
      expect(event.dateEnd, '2026-09-28');
      expect(event.location, 'Fexpocruz');
      expect(event.latitude, -17.7833);
      expect(event.longitude, -63.1833);
      expect(event.photoUrl, 'https://example.com/photo.jpg');
      expect(event.category, 'Feria');
    });

    test('fromJson handles null optional fields', () {
      final json = {
        'id': 'evt456',
        'name': 'Evento sin detalle',
      };

      final event = Event.fromJson(json);

      expect(event.id, 'evt456');
      expect(event.name, 'Evento sin detalle');
      expect(event.description, isNull);
      expect(event.dateStart, isNull);
      expect(event.dateEnd, isNull);
      expect(event.location, isNull);
      expect(event.latitude, isNull);
      expect(event.longitude, isNull);
      expect(event.photoUrl, isNull);
      expect(event.category, isNull);
    });

    test('fromJson handles latitude as string', () {
      final json = {
        'id': 'evt789',
        'name': 'Test',
        'latitude': '-17.7833',
        'longitude': '-63.1833',
      };

      final event = Event.fromJson(json);

      expect(event.latitude, -17.7833);
      expect(event.longitude, -63.1833);
    });
  });
}
