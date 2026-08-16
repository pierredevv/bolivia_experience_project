import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/gamification_service.dart';
import '../providers/gamification_provider.dart';

const _brandDark = Color(0xFF0F172A);
const _brandEmerald = Color(0xFF10B981);
const _brandGold = Color(0xFFF59E0B);
const _borderSubtle = Color(0xFFE2E8F0);
const _textSecondary = Color(0xFF64748B);
const _canvas = Color(0xFFFAFAFA);

class GamificationScreen extends ConsumerStatefulWidget {
  const GamificationScreen({super.key});

  @override
  ConsumerState<GamificationScreen> createState() => _GamificationScreenState();
}

class _GamificationScreenState extends ConsumerState<GamificationScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(gamificationProvider.notifier).load();
      ref.read(gamificationProvider.notifier).loadAllBadges();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(gamificationProvider);

    return Scaffold(
      backgroundColor: _canvas,
      appBar: AppBar(
        backgroundColor: _canvas,
        elevation: 0,
        scrolledUnderElevation: 0,
        surfaceTintColor: Colors.transparent,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded,
              size: 20, color: _brandDark),
          onPressed: () => Navigator.maybePop(context),
        ),
        title: const Text(
          'Mis Logros',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: _brandDark,
            letterSpacing: -0.3,
          ),
        ),
        centerTitle: true,
      ),
      body: state.status == GamificationStatus.loading &&
              state.snapshot.points == 0
          ? const Center(
              child: CircularProgressIndicator(
                  color: _brandEmerald, strokeWidth: 2.5),
            )
          : _buildBody(state),
    );
  }

  Widget _buildBody(GamificationState state) {
    final snapshot = state.snapshot;
    final earnedIds = snapshot.badges.map((b) => b.id).toSet();

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 40),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Points hero card ─────────────────────────────────────────
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [_brandDark, Color(0xFF1E293B)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: _brandDark.withValues(alpha: 0.25),
                  blurRadius: 18,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Column(
              children: [
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: _brandGold.withValues(alpha: 0.15),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.emoji_events_rounded,
                      size: 30, color: _brandGold),
                ),
                const SizedBox(height: 14),
                Text(
                  '${snapshot.points}',
                  style: const TextStyle(
                    fontSize: 40,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                    letterSpacing: -1,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Puntos',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF94A3B8),
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Gana puntos por tus reservas completadas.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 12,
                    color: Color(0xFFCBD5E1),
                    height: 1.5,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          if (snapshot.badges.isNotEmpty) ...[
            const _SectionLabel(label: 'Insignias desbloqueadas'),
            const SizedBox(height: 10),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: snapshot.badges.length,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 1.1,
              ),
              itemBuilder: (context, index) =>
                  _BadgeCard(badge: snapshot.badges[index], unlocked: true),
            ),
            const SizedBox(height: 24),
          ],

          // ── All badges catalog ───────────────────────────────────────
          _SectionLabel(
              label:
                  snapshot.badges.isNotEmpty ? 'Próximos logros' : 'Logros'),
          const SizedBox(height: 10),
          if (state.allBadges.isEmpty)
            const _MenuCardEmpty(text: 'No hay logros disponibles por ahora.')
          else
            ...state.allBadges.map(
              (badge) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: _BadgeTile(
                  badge: badge,
                  unlocked: earnedIds.contains(badge.id),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _BadgeCard extends StatelessWidget {
  const _BadgeCard({required this.badge, required this.unlocked});
  final BadgeModel badge;
  final bool unlocked;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: _brandGold.withValues(alpha: 0.5), width: 1.2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.emoji_events_rounded,
              size: 30, color: _brandGold),
          const SizedBox(height: 8),
          Text(
            badge.name,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: _brandDark,
            ),
          ),
          if (badge.description != null) ...[
            const SizedBox(height: 4),
            Text(
              badge.description!,
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                  fontSize: 11, color: _textSecondary, height: 1.3),
            ),
          ],
        ],
      ),
    );
  }
}

class _BadgeTile extends StatelessWidget {
  const _BadgeTile({required this.badge, required this.unlocked});
  final BadgeModel badge;
  final bool unlocked;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: _borderSubtle),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 46,
            height: 46,
            decoration: BoxDecoration(
              color: (unlocked ? _brandGold : _textSecondary)
                  .withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(13),
            ),
            child: Icon(
              Icons.emoji_events_rounded,
              size: 24,
              color: unlocked ? _brandGold : _textSecondary,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  badge.name,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: unlocked ? _brandDark : _textSecondary,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  badge.description ?? '',
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                      fontSize: 12, color: _textSecondary, height: 1.4),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          if (unlocked)
            const Icon(Icons.check_circle_rounded,
                size: 20, color: _brandEmerald)
          else
            const Icon(Icons.lock_outline_rounded,
                size: 20, color: _textSecondary),
        ],
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  const _SectionLabel({required this.label});
  final String label;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 2),
      child: Text(
        label.toUpperCase(),
        style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: _textSecondary,
          letterSpacing: 0.9,
        ),
      ),
    );
  }
}

class _MenuCardEmpty extends StatelessWidget {
  const _MenuCardEmpty({required this.text});
  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: _borderSubtle),
      ),
      child: Text(
        text,
        textAlign: TextAlign.center,
        style: const TextStyle(fontSize: 13, color: _textSecondary),
      ),
    );
  }
}
