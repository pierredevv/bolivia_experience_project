import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hive/hive.dart';
import '../../../../config/colors.dart';
import '../../../../config/router.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../favorites/presentation/providers/favorites_provider.dart';
import '../providers/profile_provider.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  late bool _notificationsEnabled;

  @override
  void initState() {
    super.initState();
    final box = Hive.box('settings');
    _notificationsEnabled = box.get('notificationsEnabled', defaultValue: true);
  }

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
                const SnackBar(content: Text('Idioma cambiado a Español (próximamente)')),
              );
            },
            child: const Row(
              children: [
                Text('🇪🇸  ', style: TextStyle(fontSize: 20)),
                Text('Español'),
              ],
            ),
          ),
          SimpleDialogOption(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Idioma cambiado a English (próximamente)')),
              );
            },
            child: const Row(
              children: [
                Text('🇺🇸  ', style: TextStyle(fontSize: 20)),
                Text('English'),
              ],
            ),
          ),
          SimpleDialogOption(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Idioma cambiado a Português (próximamente)')),
              );
            },
            child: const Row(
              children: [
                Text('🇧🇷  ', style: TextStyle(fontSize: 20)),
                Text('Português'),
              ],
            ),
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
      applicationIcon: const Icon(
        Icons.explore,
        size: 48,
        color: AppColors.primary700,
      ),
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
      appBar: AppBar(
        title: const Text('Perfil'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            onPressed: () => context.push('/settings'),
          ),
        ],
      ),
      body: _buildBody(context, profileState, favoritesState, isDark),
    );
  }

  Widget _buildBody(
    BuildContext context,
    ProfileState state,
    FavoritesState favoritesState,
    bool isDark,
  ) {
    if (state.status == ProfileStatus.loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (state.status == ProfileStatus.error) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: AppColors.error500),
              const SizedBox(height: 16),
              Text(
                state.errorMessage ?? 'Error al cargar perfil',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: () => ref.read(profileProvider.notifier).loadProfile(),
                icon: const Icon(Icons.refresh),
                label: const Text('Reintentar'),
              ),
            ],
          ),
        ),
      );
    }

    final profile = state.profile;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          // Profile header
          Center(
            child: Column(
              children: [
                CircleAvatar(
                  radius: 50,
                  backgroundColor: AppColors.primary100,
                  backgroundImage: profile?.photo != null
                      ? NetworkImage(profile!.photo!)
                      : null,
                  child: profile?.photo == null
                      ? const Icon(
                          Icons.person,
                          size: 50,
                          color: AppColors.primary700,
                        )
                      : null,
                ),
                const SizedBox(height: 16),
                Text(
                  profile?.name ?? 'Usuario',
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
                Text(
                  profile?.email ?? 'usuario@example.com',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppColors.neutral600,
                  ),
                ),
                if (profile?.country != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    profile!.country!,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppColors.neutral500,
                    ),
                  ),
                ],
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Stats
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _StatItem(value: '${favoritesState.favorites.length}', label: 'Favoritos'),
              _StatItem(
                value: '${state.totalReviews}',
                label: 'Reseñas',
              ),
              _StatItem(
                value: state.averageRating > 0
                    ? state.averageRating.toStringAsFixed(1)
                    : '-',
                label: 'Rating',
              ),
            ],
          ),

          const SizedBox(height: 32),

          // Menu items
          _ProfileMenuItem(
            icon: Icons.edit_outlined,
            title: 'Editar Perfil',
            onTap: () => context.push('/profile/edit'),
          ),
          _ProfileMenuItem(
            icon: Icons.rate_review_outlined,
            title: 'Mis Reseñas (${state.totalReviews})',
            onTap: () => context.push('/profile/reviews'),
          ),
          _ProfileMenuItem(
            icon: Icons.language,
            title: 'Idioma',
            subtitle: 'Español',
            onTap: _showLanguageDialog,
          ),
          _ProfileMenuItem(
            icon: Icons.dark_mode_outlined,
            title: 'Modo Oscuro',
            trailing: Switch(
              value: isDark,
              onChanged: (value) {
                ref.read(themeModeProvider.notifier).state =
                    value ? ThemeMode.dark : ThemeMode.light;
                Hive.box('settings').put('darkMode', value);
              },
            ),
          ),
          _ProfileMenuItem(
            icon: Icons.notifications_outlined,
            title: 'Notificaciones',
            trailing: Switch(
              value: _notificationsEnabled,
              onChanged: (value) {
                setState(() => _notificationsEnabled = value);
                Hive.box('settings').put('notificationsEnabled', value);
              },
            ),
          ),
          _ProfileMenuItem(
            icon: Icons.info_outline,
            title: 'Acerca de',
            onTap: _showAboutDialog,
          ),
          _ProfileMenuItem(
            icon: Icons.privacy_tip_outlined,
            title: 'Política de Privacidad',
            onTap: () => context.push('/profile/privacy'),
          ),

          const SizedBox(height: 24),

          // Logout button
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () async {
                final confirmed = await showDialog<bool>(
                  context: context,
                  builder: (context) => AlertDialog(
                    title: const Text('Cerrar Sesión'),
                    content: const Text('¿Estás seguro que deseas cerrar sesión?'),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context, false),
                        child: const Text('Cancelar'),
                      ),
                      TextButton(
                        onPressed: () => Navigator.pop(context, true),
                        child: const Text(
                          'Cerrar Sesión',
                          style: TextStyle(color: AppColors.error700),
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
              icon: const Icon(Icons.logout, color: AppColors.error700),
              label: const Text(
                'Cerrar Sesión',
                style: TextStyle(color: AppColors.error700),
              ),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppColors.error300),
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final String value;
  final String label;

  const _StatItem({required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          value,
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
            color: AppColors.primary700,
          ),
        ),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall,
        ),
      ],
    );
  }
}

class _ProfileMenuItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final Widget? trailing;
  final VoidCallback? onTap;

  const _ProfileMenuItem({
    required this.icon,
    required this.title,
    this.subtitle,
    this.trailing,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: AppColors.neutral700),
      title: Text(title),
      subtitle: subtitle != null ? Text(subtitle!) : null,
      trailing: trailing ?? const Icon(Icons.chevron_right),
      onTap: onTap,
    );
  }
}
