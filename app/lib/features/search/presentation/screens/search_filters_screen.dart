import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../../../config/colors.dart';
import '../../../../config/api_constants.dart';
import '../../../../core/network/dio_provider.dart';

// ============================================================================
// SearchFilters Model
// ============================================================================
class SearchFilters {
  final String? categoryId;
  final double? minRating;
  final double? maxRating;
  final bool? featured;
  final String? sortBy;
  final double? maxDistance;

  const SearchFilters({
    this.categoryId,
    this.minRating,
    this.maxRating,
    this.featured,
    this.sortBy,
    this.maxDistance,
  });

  SearchFilters copyWith({
    String? categoryId,
    double? minRating,
    double? maxRating,
    bool? featured,
    String? sortBy,
    double? maxDistance,
    bool clearCategoryId = false,
    bool clearMinRating = false,
    bool clearMaxRating = false,
    bool clearFeatured = false,
    bool clearSortBy = false,
    bool clearMaxDistance = false,
  }) {
    return SearchFilters(
      categoryId: clearCategoryId ? null : (categoryId ?? this.categoryId),
      minRating: clearMinRating ? null : (minRating ?? this.minRating),
      maxRating: clearMaxRating ? null : (maxRating ?? this.maxRating),
      featured: clearFeatured ? null : (featured ?? this.featured),
      sortBy: clearSortBy ? null : (sortBy ?? this.sortBy),
      maxDistance: clearMaxDistance ? null : (maxDistance ?? this.maxDistance),
    );
  }

  bool get hasFilters {
    return categoryId != null ||
        minRating != null ||
        maxRating != null ||
        featured != null ||
        sortBy != null ||
        maxDistance != null;
  }

  int get activeCount {
    int count = 0;
    if (categoryId != null) count++;
    if (minRating != null) count++;
    if (maxRating != null) count++;
    if (featured != null) count++;
    if (sortBy != null) count++;
    if (maxDistance != null) count++;
    return count;
  }

  Map<String, dynamic> toQueryParams() {
    final params = <String, dynamic>{};
    if (categoryId != null) params['categoryId'] = categoryId;
    if (minRating != null) params['minRating'] = minRating;
    if (maxRating != null) params['maxRating'] = maxRating;
    if (featured != null) params['featured'] = featured;
    if (sortBy != null) params['sortBy'] = sortBy;
    if (maxDistance != null) params['radius'] = maxDistance;
    return params;
  }
}

// ============================================================================
// Category Model
// ============================================================================
class _FilterCategory {
  final String? id;
  final String name;
  final IconData icon;

  const _FilterCategory({
    this.id,
    required this.name,
    this.icon = Icons.category,
  });
}

// ============================================================================
// Categories Provider
// ============================================================================
final categoriesFutureProvider = FutureProvider<List<_FilterCategory>>((ref) async {
  final dio = ref.read(dioProvider);
  try {
    final response = await dio.get(ApiConstants.categories);
    final data = response.data;
    final List items = data['data'] ?? data;
    
    final categories = <_FilterCategory>[
      const _FilterCategory(id: null, name: 'Todas', icon: Icons.all_inclusive),
    ];
    
    for (final item in items) {
      categories.add(_FilterCategory(
        id: item['id'],
        name: item['name'],
        icon: _getIconFromString(item['icon']),
      ));
    }
    
    return categories;
  } catch (e) {
    // Return default categories if API fails
    return const [
      _FilterCategory(id: null, name: 'Todas', icon: Icons.all_inclusive),
      _FilterCategory(id: null, name: 'Restaurantes', icon: Icons.restaurant),
      _FilterCategory(id: null, name: 'Hoteles', icon: Icons.hotel),
      _FilterCategory(id: null, name: 'Atracciones', icon: Icons.attractions),
      _FilterCategory(id: null, name: 'Cafeterías', icon: Icons.coffee),
      _FilterCategory(id: null, name: 'Parques', icon: Icons.park),
    ];
  }
});

