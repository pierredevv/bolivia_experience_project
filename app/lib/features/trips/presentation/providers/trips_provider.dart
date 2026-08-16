import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../../core/network/dio_provider.dart';
import '../../data/trips_service.dart';

enum TripsStatus { initial, loading, loaded, error, creating }

class TripsState {
  final TripsStatus status;
  final List<dynamic> trips;
  final Map<String, dynamic>? selectedTrip;
  final bool isLoadingDetail;
  final bool isCreating;
  final bool isGenerating;
  final String? errorMessage;

  const TripsState({
    this.status = TripsStatus.initial,
    this.trips = const [],
    this.selectedTrip,
    this.isLoadingDetail = false,
    this.isCreating = false,
    this.isGenerating = false,
    this.errorMessage,
  });

  TripsState copyWith({
    TripsStatus? status,
    List<dynamic>? trips,
    Map<String, dynamic>? selectedTrip,
    bool? isLoadingDetail,
    bool? isCreating,
    bool? isGenerating,
    String? errorMessage,
  }) {
    return TripsState(
      status: status ?? this.status,
      trips: trips ?? this.trips,
      selectedTrip: selectedTrip ?? this.selectedTrip,
      isLoadingDetail: isLoadingDetail ?? this.isLoadingDetail,
      isCreating: isCreating ?? this.isCreating,
      isGenerating: isGenerating ?? this.isGenerating,
      errorMessage: errorMessage,
    );
  }
}

final tripsServiceProvider = Provider<TripsService>((ref) {
  final dio = ref.read(dioProvider);
  return TripsService(dio);
});

final tripsProvider = StateNotifierProvider<TripsNotifier, TripsState>((ref) {
  return TripsNotifier(ref.read(tripsServiceProvider));
});

class TripsNotifier extends StateNotifier<TripsState> {
  final TripsService _tripsService;

  TripsNotifier(this._tripsService) : super(const TripsState());

  Future<void> loadTrips() async {
    if (!mounted) return;
    state = state.copyWith(
      status: TripsStatus.loading,
      errorMessage: null,
    );

    try {
      final trips = await _tripsService.getTrips();
      if (!mounted) return;
      state = state.copyWith(
        status: TripsStatus.loaded,
        trips: trips,
      );
    } on DioException catch (e) {
      if (!mounted) return;
      String message = 'Error al cargar viajes';
      if (e.response != null) {
        final statusCode = e.response?.statusCode;
        if (statusCode == 401) {
          message = 'Sesion expirada. Inicia sesion nuevamente.';
        } else if (statusCode == 500) {
          message = 'Error del servidor. Intenta mas tarde.';
        }
      } else if (e.type == DioExceptionType.connectionError ||
          e.type == DioExceptionType.unknown) {
        message = 'Sin conexion a internet. Verifica tu red.';
      }
      state = state.copyWith(
        status: TripsStatus.error,
        errorMessage: message,
      );
    } catch (e) {
      if (!mounted) return;
      state = state.copyWith(
        status: TripsStatus.error,
        errorMessage: 'Error inesperado. Intenta de nuevo.',
      );
    }
  }

  Future<void> loadTripDetail(String id) async {
    if (!mounted) return;
    state = state.copyWith(isLoadingDetail: true);

    try {
      final trip = await _tripsService.getTripById(id);
      if (!mounted) return;
      state = state.copyWith(
        selectedTrip: trip,
        isLoadingDetail: false,
      );
    } on DioException catch (e) {
      if (!mounted) return;
      String message = 'Error al cargar el viaje';
      if (e.type == DioExceptionType.connectionError ||
          e.type == DioExceptionType.unknown) {
        message = 'Sin conexion a internet';
      }
      state = state.copyWith(
        isLoadingDetail: false,
        errorMessage: message,
      );
    } catch (e) {
      if (!mounted) return;
      state = state.copyWith(
        isLoadingDetail: false,
        errorMessage: 'Error inesperado',
      );
    }
  }

  Future<bool> createTrip({
    required String name,
    required String startDate,
    required String endDate,
    String? description,
    String? destination,
    String? budgetType,
  }) async {
    if (!mounted) return false;
    state = state.copyWith(isCreating: true, errorMessage: null);

    try {
      final trip = await _tripsService.createTrip(
        name: name,
        startDate: startDate,
        endDate: endDate,
        description: description,
        destination: destination,
        budgetType: budgetType,
      );
      if (!mounted) return false;
      state = state.copyWith(
        isCreating: false,
        trips: [trip, ...state.trips],
      );
      return true;
    } on DioException catch (e) {
      if (!mounted) return false;
      String message = 'Error al crear viaje';
      if (e.response != null) {
        final statusCode = e.response?.statusCode;
        if (statusCode == 401) {
          message = 'Sesion expirada';
        } else if (statusCode == 400) {
          message = 'Datos invalidos. Verifica la informacion.';
        } else if (statusCode == 500) {
          message = 'Error del servidor';
        }
      } else if (e.type == DioExceptionType.connectionError ||
          e.type == DioExceptionType.unknown) {
        message = 'Sin conexion a internet';
      }
      state = state.copyWith(
        isCreating: false,
        errorMessage: message,
      );
      return false;
    } catch (e) {
      if (!mounted) return false;
      state = state.copyWith(
        isCreating: false,
        errorMessage: 'Error inesperado',
      );
      return false;
    }
  }

  Future<void> deleteTrip(String id) async {
    try {
      await _tripsService.deleteTrip(id);
      if (!mounted) return;
      state = state.copyWith(
        trips: state.trips.where((t) => t['id'] != id).toList(),
      );
    } on DioException catch (_) {
      if (!mounted) return;
      state = state.copyWith(errorMessage: 'Error al eliminar viaje');
    } catch (_) {
      if (!mounted) return;
      state = state.copyWith(errorMessage: 'Error inesperado');
    }
  }

  Future<String?> generateItinerary(String tripId) async {
    if (!mounted) return null;
    state = state.copyWith(isGenerating: true, errorMessage: null);
    try {
      final trip = await _tripsService.generateItinerary(tripId);
      if (!mounted) return null;
      state = state.copyWith(
        isGenerating: false,
        selectedTrip: trip,
      );
      return null;
    } on DioException catch (e) {
      if (!mounted) return null;
      state = state.copyWith(isGenerating: false);
      String message = 'No se pudo generar el itinerario';
      if (e.response != null) {
        final statusCode = e.response?.statusCode;
        if (statusCode == 400) {
          message = 'No hay lugares disponibles para generar el itinerario';
        } else if (statusCode == 500) {
          message = 'Error del servidor. Intenta mas tarde.';
        }
      } else if (e.type == DioExceptionType.connectionError ||
          e.type == DioExceptionType.unknown) {
        message = 'Sin conexion a internet. Verifica tu red.';
      }
      return message;
    } catch (_) {
      if (!mounted) return null;
      state = state.copyWith(isGenerating: false);
      return 'Error inesperado. Intenta de nuevo.';
    }
  }
}
