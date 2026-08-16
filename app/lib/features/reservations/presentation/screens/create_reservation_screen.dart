import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../../config/colors.dart';
import '../../../../features/places/data/places_service.dart';
import '../../../../features/places/presentation/providers/places_provider.dart';
import '../../data/pricing.dart';
import '../providers/reservations_provider.dart';

class CreateReservationScreen extends ConsumerStatefulWidget {
  final String placeId;
  final String placeName;
  final int? priceLevel;
  final List<Product>? products;

  const CreateReservationScreen({
    super.key,
    required this.placeId,
    required this.placeName,
    this.priceLevel,
    this.products,
  });

  @override
  ConsumerState<CreateReservationScreen> createState() => _CreateReservationScreenState();
}

class _CreateReservationScreenState extends ConsumerState<CreateReservationScreen> {
  DateTime? _selectedDate;
  TimeOfDay? _selectedTime;
  int _partySize = 2;
  final _notesController = TextEditingController();
  final _phoneController = TextEditingController();
  bool _submitting = false;

  List<Product>? _products;
  String? _selectedProductId;
  bool _loadingProducts = false;

  static const _timeSlots = [
    TimeOfDay(hour: 12, minute: 0),
    TimeOfDay(hour: 14, minute: 0),
    TimeOfDay(hour: 18, minute: 0),
    TimeOfDay(hour: 19, minute: 30),
    TimeOfDay(hour: 21, minute: 0),
  ];

  @override
  void initState() {
    super.initState();
    _initProducts();
  }

  void _initProducts() {
    if (widget.products != null && widget.products!.isNotEmpty) {
      _products = widget.products;
      _selectFirst();
      return;
    }
    _fetchProducts();
  }

  Future<void> _fetchProducts() async {
    setState(() => _loadingProducts = true);
    try {
      final service = ref.read(placesServiceProvider);
      final place = await service.getPlaceById(widget.placeId);
      if (!mounted) return;
      setState(() {
        _products = place.products;
        _loadingProducts = false;
      });
      _selectFirst();
    } catch (_) {
      if (!mounted) return;
      setState(() => _loadingProducts = false);
    }
  }

  void _selectFirst() {
    if (_selectedProductId != null) return;
    final products = _products;
    if (products != null && products.isNotEmpty) {
      _selectedProductId = products.first.id;
    }
  }

  Product? get _selectedProduct {
    final products = _products;
    if (products == null || products.isEmpty) return null;
    return products.firstWhere(
      (p) => p.id == _selectedProductId,
      orElse: () => products.first,
    );
  }

