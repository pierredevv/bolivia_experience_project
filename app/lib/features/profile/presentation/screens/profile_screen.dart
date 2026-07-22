import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../config/colors.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../favorites/presentation/providers/favorites_provider.dart';
import '../providers/profile_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileState = ref.watch(profileProvider);
    final favoritesState = ref.watch(favoritesProvider);

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
      body: _buildBody(context, ref, profileState, favoritesState),
    );
  }

  Widget _buildBody(BuildContext context, WidgetRef ref, ProfileState state, FavoritesState favoritesState) {
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
              Icon(Icons.error_outline, size: 64, color: AppColors.error500),
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
                      ? Icon(
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

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _StatItem(value: '${favoritesState.favorites.length}', label: 'Favoritos'),
              const _StatItem(value: '-', label: 'Reseñas'),
              const _StatItem(value: '-', label: 'Rating'),
            ],
          ),

          const SizedBox(height: 32),

          _ProfileMenuItem(
            icon: Icons.edit_outlined,
            title: 'Editar Perfil',
            onTap: () => context.push('/profile/edit'),
          ),
          _ProfileMenuItem(
            icon: Icons.rate_review_outlined,
            title: 'Mis Reseñas',
            onTap: () {},
          ),
          _ProfileMenuItem(
            icon: Icons.language,
            title: 'Idioma',
            subtitle: 'Español',
            onTap: () {},
          ),
          _ProfileMenuItem(
            icon: Icons.dark_mode_outlined,
            title: 'Modo Oscuro',
            trailing: Switch(
              value: false,
              onChanged: (value) {},
            ),
          ),
          _ProfileMenuItem(
            icon: Icons.notifications_outlined,
            title: 'Notificaciones',
            trailing: Switch(
              value: true,
              onChanged: (value) {},
            ),
          ),
          _ProfileMenuItem(
            icon: Icons.info_outline,
            title: 'Acerca de',
            onTap: () {},
          ),
          _ProfileMenuItem(
            icon: Icons.privacy_tip_outlined,
            title: 'Política de Privacidad',
            onTap: () {},
          ),

          const SizedBox(height: 24),

          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () async {
                final confirmed = await showDialog<bool>(
                  context: context,
                  builder: (context) => AlertDialog(
                    title: const Text('Cerrar Sesión'),
                    content: const Text('¿Estás seguro que querés cerrar sesión?'),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context, false),
                        child: const Text('Cancelar'),
                      ),
                      TextButton(
                        onPressed: () => Navigator.pop(context, true),
                        child: Text(
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
              icon: Icon(Icons.logout, color: AppColors.error700),
              label: Text(
                'Cerrar Sesión',
                style: TextStyle(color: AppColors.error700),
              ),
              style: OutlinedButton.styleFrom(
                side: BorderSide(color: AppColors.error300),
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