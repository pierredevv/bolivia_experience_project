import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../../config/colors.dart';
import '../../data/pricing.dart';
import '../../data/reservations_service.dart';
import '../providers/reservations_provider.dart';

class MyReservationsScreen extends ConsumerStatefulWidget {
  const MyReservationsScreen({super.key});

  @override
  ConsumerState<MyReservationsScreen> createState() =>
      _MyReservationsScreenState();
}

class _MyReservationsScreenState extends ConsumerState<MyReservationsScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(reservationsProvider.notifier).loadAll());
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(reservationsProvider);

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: AppColors.backgroundCanvas,
        appBar: AppBar(
          backgroundColor: AppColors.brandDark,
          foregroundColor: Colors.white,
          title: const Text('Mis Reservas'),
          elevation: 0,
          bottom: const TabBar(
            labelColor: Colors.white,
            unselectedLabelColor: Colors.white70,
            indicatorColor: AppColors.brandEmerald,
            indicatorWeight: 3,
            tabs: [
              Tab(text: 'Reservas'),
              Tab(text: 'Pagos'),
            ],
          ),
        ),
        body: state.status == ReservationsStatus.initial ||
                state.status == ReservationsStatus.loading
            ? const Center(child: CircularProgressIndicator(color: AppColors.brandDark))
            : TabBarView(
                children: [
                  _ReservationsTab(
                    reservations: state.reservations,
                    onCancel: (id) => ref.read(reservationsProvider.notifier).cancel(id),
                  ),
                  _PaymentsTab(payments: state.payments),
                ],
              ),
      ),
    );
  }
}

class _ReservationsTab extends StatelessWidget {
  final List<Reservation> reservations;
  final void Function(String id) onCancel;

  const _ReservationsTab({required this.reservations, required this.onCancel});

  String _formatDate(String date) {
    final parsed = DateTime.tryParse(date);
    if (parsed == null) return date;
    return DateFormat('EEEE, d MMM yyyy', 'es').format(parsed);
  }

