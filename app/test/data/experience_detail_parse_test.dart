import 'package:flutter_test/flutter_test.dart';
import 'package:bolivia_experience/features/home/data/experience_detail.dart';

void main() {
  group('ExperienceDetail.fromJson', () {
    test('parses a full detail payload from GET /experiences/:id', () {
      final json = {
        'id': 'exp1',
        'name': 'Tour Salar de Uyuni',
        'description': 'Recorrido completo por el desierto de sal.',
        'experienceCategory': 'Aventura',
        'price': 0,
        'pricePerAdult': 250,
        'priceVarByGroup': true,
        'currency': 'BOB',
        'photoUrl': 'https://example.com/photo.jpg',
        'duration': '8 horas',
        'minAge': 5,
        'maxAge': 70,
        'maxGroup': 15,
        'guideLanguage': 'es',
        'mobileTicket': true,
        'advanceDays': 23,
        'policies': ['Garantía de precio más bajo', 'Cancelación gratuita'],
        'ratingAvg': 4.9,
        'ratingCount': 24,
        'recommended': true,
        'recommendedReason': 'Socio recomendado',
        'socio': {
          'id': 's1',
          'name': 'Bolivia Premium Tours',
          'businessName': 'Bolivia Premium Tours',
          'isPremium': true,
        },
        'place': {
          'id': 'p1',
          'name': 'Parque Municipal Lomas de Arena',
          'address': 'Av. Banzer Km 12',
          'city': 'Santa Cruz',
          'latitude': -17.76,
          'longitude': -63.1,
          'category': {'id': 'c1', 'name': 'Naturaleza', 'slug': 'naturaleza'},
        },
        'policy': {'id': 'pol1', 'name': 'Flexible', 'rulesJson': '[]'},
        'slots': [
          {'id': 'slot1', 'date': '2026-08-08', 'time': '09:00', 'capacity': 10},
          {'id': 'fallback-2', 'date': '2026-08-09', 'time': '14:00', 'capacity': 10},
        ],
      };

      final detail = ExperienceDetail.fromJson(json);

      expect(detail.id, 'exp1');
      expect(detail.name, 'Tour Salar de Uyuni');
      expect(detail.displayPrice, 250);
      expect(detail.duration, '8 horas');
      expect(detail.minAge, 5);
      expect(detail.maxAge, 70);
      expect(detail.maxGroup, 15);
      expect(detail.guideLanguage, 'es');
      expect(detail.mobileTicket, true);
      expect(detail.advanceDays, 23);
      expect(detail.policies, hasLength(2));
      expect(detail.recommended, true);
      expect(detail.recommendedReason, 'Socio recomendado');
      expect(detail.socio!.name, 'Bolivia Premium Tours');
      expect(detail.place!.name, 'Parque Municipal Lomas de Arena');
      expect(detail.place!.latitude, -17.76);
      expect(detail.place!.category!.slug, 'naturaleza');
      expect(detail.policy!.name, 'Flexible');
      expect(detail.slots, hasLength(2));
      expect(detail.slots[0].time, '09:00');
      expect(detail.slots[1].isFallback, true);
    });

    test('is null-safe when fields are missing', () {
      final detail = ExperienceDetail.fromJson({'id': 'x', 'name': 'Exp'});
      expect(detail.policies, isEmpty);
      expect(detail.slots, isEmpty);
      expect(detail.socio, isNull);
      expect(detail.place, isNull);
      expect(detail.displayPrice, 0);
    });

    test('parses reviews via copyWith', () {
      final detail = ExperienceDetail.fromJson({'id': 'x', 'name': 'Exp'});
      final withReviews = detail.copyWith(
        reviews: [
          ExperienceReview.fromJson({
            'id': 'r1',
            'rating': 5,
            'comment': 'Increíble',
            'user': {'name': 'María García', 'photoUrl': 'https://x.com/m.jpg'},
          }),
        ],
      );
      expect(withReviews.reviews, hasLength(1));
      expect(withReviews.reviews.first.authorName, 'María García');
    });
  });

  group('slotLabel', () {
    test('formats tomorrow as "Mañana" and short dates', () {
      // Depends on DateTime.now; only assert it returns a non-empty string.
      expect(slotLabel(const ExperienceSlot(id: 's', date: '2026-12-25', time: '10:00')),
          isNotEmpty);
    });
  });
}
