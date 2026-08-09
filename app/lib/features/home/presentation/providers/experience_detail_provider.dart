import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/experience_detail.dart';
import 'home_provider.dart';

final experienceDetailProvider =
    FutureProvider.autoDispose.family<ExperienceDetail, String>((ref, id) async {
  final service = ref.watch(homeServiceProvider);
  final detail = await service.getExperienceDetail(id);
  List<ExperienceReview> reviews = const [];
  try {
    reviews = await service.getExperienceReviews(id);
  } catch (e) {
    reviews = const [];
  }
  return detail.copyWith(reviews: reviews);
});
