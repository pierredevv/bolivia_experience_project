import 'package:flutter/material.dart';
import '../../../../config/colors.dart';

class OnboardingPageData {
  final IconData icon;
  final String title;
  final String subtitle;
  final Color color;

  const OnboardingPageData({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.color,
  });
}

class OnboardingPage extends StatelessWidget {
  final OnboardingPageData data;

  const OnboardingPage({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 160,
            height: 160,
            decoration: BoxDecoration(
              color: data.color.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              data.icon,
              size: 80,
              color: data.color,
            ),
          ),
          const SizedBox(height: 48),
          Text(
            data.title,
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: AppColors.neutral900,
                ),
          ),
          const SizedBox(height: 16),
          Text(
            data.subtitle,
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                  color: AppColors.neutral600,
                ),
          ),
        ],
      ),
    );
  }
}
