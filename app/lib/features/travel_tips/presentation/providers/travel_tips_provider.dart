import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:bolivia_experience/features/travel_tips/data/travel_tips_service.dart';

final travelTipsListProvider = FutureProvider<List<TravelTip>>((ref) async {
  final service = ref.watch(travelTipsServiceProvider);
  return service.getTips(city: 'santa-cruz');
});
