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

  static Future<void> copyLink({required String placeId}) async {
    final url = 'https://boliviaexperience.app/places/$placeId';
    await Share.share(url);
  }
}
