import 'package:flutter/material.dart';
import 'package:bolivia_experience/config/colors.dart';

class TravelTipsHomeCard extends StatelessWidget {
  final VoidCallback onTap;

  const TravelTipsHomeCard({super.key, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [AppColors.primary50, AppColors.primary100],
            ),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.primary600,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.tips_and_updates_outlined,
                  color: Colors.white,
                  size: 24,
                ),
              ),
              const SizedBox(width: 14),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Tips de viaje',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: AppColors.neutral900,
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Consejos locales para moverte seguro y disfrutar más Santa Cruz',
                      style: TextStyle(
                        fontSize: 13,
                        color: AppColors.neutral600,
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, color: AppColors.neutral500),
            ],
          ),
        ),
      ),
    );
  }
}
