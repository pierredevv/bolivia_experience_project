import 'package:flutter/material.dart';

/// Catálogo controlado de comodidades de hoteles.
/// El backend guarda solo los `id`; el app resuelve label + icono.
class HotelAmenity {
  final String id;
  final String label;
  final IconData icon;

  const HotelAmenity({
    required this.id,
    required this.label,
    required this.icon,
  });
}

const kAmenityCatalog = <HotelAmenity>[
  HotelAmenity(id: 'wifi', label: 'Wifi gratis', icon: Icons.wifi),
  HotelAmenity(
      id: 'desayuno', label: 'Desayuno incluido', icon: Icons.free_breakfast),
  HotelAmenity(id: 'piscina', label: 'Piscina', icon: Icons.pool),
  HotelAmenity(
      id: 'parqueo', label: 'Parqueo gratuito', icon: Icons.local_parking),
  HotelAmenity(id: 'restaurante', label: 'Restaurante', icon: Icons.restaurant),
  HotelAmenity(
      id: 'negocio', label: 'Centro de negocios', icon: Icons.business_center),
  HotelAmenity(id: 'mascotas', label: 'Mascotas', icon: Icons.pets),
  HotelAmenity(
      id: 'aire', label: 'Aire acondicionado', icon: Icons.ac_unit),
  HotelAmenity(id: 'gimnasio', label: 'Gimnasio', icon: Icons.fitness_center),
  HotelAmenity(id: 'spa', label: 'Spa', icon: Icons.spa),
  HotelAmenity(id: 'bar', label: 'Bar', icon: Icons.local_bar),
  HotelAmenity(id: 'accesible', label: 'Accesible', icon: Icons.accessible),
];

HotelAmenity? amenityById(String id) {
  for (final a in kAmenityCatalog) {
    if (a.id == id) return a;
  }
  return null;
}

/// Set controlado de variantes de `texto_precio` (gestionado por el socio).
const kTextoPrecioOptions = <String>[
  'Precio por noche (incluye comisiones)',
  'Precio por noche (impuestos no incluidos)',
  'Precio por noche (con desayuno)',
  'Precio por noche (tarifa no reembolsable)',
];

/// Labels de tipo de propiedad.
const kTipoPropiedadLabels = <String, String>{
  'hotel': 'Hoteles',
  'bnb': 'B&B',
  'inn': 'Inns',
};

/// Opciones de ordenamiento de la lista de hoteles.
enum HotelSort {
  recommended,
  bestRating,
  travelerRanking,
  priceAsc,
  distanceFromPlaza,
}

extension HotelSortLabel on HotelSort {
  String get label {
    switch (this) {
      case HotelSort.recommended:
        return 'Recomendados';
      case HotelSort.bestRating:
        return 'Mejor valoración';
      case HotelSort.travelerRanking:
        return 'Ranking de viajeros';
      case HotelSort.priceAsc:
        return 'Precio (menor a mayor)';
      case HotelSort.distanceFromPlaza:
        return 'Distancia desde la Plaza 24 de Septiembre';
    }
  }
}
