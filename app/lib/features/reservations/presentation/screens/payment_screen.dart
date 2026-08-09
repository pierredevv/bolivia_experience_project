import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../../../config/colors.dart';
import '../../data/pricing.dart';
import '../providers/reservations_provider.dart';

class PaymentScreen extends ConsumerStatefulWidget {
  final String reservationId;
  final String placeName;
  final double amount;
  final int partySize;
  final String date;
  final String time;
  final String paymentId;
  final String? qrData;
  final DateTime? expiresAt;

  const PaymentScreen({
    super.key,
    required this.reservationId,
    required this.placeName,
    required this.amount,
    required this.partySize,
    required this.date,
    required this.time,
    required this.paymentId,
    this.qrData,
    this.expiresAt,
  });

  @override
  ConsumerState<PaymentScreen> createState() => _PaymentScreenState();
}

enum _PaymentPhase { awaiting, completed, error }

class _PaymentScreenState extends ConsumerState<PaymentScreen> {
  _PaymentPhase _phase = _PaymentPhase.awaiting;
  String? _error;
  Timer? _pollTimer;
  int _secondsLeft = 900; // 15 min por defecto

  static const _paidStatuses = {'held', 'released', 'completed', 'refunded'};

  @override
  void initState() {
    super.initState();
    _initCountdown();
    _startPolling();
  }

  void _initCountdown() {
    final expiresAt = widget.expiresAt;
    if (expiresAt != null) {
      final diff = expiresAt.difference(DateTime.now());
      if (diff.inSeconds > 0) {
        _secondsLeft = diff.inSeconds;
      }
    }
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    super.dispose();
  }

  void _startPolling() {
    if (widget.paymentId.isEmpty) {
      _phase = _PaymentPhase.error;
      _error = 'No se pudo iniciar el pago. Intentá de nuevo.';
      return;
    }
    _pollTimer?.cancel();
    _pollTimer = Timer.periodic(const Duration(seconds: 5), (timer) async {
      if (widget.paymentId.isEmpty || !mounted) return;
      try {
        final service = ref.read(reservationsServiceProvider);
        final status = await service.getPaymentStatus(widget.paymentId);
        if (!mounted) return;
        final paymentStatus = status['status']?.toString() ?? 'pending';
        setState(() {
          if (_secondsLeft > 0) _secondsLeft = _secondsLeft > 5 ? _secondsLeft - 5 : 0;
        });
        if (_paidStatuses.contains(paymentStatus)) {
          timer.cancel();
          setState(() => _phase = _PaymentPhase.completed);
          ref.read(reservationsProvider.notifier).loadAll();
        }
      } catch (_) {}
    });
  }

