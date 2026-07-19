import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hive/hive.dart';
import '../../../../config/colors.dart';
import '../../../../config/router.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../providers/profile_provider.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  @override
  Widget build(BuildContext context) {
    final profileState = ref.watch(profileProvider);
    final themeMode = ref.watch(themeModeProvider);
    final isDark = themeMode == ThemeMode.dark;

    return Scaffold(
      body: _buildBody(context, ref, profileState, isDark),
    );
  }

  Widget _buildBody(BuildContext context, WidgetRef ref, ProfileState state, bool isDark) {
    if (state.status == ProfileStatus.loading) {
      return _buildLoadingState();
    }

    if (state.status == ProfileStatus.error) {
      return _buildErrorState(context, ref, state);
    }

    final profile = state.profile;

    return RefreshIndicator(
      onRefresh: () => ref.read(profileProvider.notifier).loadProfile(),
      child: CustomScrollView(
        slivers: [
          // Profile Header
          _buildProfileHeader(context, profile),

          SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Stats Cards
                _buildStatsSection(context, profile),

                const SizedBox(height: 16),

                // Quick Actions
                _buildQuickActions(context),

                const SizedBox(height: 16),

                // Settings Sections
                _buildSettingsSection(context, ref, isDark),

                const SizedBox(height: 16),

                // About Section
                _buildAboutSection(context),

                const SizedBox(height: 24),

                // Logout Button
                _buildLogoutButton(context, ref),

                const SizedBox(height: 32),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ============================================================================
  // Loading State
  // ============================================================================
  Widget _buildLoadingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(color: AppColors.primary600),
          const SizedBox(height: 16),
          Text(
            'Cargando perfil...',
            style: TextStyle(color: AppColors.neutral500),
          ),
        ],
      ),
    );
  }

  // ============================================================================
  // Error State
  // ============================================================================
  Widget _buildErrorState(BuildContext context, WidgetRef ref, ProfileState state) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppColors.error100,
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.error_outline, size: 48, color: AppColors.error700),
            ),
            const SizedBox(height: 24),
            Text(
              'Oops! Algo salió mal',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            Text(
              state.errorMessage ?? 'Error al cargar perfil',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.neutral600),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () => ref.read(profileProvider.notifier).loadProfile(),
              icon: const Icon(Icons.refresh),
              label: const Text('Reintentar'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary700,
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ============================================================================
  // Profile Header
  // ============================================================================
  Widget _buildProfileHeader(BuildContext context, dynamic profile) {
    return SliverAppBar(
      expandedHeight: 280,
      pinned: true,
      flexibleSpace: FlexibleSpaceBar(
        background: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                AppColors.primary700,
                AppColors.primary900,
              ],
            ),
          ),
          child: SafeArea(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const SizedBox(height: 40),
                // Avatar with edit button
                Stack(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                      ),
                      child: CircleAvatar(
                        radius: 55,
                        backgroundColor: AppColors.primary100,
                        backgroundImage: profile?.photo != null
                            ? NetworkImage(profile!.photo!)
                            : null,
                        child: profile?.photo == null
                            ? Text(
                                _getInitials(profile?.name),
                                style: TextStyle(
                                  fontSize: 36,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.primary700,
                                ),
                              )
                            : null,
                      ),
                    ),
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: GestureDetector(
                        onTap: () => context.push('/profile/edit'),
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.2),
                                blurRadius: 4,
                              ),
                            ],
                          ),
                          child: Icon(
                            Icons.camera_alt,
                            size: 18,
                            color: AppColors.primary700,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                // Name
                Text(
                  profile?.name ?? 'Usuario',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                // Email
                Text(
                  profile?.email ?? 'usuario@example.com',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.white.withOpacity(0.8),
                  ),
                ),
                // Country
                if (profile?.country != null) ...[
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.location_on, size: 14, color: Colors.white.withOpacity(0.7)),
                      const SizedBox(width: 4),
                      Text(
                        profile!.country!,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Colors.white.withOpacity(0.7),
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.settings, color: Colors.white),
          onPressed: () => context.push('/settings'),
        ),
      ],
    );
  }

  // ============================================================================
  // Stats Section
  // ============================================================================
  Widget _buildStatsSection(BuildContext context, dynamic profile) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          Expanded(
            child: _StatCard(
              icon: Icons.rate_review_outlined,
              value: '${profile?.reviewCount ?? 0}',
              label: 'Reseñas',
              color: AppColors.primary600,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _StatCard(
              icon: Icons.favorite_outline,
              value: '${profile?.favoriteCount ?? 0}',
              label: 'Favoritos',
              color: AppColors.error500,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _StatCard(
              icon: Icons.star_outline,
              value: profile?.avgRating?.toStringAsFixed(1) ?? '0.0',
              label: 'Rating',
              color: AppColors.secondary500,
            ),
          ),
        ],
      ),
    );
  }

  // ============================================================================
  // Quick Actions
  // ============================================================================
  Widget _buildQuickActions(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          Expanded(
            child: _QuickActionCard(
              icon: Icons.edit_outlined,
              title: 'Editar Perfil',
              onTap: () => context.push('/profile/edit'),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _QuickActionCard(
              icon: Icons.rate_review_outlined,
              title: 'Mis Reseñas',
              onTap: () {},
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _QuickActionCard(
              icon: Icons.favorite_outline,
              title: 'Favoritos',
              onTap: () => context.go('/favorites'),
            ),
          ),
        ],
      ),
    );
  }

  // ============================================================================
  // Settings Section
  // ============================================================================
  Widget _buildSettingsSection(BuildContext context, WidgetRef ref, bool isDark) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Card(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: AppColors.neutral200),
        ),
        child: Column(
          children: [
            // Theme Toggle
            SwitchListTile(
              title: const Text('Modo Oscuro'),
              subtitle: Text(isDark ? 'Tema oscuro activado' : 'Tema claro activado'),
              value: isDark,
              onChanged: (value) {
                ref.read(themeModeProvider.notifier).state =
                    value ? ThemeMode.dark : ThemeMode.light;
                Hive.box('settings').put('darkMode', value);
              },
              secondary: Icon(
                isDark ? Icons.dark_mode : Icons.light_mode,
                color: AppColors.primary600,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            const Divider(height: 1),
            // Notifications
            SwitchListTile(
              title: const Text('Notificaciones'),
              subtitle: const Text('Recibir notificaciones push'),
              value: true,
              onChanged: (value) {
                // TODO: Toggle notifications
              },
              secondary: Icon(Icons.notifications_outlined, color: AppColors.primary600),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            const Divider(height: 1),
            // Language
            ListTile(
              leading: Icon(Icons.language, color: AppColors.primary600),
              title: const Text('Idioma'),
              subtitle: const Text('Español'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => _showLanguagePicker(context),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            const Divider(height: 1),
            // Location
            SwitchListTile(
              title: const Text('Ubicación'),
              subtitle: const Text('Permitir acceso a ubicación'),
              value: true,
              onChanged: (value) {
                // TODO: Toggle location
              },
              secondary: Icon(Icons.location_on_outlined, color: AppColors.primary600),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ============================================================================
  // About Section
  // ============================================================================
  Widget _buildAboutSection(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Card(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: AppColors.neutral200),
        ),
        child: Column(
          children: [
            ListTile(
              leading: Icon(Icons.info_outline, color: AppColors.primary600),
              title: const Text('Acerca de BoliviaExperience'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => _showAboutDialog(context),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            const Divider(height: 1),
            ListTile(
              leading: Icon(Icons.description_outlined, color: AppColors.primary600),
              title: const Text('Términos y Condiciones'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {},
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            const Divider(height: 1),
            ListTile(
              leading: Icon(Icons.privacy_tip_outlined, color: AppColors.primary600),
              title: const Text('Política de Privacidad'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {},
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            const Divider(height: 1),
            ListTile(
              leading: Icon(Icons.code, color: AppColors.primary600),
              title: const Text('Licencias'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => showLicensePage(context: context),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ============================================================================
  // Logout Button
  // ============================================================================
  Widget _buildLogoutButton(BuildContext context, WidgetRef ref) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: SizedBox(
        width: double.infinity,
        child: OutlinedButton.icon(
          onPressed: () => _confirmLogout(context, ref),
          icon: Icon(Icons.logout, color: AppColors.error700),
          label: Text(
            'Cerrar Sesión',
            style: TextStyle(color: AppColors.error700),
          ),
          style: OutlinedButton.styleFrom(
            side: BorderSide(color: AppColors.error300),
            padding: const EdgeInsets.symmetric(vertical: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
      ),
    );
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================
  String _getInitials(String? name) {
    if (name == null || name.isEmpty) return 'U';
    final parts = name.split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return name[0].toUpperCase();
  }

  void _confirmLogout(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Cerrar Sesión'),
        content: const Text('¿Estás seguro que querés cerrar sesión?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'Cancelar',
              style: TextStyle(color: AppColors.neutral600),
            ),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              ref.read(authProvider.notifier).logout();
              context.go('/login');
            },
            child: Text(
              'Cerrar Sesión',
              style: TextStyle(color: AppColors.error700),
            ),
          ),
        ],
      ),
    );
  }

  void _showLanguagePicker(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                margin: const EdgeInsets.only(top: 12),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.neutral300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16),
                child: Text(
                  'Seleccionar Idioma',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              _LanguageOption(
                title: 'Español',
                subtitle: 'Español (Bolivia)',
                isSelected: true,
                onTap: () => Navigator.pop(context),
              ),
              _LanguageOption(
                title: 'English',
                subtitle: 'English (US)',
                isSelected: false,
                onTap: () => Navigator.pop(context),
              ),
              _LanguageOption(
                title: 'Português',
                subtitle: 'Português (Brasil)',
                isSelected: false,
                onTap: () => Navigator.pop(context),
              ),
              const SizedBox(height: 16),
            ],
          ),
        );
      },
    );
  }

  void _showAboutDialog(BuildContext context) {
    showAboutDialog(
      context: context,
      applicationName: 'BoliviaExperience',
      applicationVersion: '1.0.0',
      applicationIcon: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: AppColors.primary700,
          borderRadius: BorderRadius.circular(12),
        ),
        child: const Icon(Icons.explore, color: Colors.white, size: 32),
      ),
      children: [
        const Text(
          'Descubrí la mejor experiencia turística de Santa Cruz de la Sierra, Bolivia.',
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 16),
        Text(
          '© 2026 BoliviaExperience',
          textAlign: TextAlign.center,
          style: TextStyle(color: AppColors.neutral500),
        ),
      ],
    );
  }
}

// ============================================================================
// Stat Card
// ============================================================================
class _StatCard extends StatelessWidget {
  final IconData icon;
  final String value;
  final String label;
  final Color color;

  const _StatCard({
    required this.icon,
    required this.value,
    required this.label,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 8),
          Text(
            value,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              color: color,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: AppColors.neutral600,
            ),
          ),
        ],
      ),
    );
  }
}

// ============================================================================
// Quick Action Card
// ============================================================================
class _QuickActionCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final VoidCallback? onTap;

  const _QuickActionCard({
    required this.icon,
    required this.title,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: AppColors.primary50,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.primary100),
        ),
        child: Column(
          children: [
            Icon(icon, color: AppColors.primary700, size: 28),
            const SizedBox(height: 8),
            Text(
              title,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: AppColors.primary700,
                fontWeight: FontWeight.w500,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

// ============================================================================
// Language Option
// ============================================================================
class _LanguageOption extends StatelessWidget {
  final String title;
  final String subtitle;
  final bool isSelected;
  final VoidCallback? onTap;

  const _LanguageOption({
    required this.title,
    required this.subtitle,
    required this.isSelected,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(
        isSelected ? Icons.radio_button_checked : Icons.radio_button_unchecked,
        color: isSelected ? AppColors.primary700 : AppColors.neutral400,
      ),
      title: Text(title),
      subtitle: Text(subtitle),
      onTap: onTap,
    );
  }
}