  @override
  void dispose() {
    _notesController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate ?? now,
      firstDate: now,
      lastDate: now.add(const Duration(days: 90)),
      builder: (context, child) => Theme(
        data: Theme.of(context).copyWith(
          colorScheme: const ColorScheme.light(primary: AppColors.brandDark),
        ),
        child: child!,
      ),
    );
    if (picked != null) setState(() => _selectedDate = picked);
  }

  Future<void> _submit() async {
    if (_selectedDate == null || _selectedTime == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Seleccioná fecha y hora para tu reserva')),
      );
      return;
    }

    final product = _selectedProduct;
    if (product == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Este lugar todavía no tiene servicios reservables')),
      );
      return;
    }

    setState(() => _submitting = true);
    try {
      final service = ref.read(reservationsServiceProvider);
      final reservation = await service.createReservation(
        productId: product.id,
        placeId: widget.placeId,
        date: DateFormat('yyyy-MM-dd').format(_selectedDate!),
        time: _formatTime(_selectedTime!),
        partySize: _partySize,
        notes: _notesController.text,
        contactPhone: _phoneController.text,
      );

      if (!mounted) return;

      final reservationId = reservation['id']?.toString() ?? '';
      final modalidad = reservation['modalidad']?.toString() ?? 'instantanea';
      final payment = reservation['payment'];
      final deadline = reservation['responseDeadline']?.toString();

      ref.read(reservationsProvider.notifier).loadAll();

      if (modalidad == 'solicitud') {
        context.pushReplacement(
          '/places/${widget.placeId}/reserve/waiting',
          extra: {
            'reservationId': reservationId,
            'placeName': widget.placeName,
            'partySize': _partySize,
            'date': reservation['date']?.toString() ?? DateFormat('yyyy-MM-dd').format(_selectedDate!),
            'time': reservation['time']?.toString() ?? _formatTime(_selectedTime!),
            'responseDeadline': deadline,
          },
        );
      } else {
        context.pushReplacement(
          '/places/${widget.placeId}/reserve/pay',
          extra: {
            'reservationId': reservationId,
            'placeName': widget.placeName,
            'amount': product.price * _partySize,
            'partySize': _partySize,
            'date': reservation['date']?.toString() ?? DateFormat('yyyy-MM-dd').format(_selectedDate!),
            'time': reservation['time']?.toString() ?? _formatTime(_selectedTime!),
            'paymentId': payment is Map ? payment['id']?.toString() : null,
            'qrData': payment is Map ? payment['qrData']?.toString() : null,
            'provider': payment is Map ? payment['provider']?.toString() : null,
            'clientSecret': payment is Map
                ? payment['paymentIntentClientSecret']?.toString()
                : null,
            'expiresAt': deadline,
          },
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No se pudo crear la reserva. Verificá tus datos.')),
      );
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  String _formatTime(TimeOfDay t) {
    return '${t.hour.toString().padLeft(2, '0')}:${t.minute.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final product = _selectedProduct;
    final perPerson = product?.price ?? estimatePricePerPerson(widget.priceLevel);
    final total = perPerson * _partySize;
    final isInstantanea = product?.isInstantanea ?? true;

    return Scaffold(
      backgroundColor: AppColors.backgroundCanvas,
      appBar: AppBar(
        backgroundColor: AppColors.brandDark,
        foregroundColor: Colors.white,
        title: const Text('Reservar'),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Place card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.borderSubtle),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.04),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: AppColors.brandDark.withValues(alpha: 0.06),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.storefront_outlined, color: AppColors.brandDark),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          widget.placeName,
                          style: const TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.w700,
                            color: AppColors.brandDark,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.brandEmerald.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          isInstantanea ? Icons.payments_outlined : Icons.schedule_outlined,
                          color: AppColors.brandEmerald,
                          size: 20,
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            isInstantanea
                                ? 'Pago con QR al reservar. ${formatCurrency(perPerson)} por persona.'
                                : 'El lugar debe confirmar tu solicitud antes del pago.',
                            style: const TextStyle(fontSize: 12.5, color: AppColors.textSecondary),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Product selector
            if (_loadingProducts)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 24),
                child: Center(child: CircularProgressIndicator(color: AppColors.brandDark)),
              )
            else if (product != null) ...[
              if (_products != null && _products!.length > 1) ...[
                const Text('Servicio', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.brandDark)),
                const SizedBox(height: 8),
                ..._products!.map((p) => Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: _ProductCard(
                        product: p,
                        selected: p.id == _selectedProductId,
                        onTap: () => setState(() => _selectedProductId = p.id),
                      ),
                    )),
                const SizedBox(height: 8),
              ] else ...[
                _ProductSummary(product: product),
                const SizedBox(height: 8),
              ],
            ] else if (!_loadingProducts) ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.error500.withValues(alpha: 0.06),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Text(
                  'Este lugar todavía no tiene servicios reservables.',
                  style: TextStyle(fontSize: 13, color: AppColors.error700),
                ),
              ),
              const SizedBox(height: 16),
            ],

            const Text('Fecha', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.brandDark)),
            const SizedBox(height: 8),
            _SelectableCard(
              label: _selectedDate == null
                  ? 'Elegí la fecha'
                  : DateFormat('EEEE, d MMMM yyyy', 'es').format(_selectedDate!),
              icon: Icons.calendar_today_outlined,
              onTap: _pickDate,
            ),
            const SizedBox(height: 16),

            const Text('Hora', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.brandDark)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _timeSlots.map((slot) {
                final selected = _selectedTime == slot;
                return ChoiceChip(
                  label: Text(_formatTime(slot)),
                  selected: selected,
                  selectedColor: AppColors.brandDark,
                  labelStyle: TextStyle(
                    color: selected ? Colors.white : AppColors.brandDark,
                    fontWeight: FontWeight.w600,
                  ),
                  onSelected: (_) => setState(() => _selectedTime = slot),
                );
              }).toList(),
            ),
            const SizedBox(height: 24),

            Row(
              children: [
                const Text('Personas', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.brandDark)),
                const Spacer(),
                IconButton(
                  onPressed: _partySize > 1 ? () => setState(() => _partySize--) : null,
                  icon: const Icon(Icons.remove_circle_outline),
                  color: AppColors.brandDark,
                ),
                Container(
                  width: 36,
                  height: 36,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.borderSubtle),
                  ),
                  child: Text(
                    '$_partySize',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.brandDark),
                  ),
                ),
                IconButton(
                  onPressed: _partySize < 12 ? () => setState(() => _partySize++) : null,
                  icon: const Icon(Icons.add_circle_outline),
                  color: AppColors.brandDark,
                ),
              ],
            ),
            const SizedBox(height: 24),

            const Text('Teléfono (opcional)', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.brandDark)),
            const SizedBox(height: 8),
            TextField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              decoration: _inputDecoration('+591 7 000 0000'),
            ),
            const SizedBox(height: 16),

            const Text('Notas (opcional)', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.brandDark)),
            const SizedBox(height: 8),
            TextField(
              controller: _notesController,
              maxLines: 3,
              decoration: _inputDecoration('Ocasión especial, ubicación preferida...'),
            ),
            const SizedBox(height: 28),

            // Total + submit
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.borderSubtle),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    isInstantanea ? 'Total a pagar' : 'Total estimado',
                    style: const TextStyle(fontSize: 14, color: AppColors.textSecondary),
                  ),
                  Text(
                    formatCurrency(total),
                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.brandDark),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            SizedBox(
              width: double.infinity,
              height: 54,
              child: FilledButton(
                onPressed: _submitting || product == null ? null : _submit,
                style: FilledButton.styleFrom(
                  backgroundColor: AppColors.brandDark,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                child: _submitting
                    ? const SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(strokeWidth: 2.4, color: Colors.white),
                      )
                    : Text(
                        isInstantanea ? 'Reservar y pagar' : 'Enviar solicitud',
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  InputDecoration _inputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      filled: true,
      fillColor: Colors.white,
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.borderSubtle),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.borderSubtle),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.brandDark, width: 1.4),
      ),
    );
  }
}

