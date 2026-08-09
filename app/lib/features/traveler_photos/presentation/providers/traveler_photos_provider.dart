import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/dio_provider.dart';
import '../../data/traveler_photos_service.dart';

enum TravelerPhotosStatus { initial, loading, loaded, error }

class TravelerPhotosState {
  final TravelerPhotosStatus status;
  final List<TravelerPhoto> photos;
  final String? errorMessage;

  const TravelerPhotosState({
    this.status = TravelerPhotosStatus.initial,
    this.photos = const [],
    this.errorMessage,
  });

  TravelerPhotosState copyWith({
    TravelerPhotosStatus? status,
    List<TravelerPhoto>? photos,
    String? errorMessage,
  }) {
    return TravelerPhotosState(
      status: status ?? this.status,
      photos: photos ?? this.photos,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}

final travelerPhotosServiceProvider = Provider<TravelerPhotosService>((ref) {
  return TravelerPhotosService(ref.read(dioProvider));
});

final travelerPhotosProvider =
    StateNotifierProvider.autoDispose<TravelerPhotosNotifier, TravelerPhotosState>(
        (ref) {
  final notifier = TravelerPhotosNotifier(ref.read(travelerPhotosServiceProvider));
  notifier.loadPhotos();
  return notifier;
});

class TravelerPhotosNotifier extends StateNotifier<TravelerPhotosState> {
  final TravelerPhotosService _service;

  TravelerPhotosNotifier(this._service) : super(const TravelerPhotosState());

  Future<void> loadPhotos() async {
    state = state.copyWith(status: TravelerPhotosStatus.loading, errorMessage: null);
    try {
      final photos = await _service.getPhotos(limit: 20);
      state = state.copyWith(status: TravelerPhotosStatus.loaded, photos: photos);
    } catch (e) {
      state = state.copyWith(
        status: TravelerPhotosStatus.error,
        errorMessage: 'No se pudieron cargar las fotos de viajeros.',
      );
    }
  }

  Future<void> refresh() async {
    try {
      final photos = await _service.getPhotos(limit: 20);
      state = state.copyWith(status: TravelerPhotosStatus.loaded, photos: photos);
    } catch (e) {
      state = state.copyWith(
        status: TravelerPhotosStatus.error,
        errorMessage: 'No se pudieron cargar las fotos de viajeros.',
      );
    }
  }

  void upsertPhoto(TravelerPhoto photo) {
    final exists = state.photos.any((p) => p.id == photo.id);
    final photos = exists
        ? state.photos.map((p) => p.id == photo.id ? photo : p).toList()
        : [photo, ...state.photos];
    state = state.copyWith(photos: photos);
  }

  TravelerPhoto? photoById(String id) {
    for (final p in state.photos) {
      if (p.id == id) return p;
    }
    return null;
  }

  Future<void> toggleLike(String photoId) async {
    final index = state.photos.indexWhere((p) => p.id == photoId);
    if (index < 0) return;

    final current = state.photos[index];
    final optimistic = current.copyWith(
      likedByUser: !current.likedByUser,
      likeCount: current.likeCount + (current.likedByUser ? -1 : 1),
    );
    state = state.copyWith(
      photos: [...state.photos]..[index] = optimistic,
    );

    try {
      final result = current.likedByUser
          ? await _service.removeLike(photoId)
          : await _service.toggleLike(photoId);
      final updated = current.copyWith(
        likedByUser: result.liked,
        likeCount: result.likeCount,
      );
      final photos = [...state.photos];
      final i = photos.indexWhere((p) => p.id == photoId);
      if (i >= 0) photos[i] = updated;
      state = state.copyWith(photos: photos);
    } catch (e) {
      final photos = [...state.photos];
      if (index < photos.length) photos[index] = current;
      state = state.copyWith(photos: photos);
    }
  }
}
