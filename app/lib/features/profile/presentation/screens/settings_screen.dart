import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive/hive.dart';
import '../../../../config/colors.dart';
import '../../../../config/router.dart';
import '../../../../core/currency/currency.dart';

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
  late String _currency;

  @override
  void initState() {
    super.initState();
    final box = Hive.box('settings');
    _pushNotifications = box.get('pushNotifications', defaultValue: true) as bool;
    _sound = box.get('sound', defaultValue: true) as bool;
    _location = box.get('location', defaultValue: true) as bool;
    _language = box.get('language', defaultValue: 'Español') as String;
    _currency = effectiveCurrencyCode();
  }

  void _selectCurrency(String code) {
    if (code == 'BOB') {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'No disponible por el momento debido a la fluctuación de la moneda',
          ),
        ),
      );
      return;
    }
    if (code == _currency) return;
    setState(() => _currency = code);
    Hive.box('settings').put(kCurrencyPreferenceKey, code);
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

          // Currency
          const _SectionHeader(title: 'Moneda'),
          for (final c in supportedCurrencies)
            _CurrencyTile(
              currency: c,
              selected: c.code == _currency,
              onTap: c.comingSoon
                  ? null
                  : () => _selectCurrency(c.code),
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

class _CurrencyTile extends StatelessWidget {
  final SupportedCurrency currency;
  final bool selected;
  final VoidCallback? onTap;

  const _CurrencyTile({
    required this.currency,
    required this.selected,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final content = ListTile(
      enabled: onTap != null,
      leading: Opacity(
        opacity: onTap == null ? 0.5 : 1,
        child: Text(
          currencySymbol(currency.code),
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: AppColors.brandDark,
          ),
        ),
      ),
      title: Text(
        currency.label,
        style: TextStyle(
          color: onTap == null ? AppColors.textSecondary : null,
        ),
      ),
      trailing: selected
          ? const Icon(Icons.check_circle_rounded, color: AppColors.brandEmerald)
          : (currency.comingSoon
              ? Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.textSecondary.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: const Text(
                    'Próximamente',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textSecondary,
                    ),
                  ),
                )
              : null),
      onTap: onTap,
    );

    if (onTap == null) {
      return Opacity(opacity: 0.55, child: content);
    }
    return content;
  }
}
