import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../../config/colors.dart';
import '../../data/support_service.dart';
import '../providers/support_provider.dart';

class SupportTicketsScreen extends ConsumerStatefulWidget {
  const SupportTicketsScreen({super.key});

  @override
  ConsumerState<SupportTicketsScreen> createState() =>
      _SupportTicketsScreenState();
}

class _SupportTicketsScreenState extends ConsumerState<SupportTicketsScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(supportTicketsProvider.notifier).loadAll());
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(supportTicketsProvider);

    return Scaffold(
      backgroundColor: AppColors.backgroundCanvas,
      appBar: AppBar(
        backgroundColor: AppColors.brandDark,
        foregroundColor: Colors.white,
        title: const Text('Soporte y ayuda'),
        elevation: 0,
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.brandEmerald,
        foregroundColor: Colors.white,
        onPressed: () => context.push('/support/create'),
        icon: const Icon(Icons.add_comment_outlined),
        label: const Text('Nuevo ticket'),
      ),
      body: state.status == SupportStatus.initial ||
              state.status == SupportStatus.loading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.brandDark),
            )
          : state.status == SupportStatus.error && state.tickets.isEmpty
              ? const _EmptyState(
                  icon: Icons.cloud_off_outlined,
                  title: 'No pudimos cargar el soporte',
                  subtitle: 'Revisá tu conexión e intentá de nuevo.',
                )
              : state.tickets.isEmpty
                  ? const _EmptyState(
                      icon: Icons.support_agent_outlined,
                      title: 'Todavía no tenés tickets',
                      subtitle:
                          'Ponete en contacto con nosotros si tenés un problema con una reserva o un pago.',
                    )
                  : RefreshIndicator(
                      onRefresh: () =>
                          ref.read(supportTicketsProvider.notifier).loadAll(),
                      child: ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: state.tickets.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 12),
                        itemBuilder: (context, index) =>
                            _TicketCard(ticket: state.tickets[index]),
                      ),
                    ),
    );
  }
}

class _TicketCard extends StatelessWidget {
  final SupportTicket ticket;

  const _TicketCard({required this.ticket});

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

  String _typeLabel(String type) {
    switch (type) {
      case 'reservation':
        return 'Reserva';
      case 'payment':
        return 'Pago';
      case 'tours':
        return 'Tours';
      case 'bill':
        return 'Facturación';
      case 'opinion':
        return 'Opinión';
      default:
        return 'Otro';
    }
  }

  @override
  Widget build(BuildContext context) {
    final created = DateTime.tryParse(ticket.createdAt);
    final date = created == null
        ? ''
        : DateFormat('d MMM yyyy', 'es').format(created);

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
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () => context.push('/support/${ticket.id}'),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
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
                const SizedBox(width: 8),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: AppColors.brandDark.withValues(alpha: 0.06),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    _typeLabel(ticket.type),
                    style: const TextStyle(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w600,
                      color: AppColors.brandDark,
                    ),
                  ),
                ),
                const Spacer(),
                if (date.isNotEmpty)
                  Text(
                    date,
                    style: const TextStyle(
                      fontSize: 11,
                      color: AppColors.textSecondary,
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              ticket.subject,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: AppColors.brandDark,
              ),
            ),
            const SizedBox(height: 6),
            Row(
              children: [
                const Icon(Icons.chat_bubble_outline,
                    size: 14, color: AppColors.textSecondary),
                const SizedBox(width: 4),
                Text(
                  '${ticket.messages.length} mensaje(s)',
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
                const Spacer(),
                const Icon(Icons.chevron_right,
                    size: 18, color: AppColors.textSecondary),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;

  const _EmptyState({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

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
            Text(
              title,
              textAlign: TextAlign.center,
              style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppColors.brandDark),
            ),
            const SizedBox(height: 6),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
            ),
          ],
        ),
      ),
    );
  }
}