  Future<void> _markPaid() async {
    if (widget.paymentId.isEmpty) return;
    try {
      final service = ref.read(reservationsServiceProvider);
      await service.confirmPayment(widget.paymentId);
      if (!mounted) return;
      _pollTimer?.cancel();
      setState(() => _phase = _PaymentPhase.completed);
      ref.read(reservationsProvider.notifier).loadAll();
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = 'No se pudo confirmar el pago. Revisá la conexión e intentá de nuevo.';
      });
    }
  }

  String _timeLeft() {
    if (_secondsLeft <= 0) return 'Expirado';
    final m = _secondsLeft ~/ 60;
    final s = _secondsLeft % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundCanvas,
      appBar: AppBar(
        backgroundColor: AppColors.brandDark,
        foregroundColor: Colors.white,
        title: const Text('Pagar con QR'),
        elevation: 0,
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    switch (_phase) {
      case _PaymentPhase.error:
        return Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.error_outline, size: 56, color: AppColors.error500),
                const SizedBox(height: 16),
                Text(_error ?? 'Error', textAlign: TextAlign.center),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () {
                    setState(() {
                      _phase = _PaymentPhase.awaiting;
                      _error = null;
                    });
                    _startPolling();
                  },
                  style: ElevatedButton.styleFrom(backgroundColor: AppColors.brandDark, foregroundColor: Colors.white),
                  child: const Text('Reintentar'),
                ),
              ],
            ),
          ),
        );
      case _PaymentPhase.completed:
        return _SuccessView(
          placeName: widget.placeName,
          date: widget.date,
          time: widget.time,
          partySize: widget.partySize,
          amount: widget.amount,
          onDone: () => _goToMyReservations(),
        );
      case _PaymentPhase.awaiting:
        return _buildQrView();
    }
  }

  Widget _buildQrView() {
    final qrData = widget.qrData;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.borderSubtle),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 16,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Column(
              children: [
                // Countdown
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: AppColors.brandDark.withValues(alpha: 0.06),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.timer_outlined, size: 16, color: AppColors.brandDark),
                      const SizedBox(width: 6),
                      Text(
                        'Válido por ${_timeLeft()}',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.brandDark),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Summary
                Text(widget.placeName,
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.brandDark)),
                const SizedBox(height: 4),
                Text(
                  '${widget.date} • ${widget.time} • ${widget.partySize} persona(s)',
                  style: const TextStyle(fontSize: 12.5, color: AppColors.textSecondary),
                ),
                const SizedBox(height: 16),
                Text(
                  formatCurrency(widget.amount),
                  style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: AppColors.brandDark),
                ),
                const SizedBox(height: 20),

                // QR
                if (qrData != null && qrData.isNotEmpty)
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.borderSubtle),
                    ),
                    child: QrImageView(
                      data: qrData,
                      version: QrVersions.auto,
                      size: 200,
                      backgroundColor: Colors.white,
                      eyeStyle: const QrEyeStyle(
                        eyeShape: QrEyeShape.square,
                        color: AppColors.brandDark,
                      ),
                      dataModuleStyle: const QrDataModuleStyle(
                        dataModuleShape: QrDataModuleShape.square,
                        color: AppColors.brandDark,
                      ),
                    ),
                  )
                else
                  Container(
                    width: 200,
                    height: 200,
                    decoration: BoxDecoration(
                      color: AppColors.brandDark.withValues(alpha: 0.05),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: const Center(
                      child: CircularProgressIndicator(color: AppColors.brandDark),
                    ),
                  ),
                const SizedBox(height: 16),

                const Text(
                  'Escaneá el código con la app de tu banco para pagar. El pago se confirma automáticamente.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 12.5, color: AppColors.textSecondary),
                ),
                const SizedBox(height: 20),

                // Demo: simulate confirmed payment
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: FilledButton.icon(
                    onPressed: _markPaid,
                    icon: const Icon(Icons.check_circle_outline, size: 18),
                    label: const Text('Simular pago confirmado'),
                    style: FilledButton.styleFrom(
                      backgroundColor: AppColors.brandEmerald,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _goToMyReservations() {
    context.pushReplacement('/reservations');
  }
}

class _SuccessView extends StatelessWidget {
  final String placeName;
  final String date;
  final String time;
  final int partySize;
  final double amount;
  final VoidCallback onDone;

  const _SuccessView({
    required this.placeName,
    required this.date,
    required this.time,
    required this.partySize,
    required this.amount,
    required this.onDone,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 84,
              height: 84,
              decoration: BoxDecoration(
                color: AppColors.brandEmerald.withValues(alpha: 0.12),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.check_rounded, size: 44, color: AppColors.brandEmerald),
            ),
            const SizedBox(height: 20),
            const Text('¡Pago confirmado!',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppColors.brandDark)),
            const SizedBox(height: 8),
            Text(
              'Tu reserva en $placeName quedó confirmada para el $date a las $time.',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 14, color: AppColors.textSecondary, height: 1.5),
            ),
            const SizedBox(height: 8),
            Text(
              '$partySize persona(s) • ${formatCurrency(amount)}',
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.brandDark),
            ),
            const SizedBox(height: 28),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: FilledButton(
                onPressed: onDone,
                style: FilledButton.styleFrom(
                  backgroundColor: AppColors.brandDark,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                child: const Text('Ver mis reservas', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
