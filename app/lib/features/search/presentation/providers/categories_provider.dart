import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/dio_provider.dart';
import '../../data/categories_service.dart';

final categoriesServiceProvider = Provider<CategoriesService>((ref) {
  final dio = ref.read(dioProvider);
  return CategoriesService(dio);
});

final categoriesProvider = FutureProvider<List<Category>>((ref) async {
  final service = ref.read(categoriesServiceProvider);
  return service.getCategories();
});
