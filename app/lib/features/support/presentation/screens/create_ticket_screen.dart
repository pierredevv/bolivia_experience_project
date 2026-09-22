import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../config/colors.dart';
import '../providers/support_provider.dart';

class CreateTicketScreen extends ConsumerStatefulWidget {
  const CreateTicketScreen({super.key});

  @override
  ConsumerState<CreateTicketScreen> createState() => _CreateTicketScreenState();
}

class _CreateTicketScreenState extends ConsumerState<CreateTicketScreen> {
  final _formKey = GlobalKey<FormState>();
  final _subjectController = TextEditingController();
  final _descriptionController = TextEditingController();
  String _type = 'reservation';
  String? _reservationId;
  bool _submitting = false;

  @override
  void dispose() {
    _subjectController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _submitting = true);
    try {
      final ticket = await ref.read(supportServiceProvider).createTicket(
            type: _type,
            reservationId: _reservationId?.isEmpty ?? true ? null : _reservationId,
            subject: _subjectController.text.trim(),
            description: _descriptionController.text.trim(),
          );
      await ref.read(supportTicketsProvider.notifier).loadAll();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Tu ticket fue enviado. Te responderemos pronto.')),
      );
      context.push('/support/${ticket.id}', extra: ticket);
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('No se pudo enviar el ticket, intentá de nuevo.')),
      );
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(supportTicketsProvider);
    final reservations = state.reservations
        .where((r) =>
            r.status == 'pending' ||
            r.status == 'confirmed' ||
            r.status == 'completed')
        .toList();

    return Scaffold(
      backgroundColor: AppColors.backgroundCanvas,
      appBar: AppBar(
        backgroundColor: AppColors.brandDark,
        foregroundColor: Colors.white,
        title: const Text('Nuevo ticket'),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Contanos qué pasó. Vinculamos tu ticket con la reserva para resolverlo más rápido.',
                style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
              ),
              const SizedBox(height: 20),
              DropdownButtonFormField<String>(
                initialValue: _type,
                decoration: const InputDecoration(
                  labelText: 'Tipo de consulta',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.category_outlined),
                ),
                items: const [
                  DropdownMenuItem(value: 'reservation', child: Text('Reserva')),
                  DropdownMenuItem(value: 'payment', child: Text('Pago')),
                  DropdownMenuItem(value: 'tours', child: Text('Tours')),
                  DropdownMenuItem(value: 'bill', child: Text('Facturación')),
                  DropdownMenuItem(value: 'opinion', child: Text('Opinión')),
                ],
                onChanged: (v) => setState(() => _type = v ?? 'reservation'),
              ),
              const SizedBox(height: 16),
              if (reservations.isNotEmpty) ...[
                DropdownButtonFormField<String>(
                  initialValue: _reservationId,
                  decoration: const InputDecoration(
                    labelText: 'Reserva vinculada (opcional)',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.event_outlined),
                  ),
                  items: [
                    const DropdownMenuItem<String>(
                        value: '', child: Text('Sin reserva')),
                    ...reservations.map(
                      (r) => DropdownMenuItem<String>(
                          value: r.id,
                          child: Text('Reserva ${r.id} - ${r.status}')),
                    ),
                  ],
                  onChanged: (v) => setState(() => _reservationId = v),
                ),
                const SizedBox(height: 16),
              ],
              TextFormField(
                controller: _subjectController,
                maxLength: 200,
                decoration: const InputDecoration(
                  labelText: 'Asunto',
                  hintText: 'Ej: No aparece confirmada mi reserva',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.title),
                ),
                validator: (v) =>
                    (v == null || v.trim().isEmpty) ? 'Contanos el asunto' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _descriptionController,
                maxLines: 5,
                maxLength: 4000,
                decoration: const InputDecoration(
                  labelText: 'Descripción',
                  hintText: 'Explicá el problema con detalle...',
                  border: OutlineInputBorder(),
                  alignLabelWithHint: true,
                ),
                validator: (v) => (v == null || v.trim().isEmpty)
                    ? 'Describí el problema'
                    : null,
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: FilledButton.icon(
                  onPressed: _submitting ? null : _submit,
                  icon: _submitting
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: Colors.white),
                        )
                      : const Icon(Icons.send_outlined),
                  label: Text(_submitting ? 'Enviando...' : 'Enviar ticket'),
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.brandEmerald,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}