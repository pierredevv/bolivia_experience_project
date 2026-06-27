import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive/hive.dart';
import '../../../../config/colors.dart';
import '../../../../config/router.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeModeProvider);
    final isDark = themeMode == ThemeMode.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Configuración'),
      ),
      body: ListView(
        children: [
          const SizedBox(height: 16),

          // Appearance
          _SectionHeader(title: 'Apariencia'),
          SwitchListTile(
            title: const Text('Modo Oscuro'),
            subtitle: const Text('Cambiar entre tema claro y oscuro'),
            value: isDark,
            onChanged: (value) {
              ref.read(themeModeProvider.notifier).state =
                  value ? ThemeMode.dark : ThemeMode.light;
              Hive.box('settings').put('darkMode', value);
            },
            secondary: Icon(
              isDark ? Icons.dark_mode : Icons.light_mode,
              color: AppColors.neutral700,
            ),
          ),

          const Divider(),

          // Notifications
          _SectionHeader(title: 'Notificaciones'),
          SwitchListTile(
            title: const Text('Notificaciones Push'),
            subtitle: const Text('Recibir notificaciones de eventos y promociones'),
            value: true,
            onChanged: (value) {
              // TODO: Toggle notifications
            },
            secondary: Icon(Icons.notifications_outlined, color: AppColors.neutral700),
          ),
          SwitchListTile(
            title: const Text('Sonido'),
            subtitle: const Text('Reproducir sonido con notificaciones'),
            value: true,
            onChanged: (value) {
              // TODO: Toggle sound
            },
            secondary: Icon(Icons.volume_up_outlined, color: AppColors.neutral700),
          ),

          const Divider(),

          // Location
          _SectionHeader(title: 'Ubicación'),
          SwitchListTile(
            title: const Text('Servicios de Ubicación'),
            subtitle: const Text('Permitir acceso a tu ubicación'),
            value: true,
            onChanged: (value) {
              // TODO: Toggle location
            },
            secondary: Icon(Icons.location_on_outlined, color: AppColors.neutral700),
          ),

          const Divider(),

          // Language
          _SectionHeader(title: 'Idioma'),
          ListTile(
            leading: Icon(Icons.language, color: AppColors.neutral700),
            title: const Text('Idioma de la App'),
            subtitle: const Text('Español'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              // TODO: Show language picker
            },
          ),

          const Divider(),

          // About
          _SectionHeader(title: 'Acerca de'),
          ListTile(
            leading: Icon(Icons.info_outline, color: AppColors.neutral700),
            title: const Text('Versión'),
            subtitle: const Text('1.0.0'),
          ),
          ListTile(
            leading: Icon(Icons.description_outlined, color: AppColors.neutral700),
            title: const Text('Términos y Condiciones'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {},
          ),
          ListTile(
            leading: Icon(Icons.privacy_tip_outlined, color: AppColors.neutral700),
            title: const Text('Política de Privacidad'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {},
          ),
          ListTile(
            leading: Icon(Icons.code, color: AppColors.neutral700),
            title: const Text('Licencias'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              showLicensePage(context: context);
            },
          ),

          const SizedBox(height: 32),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;

  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      child: Text(
        title,
        style: Theme.of(context).textTheme.titleMedium?.copyWith(
          color: AppColors.primary700,
        ),
      ),
    );
  }
}
