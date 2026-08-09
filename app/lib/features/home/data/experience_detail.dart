class ExperienceDetail {
  final String id;
  final String name;
  final String? description;
  final String? experienceCategory;
  final double price;
  final double? pricePerAdult;
  final bool priceVarByGroup;
  final String currency;
  final String? photoUrl;
  final String? duration;
  final int? minAge;
  final int? maxAge;
  final int? maxGroup;
  final String? guideLanguage;
  final bool mobileTicket;
  final int? advanceDays;
  final List<String> policies;
  final double ratingAvg;
  final int ratingCount;
  final bool recommended;
  final String? recommendedReason;
  final ExperienceSocio? socio;
  final ExperiencePlace? place;
  final ExperiencePolicy? policy;
  final List<ExperienceSlot> slots;
  final List<ExperienceReview> reviews;

  const ExperienceDetail({
    required this.id,
    required this.name,
    this.description,
    this.experienceCategory,
    this.price = 0,
    this.pricePerAdult,
    this.priceVarByGroup = false,
    this.currency = 'BOB',
    this.photoUrl,
    this.duration,
    this.minAge,
    this.maxAge,
    this.maxGroup,
    this.guideLanguage,
    this.mobileTicket = false,
    this.advanceDays,
    this.policies = const [],
    this.ratingAvg = 0,
    this.ratingCount = 0,
    this.recommended = false,
    this.recommendedReason,
    this.socio,
    this.place,
    this.policy,
    this.slots = const [],
    this.reviews = const [],
  });

  double get displayPrice => pricePerAdult ?? price;

  factory ExperienceDetail.fromJson(Map<String, dynamic> json) {
    final policiesRaw = json['policies'];
    List<String> policies = [];
    if (policiesRaw is List) {
      policies = policiesRaw
          .whereType<String>()
          .toList(growable: true);
    }

    List<ExperienceSlot> slots = [];
    if (json['slots'] is List) {
      slots = (json['slots'] as List)
          .whereType<Map<String, dynamic>>()
          .map((item) => ExperienceSlot.fromJson(item))
          .toList();
    }

    return ExperienceDetail(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      description: json['description']?.toString(),
      experienceCategory: json['experienceCategory']?.toString(),
      price: (json['price'] is num ? json['price'] as num : 0).toDouble(),
      pricePerAdult: json['pricePerAdult'] is num
          ? (json['pricePerAdult'] as num).toDouble()
          : null,
      priceVarByGroup: json['priceVarByGroup'] == true,
      currency: json['currency']?.toString() ?? 'BOB',
      photoUrl: json['photoUrl']?.toString(),
      duration: json['duration']?.toString(),
      minAge: json['minAge'] is num ? (json['minAge'] as num).toInt() : null,
      maxAge: json['maxAge'] is num ? (json['maxAge'] as num).toInt() : null,
      maxGroup: json['maxGroup'] is num ? (json['maxGroup'] as num).toInt() : null,
      guideLanguage: json['guideLanguage']?.toString(),
      mobileTicket: json['mobileTicket'] == true,
      advanceDays: json['advanceDays'] is num
          ? (json['advanceDays'] as num).toInt()
          : null,
      policies: policies,
      ratingAvg: (json['ratingAvg'] is num ? json['ratingAvg'] as num : 0)
          .toDouble(),
      ratingCount: json['ratingCount'] is num
          ? (json['ratingCount'] as num).toInt()
          : 0,
      recommended: json['recommended'] == true,
      recommendedReason: json['recommendedReason']?.toString(),
      socio: json['socio'] is Map<String, dynamic>
          ? ExperienceSocio.fromJson(json['socio'] as Map<String, dynamic>)
          : null,
      place: json['place'] is Map<String, dynamic>
          ? ExperiencePlace.fromJson(json['place'] as Map<String, dynamic>)
          : null,
      policy: json['policy'] is Map<String, dynamic>
          ? ExperiencePolicy.fromJson(json['policy'] as Map<String, dynamic>)
          : null,
      slots: slots,
    );
  }

  ExperienceDetail copyWith({List<ExperienceReview>? reviews}) {
    return ExperienceDetail(
      id: id,
      name: name,
      description: description,
      experienceCategory: experienceCategory,
      price: price,
      pricePerAdult: pricePerAdult,
      priceVarByGroup: priceVarByGroup,
      currency: currency,
      photoUrl: photoUrl,
      duration: duration,
      minAge: minAge,
      maxAge: maxAge,
      maxGroup: maxGroup,
      guideLanguage: guideLanguage,
      mobileTicket: mobileTicket,
      advanceDays: advanceDays,
      policies: policies,
      ratingAvg: ratingAvg,
      ratingCount: ratingCount,
      recommended: recommended,
      recommendedReason: recommendedReason,
      socio: socio,
      place: place,
      policy: policy,
      slots: slots,
      reviews: reviews ?? this.reviews,
    );
  }
}

