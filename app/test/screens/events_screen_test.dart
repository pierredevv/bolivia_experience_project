import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mockito/mockito.dart';
import 'package:dio/dio.dart';
import 'package:bolivia_experience/features/events/presentation/screens/events_screen.dart';
import 'package:bolivia_experience/features/events/presentation/providers/events_provider.dart';
import 'package:bolivia_experience/core/network/dio_provider.dart';

class MockEventsNotifier extends StateNotifier<EventsState> implements EventsNotifier {
  MockEventsNotifier() : super(const EventsState());

  @override
  Future<void> loadEvents() async {}
}

class MockDio extends Mock implements Dio {}

class TestHttpOverrides extends HttpOverrides {
  @override
  HttpClient createHttpClient(SecurityContext? context) {
    return _FakeHttpClient();
  }
}

class _FakeHttpClient implements HttpClient {
  @override
  bool autoUncompress = true;
  @override
  Future<HttpClientRequest> getUrl(Uri url) async => _FakeHttpClientRequest();
  @override
  Future<HttpClientRequest> openUrl(String method, Uri url) async => _FakeHttpClientRequest();
  @override
  dynamic noSuchMethod(Invocation invocation) => null;
}

class _FakeHttpClientRequest implements HttpClientRequest {
  @override
  HttpHeaders get headers => _FakeHttpHeaders();
  @override
  Future<HttpClientResponse> close() async => _FakeHttpClientResponse();
  @override
  dynamic noSuchMethod(Invocation invocation) => null;
}

class _FakeHttpHeaders implements HttpHeaders {
  @override
  void add(String name, Object value, {bool preserveHeaderCase = false}) {}
  @override
  void set(String name, Object value, {bool preserveHeaderCase = false}) {}
  @override
  dynamic noSuchMethod(Invocation invocation) => null;
}

class _FakeHttpClientResponse implements HttpClientResponse {
  @override
  int get statusCode => 200;
  @override
  int get contentLength => 11;
  @override
  HttpClientResponseCompressionState get compressionState =>
      HttpClientResponseCompressionState.notCompressed;
  @override
  StreamSubscription<List<int>> listen(
    void Function(List<int>)? onData, {
    Function? onError,
    void Function()? onDone,
    bool? cancelOnError,
  }) {
    return Stream<List<int>>.fromIterable([
      utf8.encode('{"data":[]}')
    ]).listen(onData, onError: onError, onDone: onDone, cancelOnError: cancelOnError);
  }
  @override
  dynamic noSuchMethod(Invocation invocation) => null;
}

void main() {
  late MockEventsNotifier mockEventsNotifier;

  setUp(() {
    HttpOverrides.global = TestHttpOverrides();
    mockEventsNotifier = MockEventsNotifier();
  });

  tearDown(() {
    HttpOverrides.global = null;
  });

  Widget buildTestableEvents() {
    return MaterialApp(
      home: ProviderScope(
        overrides: [
          eventsProvider.overrideWith((ref) => mockEventsNotifier),
        ],
        child: const EventsScreen(),
      ),
    );
  }

  group('EventsScreen', () {
    testWidgets('renders filter chips', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestableEvents());
      await tester.pump(const Duration(seconds: 1));

      expect(find.byType(FilterChip), findsNWidgets(2));
      expect(find.text('Todos'), findsOneWidget);
      expect(find.text('Hoy'), findsOneWidget);
    });

    testWidgets('shows empty state when no events', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestableEvents());
      await tester.pumpAndSettle();

      expect(find.byIcon(Icons.event_outlined), findsOneWidget);
    });

    testWidgets('filter chip Hoy is selectable', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestableEvents());
      await tester.pump(const Duration(seconds: 1));

      await tester.tap(find.text('Hoy'));
      await tester.pump();

      final hoyChip = tester.widget<FilterChip>(find.byWidgetPredicate(
        (widget) => widget is FilterChip && (widget.label as Text).data == 'Hoy',
      ));
      expect(hoyChip.selected, true);
    });

    testWidgets('filter chip Todos is selectable', (WidgetTester tester) async {
      await tester.pumpWidget(buildTestableEvents());
      await tester.pump(const Duration(seconds: 1));

      await tester.tap(find.text('Hoy'));
      await tester.pump();
      await tester.tap(find.text('Todos'));
      await tester.pump();

      final todosChip = tester.widget<FilterChip>(find.byWidgetPredicate(
        (widget) => widget is FilterChip && (widget.label as Text).data == 'Todos',
      ));
      expect(todosChip.selected, true);
    });
  });
}
