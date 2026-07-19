import 'package:flutter_test/flutter_test.dart';
import 'package:bolivia_experience/features/notifications/data/notification_service.dart';

void main() {
  group('AppNotification', () {
    test('fromJson parses complete notification', () {
      final json = {
        'id': 'notif123',
        'title': 'Nueva promoción',
        'body': '20% de descuento en Restaurant A',
        'type': 'promotion',
        'data': {'placeId': 'p1'},
        'isRead': false,
        'createdAt': '2026-07-18T10:30:00.000Z',
      };

      final notif = AppNotification.fromJson(json);

      expect(notif.id, 'notif123');
      expect(notif.title, 'Nueva promoción');
      expect(notif.body, '20% de descuento en Restaurant A');
      expect(notif.type, 'promotion');
      expect(notif.data, isNotNull);
      expect(notif.data!['placeId'], 'p1');
      expect(notif.isRead, false);
      expect(notif.createdAt, isNotNull);
    });

    test('fromJson handles null optional fields', () {
      final json = {
        'id': 'notif456',
        'title': 'Test',
        'body': 'Body',
      };

      final notif = AppNotification.fromJson(json);

      expect(notif.id, 'notif456');
      expect(notif.type, isNull);
      expect(notif.data, isNull);
      expect(notif.isRead, false);
      expect(notif.createdAt, isNull);
    });

    test('fromJson defaults isRead to false', () {
      final json = {
        'id': 'notif789',
        'title': 'Test',
        'body': 'Body',
      };

      final notif = AppNotification.fromJson(json);
      expect(notif.isRead, false);
    });
  });
}
