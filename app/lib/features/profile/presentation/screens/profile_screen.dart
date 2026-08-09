import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hive/hive.dart';
import '../../../../config/colors.dart';
import '../../../../config/router.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../favorites/presentation/providers/favorites_provider.dart';
import '../providers/profile_provider.dart';

// ── Brand tokens ──────────────────────────────────────────────────────────────
const _brandDark = Color(0xFF0F172A);
const _brandEmerald = Color(0xFF10B981);
const _brandGold = Color(0xFFF59E0B);
const _borderSubtle = Color(0xFFE2E8F0);
const _textSecondary = Color(0xFF64748B);
const _canvas = Color(0xFFFAFAFA);

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  // ── Local state — untouched ───────────────────────────────────────────────
  late bool _notificationsEnabled;

  @override
  void initState() {
    super.initState();
    final box = Hive.box('settings');
    _notificationsEnabled =
        box.get('notificationsEnabled', defaultValue: true);
  }

  // ── Dialogs — untouched ───────────────────────────────────────────────────
  void _showLanguageDialog() {
    showDialog(
      context: context,
      builder: (context) => SimpleDialog(
        title: const Text('Seleccionar idioma'),
        children: [
          SimpleDialogOption(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                    content:
                        Text('Idioma cambiado a Español (próximamente)')),
              );
            },
            child: const Row(children: [
              Text('🇪🇸  ', style: TextStyle(fontSize: 20)),
              Text('Español'),
            ]),
          ),
          SimpleDialogOption(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                    content:
                        Text('Idioma cambiado a English (próximamente)')),
              );
            },
            child: const Row(children: [
              Text('🇺🇸  ', style: TextStyle(fontSize: 20)),
              Text('English'),
            ]),
          ),
          SimpleDialogOption(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                    content: Text(
                        'Idioma cambiado a Português (próximamente)')),
              );
            },
            child: const Row(children: [
              Text('🇧🇷  ', style: TextStyle(fontSize: 20)),
              Text('Português'),
            ]),
          ),
        ],
      ),
    );
  }

  void _showAboutDialog() {
    showAboutDialog(
      context: context,
      applicationName: 'BoliviaExperience',
      applicationVersion: '1.0.0',
      applicationIcon:
          const Icon(Icons.explore, size: 48, color: AppColors.primary700),
      children: const [
        Text(
          'Descubre los mejores lugares de Santa Cruz de la Sierra. '
          'Explora restaurantes, hoteles, eventos y mucho más.',
        ),
        SizedBox(height: 16),
        Text('Desarrollado con ❤️ en Bolivia'),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final profileState = ref.watch(profileProvider);
    final favoritesState = ref.watch(favoritesProvider);
    final themeMode = ref.watch(themeModeProvider);
    final isDark = themeMode == ThemeMode.dark;

    return Scaffold(
      backgroundColor: _canvas,
      body: _buildBody(context, profileState, favoritesState, isDark),
    );
  }

  Widget _buildBody(
    BuildContext context,
    ProfileState state,
    FavoritesState favoritesState,
    bool isDark,
  ) {
    // ── Loading ──────────────────────────────────────────────────────────────
    if (state.status == ProfileStatus.loading) {
      return const Center(
        child: CircularProgressIndicator(
            color: _brandEmerald, strokeWidth: 2.5),
      );
    }

    // ── Error ────────────────────────────────────────────────────────────────
    if (state.status == ProfileStatus.error) {
      return SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(28),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 72,
                  height: 72,
                  decoration: BoxDecoration(
                    color: AppColors.error500.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Icon(Icons.error_outline,
                      size: 36, color: AppColors.error500),
                ),
                const SizedBox(height: 20),
                Text(
                  state.errorMessage ?? 'Error al cargar perfil',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                      fontSize: 15, color: _textSecondary, height: 1.5),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  height: 46,
                  child: ElevatedButton.icon(
                    onPressed: () =>
                        ref.read(profileProvider.notifier).loadProfile(),
                    icon: const Icon(Icons.refresh, size: 18),
                    label: const Text('Reintentar'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _brandDark,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final profile = state.profile;

    return SafeArea(
      bottom: false,
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 24, 20, 40),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Page header ──────────────────────────────────────────────
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Mi Perfil',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w700,
                    color: _brandDark,
                    letterSpacing: -0.4,
                  ),
                ),
                // Settings icon button
                GestureDetector(
                  onTap: () => context.push('/settings'),
                  child: Container(
                    width: 42,
                    height: 42,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(13),
                      border: Border.all(color: _borderSubtle),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.04),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: const Icon(Icons.settings_outlined,
                        size: 20, color: _brandDark),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // ── Identity card ────────────────────────────────────────────
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: _borderSubtle),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Column(
                children: [
                  // Avatar with emerald ring
                  Container(
                    width: 88,
                    height: 88,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: _brandEmerald, width: 2.5),
                    ),
                    child: ClipOval(
                      child: profile?.photo != null
                          ? Image.network(
                              profile!.photo!,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) =>
                                  _DefaultAvatar(name: profile.name),
                            )
                          : _DefaultAvatar(name: profile?.name),
                    ),
                  ),
                  const SizedBox(height: 14),
                  Text(
                    profile?.name ?? 'Usuario',
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w700,
                      color: _brandDark,
                      letterSpacing: -0.3,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    profile?.email ?? 'usuario@example.com',
                    style: const TextStyle(
                      fontSize: 14,
                      color: _textSecondary,
                    ),
                  ),
                  if (profile?.country != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      profile!.country!,
                      style: const TextStyle(
                        fontSize: 12,
                        color: _textSecondary,
                      ),
                    ),
                  ],
                  const SizedBox(height: 20),

                  // Stats row inside identity card
                  Container(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    decoration: BoxDecoration(
                      color: _canvas,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        _StatItem(
                          value: '${favoritesState.favorites.length}',
                          label: 'Favoritos',
                          icon: Icons.favorite_rounded,
                          iconColor: const Color(0xFFFC7B7B),
                        ),
                        _VerticalDivider(),
                        _StatItem(
                          value: '${state.totalReviews}',
                          label: 'Reseñas',
                          icon: Icons.rate_review_rounded,
                          iconColor: _brandEmerald,
                        ),
                        _VerticalDivider(),
                        _StatItem(
                          value: state.averageRating > 0
                              ? state.averageRating.toStringAsFixed(1)
                              : '-',
                          label: 'Rating',
                          icon: Icons.star_rounded,
                          iconColor: _brandGold,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // ── Account section ──────────────────────────────────────────
            const _SectionLabel(label: 'Cuenta'),
            const SizedBox(height: 10),
            _MenuCard(
              items: [
                _MenuItem(
                  icon: Icons.edit_outlined,
                  title: 'Editar Perfil',
                  onTap: () => context.push('/profile/edit'),
                ),
                _MenuItem(
                  icon: Icons.event_available_outlined,
                  title: 'Mis Reservas',
                  onTap: () => context.push('/reservations'),
                ),
                _MenuItem(
                  icon: Icons.rate_review_outlined,
                  title: 'Mis Reseñas (${state.totalReviews})',
                  onTap: () => context.push('/profile/reviews'),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // ── Preferences section ──────────────────────────────────────
            const _SectionLabel(label: 'Preferencias'),
            const SizedBox(height: 10),
            _MenuCard(
              items: [
                _MenuItem(
                  icon: Icons.language_outlined,
                  title: 'Idioma',
                  subtitle: 'Español',
                  onTap: _showLanguageDialog,
                ),
                _MenuItem(
                  icon: Icons.dark_mode_outlined,
                  title: 'Modo Oscuro',
                  trailing: Switch.adaptive(
                    value: isDark,
                    activeTrackColor: _brandEmerald,
                    onChanged: (value) {
                      ref.read(themeModeProvider.notifier).state =
                          value ? ThemeMode.dark : ThemeMode.light;
                      Hive.box('settings').put('darkMode', value);
                    },
                  ),
                ),
                _MenuItem(
                  icon: Icons.notifications_outlined,
                  title: 'Notificaciones',
                  trailing: Switch.adaptive(
                    value: _notificationsEnabled,
                    activeTrackColor: _brandEmerald,
                    onChanged: (value) {
                      setState(() => _notificationsEnabled = value);
                      Hive.box('settings')
                          .put('notificationsEnabled', value);
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // ── Info section ─────────────────────────────────────────────
            const _SectionLabel(label: 'Información'),
            const SizedBox(height: 10),
            _MenuCard(
              items: [
                _MenuItem(
                  icon: Icons.info_outline,
                  title: 'Acerca de',
                  onTap: _showAboutDialog,
                ),
                _MenuItem(
                  icon: Icons.privacy_tip_outlined,
                  title: 'Política de Privacidad',
                  onTap: () => context.push('/profile/privacy'),
                ),
              ],
            ),
            const SizedBox(height: 28),

            // ── Logout button ────────────────────────────────────────────
            SizedBox(
              width: double.infinity,
              height: 52,
              child: OutlinedButton.icon(
                onPressed: () async {
                  final confirmed = await showDialog<bool>(
                    context: context,
                    builder: (context) => AlertDialog(
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20)),
                      title: const Text(
                        'Cerrar Sesión',
                        style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                            color: _brandDark),
                      ),
                      content: const Text(
                        '¿Estás seguro que deseas cerrar sesión?',
                        style:
                            TextStyle(fontSize: 14, color: _textSecondary),
                      ),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.pop(context, false),
                          child: const Text('Cancelar',
                              style: TextStyle(color: _textSecondary)),
                        ),
                        TextButton(
                          onPressed: () => Navigator.pop(context, true),
                          child: const Text(
                            'Cerrar Sesión',
                            style: TextStyle(
                                color: AppColors.error700,
                                fontWeight: FontWeight.w700),
                          ),
                        ),
                      ],
                    ),
                  );

                  if (confirmed == true && context.mounted) {
                    ref.read(authProvider.notifier).logout();
                    context.go('/login');
                  }
                },
                icon: const Icon(Icons.logout_rounded,
                    size: 18, color: AppColors.error700),
                label: const Text(
                  'Cerrar Sesión',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: AppColors.error700,
                  ),
                ),
                style: OutlinedButton.styleFrom(
                  backgroundColor: AppColors.error500.withValues(alpha: 0.05),
                  side: BorderSide(
                      color: AppColors.error500.withValues(alpha: 0.3), width: 1.2),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Default avatar — dark background with initials or person icon
// ─────────────────────────────────────────────────────────────────────────────
class _DefaultAvatar extends StatelessWidget {
  const _DefaultAvatar({this.name});
  final String? name;

  String _initials(String? n) {
    if (n == null || n.trim().isEmpty) return '?';
    final parts = n.trim().split(' ');
    if (parts.length == 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    final initials = _initials(name);
    return Container(
      color: _brandDark,
      child: Center(
        child: Text(
          initials,
          style: const TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.w700,
            color: Colors.white,
            letterSpacing: -0.5,
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat item with icon
// ─────────────────────────────────────────────────────────────────────────────
class _StatItem extends StatelessWidget {
  const _StatItem({
    required this.value,
    required this.label,
    required this.icon,
    required this.iconColor,
  });

  final String value;
  final String label;
  final IconData icon;
  final Color iconColor;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 18, color: iconColor),
        const SizedBox(height: 5),
        Text(
          value,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: _brandDark,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: const TextStyle(fontSize: 11, color: _textSecondary),
        ),
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Vertical divider for stats row
// ─────────────────────────────────────────────────────────────────────────────
class _VerticalDivider extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 1,
      height: 36,
      color: _borderSubtle,
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Section label (e.g. "Cuenta", "Preferencias")
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// White card that wraps a list of menu items with dividers
// ─────────────────────────────────────────────────────────────────────────────
class _MenuCard extends StatelessWidget {
  const _MenuCard({required this.items});
  final List<_MenuItem> items;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: _borderSubtle),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        children: [
          for (int i = 0; i < items.length; i++) ...[
            items[i],
            if (i < items.length - 1)
              const Divider(height: 1, indent: 52, color: _borderSubtle),
          ],
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Individual menu item row
// ─────────────────────────────────────────────────────────────────────────────
class _MenuItem extends StatelessWidget {
  const _MenuItem({
    required this.icon,
    required this.title,
    this.subtitle,
    this.trailing,
    this.onTap,
  });

  final IconData icon;
  final String title;
  final String? subtitle;
  final Widget? trailing;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            // Icon container
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: _brandDark.withValues(alpha: 0.06),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, size: 18, color: _brandDark),
            ),
            const SizedBox(width: 14),
            // Title + subtitle
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: _brandDark,
                    ),
                  ),
                  if (subtitle != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      subtitle!,
                      style: const TextStyle(
                          fontSize: 12, color: _textSecondary),
                    ),
                  ],
                ],
              ),
            ),
            // Trailing (chevron or switch)
            trailing ??
                const Icon(Icons.chevron_right_rounded,
                    size: 20, color: _textSecondary),
          ],
        ),
      ),
    );
  }
}
