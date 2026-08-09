import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../data/traveler_photos_service.dart';
import '../providers/traveler_photos_provider.dart';
import '../widgets/traveler_photos_carousel.dart' show brandDark, brandEmerald, borderSubtle, textSecondary;

class TravelerPhotosGridScreen extends ConsumerStatefulWidget {
  const TravelerPhotosGridScreen({super.key});

  @override
  ConsumerState<TravelerPhotosGridScreen> createState() =>
      _TravelerPhotosGridScreenState();
}

class _TravelerPhotosGridScreenState
    extends ConsumerState<TravelerPhotosGridScreen> {
  @override
  Widget build(BuildContext context) {
    final state = ref.watch(travelerPhotosProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFFAFAFA),
      appBar: AppBar(
        backgroundColor: const Color(0xFFFAFAFA),
        elevation: 0,
        title: const Text(
          'Fotos de Viajeros',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: brandDark,
          ),
        ),
        centerTitle: false,
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/traveler-photos/create'),
        backgroundColor: brandDark,
        foregroundColor: Colors.white,
        elevation: 3,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        icon: const Icon(Icons.add_a_photo_outlined, size: 20),
        label: const Text(
          'Subir tu foto',
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
        ),
      ),
      body: RefreshIndicator(
        color: brandEmerald,
        onRefresh: () => ref.read(travelerPhotosProvider.notifier).refresh(),
        child: _buildBody(context, state),
      ),
    );
  }

  Widget _buildBody(BuildContext context, TravelerPhotosState state) {
    if (state.status == TravelerPhotosStatus.loading && state.photos.isEmpty) {
      return GridView.builder(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
        gridDelegate: _gridDelegate(),
        itemCount: 8,
        itemBuilder: (_, __) => _GridSkeleton(),
      );
    }

    if (state.photos.isEmpty) {
      return LayoutBuilder(
        builder: (context, constraints) => SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: ConstrainedBox(
            constraints: BoxConstraints(minHeight: constraints.maxHeight),
            child: Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 72,
                      height: 72,
                      decoration: BoxDecoration(
                        color: borderSubtle,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Icon(Icons.photo_library_outlined,
                          size: 36, color: textSecondary),
                    ),
                    const SizedBox(height: 18),
                    const Text(
                      'No hay fotos aún',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: brandDark,
                      ),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Sé la primera persona en compartir tu experiencia',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 13, color: textSecondary),
                    ),
                    const SizedBox(height: 20),
                    ElevatedButton.icon(
                      onPressed: () => context.push('/traveler-photos/create'),
                      icon: const Icon(Icons.add_a_photo_outlined, size: 18),
                      label: const Text('Subir tu foto'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: brandDark,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      );
    }

    return GridView.builder(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
      gridDelegate: _gridDelegate(),
      itemCount: state.photos.length,
      itemBuilder: (context, index) {
        final photo = state.photos[index];
        return _GridCard(photo: photo);
      },
    );
  }

  SliverGridDelegateWithMaxCrossAxisExtent _gridDelegate() {
    return const SliverGridDelegateWithMaxCrossAxisExtent(
      maxCrossAxisExtent: 220,
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 0.85,
    );
  }
}

class _GridCard extends StatelessWidget {
  final TravelerPhoto photo;

  const _GridCard({required this.photo});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push('/traveler-photos/${photo.id}'),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: SizedBox(
                width: double.infinity,
                child: photo.imageUrl.isEmpty
                    ? Container(
                        color: borderSubtle,
                        child: const Center(
                          child: Icon(Icons.image_outlined,
                              color: textSecondary, size: 30),
                        ),
                      )
                    : Image.network(
                        photo.imageUrl,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Container(
                          color: borderSubtle,
                          child: const Center(
                            child: Icon(Icons.image_outlined,
                                color: textSecondary, size: 30),
                          ),
                        ),
                      ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(10, 9, 10, 10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    photo.title,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: brandDark,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 5),
                  Row(
                    children: [
                      const Icon(Icons.favorite_rounded,
                          size: 12, color: brandEmerald),
                      const SizedBox(width: 3),
                      Text(
                        '${photo.likeCount}',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: textSecondary,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          photo.author.name,
                          style: const TextStyle(
                              fontSize: 11, color: textSecondary),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _GridSkeleton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Container(
              color: borderSubtle.withValues(alpha: 0.5),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(10),
            child: Container(
              height: 10,
              decoration: BoxDecoration(
                color: borderSubtle,
                borderRadius: BorderRadius.circular(5),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
