class HomeExperience {
  final String id;
  final String name;
  final String? description;
  final String? descriptionEn;
  final String? experienceCategory;
  final double price;
  final double? pricePerAdult;
  final bool priceVarByGroup;
  final String currency;
  final String? photoUrl;
  final double ratingAvg;
  final int ratingCount;
  final bool recommended;
  final String? recommendedReason;
  final bool verified;
  final PlaceInfo? place;

  const HomeExperience({
    required this.id,
    required this.name,
    this.description,
    this.descriptionEn,
    this.experienceCategory,
    this.price = 0,
    this.pricePerAdult,
    this.priceVarByGroup = false,
    this.currency = 'BOB',
    this.photoUrl,
    this.ratingAvg = 0,
    this.ratingCount = 0,
    this.recommended = false,
    this.recommendedReason,
    this.verified = false,
    this.place,
  });

  factory HomeExperience.fromJson(Map<String, dynamic> json) {
    return HomeExperience(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      description: json['description']?.toString(),
      descriptionEn: json['descriptionEn']?.toString(),
      experienceCategory: json['experienceCategory']?.toString(),
      price: (json['price'] is num ? json['price'] as num : 0).toDouble(),
      pricePerAdult: json['pricePerAdult'] is num
          ? (json['pricePerAdult'] as num).toDouble()
          : null,
      priceVarByGroup: json['priceVarByGroup'] == true,
      currency: json['currency']?.toString() ?? 'BOB',
      photoUrl: json['photoUrl']?.toString(),
      ratingAvg: (json['ratingAvg'] is num ? json['ratingAvg'] as num : 0)
          .toDouble(),
      ratingCount: json['ratingCount'] is num
          ? (json['ratingCount'] as num).toInt()
          : 0,
      recommended: json['recommended'] == true,
      recommendedReason: json['recommendedReason']?.toString(),
      verified: json['verified'] == true,
      place: json['place'] is Map<String, dynamic>
          ? PlaceInfo.fromJson(json['place'] as Map<String, dynamic>)
          : null,
    );
  }
}

class PlaceInfo {
  final String id;
  final String name;
  final String? address;
  final String? city;
  final String? categorySlug;

  const PlaceInfo({
    required this.id,
    required this.name,
    this.address,
    this.city,
    this.categorySlug,
  });

  factory PlaceInfo.fromJson(Map<String, dynamic> json) {
    return PlaceInfo(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      address: json['address']?.toString(),
      city: json['city']?.toString(),
      categorySlug: json['categorySlug']?.toString(),
    );
  }
}
