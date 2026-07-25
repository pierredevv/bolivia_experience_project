import 'package:flutter/material.dart';
import '../../config/colors.dart';

class EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final String? actionLabel;
  final VoidCallback? onAction;

  const EmptyState({
    super.key,
    required this.icon,
    required this.title,
    this.subtitle,
    this.actionLabel,
    this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 64,
              color: AppColors.neutral400,
            ),
            const SizedBox(height: 16),
            Text(
              title,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: AppColors.neutral700,
                    fontWeight: FontWeight.w500,
                  ),
            ),
            if (subtitle != null) ...[
              const SizedBox(height: 8),
              Text(
                subtitle!,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppColors.neutral500,
                    ),
              ),
            ],
            if (actionLabel != null && onAction != null) ...[
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: onAction,
                icon: const Icon(Icons.refresh),
                label: Text(actionLabel!),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary700,
                  foregroundColor: Colors.white,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class EmptyStateFavorites extends StatelessWidget {
  const EmptyStateFavorites({super.key});

  @override
  Widget build(BuildContext context) {
    return const EmptyState(
      icon: Icons.favorite_border,
      title: 'No tienes favoritos aún',
      subtitle: 'Guarda lugares que te gusten',
    );
  }
}

class EmptyStateReviews extends StatelessWidget {
  const EmptyStateReviews({super.key});

  @override
  Widget build(BuildContext context) {
    return const EmptyState(
      icon: Icons.rate_review_outlined,
      title: 'No hay reseñas',
      subtitle: 'Sé el primero en dejar una reseña',
    );
  }
}

class EmptyStateSearch extends StatelessWidget {
  const EmptyStateSearch({super.key});

  @override
  Widget build(BuildContext context) {
    return const EmptyState(
      icon: Icons.search_off,
      title: 'No se encontraron resultados',
      subtitle: 'Intenta con otros términos de búsqueda',
    );
  }
}

class EmptyStateEvents extends StatelessWidget {
  const EmptyStateEvents({super.key});

  @override
  Widget build(BuildContext context) {
    return const EmptyState(
      icon: Icons.event_busy,
      title: 'No hay eventos disponibles',
      subtitle: 'Vuelve pronto para ver nuevos eventos',
    );
  }
}

class EmptyStatePromotions extends StatelessWidget {
  const EmptyStatePromotions({super.key});

  @override
  Widget build(BuildContext context) {
    return const EmptyState(
      icon: Icons.local_offer_outlined,
      title: 'No hay promociones disponibles',
      subtitle: 'Vuelve pronto para ver ofertas',
    );
  }
}
