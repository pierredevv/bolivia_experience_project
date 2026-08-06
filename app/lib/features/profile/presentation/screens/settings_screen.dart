import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive/hive.dart';
import '../../../../config/colors.dart';
import '../../../../config/router.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  late bool _pushNotifications;
  late bool _sound;
  late bool _location;
  late String _language;

  @override
  void initState() {
    super.initState();
    final box = Hive.box('settings');
    _pushNotifications = box.get('pushNotifications', defaultValue: true) as bool;
    _sound = box.get('sound', defaultValue: true) as bool;
    _location = box.get('location', defaultValue: true) as bool;
    _language = box.get('language', defaultValue: 'Español') as String;
  }

  void _showLanguagePicker() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Padding(
              padding: EdgeInsets.all(16),
              child: Text(
                'Seleccionar Idioma',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.brandDark,
                ),
              ),
            ),
            ListTile(
              title: const Text('Español'),
              trailing: _language == 'Español'
                  ? const Icon(Icons.check, color: AppColors.brandEmerald)
                  : null,
              onTap: () {
                setState(() => _language = 'Español');
                Hive.box('settings').put('language', 'Español');
                Navigator.pop(ctx);
              },
            ),
            ListTile(
              title: const Text('English'),
              trailing: _language == 'English'
                  ? const Icon(Icons.check, color: AppColors.brandEmerald)
                  : null,
              onTap: () {
                setState(() => _language = 'English');
                Hive.box('settings').put('language', 'English');
                Navigator.pop(ctx);
              },
            ),
            ListTile(
              title: const Text('Português'),
              trailing: _language == 'Português'
                  ? const Icon(Icons.check, color: AppColors.brandEmerald)
                  : null,
              onTap: () {
                setState(() => _language = 'Português');
                Hive.box('settings').put('language', 'Português');
                Navigator.pop(ctx);
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
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
          const _SectionHeader(title: 'Apariencia'),
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
              color: AppColors.brandDark,
            ),
          ),

          const Divider(),

          // Notifications
          const _SectionHeader(title: 'Notificaciones'),
          SwitchListTile(
            title: const Text('Notificaciones Push'),
            subtitle: const Text('Recibir notificaciones de eventos y promociones'),
            value: _pushNotifications,
            onChanged: (value) {
              setState(() => _pushNotifications = value);
              Hive.box('settings').put('pushNotifications', value);
            },
            secondary: const Icon(Icons.notifications_outlined, color: AppColors.brandDark),
          ),
          SwitchListTile(
            title: const Text('Sonido'),
            subtitle: const Text('Reproducir sonido con notificaciones'),
            value: _sound,
            onChanged: (value) {
              setState(() => _sound = value);
              Hive.box('settings').put('sound', value);
            },
            secondary: const Icon(Icons.volume_up_outlined, color: AppColors.brandDark),
          ),

          const Divider(),

          // Location
          const _SectionHeader(title: 'Ubicación'),
          SwitchListTile(
            title: const Text('Servicios de Ubicación'),
            subtitle: const Text('Permitir acceso a tu ubicación'),
            value: _location,
            onChanged: (value) {
              setState(() => _location = value);
              Hive.box('settings').put('location', value);
            },
            secondary: const Icon(Icons.location_on_outlined, color: AppColors.brandDark),
          ),

          const Divider(),

          // Language
          const _SectionHeader(title: 'Idioma'),
          ListTile(
            leading: const Icon(Icons.language, color: AppColors.brandDark),
            title: const Text('Idioma de la App'),
            subtitle: Text(_language),
            trailing: const Icon(Icons.chevron_right),
            onTap: _showLanguagePicker,
          ),

          const Divider(),

          // About
          const _SectionHeader(title: 'Acerca de'),
          const ListTile(
            leading: Icon(Icons.info_outline, color: AppColors.brandDark),
            title: Text('Versión'),
            subtitle: Text('1.0.0'),
          ),
          ListTile(
            leading: const Icon(Icons.description_outlined, color: AppColors.brandDark),
            title: const Text('Términos y Condiciones'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {},
          ),
          ListTile(
            leading: const Icon(Icons.privacy_tip_outlined, color: AppColors.brandDark),
            title: const Text('Política de Privacidad'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {},
          ),
          ListTile(
            leading: const Icon(Icons.code, color: AppColors.brandDark),
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
              color: AppColors.brandDark,
              fontWeight: FontWeight.bold,
            ),
      ),
    );
  }
}
