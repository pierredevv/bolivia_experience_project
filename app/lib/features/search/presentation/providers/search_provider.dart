import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../../core/network/dio_provider.dart';
import '../../data/search_service.dart';

enum SearchStatus { initial, loading, loaded, error }

class SearchState {
  final SearchStatus status;
  final List<dynamic> results;
  final List<dynamic> suggestions;
  final List<dynamic> searchHistory;
  final String? errorMessage;
  final String query;
  final bool showSuggestions;

  const SearchState({
    this.status = SearchStatus.initial,
    this.results = const [],
    this.suggestions = const [],
    this.searchHistory = const [],
    this.errorMessage,
    this.query = '',
    this.showSuggestions = false,
  });

  SearchState copyWith({
    SearchStatus? status,
    List<dynamic>? results,
    List<dynamic>? suggestions,
    List<dynamic>? searchHistory,
    String? errorMessage,
    String? query,
    bool? showSuggestions,
  }) {
    return SearchState(
      status: status ?? this.status,
      results: results ?? this.results,
      suggestions: suggestions ?? this.suggestions,
      searchHistory: searchHistory ?? this.searchHistory,
      errorMessage: errorMessage,
      query: query ?? this.query,
      showSuggestions: showSuggestions ?? this.showSuggestions,
    );
  }
}

final searchServiceProvider = Provider<SearchService>((ref) {
  final dio = ref.read(dioProvider);
  return SearchService(dio);
});

final searchProvider = StateNotifierProvider<SearchNotifier, SearchState>((ref) {
  return SearchNotifier(ref.read(searchServiceProvider));
});

class SearchNotifier extends StateNotifier<SearchState> {
  final SearchService _searchService;
  Timer? _suggestionsDebounce;
  Timer? _searchDebounce;

  SearchNotifier(this._searchService) : super(const SearchState());

  @override
  void dispose() {
    _suggestionsDebounce?.cancel();
    _searchDebounce?.cancel();
    super.dispose();
  }

  void updateQuery(String query) {
    state = state.copyWith(query: query);

    _suggestionsDebounce?.cancel();
    _searchDebounce?.cancel();

    if (query.length >= 2) {
      _suggestionsDebounce = Timer(const Duration(milliseconds: 300), () {
        getSuggestions(query);
      });
      _searchDebounce = Timer(const Duration(milliseconds: 500), () {
        search(query);
      });
    } else {
      state = state.copyWith(
        results: [],
        suggestions: [],
        showSuggestions: false,
      );
    }
  }

  Future<void> search(String query) async {
    if (!mounted) return;
    if (query.isEmpty) {
      state = state.copyWith(results: [], status: SearchStatus.initial, showSuggestions: false);
      return;
    }

    state = state.copyWith(status: SearchStatus.loading, showSuggestions: false);

    try {
      final results = await _searchService.search(query: query);
      if (!mounted) return;
      state = state.copyWith(
        status: SearchStatus.loaded,
        results: results,
      );
    } on DioException catch (e) {
      if (!mounted) return;
      String message = 'Error al buscar';
      if (e.response != null) {
        final statusCode = e.response?.statusCode;
        if (statusCode == 401) {
          message = 'Sesión expirada. Iniciá sesión nuevamente.';
        } else if (statusCode == 500) {
          message = 'Error del servidor. Intentá más tarde.';
        }
      } else if (e.type == DioExceptionType.connectionError ||
          e.type == DioExceptionType.unknown) {
        message = 'Sin conexión a internet. Verificá tu red.';
      }
      state = state.copyWith(
        status: SearchStatus.error,
        errorMessage: message,
      );
    } catch (e) {
      if (!mounted) return;
      state = state.copyWith(
        status: SearchStatus.error,
        errorMessage: 'Error inesperado. Intentá de nuevo.',
      );
    }
  }

  Future<void> getSuggestions(String query) async {
    if (query.isEmpty) {
      state = state.copyWith(suggestions: [], showSuggestions: false);
      return;
    }

    try {
      final suggestions = await _searchService.getSuggestions(query: query);
      if (!mounted) return;
      state = state.copyWith(
        suggestions: suggestions,
        showSuggestions: suggestions.isNotEmpty,
      );
    } catch (e) {
      // Silently fail for suggestions
    }
  }

  Future<void> loadSearchHistory() async {
    try {
      final history = await _searchService.getSearchHistory();
      state = state.copyWith(searchHistory: history);
    } catch (e) {
      // Silently fail for history
    }
  }

  void hideSuggestions() {
    state = state.copyWith(showSuggestions: false);
  }

  void clearSearch() {
    _suggestionsDebounce?.cancel();
    _searchDebounce?.cancel();
    state = const SearchState();
  }
}
