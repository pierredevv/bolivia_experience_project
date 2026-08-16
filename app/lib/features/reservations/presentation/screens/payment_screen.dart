import 'dart:async';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_stripe/flutter_stripe.dart';
import 'package:go_router/go_router.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
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
  final String? provider;
  final String? clientSecret;
  final String? payUrl;
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
    this.provider,
    this.clientSecret,
    this.payUrl,
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

  // Estado mutable del pago actual (se actualiza al recrear con otro proveedor).
  late String _paymentId;
  String? _provider;
  String? _qrData;
  String? _clientSecret;
  String? _payUrl;
  bool _recreating = false;

  static const _paidStatuses = {'held', 'released', 'completed', 'refunded'};

  @override
  void initState() {
    super.initState();
    _paymentId = widget.paymentId;
    _provider = widget.provider;
    _qrData = widget.qrData;
    _clientSecret = widget.clientSecret;
    _payUrl = widget.payUrl;
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
    if (_paymentId.isEmpty) {
      _phase = _PaymentPhase.error;
      _error = 'No se pudo iniciar el pago. Intentá de nuevo.';
      return;
    }
    _pollTimer?.cancel();
    _pollTimer = Timer.periodic(const Duration(seconds: 5), (timer) async {
      if (_paymentId.isEmpty || !mounted) return;
      try {
        final service = ref.read(reservationsServiceProvider);
        final status = await service.getPaymentStatus(_paymentId);
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
    if (_paymentId.isEmpty) return;
    try {
      final service = ref.read(reservationsServiceProvider);
      final result = await service.confirmPayment(_paymentId);
      if (!mounted) return;
      final status = result['status']?.toString() ?? 'pending';
      if (_paidStatuses.contains(status)) {
        _pollTimer?.cancel();
        setState(() => _phase = _PaymentPhase.completed);
        ref.read(reservationsProvider.notifier).loadAll();
      } else {
        // El proveedor aún no confirma el cargo (p.ej. 3DS pendiente o la sheet
        // se cerró sin completar). El polling lo detectará automáticamente.
        setState(() {
          _phase = _PaymentPhase.awaiting;
          _error = null;
        });
        _startPolling();
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _phase = _PaymentPhase.error;
        _error = 'No se pudo confirmar el pago: ${_httpErrorMessage(e)}';
      });
    }
  }

  bool get _isStripe =>
      _provider == 'stripe' && (_clientSecret?.isNotEmpty ?? false);

  bool get _isPayPal => _provider == 'paypal' && (_payUrl?.isNotEmpty ?? false);

  Future<void> _payWithStripe() async {
    if (_paymentId.isEmpty || _clientSecret == null) return;
    try {
      await Stripe.instance.initPaymentSheet(
        paymentSheetParameters: SetupPaymentSheetParameters(
          paymentIntentClientSecret: _clientSecret!,
          merchantDisplayName: 'BoliviaExperience',
          returnURL: 'boliviaexperience://stripe',
        ),
      );
      await Stripe.instance.presentPaymentSheet();
      // El cliente finalizó la sheet. El servidor valida contra Stripe (retrieve)
      // antes de marcar held, por lo que el aviso del cliente NO es fuente de verdad.
      await _markPaid();
    } catch (e) {
      if (!mounted) return;
      debugPrint('[Stripe] _payWithStripe error: ${e.runtimeType}: $e');
      if (_isSheetCanceledOrTimeout(e)) {
        // El usuario cerró la sheet sin completar el pago: volver al estado de
        // espera sin alarmar. El polling seguirá detectando la confirmación.
        setState(() {
          _phase = _PaymentPhase.awaiting;
          _error = null;
        });
        return;
      }
      setState(() {
        _phase = _PaymentPhase.error;
        _error =
            'No se pudo completar el pago. Si ya pagaste, esperá la confirmación.\n\n'
            'Detalle: ${_stripeErrorDetail(e)}';
      });
    }
  }

  bool _isSheetCanceledOrTimeout(Object e) {
    if (e is StripeException) {
      return e.error.code == FailureCode.Canceled ||
          e.error.code == FailureCode.Timeout;
    }
    return false;
  }

  String _stripeErrorDetail(Object e) {
    if (e is StripeException) {
      final detail = e.error.localizedMessage ?? e.error.message;
      final code = e.error.stripeErrorCode;
      final suffix = (code != null && code.isNotEmpty) ? ' ($code)' : '';
      if (detail != null && detail.isNotEmpty) {
        return '$detail$suffix';
      }
      return 'StripeException code=${e.error.code} sin mensaje';
    }
    // Cualquier otra excepción (PlatformException del SDK, etc.): mostrarla tal
    // cual para poder diagnosticar sin adivinar.
    return '${e.runtimeType}: $e';
  }

  String _httpErrorMessage(Object e) {
    if (e is DioException) {
      final data = e.response?.data;
      if (data is Map && data['message'] != null) {
        return data['message'].toString();
      }
      return e.message ?? 'Error de conexión';
    }
    return e.toString();
  }

  Future<void> _payWithPayPal() async {
    final url = _payUrl;
    if (url == null || url.isEmpty) return;
    final ok = await launchUrl(
      Uri.parse(url),
      mode: LaunchMode.externalApplication,
    );
    if (!ok && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No se pudo abrir PayPal. Intentá de nuevo.')),
      );
    }
  }

  Future<void> _switchProvider(String provider) async {
    if (_recreating || provider == _provider) return;
    setState(() => _recreating = true);
    try {
      final service = ref.read(reservationsServiceProvider);
      final result = await service.createPayment(
        amount: widget.amount,
        currency: 'USD',
        description: 'Reserva en ${widget.placeName}',
        type: 'reservation',
        referenceId: widget.reservationId,
        provider: provider,
      );
      if (!mounted) return;
      _pollTimer?.cancel();
      setState(() {
        _paymentId = result['paymentId']?.toString() ?? _paymentId;
        _provider = result['provider']?.toString() ?? provider;
        _qrData = result['qrData']?.toString();
        _clientSecret = result['clientSecret']?.toString();
        _payUrl = result['payUrl']?.toString();
        _secondsLeft = 900;
        _recreating = false;
      });
      _startPolling();
    } catch (e) {
      if (!mounted) return;
      setState(() => _recreating = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('No se pudo cambiar el método de pago: ${_httpErrorMessage(e)}'),
        ),
      );
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
        title: const Text('Pagar'),
        elevation: 0,
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    switch (_phase) {
      case _PaymentPhase.error:
        return SingleChildScrollView(
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
                  if (_isStripe) {
                    _payWithStripe();
                  } else if (_isPayPal) {
                    _payWithPayPal();
                  } else {
                    _startPolling();
                  }
                },
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.brandDark, foregroundColor: Colors.white),
                child: const Text('Reintentar'),
              ),
            ],
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
    final qrData = _qrData;
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

                if (_isStripe || _isPayPal)
                  const Text(
                    'Completá el pago con tu método elegido. Se confirma automáticamente.',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 12.5, color: AppColors.textSecondary),
                  )
                else
                  const Text(
                    'Escaneá el código con la app de tu banco para pagar. El pago se confirma automáticamente.',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 12.5, color: AppColors.textSecondary),
                  ),
                const SizedBox(height: 20),

                // Acción de pago según el proveedor activo
                if (_isStripe)
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: FilledButton.icon(
                      onPressed: _payWithStripe,
                      icon: const Icon(Icons.credit_card, size: 18),
                      label: const Text('Pagar con tarjeta'),
                      style: FilledButton.styleFrom(
                        backgroundColor: AppColors.brandDark,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                    ),
                  )
                else if (_isPayPal)
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: FilledButton.icon(
                      onPressed: _payWithPayPal,
                      icon: const Icon(Icons.account_balance_wallet, size: 18),
                      label: const Text('Pagar con PayPal'),
                      style: FilledButton.styleFrom(
                        backgroundColor: AppColors.brandDark,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                    ),
                  )
                else
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

                const SizedBox(height: 24),
                _buildProviderSelector(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProviderSelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Método de pago',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: AppColors.brandDark,
          ),
        ),
        const SizedBox(height: 10),
        _providerOption(
          key: 'stripe',
          label: 'Tarjeta de crédito / débito',
          subtitle: 'Pago seguro con Stripe',
          icon: Icons.credit_card,
          enabled: true,
        ),
        const SizedBox(height: 8),
        _providerOption(
          key: 'paypal',
          label: 'PayPal',
          subtitle: 'Paga con tu cuenta de PayPal',
          icon: Icons.account_balance_wallet,
          enabled: true,
        ),
        const SizedBox(height: 8),
        _providerOption(
          key: 'qr_banco_local',
          label: 'QR bancario',
          subtitle: 'Escaneá con la app de tu banco',
          icon: Icons.qr_code_2,
          enabled: false,
        ),
      ],
    );
  }

  Widget _providerOption({
    required String key,
    required String label,
    required String subtitle,
    required IconData icon,
    required bool enabled,
  }) {
    final selected = _provider == key;
    final onTap = enabled ? () => _switchProvider(key) : null;
    return Opacity(
      opacity: enabled ? 1 : 0.55,
      child: Material(
        color: selected ? AppColors.brandDark.withValues(alpha: 0.06) : Colors.white,
        borderRadius: BorderRadius.circular(14),
        child: InkWell(
          borderRadius: BorderRadius.circular(14),
          onTap: onTap,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: selected ? AppColors.brandDark : AppColors.borderSubtle,
                width: selected ? 1.6 : 1,
              ),
            ),
            child: Row(
              children: [
                Icon(
                  icon,
                  size: 24,
                  color: selected ? AppColors.brandDark : AppColors.textSecondary,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        label,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: AppColors.brandDark,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        subtitle,
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                if (enabled)
                  Icon(
                    selected ? Icons.radio_button_checked : Icons.radio_button_unchecked,
                    size: 20,
                    color: selected ? AppColors.brandDark : AppColors.textSecondary,
                  )
                else
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppColors.borderSubtle,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Text(
                      'Próximamente',
                      style: TextStyle(fontSize: 10.5, color: AppColors.textSecondary),
                    ),
                  ),
                if (_recreating && _provider == key)
                  const Padding(
                    padding: EdgeInsets.only(left: 8),
                    child: SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                  ),
              ],
            ),
          ),
        ),
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
