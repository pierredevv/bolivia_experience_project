import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../data/traveler_photos_service.dart';

const brandDark = Color(0xFF0F172A);
const brandEmerald = Color(0xFF10B981);
const brandGold = Color(0xFFF59E0B);
const borderSubtle = Color(0xFFE2E8F0);
const textSecondary = Color(0xFF64748B);

class TravelerPhotosCarousel extends StatelessWidget {
  final List<TravelerPhoto> photos;
  final bool loading;

  const TravelerPhotosCarousel({
    super.key,
    required this.photos,
    this.loading = false,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Fotos de Viajeros',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: brandDark,
                letterSpacing: -0.2,
              ),
            ),
            GestureDetector(
              onTap: () => context.push('/traveler-photos'),
              child: const Text(
                'Ver todos',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: brandEmerald,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),
        if (loading)
          SizedBox(
            height: 220,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: 3,
              itemBuilder: (_, __) => const _CarouselSkeleton(),
            ),
          )
        else if (photos.isEmpty)
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: borderSubtle),
            ),
            child: const Row(
              children: [
                Icon(Icons.photo_library_outlined,
                    color: textSecondary, size: 28),
                SizedBox(width: 14),
                Expanded(
                  child: Text(
                    'Aún no hay fotos de viajeros. ¡Sé la primera persona en compartir!',
                    style: TextStyle(
                        fontSize: 13, color: textSecondary, height: 1.4),
                  ),
                ),
              ],
            ),
          )
        else
          SizedBox(
            height: 220,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: photos.length,
              itemBuilder: (context, index) {
                final photo = photos[index];
                return _CarouselCard(photo: photo);
              },
            ),
          ),
      ],
    );
  }
}

class _CarouselCard extends StatelessWidget {
  final TravelerPhoto photo;

  const _CarouselCard({required this.photo});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push('/traveler-photos/${photo.id}'),
      child: Container(
        width: 230,
        margin: const EdgeInsets.only(right: 14),
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
                child: _photoImage(),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    photo.title,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: brandDark,
                      letterSpacing: -0.1,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      _authorAvatar(size: 18),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          _authorLabel(),
                          style: const TextStyle(
                              fontSize: 11, color: textSecondary),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 6),
                      const Icon(Icons.favorite_rounded,
                          size: 13, color: brandGold),
                      const SizedBox(width: 3),
                      Text(
                        '${photo.likeCount}',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: brandDark,
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

  Widget _photoImage() {
    return photo.imageUrl.isEmpty
        ? Container(
            color: borderSubtle,
            child: const Center(
              child: Icon(Icons.image_outlined,
                  color: textSecondary, size: 32),
            ),
          )
        : Image.network(
            photo.imageUrl,
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => Container(
              color: borderSubtle,
              child: const Center(
                child:
                    Icon(Icons.image_outlined, color: textSecondary, size: 32),
              ),
            ),
          );
  }

  Widget _authorAvatar({double size = 18}) {
    final url = photo.author.photoUrl;
    return ClipOval(
      child: SizedBox(
        width: size,
        height: size,
        child: url != null && url.isNotEmpty
            ? Image.network(
                url,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => _fallbackAvatar(size),
              )
            : _fallbackAvatar(size),
      ),
    );
  }

  Widget _fallbackAvatar(double size) {
    return Container(
      color: brandDark,
      child: Icon(Icons.person, size: size * 0.7, color: Colors.white),
    );
  }

  String _authorLabel() {
    final name = photo.author.name;
    final country = photo.author.country;
    if (country != null && country.isNotEmpty) {
      return 'By $name · $country';
    }
    return 'By $name';
  }
}

class _CarouselSkeleton extends StatelessWidget {
  const _CarouselSkeleton();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 230,
      margin: const EdgeInsets.only(right: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
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
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 140,
                  height: 12,
                  decoration: BoxDecoration(
                    color: borderSubtle,
                    borderRadius: BorderRadius.circular(6),
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  width: 110,
                  height: 10,
                  decoration: BoxDecoration(
                    color: borderSubtle,
                    borderRadius: BorderRadius.circular(5),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
