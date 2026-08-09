import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../data/experience_detail.dart';
import '../../data/home_experience.dart';
import '../providers/experience_detail_provider.dart';

// ── Brand tokens ─────────────────────────────────────────────────────────────
const _brandDark = Color(0xFF0F172A);
const _brandEmerald = Color(0xFF10B981);
const _brandGold = Color(0xFFF59E0B);
const _textSecondary = Color(0xFF64748B);
const _borderSubtle = Color(0xFFE2E8F0);

class ExperienceDetailScreen extends ConsumerStatefulWidget {
  const ExperienceDetailScreen({
    super.key,
    required this.experienceId,
    this.initial,
  });

  final String experienceId;
  final HomeExperience? initial;

  @override
  ConsumerState<ExperienceDetailScreen> createState() =>
      _ExperienceDetailScreenState();
}

class _ExperienceDetailScreenState
    extends ConsumerState<ExperienceDetailScreen> {
  final _slotsKey = GlobalKey();

  @override
  void dispose() {
    super.dispose();
  }

  void _scrollToSlots() {
    final ctx = _slotsKey.currentContext;
    if (ctx == null) return;
    Scrollable.ensureVisible(
      ctx,
      duration: const Duration(milliseconds: 450),
      curve: Curves.easeInOut,
      alignment: 0.15,
    );
  }

  void _showMoreDates(ExperienceDetail detail) {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (sheetCtx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: _borderSubtle,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                const Text(
                  'Todas las fechas',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: _brandDark,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Elegí la sesión que prefieras',
                  style: TextStyle(fontSize: 13, color: _textSecondary),
                ),
                const SizedBox(height: 16),
                Flexible(
                  child: ListView.builder(
                    shrinkWrap: true,
                    itemCount: detail.slots.length,
                    itemBuilder: (ctx, index) {
                      final slot = detail.slots[index];
                      return Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 14),
                        decoration: BoxDecoration(
                          color: _brandDark,
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.calendar_today,
                                size: 16, color: _brandEmerald),
                            const SizedBox(width: 10),
                            Text(
                              slotLabel(slot),
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              '${slot.date} · ${slot.time}',
                              style: const TextStyle(
                                  fontSize: 12, color: Colors.white70),
                            ),
                            const Spacer(),
                            const Text(
                              'Disponible',
                              style: TextStyle(
                                  fontSize: 11, color: _brandEmerald),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final asyncDetail = ref.watch(experienceDetailProvider(widget.experienceId));

    return Scaffold(
      backgroundColor: const Color(0xFFFAFAFA),
      body: asyncDetail.when(
        loading: () => _buildHero(context, showLoader: true),
        error: (err, _) => _buildError(context),
        data: (detail) => _buildDetail(context, detail),
      ),
    );
  }

  // ── Hero / loading / error ─────────────────────────────────────────────────
  Widget _buildHero(BuildContext context, {bool showLoader = false}) {
    final photoUrl = widget.initial?.photoUrl;
    return Scaffold(
      backgroundColor: const Color(0xFFFAFAFA),
      body: Stack(
        children: [
          CustomScrollView(
            slivers: [
              SliverAppBar(
                pinned: true,
                expandedHeight: 260,
                backgroundColor: _brandDark,
                foregroundColor: Colors.white,
                leading: IconButton(
                  icon: const Icon(Icons.arrow_back, color: Colors.white),
                  onPressed: () => context.pop(),
                ),
                flexibleSpace: FlexibleSpaceBar(
                  background: Stack(
                    fit: StackFit.expand,
                    children: [
                      if (photoUrl != null)
                        Image.network(
                          photoUrl,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(
                            color: _brandDark,
                            child: const Center(
                              child: Icon(Icons.image_outlined,
                                  color: Colors.white54, size: 40),
                            ),
                          ),
                        )
                      else
                        Container(
                          color: _brandDark,
                          child: const Center(
                            child: Icon(Icons.image_outlined,
                                color: Colors.white54, size: 40),
                          ),
                        ),
                      Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.transparent,
                              Colors.black.withValues(alpha: 0.45),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          if (showLoader)
            const Center(
              child: CircularProgressIndicator(color: _brandDark),
            ),
        ],
      ),
    );
  }

  Widget _buildError(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAFAFA),
      appBar: AppBar(
        backgroundColor: _brandDark,
        foregroundColor: Colors.white,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => context.pop(),
        ),
      ),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, size: 48, color: _textSecondary),
            const SizedBox(height: 16),
            const Text(
              'Error inesperado. Intentá de nuevo.',
              style: TextStyle(fontSize: 15, color: _textSecondary),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () => ref.invalidate(
                experienceDetailProvider(widget.experienceId),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: _brandDark,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text('Reintentar'),
            ),
          ],
        ),
      ),
    );
  }

  // ── Detail body ────────────────────────────────────────────────────────────
  Widget _buildDetail(BuildContext context, ExperienceDetail detail) {
    final photoUrl = detail.photoUrl;
    final price = detail.displayPrice;
    final priceStr = price > 0
        ? '${detail.currency == 'USD' ? 'US\$' : 'Bs'} ${price.toStringAsFixed(0)}'
        : 'Gratis';
    final badge = detail.recommended
        ? (detail.recommendedReason ?? 'Recomendado')
        : null;

    return Scaffold(
      backgroundColor: const Color(0xFFFAFAFA),
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: true,
            expandedHeight: 260,
            backgroundColor: _brandDark,
            foregroundColor: Colors.white,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back, color: Colors.white),
              onPressed: () => context.pop(),
            ),
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  if (photoUrl != null)
                    Image.network(
                      photoUrl,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(
                        color: _brandDark,
                        child: const Center(
                          child: Icon(Icons.image_outlined,
                              color: Colors.white54, size: 40),
                        ),
                      ),
                    )
                  else
                    Container(
                      color: _brandDark,
                      child: const Center(
                        child: Icon(Icons.image_outlined,
                            color: Colors.white54, size: 40),
                      ),
                    ),
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          Colors.black.withValues(alpha: 0.45),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title + recommended badge
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          detail.name,
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w700,
                            color: _brandDark,
                            letterSpacing: -0.3,
                          ),
                        ),
                      ),
                      if (badge != null)
                        Tooltip(
                          message: badge,
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(
                              color: _brandGold,
                              borderRadius: BorderRadius.circular(24),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.thumb_up_alt_rounded,
                                    size: 14, color: Colors.white),
                                const SizedBox(width: 4),
                                Text(
                                  badge,
                                  style: const TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    color: Colors.white,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  // Place
                  if (detail.place != null) ...[
                    Row(
                      children: [
                        const Icon(Icons.place_outlined,
                            size: 16, color: _brandEmerald),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            'En ${detail.place!.name}',
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: _brandDark,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                  ],

                  // By {businessName}
                  if (detail.socio != null)
                    Row(
                      children: [
                        const Icon(Icons.verified_outlined,
                            size: 16, color: _brandEmerald),
                        const SizedBox(width: 6),
                        Text(
                          'By ${detail.socio!.name}',
                          style: const TextStyle(
                            fontSize: 13,
                            color: _textSecondary,
                          ),
                        ),
                      ],
                    ),
                  const SizedBox(height: 12),

                  // Score + count + category
                  Row(
                    children: [
                      const Icon(Icons.star_rounded,
                          size: 18, color: _brandGold),
                      const SizedBox(width: 4),
                      Text(
                        detail.ratingAvg.toStringAsFixed(1),
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: _brandDark,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        '(${detail.ratingCount} reseñas)',
                        style: const TextStyle(
                            fontSize: 13, color: _textSecondary),
                      ),
                      if (detail.experienceCategory != null) ...[
                        const SizedBox(width: 12),
                        const Icon(Icons.category_outlined,
                            size: 15, color: _textSecondary),
                        const SizedBox(width: 4),
                        Text(
                          detail.experienceCategory!,
                          style: const TextStyle(
                              fontSize: 13, color: _textSecondary),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Description
                  if (detail.description != null &&
                      detail.description!.isNotEmpty) ...[
                    const _SectionTitle('Descripción'),
                    const SizedBox(height: 8),
                    Text(
                      detail.description!,
                      style: const TextStyle(
                        fontSize: 14,
                        color: _textSecondary,
                        height: 1.6,
                      ),
                    ),
                    const SizedBox(height: 20),
                  ],

                  // Reservar con Antelación
                  _InfoBanner(
                    icon: Icons.schedule_outlined,
                    title: 'Reservar con Antelación',
                    subtitle: detail.advanceDays != null
                        ? 'Se reserva con ${detail.advanceDays} días de antelación'
                        : 'Reservá con anticipación para asegurar tu lugar',
                  ),
                  const SizedBox(height: 16),

                  // Políticas
                  if (detail.policies.isNotEmpty) ...[
                    const _SectionTitle('Políticas'),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: detail.policies
                          .map((p) => Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 12, vertical: 8),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(12),
                                  border:
                                      Border.all(color: _borderSubtle),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(Icons.check_circle_outline,
                                        size: 14, color: _brandEmerald),
                                    const SizedBox(width: 6),
                                    Text(
                                      p,
                                      style: const TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w500,
                                        color: _brandDark,
                                      ),
                                    ),
                                  ],
                                ),
                              ))
                          .toList(),
                    ),
                    const SizedBox(height: 20),
                  ],

                  // Datos clave (duración, edades, grupo, ticket, idioma)
                  const _SectionTitle('Detalles'),
                  const SizedBox(height: 10),
                  _DetailGrid(detail: detail),
                  const SizedBox(height: 20),

                  // Reserva tu lugar
                  Container(
                    key: _slotsKey,
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: _borderSubtle),
                    ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Row(
                              children: [
                                Icon(Icons.event_available_rounded,
                                    size: 20, color: _brandDark),
                                SizedBox(width: 8),
                                Text(
                                  'Reserva tu lugar',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                color: _brandDark,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'Disponibilidad para las próximas fechas',
                          style: TextStyle(
                              fontSize: 12, color: _textSecondary),
                        ),
                        const SizedBox(height: 12),
                        if (detail.slots.isEmpty)
                          const Text(
                            'Aún no hay fechas publicadas',
                            style: TextStyle(
                                fontSize: 13, color: _textSecondary),
                          )
                        else ...[
                          SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: Row(
                              children: detail.slots
                                  .map((slot) => _SlotCard(slot: slot))
                                  .toList(),
                            ),
                          ),
                          if (detail.slots.length > 1) ...[
                            const SizedBox(height: 8),
                            Align(
                              alignment: Alignment.centerRight,
                              child: TextButton(
                                onPressed: () =>
                                    _showMoreDates(detail),
                                child: const Text(
                                  'Ver más Fechas',
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: _brandDark,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Price card + Reservar
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: _borderSubtle),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.payments_outlined,
                                size: 22, color: _brandEmerald),
                            const SizedBox(width: 12),
                            Text(
                              priceStr,
                              style: const TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.w700,
                                color: _brandEmerald,
                              ),
                            ),
                            const SizedBox(width: 6),
                            const Text(
                              'por persona',
                              style: TextStyle(
                                  fontSize: 13, color: _textSecondary),
                            ),
                            const Spacer(),
                            if (detail.priceVarByGroup)
                              const Text(
                                'precio por grupo',
                                style: TextStyle(
                                    fontSize: 11, color: _textSecondary),
                              ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        SizedBox(
                          width: double.infinity,
                          height: 50,
                          child: ElevatedButton.icon(
                            onPressed: () {
                              final placeId = detail.place?.id;
                              if (placeId != null && placeId.isNotEmpty) {
                                context.push(
                                  '/places/$placeId/reserve',
                                  extra: {
                                    'placeName': detail.place!.name,
                                  },
                                );
                              } else {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content:
                                        Text('Reservá desde el establecimiento'),
                                  ),
                                );
                              }
                            },
                            icon: const Icon(Icons.event_available,
                                size: 20),
                            label: const Text('Reservar'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: _brandDark,
                              foregroundColor: Colors.white,
                              elevation: 0,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Reseñas en carrusel
                  if (detail.reviews.isNotEmpty) ...[
                    const _SectionTitle('Por qué los viajeros aman esto'),
                    const SizedBox(height: 8),
                    const Text(
                      'Reseñas de otros viajeros',
                      style:
                          TextStyle(fontSize: 13, color: _textSecondary),
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      height: 170,
                      child: PageView.builder(
                        itemCount: detail.reviews.length,
                        itemBuilder: (context, index) {
                          final review = detail.reviews[index];
                          return Padding(
                            padding: const EdgeInsets.only(right: 12),
                            child: _ReviewCard(review: review),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 32),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: _BottomBar(
        priceStr: priceStr,
        onConsult: _scrollToSlots,
      ),
    );
  }
}

// ── Section title ────────────────────────────────────────────────────────────
class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.title);

  final String title;

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w700,
        color: _brandDark,
      ),
    );
  }
}

// ── Info banner (antelación) ─────────────────────────────────────────────────
class _InfoBanner extends StatelessWidget {
  const _InfoBanner({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  final IconData icon;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
          colors: [_brandDark, Color(0xFF1E293B)],
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: const BoxDecoration(
              color: Color(0x22FFFFFF),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, size: 20, color: _brandEmerald),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: const TextStyle(
                      fontSize: 12, color: Colors.white70),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── Detail grid (duración / edades / grupo / ticket / idioma) ───────────────
class _DetailGrid extends StatelessWidget {
  const _DetailGrid({required this.detail});

  final ExperienceDetail detail;

  @override
  Widget build(BuildContext context) {
    final items = <({IconData icon, String label, String value})>[];
    if (detail.duration != null && detail.duration!.isNotEmpty) {
      items.add((icon: Icons.timer_outlined, label: 'Duración', value: detail.duration!));
    }
    if (detail.minAge != null || detail.maxAge != null) {
      final min = detail.minAge ?? 0;
      final max = detail.maxAge ?? 99;
      items.add((icon: Icons.child_care_outlined, label: 'Edades', value: '$min–$max años'));
    }
    if (detail.maxGroup != null) {
      items.add((icon: Icons.groups_outlined, label: 'Grupo máx.', value: '${detail.maxGroup} personas'));
    }
    if (detail.mobileTicket) {
      items.add((icon: Icons.phone_iphone_outlined, label: 'Ticket', value: 'Entrada móvil'));
    }
    if (detail.guideLanguage != null && detail.guideLanguage!.isNotEmpty) {
      items.add((icon: Icons.translate_outlined, label: 'Guía', value: detail.guideLanguage!));
    }

    if (items.isEmpty) return const SizedBox.shrink();

    return Column(
      children: List.generate(items.length, (index) {
        final item = items[index];
        return Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: _borderSubtle),
          ),
          child: Row(
            children: [
              Icon(item.icon, size: 18, color: _brandDark),
              const SizedBox(width: 12),
              Text(
                item.label,
                style: const TextStyle(
                  fontSize: 13,
                  color: _textSecondary,
                ),
              ),
              const Spacer(),
              Text(
                item.value,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: _brandDark,
                ),
              ),
            ],
          ),
        );
      }),
    );
  }
}

// ── Slot card ────────────────────────────────────────────────────────────────
class _SlotCard extends StatelessWidget {
  const _SlotCard({required this.slot});

  final ExperienceSlot slot;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 112,
      margin: const EdgeInsets.only(right: 10),
      padding: const EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(
        color: _brandDark,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        children: [
          Text(
            slotLabel(slot),
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: Colors.white,
            ),
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 4),
          Text(
            slot.time,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: _brandEmerald,
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'Disponible',
            style: TextStyle(fontSize: 10, color: Colors.white70),
          ),
        ],
      ),
    );
  }
}

// ── Review card ──────────────────────────────────────────────────────────────
class _ReviewCard extends StatelessWidget {
  const _ReviewCard({required this.review});

  final ExperienceReview review;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 280,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: _borderSubtle),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              if (review.authorPhoto != null && review.authorPhoto!.isNotEmpty)
                ClipOval(
                  child: Image.network(
                    review.authorPhoto!,
                    width: 34,
                    height: 34,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => _AvatarFallback(
                        name: review.authorName ?? ''),
                  ),
                )
              else
                _AvatarFallback(name: review.authorName ?? ''),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  review.authorName ?? 'Viajero',
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: _brandDark,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const Icon(Icons.star_rounded, size: 16, color: _brandGold),
              const SizedBox(width: 2),
              Text(
                review.rating.toString(),
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: _brandDark,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Expanded(
            child: Text(
              review.comment ?? '',
              style: const TextStyle(
                fontSize: 13,
                color: _textSecondary,
                height: 1.5,
              ),
              maxLines: 4,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}

class _AvatarFallback extends StatelessWidget {
  const _AvatarFallback({required this.name});

  final String name;

  @override
  Widget build(BuildContext context) {
    final initial = name.isNotEmpty ? name[0].toUpperCase() : '?';
    return Container(
      width: 34,
      height: 34,
      alignment: Alignment.center,
      decoration: const BoxDecoration(
        color: Color(0xFFE2E8F0),
        shape: BoxShape.circle,
      ),
      child: Text(
        initial,
        style: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w700,
          color: _brandDark,
        ),
      ),
    );
  }
}

// ── Bottom bar ───────────────────────────────────────────────────────────────
class _BottomBar extends StatelessWidget {
  const _BottomBar({required this.priceStr, required this.onConsult});

  final String priceStr;
  final VoidCallback onConsult;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.fromLTRB(
          20, 12, 20, 12 + MediaQuery.of(context).padding.bottom),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: _borderSubtle)),
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    'Desde',
                    style: TextStyle(fontSize: 11, color: _textSecondary),
                  ),
                  Text(
                    priceStr,
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                      color: _brandDark,
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              flex: 2,
              child: SizedBox(
                height: 48,
                child: ElevatedButton.icon(
                  onPressed: onConsult,
                  icon: const Icon(Icons.event_available, size: 18),
                  label: const Text('Consultar disponibilidad'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _brandDark,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
