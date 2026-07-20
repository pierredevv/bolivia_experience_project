import 'package:url_launcher/url_launcher.dart';

class DeepLinkService {
  static Future<void> openInGoogleMaps({
    required double latitude,
    required double longitude,
    required String label,
  }) async {
    final url = Uri.parse(
      'https://www.google.com/maps/search/?api=1&query=$latitude,$longitude&query_place_id=$label',
    );

    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    }
  }

  static Future<void> openInWaze({
    required double latitude,
    required double longitude,
  }) async {
    final url = Uri.parse(
      'https://waze.com/ul?ll=$latitude,$longitude&navigate=yes',
    );

    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    }
  }

  static Future<void> openDirections({
    required double latitude,
    required double longitude,
    required String label,
  }) async {
    final url = Uri.parse(
      'https://www.google.com/maps/dir/?api=1&destination=$latitude,$longitude&destination_place_id=$label',
    );

    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    }
  }

  static Future<void> makePhoneCall({required String phoneNumber}) async {
    final url = Uri.parse('tel:$phoneNumber');

    if (await canLaunchUrl(url)) {
      await launchUrl(url);
    }
  }
}