  String _statusLabel(Reservation r) {
    switch (r.status) {
      case 'confirmed':
        return 'Confirmada';
      case 'cancelled':
        return 'Cancelada';
      case 'rejected':
        return 'Rechazada';
      case 'expirada':
        return 'Expirada';
      case 'no_show':
        return 'No asistió';
      case 'completed':
        return 'Completada';
      case 'pending':
        if (r.isSolicitud) return 'Esperando confirmación';
        return 'Pendiente de pago';
      default:
        return 'Pendiente';
    }
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return AppColors.brandEmerald;
      case 'cancelled':
      case 'rejected':
      case 'expirada':
      case 'no_show':
        return AppColors.error500;
      case 'pending':
        return AppColors.brandGold;
      default:
        return AppColors.brandGold;
    }
  }

  void _goToPay(BuildContext context, Reservation r) {
    final payment = r.payment;
    final place = r.place is Map<String, dynamic> ? (r.place as Map<String, dynamic>) : null;
    final placeId = place?['id']?.toString() ?? '';
    final placeName = place?['name']?.toString() ?? '';
    final amount = payment?['amount'] is num
        ? (payment!['amount'] as num).toDouble()
        : r.totalAmount;
    context.push('/places/$placeId/reserve/pay', extra: {
      'reservationId': r.id,
      'placeName': placeName,
      'amount': amount,
      'partySize': r.partySize,
      'date': r.date,
      'time': r.time,
      'paymentId': payment?['id']?.toString() ?? '',
      'qrData': payment?['qrData']?.toString(),
      'expiresAt': r.responseDeadline?.toIso8601String(),
    });
  }

  @override
  Widget build(BuildContext context) {
    if (reservations.isEmpty) {
      return const _EmptyState(
        icon: Icons.event_busy_outlined,
        title: 'Todavía no tenés reservas',
        subtitle: 'Buscá un lugar en el mapa y reservá tu visita.',
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: reservations.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final r = reservations[index];
        final place = r.place is Map<String, dynamic> ? (r.place as Map<String, dynamic>) : null;
        final placeName = place?['name']?.toString() ?? 'Lugar';
        final address = place?['address']?.toString();
        final canCancel = r.status == 'pending' || r.status == 'confirmed';
        final showPay = r.needsPayment;

        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.borderSubtle),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.04),
                blurRadius: 10,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: _statusColor(r.status).withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      _statusLabel(r),
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: _statusColor(r.status)),
                    ),
                  ),
                  const Spacer(),
                  if (r.isSolicitud)
                    const Row(
                      children: [
                        Icon(Icons.schedule_outlined, size: 14, color: AppColors.textSecondary),
                        SizedBox(width: 4),
                        Text(
                          'Solicitud',
                          style: TextStyle(fontSize: 11.5, color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                ],
              ),
              const SizedBox(height: 12),
              Text(placeName,
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.brandDark)),
              if (address != null && address.isNotEmpty) ...[
                const SizedBox(height: 4),
                Text(address, style: const TextStyle(fontSize: 12.5, color: AppColors.textSecondary)),
              ],
              const SizedBox(height: 12),
              Row(
                children: [
                  const Icon(Icons.event_outlined, size: 16, color: AppColors.textSecondary),
                  const SizedBox(width: 6),
                  Text(_formatDate(r.date), style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                  const SizedBox(width: 14),
                  const Icon(Icons.schedule_outlined, size: 16, color: AppColors.textSecondary),
                  const SizedBox(width: 6),
                  Text(r.time, style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                ],
              ),
              const SizedBox(height: 6),
              Row(
                children: [
                  const Icon(Icons.people_outline, size: 16, color: AppColors.textSecondary),
                  const SizedBox(width: 6),
                  Text('${r.partySize} persona(s)',
                      style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                ],
              ),
              if (r.isSolicitud && r.status == 'pending' && r.responseDeadline != null) ...[
                const SizedBox(height: 6),
                Text(
                  'Plazo de respuesta: ${_formatDeadline(r.responseDeadline!)}',
                  style: const TextStyle(fontSize: 12, color: AppColors.brandGold, fontWeight: FontWeight.w600),
                ),
              ],
              if (showPay) ...[
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  height: 46,
                  child: FilledButton.icon(
                    onPressed: () => _goToPay(context, r),
                    icon: const Icon(Icons.qr_code_2, size: 18),
                    label: const Text('Pagar con QR'),
                    style: FilledButton.styleFrom(
                      backgroundColor: AppColors.brandEmerald,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
              ],
              if (canCancel) ...[
                const SizedBox(height: 12),
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton.icon(
                    onPressed: () => _confirmCancel(context, onCancel, r.id),
                    icon: const Icon(Icons.close, size: 16, color: AppColors.error500),
                    label: const Text('Cancelar reserva',
                        style: TextStyle(fontSize: 13, color: AppColors.error500)),
                  ),
                ),
              ],
            ],
          ),
        );
      },
    );
  }

  String _formatDeadline(DateTime deadline) {
    final diff = deadline.difference(DateTime.now());
    if (diff.isNegative) return 'venció';
    final hours = diff.inHours;
    final minutes = diff.inMinutes % 60;
    if (hours > 0) return '${hours}h ${minutes}min restantes';
    return '${minutes}min restantes';
  }

  void _confirmCancel(BuildContext context, void Function(String) onCancel, String id) {
    showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Cancelar reserva', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
        content: const Text('¿Seguro que querés cancelar esta reserva?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Volver'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Cancelar reserva', style: TextStyle(color: AppColors.error700)),
          ),
        ],
      ),
    ).then((ok) {
      if (ok == true) onCancel(id);
    });
  }
}

class _PaymentsTab extends StatelessWidget {
  final List<PaymentRecord> payments;

  const _PaymentsTab({required this.payments});

  String _statusLabel(String status) {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Pendiente';
    }
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'completed':
        return AppColors.brandEmerald;
      case 'cancelled':
        return AppColors.error500;
      default:
        return AppColors.brandGold;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (payments.isEmpty) {
      return const _EmptyState(
        icon: Icons.receipt_long_outlined,
        title: 'No tenés pagos todavía',
        subtitle: 'Tus pagos con QR aparecerán acá.',
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: payments.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final p = payments[index];
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.borderSubtle),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(p.description,
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.brandDark)),
                  ),
                  Text(
                    formatCurrency(p.amount, currency: p.currency),
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.brandDark),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: _statusColor(p.status).withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      _statusLabel(p.status),
                      style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600, color: _statusColor(p.status)),
                    ),
                  ),
                  const Spacer(),
                  Text(
                    p.id,
                    style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}

class _EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;

  const _EmptyState({required this.icon, required this.title, required this.subtitle});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 56, color: AppColors.neutral300),
            const SizedBox(height: 16),
            Text(title,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.brandDark)),
            const SizedBox(height: 6),
            Text(subtitle,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
          ],
        ),
      ),
    );
  }
}
