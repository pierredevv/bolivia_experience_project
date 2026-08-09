import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../data/traveler_photos_service.dart';
import '../providers/traveler_photos_provider.dart';
import '../widgets/traveler_photos_carousel.dart' show brandDark, brandEmerald, textSecondary;

class TravelerPhotoDetailScreen extends ConsumerStatefulWidget {
  final String photoId;
  final TravelerPhoto? initialPhoto;

  const TravelerPhotoDetailScreen({
    super.key,
    required this.photoId,
    this.initialPhoto,
  });

  @override
  ConsumerState<TravelerPhotoDetailScreen> createState() =>
      _TravelerPhotoDetailScreenState();
}

class _TravelerPhotoDetailScreenState
    extends ConsumerState<TravelerPhotoDetailScreen> {
  bool _likeBusy = false;

  @override
  void initState() {
    super.initState();
    final notifier = ref.read(travelerPhotosProvider.notifier);
    final existing = notifier.photoById(widget.photoId);
    if (existing == null && widget.initialPhoto != null) {
      notifier.upsertPhoto(widget.initialPhoto!);
    }
    if (notifier.photoById(widget.photoId) == null) {
      _fetchDetail();
    }
  }

  Future<void> _fetchDetail() async {
    try {
      final service = ref.read(travelerPhotosServiceProvider);
      final photo = await service.getPhoto(widget.photoId);
      if (mounted) {
        ref.read(travelerPhotosProvider.notifier).upsertPhoto(photo);
      }
    } catch (_) {
      // Mantiene el estado actual; si no hay foto, se muestra fallback.
    }
  }

  Future<void> _toggleLike(TravelerPhoto photo) async {
    if (_likeBusy) return;
    setState(() => _likeBusy = true);
    await ref.read(travelerPhotosProvider.notifier).toggleLike(photo.id);
    if (mounted) setState(() => _likeBusy = false);
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(travelerPhotosProvider);
    final photo = state.photos
        .where((p) => p.id == widget.photoId)
        .cast<TravelerPhoto?>()
        .firstOrNull;

    if (photo == null) {
      return const Scaffold(
        backgroundColor: Color(0xFFFAFAFA),
        body: Center(
          child: CircularProgressIndicator(
            color: brandEmerald,
            strokeWidth: 2.5,
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // ── Hero image ──────────────────────────────────────────────
          Positioned.fill(
            child: photo.imageUrl.isEmpty
                ? Container(color: brandDark)
                : Image.network(
                    photo.imageUrl,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      color: brandDark,
                      child: const Center(
                        child: Icon(Icons.image_outlined,
                            color: Colors.white54, size: 48),
                      ),
                    ),
                  ),
          ),
          // ── Gradient overlay for readability ────────────────────────
          Positioned.fill(
            child: DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.black.withValues(alpha: 0.35),
                    Colors.transparent,
                    Colors.black.withValues(alpha: 0.75),
                  ],
                  stops: const [0.0, 0.4, 1.0],
                ),
              ),
            ),
          ),
          // ── Back button ─────────────────────────────────────────────
          SafeArea(
            child: Align(
              alignment: Alignment.topLeft,
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: _GlassCircle(
                  icon: Icons.arrow_back,
                  onTap: () => Navigator.of(context).maybePop(),
                ),
              ),
            ),
          ),
          // ── Like floating button (top right) ────────────────────────
          SafeArea(
            child: Align(
              alignment: Alignment.topRight,
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: _LikePill(
                  liked: photo.likedByUser,
                  likeCount: photo.likeCount,
                  onTap: () => _toggleLike(photo),
                ),
              ),
            ),
          ),
          // ── Info panel at bottom ────────────────────────────────────
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: Container(
              padding: const EdgeInsets.fromLTRB(24, 20, 24, 32),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(
                  top: Radius.circular(28),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Title + author row
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          photo.title,
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w700,
                            color: brandDark,
                            letterSpacing: -0.3,
                            height: 1.25,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  if (photo.description != null &&
                      photo.description!.isNotEmpty) ...[
                    Text(
                      photo.description!,
                      style: const TextStyle(
                        fontSize: 14,
                        color: textSecondary,
                        height: 1.5,
                      ),
                    ),
                    const SizedBox(height: 18),
                  ],
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      _authorAvatar(photo.author),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              photo.author.name,
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: brandDark,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            if (photo.author.country != null &&
                                photo.author.country!.isNotEmpty)
                              Text(
                                photo.author.country!,
                                style: const TextStyle(
                                    fontSize: 12, color: textSecondary),
                              ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      if (photo.createdAt != null)
                        Text(
                          _formatDate(photo.createdAt!),
                          style: const TextStyle(
                              fontSize: 12, color: textSecondary),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _authorAvatar(TravelerPhotoAuthor author) {
    final url = author.photoUrl;
    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: brandEmerald, width: 2),
        color: brandDark,
      ),
      clipBehavior: Clip.antiAlias,
      child: url != null && url.isNotEmpty
          ? Image.network(
              url,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) =>
                  const Icon(Icons.person, color: Colors.white, size: 20),
            )
          : const Icon(Icons.person, color: Colors.white, size: 20),
    );
  }

  String _formatDate(DateTime date) {
    return DateFormat('dd MMM yyyy', 'es').format(date.toLocal());
  }
}

class _GlassCircle extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;

  const _GlassCircle({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 42,
        height: 42,
        decoration: BoxDecoration(
          color: Colors.black.withValues(alpha: 0.35),
          shape: BoxShape.circle,
          border: Border.all(color: Colors.white.withValues(alpha: 0.25)),
        ),
        child: Icon(icon, color: Colors.white, size: 22),
      ),
    );
  }
}

class _LikePill extends StatelessWidget {
  final bool liked;
  final int likeCount;
  final VoidCallback onTap;

  const _LikePill({
    required this.liked,
    required this.likeCount,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
        decoration: BoxDecoration(
          color: Colors.black.withValues(alpha: 0.35),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: Colors.white.withValues(alpha: 0.25)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              liked ? Icons.favorite_rounded : Icons.favorite_border,
              size: 18,
              color: liked ? const Color(0xFFF43F5E) : Colors.white,
            ),
            const SizedBox(width: 6),
            Text(
              '$likeCount',
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