class ExperienceSocio {
  final String id;
  final String name;
  final String? businessName;
  final bool isPremium;

  const ExperienceSocio({
    required this.id,
    required this.name,
    this.businessName,
    this.isPremium = false,
  });

  factory ExperienceSocio.fromJson(Map<String, dynamic> json) {
    return ExperienceSocio(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      businessName: json['businessName']?.toString(),
      isPremium: json['isPremium'] == true,
    );
  }
}

class ExperiencePlace {
  final String id;
  final String name;
  final String? address;
  final String? city;
  final double? latitude;
  final double? longitude;
  final ExperienceCategory? category;

  const ExperiencePlace({
    required this.id,
    required this.name,
    this.address,
    this.city,
    this.latitude,
    this.longitude,
    this.category,
  });

  factory ExperiencePlace.fromJson(Map<String, dynamic> json) {
    return ExperiencePlace(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      address: json['address']?.toString(),
      city: json['city']?.toString(),
      latitude: json['latitude'] is num
          ? (json['latitude'] as num).toDouble()
          : null,
      longitude: json['longitude'] is num
          ? (json['longitude'] as num).toDouble()
          : null,
      category: json['category'] is Map<String, dynamic>
          ? ExperienceCategory.fromJson(json['category'] as Map<String, dynamic>)
          : null,
    );
  }
}

class ExperienceCategory {
  final String id;
  final String name;
  final String? slug;

  const ExperienceCategory({
    required this.id,
    required this.name,
    this.slug,
  });

  factory ExperienceCategory.fromJson(Map<String, dynamic> json) {
    return ExperienceCategory(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      slug: json['slug']?.toString(),
    );
  }
}

class ExperiencePolicy {
  final String id;
  final String name;
  final String? rulesJson;

  const ExperiencePolicy({
    required this.id,
    required this.name,
    this.rulesJson,
  });

  factory ExperiencePolicy.fromJson(Map<String, dynamic> json) {
    return ExperiencePolicy(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      rulesJson: json['rulesJson']?.toString(),
    );
  }
}

class ExperienceSlot {
  final String id;
  final String date;
  final String time;
  final int capacity;
  final bool isFallback;

  const ExperienceSlot({
    required this.id,
    required this.date,
    required this.time,
    this.capacity = 10,
    this.isFallback = false,
  });

  factory ExperienceSlot.fromJson(Map<String, dynamic> json) {
    final rawId = json['id']?.toString() ?? '';
    return ExperienceSlot(
      id: rawId,
      date: json['date']?.toString() ?? '',
      time: json['time']?.toString() ?? '',
      capacity: json['capacity'] is num ? (json['capacity'] as num).toInt() : 10,
      isFallback: rawId.startsWith('fallback-'),
    );
  }
}

class ExperienceReview {
  final String id;
  final int rating;
  final String? comment;
  final String? authorName;
  final String? authorPhoto;

  const ExperienceReview({
    required this.id,
    required this.rating,
    this.comment,
    this.authorName,
    this.authorPhoto,
  });

  factory ExperienceReview.fromJson(Map<String, dynamic> json) {
    final user = json['user'];
    return ExperienceReview(
      id: json['id']?.toString() ?? '',
      rating: json['rating'] is num ? (json['rating'] as num).toInt() : 0,
      comment: json['comment']?.toString(),
      authorName: user is Map<String, dynamic>
          ? user['name']?.toString()
          : null,
      authorPhoto: user is Map<String, dynamic>
          ? user['photoUrl']?.toString()
          : null,
    );
  }
}

const _monthsShort = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];
const _weekdays = [
  'Lunes', 'Martes', 'Miércoles', 'Jueves',
  'Viernes', 'Sábado', 'Domingo',
];

/// Etiqueta amigable para un slot: "Mañana", día de la semana o fecha corta.
String slotLabel(ExperienceSlot slot) {
  final parsed = DateTime.tryParse(slot.date);
  if (parsed == null) return slot.date;
  final now = DateTime.now();
  final today = DateTime(now.year, now.month, now.day);
  final day = DateTime(parsed.year, parsed.month, parsed.day);
  final diff = day.difference(today).inDays;
  if (diff == 1) return 'Mañana';
  if (diff >= 2 && diff < 7) return _weekdays[parsed.weekday - 1];
  return '${_monthsShort[parsed.month - 1]} ${parsed.day}';
}
