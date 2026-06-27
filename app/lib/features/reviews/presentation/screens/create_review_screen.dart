import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../config/colors.dart';
import '../providers/reviews_provider.dart';

class CreateReviewScreen extends ConsumerStatefulWidget {
  final String placeId;

  const CreateReviewScreen({super.key, required this.placeId});

  @override
  ConsumerState<CreateReviewScreen> createState() => _CreateReviewScreenState();
}

class _CreateReviewScreenState extends ConsumerState<CreateReviewScreen> {
  int _rating = 0;
  final _commentController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Escribir Reseña'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              child: ListTile(
                leading: Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    color: AppColors.neutral200,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(Icons.image, color: AppColors.neutral400),
                ),
                title: const Text('Lugar'),
                subtitle: const Text('Reseña'),
              ),
            ),

            const SizedBox(height: 24),

            Text(
              'Calificación',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(5, (index) {
                return GestureDetector(
                  onTap: () {
                    setState(() {
                      _rating = index + 1;
                    });
                  },
                  child: Padding(
                    padding: const EdgeInsets.all(4),
                    child: Icon(
                      index < _rating ? Icons.star : Icons.star_outline,
                      size: 48,
                      color: AppColors.secondary500,
                    ),
                  ),
                );
              }),
            ),
            Center(
              child: Text(
                _getRatingText(_rating),
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: _getRatingColor(_rating),
                ),
              ),
            ),

            const SizedBox(height: 24),

            Text(
              'Tu opinión',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _commentController,
              maxLines: 5,
              maxLength: 500,
              decoration: InputDecoration(
                hintText: 'Cuéntanos tu experiencia...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),

            const SizedBox(height: 16),

            Text(
              'Fotos (opcional)',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _AddPhotoButton(
                  onTap: () {},
                ),
              ],
            ),

            const SizedBox(height: 16),

            Text(
              'Fecha de visita (opcional)',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            InkWell(
              onTap: () {},
              child: InputDecorator(
                decoration: InputDecoration(
                  hintText: 'Seleccionar fecha',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: const [
                    Text('Seleccionar fecha'),
                    Icon(Icons.calendar_today),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: ElevatedButton(
            onPressed: _rating > 0 && !_isSubmitting
                ? _submitReview
                : null,
            child: _isSubmitting
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : const Text('Publicar Reseña'),
          ),
        ),
      ),
    );
  }

  Future<void> _submitReview() async {
    setState(() => _isSubmitting = true);

    try {
      await ref.read(reviewsProvider.notifier).createReview(
        placeId: widget.placeId,
        rating: _rating,
        comment: _commentController.text.trim(),
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Reseña publicada exitosamente'),
            backgroundColor: Colors.green,
          ),
        );
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al publicar reseña: $e'),
            backgroundColor: AppColors.error700,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  String _getRatingText(int rating) {
    switch (rating) {
      case 1:
        return 'Malo';
      case 2:
        return 'Regular';
      case 3:
        return 'Bueno';
      case 4:
        return 'Muy bueno';
      case 5:
        return 'Excelente';
      default:
        return 'Selecciona una calificación';
    }
  }

  Color _getRatingColor(int rating) {
    switch (rating) {
      case 1:
        return AppColors.error700;
      case 2:
        return AppColors.warning700;
      case 3:
        return AppColors.warning700;
      case 4:
        return AppColors.success700;
      case 5:
        return AppColors.success700;
      default:
        return AppColors.neutral500;
    }
  }
}

class _AddPhotoButton extends StatelessWidget {
  final VoidCallback onTap;

  const _AddPhotoButton({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 80,
        height: 80,
        decoration: BoxDecoration(
          color: AppColors.neutral100,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppColors.neutral300),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.add_a_photo, color: AppColors.neutral500),
            const SizedBox(height: 4),
            Text(
              'Agregar',
              style: TextStyle(color: AppColors.neutral50, fontSize: 10),
            ),
          ],
        ),
      ),
    );
  }
}