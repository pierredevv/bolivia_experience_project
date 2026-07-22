import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';

class ShareService {
  static Future<void> sharePlace({
    required String placeId,
    required String placeName,
    required String address,
  }) async {
    final url = 'https://boliviaexperience.app/places/$placeId';
    final text = '¡Mira este lugar en BoliviaExperience! 🇧🇴\n\n'
        '$placeName\n'
        '$address\n\n'
        '$url';

    await Share.share(text, subject: placeName);
  }

  static Future<void> shareEvent({
    required String eventId,
    required String eventName,
    required String? eventDate,
  }) async {
    final url = 'https://boliviaexperience.app/events/$eventId';
    final dateText = eventDate != null ? '\n📅 $eventDate' : '';
    final text = '¡No te pierdas este evento! 🎉\n\n'
        '$eventName$dateText\n\n'
        '$url';

    await Share.share(text, subject: eventName);
  }

  static Future<void> shareViaWhatsApp({
    required String placeId,
    required String placeName,
    required String address,
  }) async {
    final url = 'https://boliviaexperience.app/places/$placeId';
    final text = '¡Mira este lugar en BoliviaExperience! 🇧🇴\n\n'
        '$placeName\n'
        '$address\n\n'
        '$url';

    final whatsappUrl = Uri.parse(
      'https://wa.me/?text=${Uri.encodeComponent(text)}',
    );

    if (await canLaunchUrl(whatsappUrl)) {
      await launchUrl(whatsappUrl);
    }
  }

  static Future<void> shareEventViaWhatsApp({
    required String eventId,
    required String eventName,
  }) async {
    final url = 'https://boliviaexperience.app/events/$eventId';
    final text = '¡No te pierdas este evento! 🎉\n\n'
        '$eventName\n\n'
        '$url';

    final whatsappUrl = Uri.parse(
      'https://wa.me/?text=${Uri.encodeComponent(text)}',
    );

    if (await canLaunchUrl(whatsappUrl)) {
      await launchUrl(whatsappUrl);
    }
  }

  static Future<void> copyLink({required String placeId}) async {
    final url = 'https://boliviaexperience.app/places/$placeId';
    await Share.share(url);
  }

  static Future<void> shareApp() async {
    const text = '¡Descargá BoliviaExperience! 🇧🇴\n\n'
        'Toda Santa Cruz en la palma de tu mano.\n\n'
        'Android: https://play.google.com/store/apps/details?id=com.boliviaexperience.app\n'
        'iOS: https://apps.apple.com/app/boliviaexperience/id123456789';

    await Share.share(text, subject: 'BoliviaExperience');
  }
}
