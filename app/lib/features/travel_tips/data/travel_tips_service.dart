class TravelTipsService {
  final Dio _dio;

  TravelTipsService(this._dio);

  Future<List<TravelTip>> getTips({
    String? category,
    String city = 'santa-cruz',
  }) async {
    final response = await _dio.get(
      ApiConstants.travelTips,
      queryParameters: {
        if (category != null) 'category': category,
        'city': city,
      },
    );
    final data = response.data;
    final list = data is List
        ? data
        : data is Map<String, dynamic>
            ? (data['data'] as List?) ?? []
            : <dynamic>[];
    return list
        .whereType<Map<String, dynamic>>()
        .map(TravelTip.fromJson)
        .toList();
  }
}

final travelTipsServiceProvider = Provider<TravelTipsService>((ref) {
  return TravelTipsService(ref.read(dioProvider));
});