IconData _getIconFromString(String iconName) {
  switch (iconName.toLowerCase()) {
    case 'restaurant':
    case 'restaurant_menu':
      return Icons.restaurant;
    case 'hotel':
    case 'bed':
      return Icons.hotel;
    case 'place':
    case 'attractions':
    case 'terrain':
      return Icons.attractions;
    case 'local_cafe':
    case 'coffee':
      return Icons.coffee;
    case 'park':
    case 'trees':
      return Icons.park;
    case 'shopping_cart':
    case 'store':
      return Icons.store;
    case 'museum':
    case 'palette':
      return Icons.museum;
    case 'local_bar':
    case 'nightlife':
      return Icons.local_bar;
    default:
      return Icons.place;
  }
}

// ============================================================================
// Filters Screen
// ============================================================================
class SearchFiltersScreen extends ConsumerStatefulWidget {
  final SearchFilters initialFilters;

  const SearchFiltersScreen({super.key, required this.initialFilters});

  @override
  ConsumerState<SearchFiltersScreen> createState() => _SearchFiltersScreenState();
}

class _SearchFiltersScreenState extends ConsumerState<SearchFiltersScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  late Animation<double> _fadeIn;
  
  String? _selectedCategoryId;
  RangeValues _ratingRange = const RangeValues(1, 5);
  bool _hasRatingFilter = false;
  bool? _featured;
  String? _sortBy;
  double? _maxDistance;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _fadeIn = CurvedAnimation(parent: _animController, curve: Curves.easeOut);
    _animController.forward();
    
    _initFromFilters();
  }

  void _initFromFilters() {
    final f = widget.initialFilters;
    _selectedCategoryId = f.categoryId;
    _hasRatingFilter = f.minRating != null || f.maxRating != null;
    _ratingRange = RangeValues(f.minRating ?? 1, f.maxRating ?? 5);
    _featured = f.featured;
    _sortBy = f.sortBy;
    _maxDistance = f.maxDistance;
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final categoriesAsync = ref.watch(categoriesFutureProvider);

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            const Text('Filtros'),
            const SizedBox(width: 8),
            _buildActiveCountBadge(),
          ],
        ),
        actions: [
          TextButton(
            onPressed: _clearAllFilters,
            child: const Text('Limpiar todo'),
          ),
        ],
      ),
      body: FadeTransition(
        opacity: _fadeIn,
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Categories
                    _buildSection(
                      title: 'Categoría',
                      icon: Icons.category_outlined,
                      onClear: () => setState(() => _selectedCategoryId = null),
                      hasFilter: _selectedCategoryId != null,
                      child: categoriesAsync.when(
                        data: (categories) => _buildCategoryChips(categories),
                        loading: () => const Center(
                          child: Padding(
                            padding: EdgeInsets.all(16),
                            child: CircularProgressIndicator(),
                          ),
                        ),
                        error: (_, __) => const Center(
                          child: Text('Error al cargar categorías'),
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),

                    // Rating
                    _buildSection(
                      title: 'Calificación',
                      icon: Icons.star_outline,
                      onClear: () => setState(() {
                        _hasRatingFilter = false;
                        _ratingRange = const RangeValues(1, 5);
                      }),
                      hasFilter: _hasRatingFilter,
                      child: _buildRatingSection(),
                    ),
                    const SizedBox(height: 8),

                    // Distance
                    _buildSection(
                      title: 'Distancia',
                      icon: Icons.location_on_outlined,
                      onClear: () => setState(() => _maxDistance = null),
                      hasFilter: _maxDistance != null,
                      child: _buildDistanceSection(),
                    ),
                    const SizedBox(height: 8),

                    // Featured
                    _buildSection(
                      title: 'Destacados',
                      icon: Icons.featured_play_list_outlined,
                      onClear: () => setState(() => _featured = null),
                      hasFilter: _featured != null,
                      child: _buildFeaturedSection(),
                    ),
                    const SizedBox(height: 8),

                    // Sort
                    _buildSection(
                      title: 'Ordenar por',
                      icon: Icons.sort,
                      onClear: () => setState(() => _sortBy = null),
                      hasFilter: _sortBy != null,
                      child: _buildSortSection(),
                    ),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),

            // Apply button
            _buildApplyButton(),
          ],
        ),
      ),
    );
  }

  // ============================================================================
  // Active Count Badge
  // ============================================================================
  Widget _buildActiveCountBadge() {
    final count = _getActiveFilterCount();
    if (count == 0) return const SizedBox.shrink();
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: AppColors.primary700,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        '$count',
        style: const TextStyle(
          color: Colors.white,
          fontSize: 12,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  int _getActiveFilterCount() {
    int count = 0;
    if (_selectedCategoryId != null) count++;
    if (_hasRatingFilter) count++;
    if (_maxDistance != null) count++;
    if (_featured != null) count++;
    if (_sortBy != null) count++;
    return count;
  }

  // ============================================================================
  // Section Builder
  // ============================================================================
  Widget _buildSection({
    required String title,
    required IconData icon,
    required Widget child,
    VoidCallback? onClear,
    bool hasFilter = false,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: hasFilter
            ? Border.all(color: AppColors.primary200, width: 2)
            : null,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 8, 8),
            child: Row(
              children: [
                Icon(icon, size: 20, color: AppColors.primary600),
                const SizedBox(width: 8),
                Text(
                  title,
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Spacer(),
                if (hasFilter)
                  IconButton(
                    icon: const Icon(Icons.close, size: 18),
                    onPressed: onClear,
                    visualDensity: VisualDensity.compact,
                    tooltip: 'Limpiar',
                  ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: child,
          ),
        ],
      ),
    );
  }

  // ============================================================================
  // Category Chips
  // ============================================================================
  Widget _buildCategoryChips(List<_FilterCategory> categories) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: categories.map((cat) {
        final isSelected = _selectedCategoryId == cat.id && cat.id != null;
        return AnimatedScale(
          scale: isSelected ? 1.05 : 1.0,
          duration: const Duration(milliseconds: 200),
          child: FilterChip(
            avatar: Icon(
              cat.icon,
              size: 18,
              color: isSelected ? AppColors.primary700 : AppColors.neutral600,
            ),
            label: Text(cat.name),
            selected: isSelected,
            onSelected: (selected) {
              setState(() {
                _selectedCategoryId = selected ? cat.id : null;
              });
            },
            selectedColor: AppColors.primary100,
            checkmarkColor: AppColors.primary700,
            side: BorderSide(
              color: isSelected ? AppColors.primary300 : AppColors.neutral300,
            ),
          ),
        );
      }).toList(),
    );
  }

  // ============================================================================
  // Rating Section
  // ============================================================================
  Widget _buildRatingSection() {
    return Column(
      children: [
        Row(
          children: [
            Switch(
              value: _hasRatingFilter,
              onChanged: (value) {
                setState(() {
                  _hasRatingFilter = value;
                  if (!value) {
                    _ratingRange = const RangeValues(1, 5);
                  }
                });
              },
              activeColor: AppColors.primary600,
            ),
            const SizedBox(width: 8),
            Text(
              _hasRatingFilter ? 'Filtrar por calificación' : 'Sin filtro de calificación',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
        ),
        if (_hasRatingFilter) ...[
          const SizedBox(height: 8),
          Row(
            children: [
              _buildRatingStars(_ratingRange.start.round()),
              Expanded(
                child: RangeSlider(
                  values: _ratingRange,
                  min: 1,
                  max: 5,
                  divisions: 4,
                  labels: RangeLabels(
                    '${_ratingRange.start.round()}',
                    '${_ratingRange.end.round()}',
                  ),
                  onChanged: (values) {
                    setState(() {
                      _ratingRange = values;
                    });
                  },
                  activeColor: AppColors.primary600,
                ),
              ),
              _buildRatingStars(_ratingRange.end.round()),
            ],
          ),
          Center(
            child: Text(
              '${_ratingRange.start.round()} - ${_ratingRange.end.round()} estrellas',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: AppColors.neutral600,
              ),
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildRatingStars(int rating) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(5, (i) {
        return Icon(
          i < rating ? Icons.star : Icons.star_border,
          size: 16,
          color: i < rating ? Colors.amber : AppColors.neutral400,
        );
      }),
    );
  }

  // ============================================================================
  // Distance Section
  // ============================================================================
  Widget _buildDistanceSection() {
    final distances = [
      {'value': null, 'label': 'Cualquier distancia'},
      {'value': 1000.0, 'label': 'Hasta 1 km'},
      {'value': 3000.0, 'label': 'Hasta 3 km'},
      {'value': 5000.0, 'label': 'Hasta 5 km'},
      {'value': 10000.0, 'label': 'Hasta 10 km'},
      {'value': 20000.0, 'label': 'Hasta 20 km'},
    ];

    return Column(
      children: distances.map((d) {
        final isSelected = _maxDistance == d['value'];
        return RadioListTile<double?>(
          title: Text(d['label'] as String),
          value: d['value'] as double?,
          groupValue: _maxDistance,
          onChanged: (value) {
            setState(() {
              _maxDistance = value;
            });
          },
          activeColor: AppColors.primary600,
          contentPadding: EdgeInsets.zero,
          dense: true,
        );
      }).toList(),
    );
  }

  // ============================================================================
  // Featured Section
  // ============================================================================
  Widget _buildFeaturedSection() {
    return Column(
      children: [
        _buildFeaturedOption('Todos los lugares', null),
        _buildFeaturedOption('Solo destacados', true),
      ],
    );
  }

  Widget _buildFeaturedOption(String label, bool? value) {
    return RadioListTile<bool?>(
      title: Text(label),
      value: value,
      groupValue: _featured,
      onChanged: (v) {
        setState(() {
          _featured = v;
        });
      },
      activeColor: AppColors.primary600,
      contentPadding: EdgeInsets.zero,
      dense: true,
    );
  }

  // ============================================================================
  // Sort Section
  // ============================================================================
  Widget _buildSortSection() {
    final options = [
      {'value': null, 'label': 'Por defecto', 'icon': Icons.sort},
      {'value': 'ratingAvg', 'label': 'Mejor calificados', 'icon': Icons.star},
      {'value': 'name', 'label': 'Nombre (A-Z)', 'icon': Icons.sort_by_alpha},
      {'value': 'createdAt', 'label': 'Más recientes', 'icon': Icons.new_releases},
    ];

    return Column(
      children: options.map((opt) {
        return RadioListTile<String?>(
          title: Row(
            children: [
              Icon(opt['icon'] as IconData, size: 20, color: AppColors.neutral600),
              const SizedBox(width: 12),
              Text(opt['label'] as String),
            ],
          ),
          value: opt['value'] as String?,
          groupValue: _sortBy,
          onChanged: (value) {
            setState(() {
              _sortBy = value;
            });
          },
          activeColor: AppColors.primary600,
          contentPadding: EdgeInsets.zero,
          dense: true,
        );
      }).toList(),
    );
  }

  // ============================================================================
  // Apply Button
  // ============================================================================
  Widget _buildApplyButton() {
    final count = _getActiveFilterCount();
    
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: SizedBox(
          width: double.infinity,
          height: 52,
          child: ElevatedButton(
            onPressed: _applyFilters,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary700,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              elevation: 0,
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.check, size: 20),
                const SizedBox(width: 8),
                Text(
                  count > 0
                      ? 'Aplicar $count filtro${count > 1 ? 's' : ''}'
                      : 'Mostrar todos',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ============================================================================
  // Actions
  // ============================================================================
  void _clearAllFilters() {
    setState(() {
      _selectedCategoryId = null;
      _hasRatingFilter = false;
      _ratingRange = const RangeValues(1, 5);
      _featured = null;
      _sortBy = null;
      _maxDistance = null;
    });
  }

  void _applyFilters() {
    final filters = SearchFilters(
      categoryId: _selectedCategoryId,
      minRating: _hasRatingFilter ? _ratingRange.start : null,
      maxRating: _hasRatingFilter ? _ratingRange.end : null,
      featured: _featured,
      sortBy: _sortBy,
      maxDistance: _maxDistance,
    );
    Navigator.pop(context, filters);
  }
}
