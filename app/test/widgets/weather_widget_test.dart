import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:bolivia_experience/features/weather/presentation/widgets/weather_widget.dart';

void main() {
  group('WeatherWidget', () {
    testWidgets('builds without crashing', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(body: WeatherWidget()),
        ),
      );

      expect(find.byType(WeatherWidget), findsOneWidget);
    });

    testWidgets('builds with showForecast parameter', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(body: WeatherWidget(showForecast: true)),
        ),
      );

      expect(find.byType(WeatherWidget), findsOneWidget);
    });
  });
}
