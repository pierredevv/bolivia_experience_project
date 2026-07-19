import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../config/colors.dart';
import '../providers/search_provider.dart';
import 'search_filters_screen.dart';

class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  final FocusNode _focusNode = FocusNode();

  @override
  void initState() {
    super.initState();
    ref.read(searchProvider.notifier).loadSearchHistory();
  }

  @override
  void dispose() {
    _searchController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final searchState = ref.watch(searchProvider);

    return Scaffold(
      appBar: AppBar(
        title: TextField(
          controller: _searchController,
          focusNode: _focusNode,
          autofocus: true,
          decoration: InputDecoration(
            hintText: 'Buscar lugares, eventos...',
            border: InputBorder.none,
            prefixIcon: const Icon(Icons.search),
            suffixIcon: _searchController.text.isNotEmpty
                ? IconButton(
                    icon: const Icon(Icons.clear),
                    onPressed: () {
                      _searchController.clear();
                      ref.read(searchProvider.notifier).clearSearch();
                    },
                  )
                : null,
          ),
          onChanged: (value) {
            ref.read(searchProvider.notifier).updateQuery(value);
            setState(() {});
          },
        ),
        actions: [
          // Filters button
          IconButton(
            icon: Icon(
              Icons.filter_list,
              color: searchState.filters.hasFilters
                  ? AppColors.primary700
                  : null,
            ),
            onPressed: _openFilters,
          ),
          TextButton(
            onPressed: () {
              _searchController.clear();
              ref.read(searchProvider.notifier).clearSearch();
              Navigator.pop(context);
            },
            child: const Text('Cancelar'),
          ),
        ],
      ),
      body: _buildBody(context, searchState),
    );
  }

  Future<void> _openFilters() async {
    final searchState = ref.read(searchProvider);
    final filters = await Navigator.push<SearchFilters>(
      context,
      MaterialPageRoute(
        builder: (context) => SearchFiltersScreen(
          initialFilters: searchState.filters,
        ),
      ),
    );

    if (filters != null) {
      ref.read(searchProvider.notifier).updateFilters(filters);
    }
  }

  Widget _buildBody(BuildContext context, SearchState state) {
    if (state.query.isEmpty && !state.filters.hasFilters) {
      return _buildHistoryAndSuggestions(context, state);
    }

    if (state.status == SearchStatus.loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (state.status == SearchStatus.error) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 64, color: AppColors.error500),
              const SizedBox(height: 16),
              Text(
                state.errorMessage ?? 'Error al buscar',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: () {
                  ref.read(searchProvider.notifier).search();
                },
                icon: const Icon(Icons.refresh),
                label: const Text('Reintentar'),
              ),
            ],
          ),
        ),
      );
    }

    if (state.results.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.search_off, size: 64, color: AppColors.neutral400),
              const SizedBox(height: 16),
              Text(
                'No se encontraron resultados',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 8),
              Text(
                'No encontramos resultados para "${state.query}"',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 8),
              Text(
                'Intentá con otros términos o ajustá los filtros',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ],
          ),
        ),
      );
    }

    return Column(
      children: [
        // Active filters chips
        if (state.filters.hasFilters)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                Text(
                  '${state.total} resultados',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                const Spacer(),
                TextButton.icon(
                  onPressed: () {
                    ref.read(searchProvider.notifier).updateFilters(
                      const SearchFilters(),
                    );
                  },
                  icon: const Icon(Icons.close, size: 16),
                  label: const Text('Limpiar filtros'),
                ),
              ],
            ),
          ),

        // Results list
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: state.results.length,
            itemBuilder: (context, index) {
              final result = state.results[index];
              return _SearchResultCard(
                result: result,
                onTap: () => context.go('/places/${result['id']}'),
              );
            },
          ),
        ),

        // Pagination
        if (state.totalPages > 1)
          Container(
            padding: const EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (state.page > 1)
                  IconButton(
                    icon: const Icon(Icons.chevron_left),
                    onPressed: () {
                      ref.read(searchProvider.notifier).updatePage(state.page - 1);
                    },
                  ),
                Text(
                  'Página ${state.page} de ${state.totalPages}',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                if (state.page < state.totalPages)
                  IconButton(
                    icon: const Icon(Icons.chevron_right),
                    onPressed: () {
                      ref.read(searchProvider.notifier).updatePage(state.page + 1);
                    },
                  ),
              ],
            ),
          ),
      ],
    );
  }

  Widget _buildHistoryAndSuggestions(BuildContext context, SearchState state) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (state.suggestions.isNotEmpty) ...[
            Text(
              'Sugerencias',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            ...state.suggestions.map((suggestion) {
              return ListTile(
                leading: const Icon(Icons.search, size: 20),
                title: Text(suggestion['name'] ?? suggestion.toString()),
                subtitle: suggestion['address'] != null
                    ? Text(
                        suggestion['address'],
                        style: Theme.of(context).textTheme.bodySmall,
                      )
                    : null,
                onTap: () {
                  final text = suggestion['name'] ?? suggestion.toString();
                  _searchController.text = text;
                  ref.read(searchProvider.notifier).updateQuery(text);
                },
              );
            }),
            const SizedBox(height: 16),
          ],
          if (state.searchHistory.isNotEmpty) ...[
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Búsquedas recientes',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                TextButton(
                  onPressed: () {
                    ref.read(searchProvider.notifier).clearHistory();
                  },
                  child: const Text('Limpiar'),
                ),
              ],
            ),
            const SizedBox(height: 8),
            ...state.searchHistory.map((history) {
              final text = history['query'] ?? history.toString();
              return ListTile(
                leading: const Icon(Icons.history, size: 20),
                title: Text(text),
                trailing: const Icon(Icons.north_west, size: 16),
                onTap: () {
                  _searchController.text = text;
                  ref.read(searchProvider.notifier).updateQuery(text);
                },
              );
            }),
          ],
          if (state.suggestions.isEmpty && state.searchHistory.isEmpty)
            Center(
              child: Padding(
                padding: const EdgeInsets.only(top: 100),
                child: Column(
                  children: [
                    Icon(Icons.search, size: 64, color: AppColors.neutral300),
                    const SizedBox(height: 16),
                    Text(
                      '¿Qué estás buscando?',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: AppColors.neutral500,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Usá los filtros para refinar tu búsqueda',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppColors.neutral400,
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _SearchResultCard extends StatelessWidget {
  final dynamic result;
  final VoidCallback? onTap;

  const _SearchResultCard({required this.result, this.onTap});

  @override
  Widget build(BuildContext context) {
    final photos = result['photos'] as List<dynamic>? ?? [];
    final photoUrl = photos.isNotEmpty ? photos[0]['url'] : null;
    final category = result['category'] as Map<String, dynamic>? ?? {};
    final ratingAvg = result['ratingAvg'] ?? 0;
    final ratingCount = result['ratingCount'] ?? 0;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: AppColors.neutral200,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: photoUrl != null
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.network(
                          photoUrl,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                            return Center(
                              child: Icon(Icons.image, color: AppColors.neutral400),
                            );
                          },
                        ),
                      )
                    : Center(
                        child: Icon(Icons.image, color: AppColors.neutral400),
                      ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      result['name'] ?? '',
                      style: Theme.of(context).textTheme.titleMedium,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    if (category.isNotEmpty)
                      Text(
                        category['name'] ?? '',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(Icons.star, size: 14, color: AppColors.secondary500),
                        const SizedBox(width: 4),
                        Text(
                          '${ratingAvg.toStringAsFixed(1)} ($ratingCount)',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                    if (result['address'] != null) ...[
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Icon(Icons.location_on, size: 14, color: AppColors.neutral500),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              result['address'],
                              style: Theme.of(context).textTheme.bodySmall,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