class _ProductCard extends StatelessWidget {
  final Product product;
  final bool selected;
  final VoidCallback onTap;

  const _ProductCard({required this.product, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: selected ? AppColors.brandDark : AppColors.borderSubtle,
            width: selected ? 1.6 : 1,
          ),
        ),
        child: Row(
          children: [
            Icon(
              selected ? Icons.radio_button_checked : Icons.radio_button_unchecked,
              size: 20,
              color: selected ? AppColors.brandDark : AppColors.neutral400,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(product.name,
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.brandDark)),
                  if (product.description != null && product.description!.isNotEmpty) ...[
                    const SizedBox(height: 2),
                    Text(product.description!,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                  ],
                  const SizedBox(height: 2),
                  Text(
                    product.isSolicitud ? 'Con confirmación previa' : 'Pago inmediato',
                    style: const TextStyle(fontSize: 11.5, color: AppColors.textSecondary),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Text(
              formatCurrency(product.price),
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.brandDark),
            ),
          ],
        ),
      ),
    );
  }
}

class _ProductSummary extends StatelessWidget {
  final Product product;

  const _ProductSummary({required this.product});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Row(
        children: [
          const Icon(Icons.local_offer_outlined, size: 20, color: AppColors.brandDark),
          const SizedBox(width: 10),
          Expanded(
            child: Text(product.name,
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.brandDark)),
          ),
          Text(
            formatCurrency(product.price),
            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.brandDark),
          ),
        ],
      ),
    );
  }
}

class _SelectableCard extends StatelessWidget {
  final String label;
  final IconData icon;
  final VoidCallback onTap;

  const _SelectableCard({required this.label, required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.borderSubtle),
        ),
        child: Row(
          children: [
            Icon(icon, size: 18, color: AppColors.brandDark),
            const SizedBox(width: 10),
            Expanded(child: Text(label, style: const TextStyle(fontSize: 14, color: AppColors.brandDark))),
            const Icon(Icons.chevron_right, size: 18, color: AppColors.textSecondary),
          ],
        ),
      ),
    );
  }
}
