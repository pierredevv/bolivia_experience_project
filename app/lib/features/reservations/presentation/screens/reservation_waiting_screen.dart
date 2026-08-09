import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../../config/colors.dart';

class ReservationWaitingScreen extends StatefulWidget {
  final String reservationId;
  final String placeName;
  final int partySize;
  final String date;
  final String time;
  final DateTime? responseDeadline;

  const ReservationWaitingScreen({
    super.key,
    required this.reservationId,
    required this.placeName,
    required this.partySize,
    required this.date,
    required this.time,
    this.responseDeadline,
  });

  @override
  State<ReservationWaitingScreen> createState() => _ReservationWaitingScreenState();
}

class _ReservationWaitingScreenState extends State<ReservationWaitingScreen> {
  Timer? _timer;
  DateTime? _now;

  @override
  void initState() {
    super.initState();
    _now = DateTime.now();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() => _now = DateTime.now());
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  String _deadlineLabel() {
    final deadline = widget.responseDeadline;
    if (deadline == null) return 'El lugar tiene 24 horas para responder.';
    final diff = deadline.difference(_now ?? DateTime.now());
    if (diff.isNegative) return 'El plazo de respuesta venció.';
    final hours = diff.inHours;
    final minutes = diff.inMinutes % 60;
    if (hours > 0) {
      return 'Plazo para responder: ${hours}h ${minutes}min restantes.';
    }
    return 'Plazo para responder: ${minutes}min restantes.';
  }

  String _formatDate(String date) {
    final parsed = DateTime.tryParse(date);
    if (parsed == null) return date;
    return DateFormat('EEEE, d MMMM yyyy', 'es').format(parsed);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundCanvas,
      appBar: AppBar(
        backgroundColor: AppColors.brandDark,
        foregroundColor: Colors.white,
        title: const Text('Solicitud enviada'),
        elevation: 0,
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 84,
                height: 84,
                decoration: BoxDecoration(
                  color: AppColors.brandGold.withValues(alpha: 0.14),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.hourglass_top_rounded, size: 44, color: AppColors.brandGold),
              ),
              const SizedBox(height: 20),
              const Text(
                'Esperando confirmación',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppColors.brandDark),
              ),
              const SizedBox(height: 8),
              Text(
                'Enviamos tu solicitud a ${widget.placeName}. Te avisaremos cuando el lugar la confirme o rechace.',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 14, color: AppColors.textSecondary, height: 1.5),
              ),
              const SizedBox(height: 8),
              Text(
                '${_formatDate(widget.date)} • ${widget.time} • ${widget.partySize} persona(s)',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.brandDark),
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: AppColors.brandDark.withValues(alpha: 0.06),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  _deadlineLabel(),
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.brandDark),
                ),
              ),
              const SizedBox(height: 28),
              SizedBox(
                width: double.infinity,
                height: 52,
                child: FilledButton(
                  onPressed: () => context.pushReplacement('/reservations'),
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
      ),
    );
  }
}
