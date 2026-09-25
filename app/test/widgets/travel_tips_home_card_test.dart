import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:bolivia_experience/features/travel_tips/presentation/widgets/travel_tips_home_card.dart';

void main() {
  group('TravelTipsHomeCard', () {
    testWidgets('builds without crashing', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: TravelTipsHomeCard(onTap: () {}),
          ),
        ),
      );

      expect(find.byType(TravelTipsHomeCard), findsOneWidget);
    });

    testWidgets('triggers onTap callback', (WidgetTester tester) async {
      var tapped = false;
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: TravelTipsHomeCard(onTap: () => tapped = true),
          ),
        ),
      );

      await tester.tap(find.byType(TravelTipsHomeCard));
      await tester.pump();

      expect(tapped, isTrue);
    });
  });
}
