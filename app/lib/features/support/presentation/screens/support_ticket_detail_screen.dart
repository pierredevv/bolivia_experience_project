import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../../config/colors.dart';
import '../../data/support_service.dart';
import '../providers/support_provider.dart';

class SupportTicketDetailScreen extends ConsumerStatefulWidget {
  final String ticketId;
  final SupportTicket? initial;

  const SupportTicketDetailScreen({
    super.key,
    required this.ticketId,
    this.initial,
  });

  @override
  ConsumerState<SupportTicketDetailScreen> createState() =>
      _SupportTicketDetailScreenState();
}

class _SupportTicketDetailScreenState
    extends ConsumerState<SupportTicketDetailScreen> {
  final _replyController = TextEditingController();
  bool _sending = false;

  @override
  void dispose() {
    _replyController.dispose();
    super.dispose();
  }

  Future<void> _sendReply() async {
    final body = _replyController.text.trim();
    if (body.isEmpty) return;
    setState(() => _sending = true);
    try {
      await ref.read(supportTicketsProvider.notifier).reply(widget.ticketId, body);
      _replyController.clear();
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No se pudo enviar el mensaje.')),
      );
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(supportTicketsProvider);
    final ticket = state.tickets
            .where((t) => t.id == widget.ticketId)
            .firstOrNull ??
        widget.initial;

    return Scaffold(
      backgroundColor: AppColors.backgroundCanvas,
      appBar: AppBar(
        backgroundColor: AppColors.brandDark,
        foregroundColor: Colors.white,
        title: const Text('Ticket de soporte'),
        elevation: 0,
      ),
      body: ticket == null
          ? const Center(child: CircularProgressIndicator(color: AppColors.brandDark))
          : Column(
              children: [
                Expanded(
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      _TicketHeader(ticket: ticket),
                      const SizedBox(height: 20),
                      const Text(
                        'Conversación',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: AppColors.brandDark,
                        ),
                      ),
                      const SizedBox(height: 10),
                      ...ticket.messages.map(
                        (m) => Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: _MessageBubble(message: m),
                        ),
                      ),
                      if (ticket.messages.isEmpty)
                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 20),
                          child: Text(
                            'Todavía no hay mensajes. Escribinos y te responderemos.',
                            style:
                                TextStyle(fontSize: 13, color: AppColors.textSecondary),
                          ),
                        ),
                    ],
                  ),
                ),
                if (ticket.isOpen)
                  _ReplyBar(
                    controller: _replyController,
                    sending: _sending,
                    onSend: _sendReply,
                  ),
              ],
            ),
    );
  }
}

class _TicketHeader extends StatelessWidget {
  final SupportTicket ticket;

  const _TicketHeader({required this.ticket});

  String _statusLabel(String status) {
    switch (status) {
      case 'open':
        return 'Abierto';
      case 'in_progress':
        return 'En revisión';
      case 'resolved':
        return 'Resuelto';
      case 'closed':
        return 'Cerrado';
      default:
        return status;
    }
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'resolved':
      case 'closed':
        return AppColors.brandEmerald;
      case 'in_progress':
        return AppColors.brandGold;
      default:
        return AppColors.error500;
    }
  }

  String _formatDate(String value) {
    final parsed = DateTime.tryParse(value);
    if (parsed == null) return '';
    return DateFormat('d MMM yyyy, HH:mm', 'es').format(parsed);
  }

  @override
  Widget build(BuildContext context) {
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
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: _statusColor(ticket.status).withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  _statusLabel(ticket.status),
                  style: TextStyle(
                    fontSize: 11.5,
                    fontWeight: FontWeight.w600,
                    color: _statusColor(ticket.status),
                  ),
                ),
              ),
              const Spacer(),
              Text(
                '#${ticket.id.substring(0, ticket.id.length > 6 ? 6 : ticket.id.length)}',
                style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            ticket.subject,
            style: const TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w700,
              color: AppColors.brandDark,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            ticket.description,
            style: const TextStyle(fontSize: 13.5, color: AppColors.textSecondary),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              const Icon(Icons.event_outlined, size: 14, color: AppColors.textSecondary),
              const SizedBox(width: 5),
              Text(
                'Creado ${_formatDate(ticket.createdAt)}',
                style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _MessageBubble extends StatelessWidget {
  final SupportMessage message;

  const _MessageBubble({required this.message});

  @override
  Widget build(BuildContext context) {
    final created = DateTime.tryParse(message.createdAt);
    final time = created == null
        ? ''
        : DateFormat('HH:mm', 'es').format(created);

    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        constraints: const BoxConstraints(maxWidth: 320),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.borderSubtle),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              message.body,
              style: const TextStyle(fontSize: 13.5, color: AppColors.brandDark),
            ),
            const SizedBox(height: 6),
            Text(
              time,
              style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
            ),
          ],
        ),
      ),
    );
  }
}

class _ReplyBar extends StatelessWidget {
  final TextEditingController controller;
  final bool sending;
  final VoidCallback onSend;

  const _ReplyBar({
    required this.controller,
    required this.sending,
    required this.onSend,
  });

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Container(
        padding: const EdgeInsets.fromLTRB(12, 8, 12, 8),
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: AppColors.borderSubtle)),
        ),
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: controller,
                maxLines: 3,
                minLines: 1,
                textInputAction: TextInputAction.newline,
                decoration: InputDecoration(
                  hintText: 'Escribí un mensaje...',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  contentPadding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                ),
              ),
            ),
            const SizedBox(width: 8),
            IconButton.filled(
              onPressed: sending ? null : onSend,
              icon: sending
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white),
                    )
                  : const Icon(Icons.send),
              style: IconButton.styleFrom(
                backgroundColor: AppColors.brandEmerald,
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }
}