import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class OnboardingPreferences {
  final String? tourismType;
  final String? budgetType;
  final List<String> interests;

  const OnboardingPreferences({
    this.tourismType,
    this.budgetType,
    this.interests = const [],
  });

  bool get isEmpty =>
      tourismType == null && budgetType == null && interests.isEmpty;

  factory OnboardingPreferences.fromJson(Map<String, dynamic> json) {
    final rawInterests = json['interests'];
    return OnboardingPreferences(
      tourismType: json['tourismType'] as String?,
      budgetType: json['budgetType'] as String?,
      interests: rawInterests is List
          ? rawInterests.map((e) => e.toString()).toList()
          : const [],
    );
  }

  Map<String, dynamic> toJson() => {
        if (tourismType != null) 'tourismType': tourismType,
        if (budgetType != null) 'budgetType': budgetType,
        'interests': interests,
      };
}

const String kOnboardingPreferencesKey = 'onboarding_preferences';

class OnboardingPreferencesStore {
  static const String _key = kOnboardingPreferencesKey;

  static Future<OnboardingPreferences> load() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_key);
    if (raw == null) return const OnboardingPreferences();
    try {
      return OnboardingPreferences.fromJson(
        jsonDecode(raw) as Map<String, dynamic>,
      );
    } catch (_) {
      return const OnboardingPreferences();
    }
  }

  static Future<void> save(OnboardingPreferences preferences) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_key, jsonEncode(preferences.toJson()));
  }

  static Future<bool> wasCompleted() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool('onboarding_completed') ?? false;
  }

  static Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_key);
  }
}