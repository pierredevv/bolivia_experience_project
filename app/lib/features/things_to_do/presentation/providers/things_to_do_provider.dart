import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/dio_provider.dart';
import '../../../home/data/home_experience.dart';
import '../../../home/data/home_service.dart';
import '../../../home/presentation/providers/home_provider.dart';
import '../../data/tour.dart';
import '../../data/tours_service.dart';

final toursServiceProvider = Provider<ToursService>((ref) {
  return ToursService(ref.read(dioProvider));
});

enum ThingsToDoStatus { initial, loading, loaded, error }

/// Tipo de filtro del top bar de "Cosas que hacer".
enum ThingsToDoFilterType { all, category, tours, oneDay, outdoor }

/// Filtro activo. `category` se usa cuando hay un slug de categoría (chips
/// con slug o categoría elegida desde "Más categorías"); los demás filtran
/// la lista de tours localmente.
class ThingsToDoFilter {
  final ThingsToDoFilterType type;
  final String? slug;
  final String? label;

  const ThingsToDoFilter({
    this.type = ThingsToDoFilterType.all,
    this.slug,
    this.label,
  });

  bool get isCategory => type == ThingsToDoFilterType.category;

  bool matches(ThingsToDoFilter other) {
    if (type != other.type) return false;
    if (type == ThingsToDoFilterType.category) return slug == other.slug;
    return true;
  }
}

/// Subcategorías de tours de la vista (orden fijo). `caminata_sin_guia` se
/// muestra siempre como "Próximamente", por eso no necesita productos.
const kTourSectionOrder = [
  ('naturaleza_vida_salvaje', 'Tours de Naturaleza y vida salvaje'),
  ('cultural_rural', 'Tours Culturales y Turismo Rural'),
  ('multi_dia', 'Tours y Excursiones de varios Días'),
  ('visita_privada', 'Tours y Visitas Turísticas Privadas'),
  ('recorrido_historico', 'Recorridos Históricos - Rutas de Historia'),
  ('caminata_turistica', 'Caminata Turística'),
  ('privada_lujo', 'Experiencia Privada y De Lujo'),
];

class ThingsToDoState {
  final ThingsToDoStatus status;
  final List<HomeExperience> experiences;
  final List<Tour> recommended;
  final List<Tour> tours;
  final List<dynamic> topAttractions;
  final ThingsToDoFilter filter;
  final List<Map<String, dynamic>> feedItems;
  final bool feedLoading;
  final String? errorMessage;

  const ThingsToDoState({
    this.status = ThingsToDoStatus.initial,
    this.experiences = const [],
    this.recommended = const [],
    this.tours = const [],
    this.topAttractions = const [],
    this.filter = const ThingsToDoFilter(),
    this.feedItems = const [],
    this.feedLoading = false,
    this.errorMessage,
  });

  ThingsToDoState copyWith({
    ThingsToDoStatus? status,
    List<HomeExperience>? experiences,
    List<Tour>? recommended,
    List<Tour>? tours,
    List<dynamic>? topAttractions,
    ThingsToDoFilter? filter,
    List<Map<String, dynamic>>? feedItems,
    bool? feedLoading,
    String? errorMessage,
  }) {
    return ThingsToDoState(
      status: status ?? this.status,
      experiences: experiences ?? this.experiences,
      recommended: recommended ?? this.recommended,
      tours: tours ?? this.tours,
      topAttractions: topAttractions ?? this.topAttractions,
      filter: filter ?? this.filter,
      feedItems: feedItems ?? this.feedItems,
      feedLoading: feedLoading ?? this.feedLoading,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  /// Tours de una subcategoría.
  List<Tour> toursOf(String subcategoria) =>
      tours.where((t) => t.subcategoriaTour == subcategoria).toList();

  /// Tours visibles con el filtro actual (tours / un día / aire libre).
  List<Tour> get filteredTours {
    switch (filter.type) {
      case ThingsToDoFilterType.tours:
        return tours;
      case ThingsToDoFilterType.oneDay:
        return tours
            .where((t) => (t.duracionDias ?? 1) == 1)
            .toList();
      case ThingsToDoFilterType.outdoor:
        return tours
            .where((t) =>
                t.subcategoriaTour == 'naturaleza_vida_salvaje' ||
                t.subcategoriaTour == 'caminata_turistica')
            .toList();
      case ThingsToDoFilterType.all:
      case ThingsToDoFilterType.category:
        return const [];
    }
  }

  /// Título de sección cuando hay un filtro activo distinto de "Todo".
  String get filterTitle {
    switch (filter.type) {
      case ThingsToDoFilterType.all:
        return '';
      case ThingsToDoFilterType.category:
        return filter.label ?? filter.slug ?? '';
      case ThingsToDoFilterType.tours:
        return 'Tours';
      case ThingsToDoFilterType.oneDay:
        return 'Excursiones de un día';
      case ThingsToDoFilterType.outdoor:
        return 'Actividades al Aire libre';
    }
  }
}

final thingsToDoProvider =
    StateNotifierProvider<ThingsToDoNotifier, ThingsToDoState>((ref) {
  return ThingsToDoNotifier(
    ref.read(toursServiceProvider),
    ref.read(homeServiceProvider),
  );
});

class ThingsToDoNotifier extends StateNotifier<ThingsToDoState> {
  final ToursService _toursService;
  final HomeService _homeService;

  ThingsToDoNotifier(this._toursService, this._homeService)
      : super(const ThingsToDoState());

  bool _loading = false;

  Future<void> load() async {
    if (_loading) return;
    _loading = true;
    if (!mounted) return;
    state = state.copyWith(status: ThingsToDoStatus.loading, errorMessage: null);
    try {
      final experiences = await _homeService.getHomeExperiences();
      final recommended = await _toursService.getRecommendedTours();
      final tours = await _toursService.getTours();
      final topAttractions = await _homeService.getFeaturedPlaces();
      if (!mounted) return;
      state = ThingsToDoState(
        status: ThingsToDoStatus.loaded,
        experiences: experiences,
        recommended: recommended,
        tours: tours,
        topAttractions: topAttractions,
      );
    } catch (e) {
      if (!mounted) return;
      state = state.copyWith(
        status: ThingsToDoStatus.error,
        errorMessage: e.toString(),
      );
    } finally {
      _loading = false;
    }
  }

  Future<void> refresh() => load();

  /// Cambia el filtro activo. Si es una categoría con slug, carga el feed
  /// de lugares de esa categoría; si no, solo actualiza el estado.
  Future<void> selectFilter(ThingsToDoFilter filter) async {
    if (!filter.isCategory || filter.slug == null || filter.slug!.isEmpty) {
      state = state.copyWith(filter: filter, feedItems: const []);
      return;
    }
    state = state.copyWith(
      filter: filter,
      feedItems: const [],
      feedLoading: true,
    );
    try {
      final items = await _toursService.getPlacesFeed(filter.slug);
      if (!mounted) return;
      state = state.copyWith(filter: filter, feedItems: items, feedLoading: false);
    } catch (e) {
      if (!mounted) return;
      state = state.copyWith(
        filter: filter,
        feedItems: const [],
        feedLoading: false,
        errorMessage: e.toString(),
      );
    }
  }

  /// Resetea al estado "Todo" (vista completa).
  void resetFilter() => state = state.copyWith(
        filter: const ThingsToDoFilter(),
        feedItems: const [],
        feedLoading: false,
      );
}
