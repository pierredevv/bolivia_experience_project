import 'package:flutter/material.dart';

/// Comodidad de restaurantes (id + label + icono) para resolver chips.
class RestaurantAmenity {
  final String id;
  final String label;
  final IconData icon;

  const RestaurantAmenity({
    required this.id,
    required this.label,
    required this.icon,
  });
}

/// Catálogo controlado de comodidades de restaurantes.
const kRestaurantAmenityCatalog = <RestaurantAmenity>[
  RestaurantAmenity(id: 'wifi', label: 'Wifi', icon: Icons.wifi),
  RestaurantAmenity(id: 'aire', label: 'Aire acondicionado', icon: Icons.ac_unit),
  RestaurantAmenity(id: 'terraza', label: 'Terraza', icon: Icons.deck),
  RestaurantAmenity(id: 'música', label: 'Música', icon: Icons.music_note),
  RestaurantAmenity(id: 'reservas', label: 'Reservas', icon: Icons.event_seat),
  RestaurantAmenity(id: 'cócteles', label: 'Cócteles', icon: Icons.local_bar),
  RestaurantAmenity(id: 'parqueo', label: 'Parqueo', icon: Icons.local_parking),
  RestaurantAmenity(id: 'niños', label: 'Apto para niños', icon: Icons.child_care),
  RestaurantAmenity(id: 'barra', label: 'Barra', icon: Icons.table_bar),
  RestaurantAmenity(id: 'delivery', label: 'Delivery', icon: Icons.delivery_dining),
  RestaurantAmenity(id: 'vegana', label: 'Opciones veganas', icon: Icons.eco),
];

RestaurantAmenity? restaurantAmenityById(String id) {
  for (final a in kRestaurantAmenityCatalog) {
    if (a.id == id) return a;
  }
  return null;
}

/// Opciones de ordenamiento de la lista de restaurantes.
enum RestaurantSort {
  recommended,
  bestRating,
  priceAsc,
  distanceFromPlaza,
}

extension RestaurantSortLabel on RestaurantSort {
  String get label {
    switch (this) {
      case RestaurantSort.recommended:
        return 'Recomendados';
      case RestaurantSort.bestRating:
        return 'Mejor valoración';
      case RestaurantSort.priceAsc:
        return 'Precio (menor a mayor)';
      case RestaurantSort.distanceFromPlaza:
        return 'Distancia desde la Plaza 24 de Septiembre';
    }
  }
}

/// Labels de los niveles de precio por cuartiles.
const kPriceLevelLabels = <int, String>{
  1: '\$',
  2: '\$\$',
  3: '\$\$\$',
  4: '\$\$\$\$',
};

/// Franjas horarias típicas de reserva de mesa.
const kReservationTimes = <String>[
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '19:00',
  '19:30',
  '20:00',
  '20:30',
  '21:00',
  '21:30',
  '22:00',
];
