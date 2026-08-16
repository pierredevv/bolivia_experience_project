class PersonalizedRecommendations {
  final List<Map<String, dynamic>> recommendations;
  final RecommendationBasedOn basedOn;

  const PersonalizedRecommendations({
    required this.recommendations,
    required this.basedOn,
  });

  factory PersonalizedRecommendations.fromJson(Map<String, dynamic> json) {
    final recs = json['recommendations'];
    return PersonalizedRecommendations(
      recommendations: recs is List
          ? recs.whereType<Map<String, dynamic>>().toList()
          : [],
      basedOn: RecommendationBasedOn.fromJson(
        json['basedOn'] is Map<String, dynamic>
            ? json['basedOn'] as Map<String, dynamic>
            : const {},
      ),
    );
  }
}

class RecommendationBasedOn {
  final List<String> favoriteCategories;
  final int totalFavorites;
  final int totalReviews;
  final RecommendationPreferences preferences;

  const RecommendationBasedOn({
    required this.favoriteCategories,
    required this.totalFavorites,
    required this.totalReviews,
    required this.preferences,
  });

  factory RecommendationBasedOn.fromJson(Map<String, dynamic> json) {
    final cats = json['favoriteCategories'];
    return RecommendationBasedOn(
      favoriteCategories: cats is List ? cats.map((e) => e.toString()).toList() : [],
      totalFavorites: (json['totalFavorites'] as num?)?.toInt() ?? 0,
      totalReviews: (json['totalReviews'] as num?)?.toInt() ?? 0,
      preferences: RecommendationPreferences.fromJson(
        json['preferences'] is Map<String, dynamic>
            ? json['preferences'] as Map<String, dynamic>
            : const {},
      ),
    );
  }
}

class RecommendationPreferences {
  final String? budgetType;
  final String? tourismType;
  final String source;

  const RecommendationPreferences({
    this.budgetType,
    this.tourismType,
    this.source = 'none',
  });

  factory RecommendationPreferences.fromJson(Map<String, dynamic> json) {
    return RecommendationPreferences(
      budgetType: json['budgetType']?.toString(),
      tourismType: json['tourismType']?.toString(),
      source: json['source']?.toString() ?? 'none',
    );
  }
}
