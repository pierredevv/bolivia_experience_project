import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../../config/colors.dart';
import '../../../../features/trips/presentation/providers/trips_provider.dart';
import '../providers/chat_provider.dart';

const _greeting =
    '¡Hola! 👋 Soy el asistente de BoliviaExperience.\n\n'
    'Contame qué andás buscando (restaurantes, tours, experiencias, hoteles) '
    'y te ayudo a armar tu plan en Santa Cruz.';

class ChatScreen extends ConsumerStatefulWidget {
  const ChatScreen({super.key});

  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen> {
  final _controller = TextEditingController();
  final _scrollController = ScrollController();
  bool _isBuildingItinerary = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(chatProvider.notifier).init();
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _buildItinerary() async {
    final service = ref.read(tripsServiceProvider);
    setState(() => _isBuildingItinerary = true);
    try {
      final now = DateTime.now();
      final end = now.add(const Duration(days: 4));
      final fmt = DateFormat('yyyy-MM-dd');
      final trip =
          await service.createTrip(name: 'Itinerario del Asistente', startDate: fmt.format(now), endDate: fmt.format(end), destination: 'Santa Cruz');
      final tripId = trip['id']?.toString();
      if (tripId == null || tripId.isEmpty) throw Exception('no trip id');
      await service.generateItinerary(tripId);
      if (!mounted) return;
      context.push('/trips/$tripId');
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('No se pudo armar el itinerario. Intentá de nuevo.'),
        ),
      );
    } finally {
      if (mounted) setState(() => _isBuildingItinerary = false);
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(chatProvider);
    final canBuild = state.messages.isNotEmpty && !_isBuildingItinerary;

    return Scaffold(
      backgroundColor: const Color(0xFFF2F4F7),
      appBar: AppBar(
        backgroundColor: AppColors.brandDark,
        foregroundColor: Colors.white,
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Asistente IA'),
            Text(
              'Turismo en Santa Cruz',
              style: TextStyle(fontSize: 12, color: Colors.white70),
            ),
          ],
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: TextButton.icon(
              onPressed: canBuild ? _buildItinerary : null,
              icon: const Icon(Icons.route_outlined,
                  size: 18, color: Colors.white),
              label: Text(
                _isBuildingItinerary ? 'Creando…' : 'Armar itinerario',
                style: const TextStyle(color: Colors.white, fontSize: 13),
              ),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: state.isInitializing
                ? const Center(
                    child: CircularProgressIndicator(
                        color: AppColors.primary700))
                : ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.all(16),
                    itemCount: state.messages.length + 1,
                    itemBuilder: (context, index) {
                      if (index == 0) {
                        return const _Bubble(
                          text: _greeting,
                          isUser: false,
                        );
                      }
                      final message = state.messages[index - 1];
                      return _Bubble(
                        text: message.content,
                        isUser: message.role == 'user',
                      );
                    },
                  ),
          ),
          if (state.errorMessage != null)
            Container(
              width: double.infinity,
              color: AppColors.error700.withValues(alpha: 0.1),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      state.errorMessage!,
                      style: const TextStyle(
                          fontSize: 12, color: AppColors.error700),
                    ),
                  ),
                  TextButton(
                    onPressed: () =>
                        ref.read(chatProvider.notifier).clearError(),
                    child: const Text('Cerrar'),
                  ),
                ],
              ),
            ),
          if (state.isSending)
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              child: Align(
                alignment: Alignment.centerLeft,
                child: _Bubble(text: 'escribiendo…', isUser: false),
              ),
            ),
          _InputBar(
            controller: _controller,
            enabled: !state.isSending,
            onSend: () {
              final text = _controller.text;
              if (text.trim().isEmpty) return;
              _controller.clear();
              ref.read(chatProvider.notifier).send(text);
              _scrollToBottom();
            },
          ),
        ],
      ),
    );
  }
}

class _Bubble extends StatelessWidget {
  final String text;
  final bool isUser;

  const _Bubble({required this.text, required this.isUser});

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.78,
        ),
        margin: const EdgeInsets.symmetric(vertical: 6),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: isUser ? AppColors.primary700 : Colors.white,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: Radius.circular(isUser ? 6 : 16),
            bottomRight: Radius.circular(isUser ? 16 : 6),
          ),
          border: isUser
              ? null
              : Border.all(color: AppColors.borderSubtle),
        ),
        child: Text(
          text,
          style: TextStyle(
            fontSize: 14,
            height: 1.4,
            color: isUser ? Colors.white : const Color(0xFF1F2933),
          ),
        ),
      ),
    );
  }
}

class _InputBar extends StatelessWidget {
  final TextEditingController controller;
  final bool enabled;
  final VoidCallback onSend;

  const _InputBar({
    required this.controller,
    required this.enabled,
    required this.onSend,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: AppColors.borderSubtle)),
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: controller,
                enabled: enabled,
                minLines: 1,
                maxLines: 4,
                textInputAction: TextInputAction.send,
                onSubmitted: (_) => onSend(),
                decoration: InputDecoration(
                  hintText: 'Escribí tu mensaje…',
                  hintStyle:
                      const TextStyle(color: AppColors.neutral400, fontSize: 14),
                  filled: true,
                  fillColor: const Color(0xFFF2F4F7),
                  contentPadding: const EdgeInsets.symmetric(
                      horizontal: 16, vertical: 10),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(24),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            IconButton.filled(
              onPressed: enabled ? onSend : null,
              icon: const Icon(Icons.send_rounded),
              style: IconButton.styleFrom(
                backgroundColor: AppColors.primary700,
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }
}