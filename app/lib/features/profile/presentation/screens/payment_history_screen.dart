import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../config/colors.dart';
import '../../data/profile_service.dart';
import '../providers/profile_provider.dart';

class PaymentHistoryScreen extends ConsumerWidget {
  const PaymentHistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final paymentsAsync = ref.watch(paymentHistoryProvider);

    return Scaffold(
      backgroundColor: AppColors.backgroundCanvas,
      appBar: AppBar(
        backgroundColor: AppColors.brandDark,
        foregroundColor: Colors.white,
        title: const Text('Historial de Pagos'),
        elevation: 0,
      ),
      body: paymentsAsync.when(
        loading: () => const Center(
          child: CircularProgressIndicator(color: AppColors.primary700),
        ),
        error: (_, __) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline,
                  size: 40, color: AppColors.neutral400),
              const SizedBox(height: 12),
              const Text(
                'No se pudo cargar el historial de pagos',
                style: TextStyle(color: AppColors.neutral500),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref.invalidate(paymentHistoryProvider),
                child: const Text('Reintentar'),
              ),
            ],
          ),
        ),
        data: (payments) {
          if (payments.isEmpty) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.receipt_long_outlined,
                      size: 48, color: AppColors.neutral400),
                  SizedBox(height: 12),
                  Text(
                    'Todavía no realizaste pagos',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: AppColors.neutral600,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Tus compras aparecerán acá.',
                    style: TextStyle(fontSize: 13, color: AppColors.neutral500),
                  ),
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: payments.length,
            itemBuilder: (context, index) =>
                _PaymentCard(item: payments[index]),
          );
        },
      ),
    );
  }
}

class _PaymentCard extends StatelessWidget {
  final PaymentHistoryItem item;
  const _PaymentCard({required this.item});

  String get _providerLabel {
    switch (item.provider) {
      case 'stripe':
        return 'Tarjeta (Stripe)';
      case 'paypal':
        return 'PayPal';
      case 'qr_banco_local':
        return 'QR Banco Local';
      default:
        return item.provider;
    }
  }

  String get _statusLabel {
    switch (item.status) {
      case 'held':
        return 'Pagado';
      case 'pending':
        return 'Pendiente';
      case 'processing':
        return 'Procesando';
      case 'released':
        return 'Liberado';
      case 'refunded':
        return 'Reembolsado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return item.status;
    }
  }

  Color get _statusColor {
    switch (item.status) {
      case 'held':
      case 'released':
        return AppColors.success700;
      case 'refunded':
        return AppColors.warning700;
      case 'pending':
      case 'processing':
        return AppColors.warning700;
      case 'cancelled':
        return AppColors.error700;
      default:
        return AppColors.neutral600;
    }
  }

  String get _amountLabel {
    final formatted = NumberFormat('#,##0.00').format(item.amount);
    if (item.currency == 'BOB') return 'Bs. $formatted';
    return 'US\$ $formatted';
  }

  @override
  Widget build(BuildContext context) {
    final dateStr = item.createdAt;
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: AppColors.primary700.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.payments_outlined,
                size: 20, color: AppColors.primary700),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '$_providerLabel · $_amountLabel',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.brandDark,
                  ),
                ),
                if (item.description != null &&
                    item.description!.isNotEmpty) ...[
                  const SizedBox(height: 2),
                  Text(
                    item.description!,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                        fontSize: 12, color: AppColors.textSecondary),
                  ),
                ],
                const SizedBox(height: 4),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: _statusColor.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        _statusLabel,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: _statusColor,
                        ),
                      ),
                    ),
                    if (dateStr != null) ...[
                      const SizedBox(width: 8),
                      Text(
                        _formatDate(dateStr),
                        style: const TextStyle(
                            fontSize: 11, color: AppColors.neutral500),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(String iso) {
    final date = DateTime.tryParse(iso);
    if (date == null) return '';
    return DateFormat('d MMM yyyy', 'es').format(date);
  }
}