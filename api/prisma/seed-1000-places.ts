// Seed script to expand from 200 to 1000 places
// Run: npx ts-node prisma/seed-1000-places.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  'restaurantes', 'hoteles', 'bares', 'cafeterias', 'atracciones',
  'parques', 'museos', 'centros-comerciales', 'deportes', 'gastronomia'
];

const neighborhoodNames = [
  'Equipetrol', 'Centro', 'Urbari', 'Lomas de Arena', 'El Cristo',
  'Palmasola', 'Villa 1ro de Mayo', 'Satélite Norte', 'El Bajío',
  'Plan Tres Mil', 'Km 4', 'Km 7', 'Km 12', 'Monseñor',
  'Chochis', 'Los Cuses', 'Pampa de la Isla', 'Barrio Lindo',
  'Villa Colombia', 'San Antonio', 'La Concordia', 'Villa Pagador',
  'Los Mangales', 'La Pitaya', 'El Jardín', 'Santa Mónica',
  'Las Palmas', 'Villa San Jorge', 'Piraí', 'El Trompillo',
];

const placePrefixes = [
  'Restaurante', 'Hotel', 'Bar', 'Cafetería', 'Parque', 'Museo',
  'Gimnasio', 'Librería', 'Farmacia', 'Supermercado', 'Panadería',
  'Carnicería', 'Frutería', 'Floristería', 'Peluquería', 'Veterinaria',
  'Clínica', 'Consultorio', 'Academia', 'Colegio', 'Universidad',
  'Teatro', 'Cine', 'Galería', 'Biblioteca', 'Plaza', 'Monumento',
  'Iglesia', 'Templo', 'Mercado', 'Tienda', 'Boutique', 'Ferretería',
  'Electrodomésticos', 'Mueblería', 'Juguetería', 'Deportes', 'Surf',
  'Yoga', 'Pilates', 'Crossfit', 'Spa', 'Salón de belleza',
  'Tattoo', 'Óptica', 'Laboratorio', 'Clínica dental', 'Hospital',
];

const placeNames = [
  'El Paraíso', 'La Esquina', 'Donde Pedro', 'Casa Grande', 'El Rincón',
  'La Casona', 'El Jardín', 'La Terraza', 'El Patio', 'La Quinta',
  'El Bosque', 'La Playa', 'El Mirador', 'La Cascada', 'El Volcán',
  'La Laguna', 'El Valle', 'La Montaña', 'El Rio', 'La Isla',
  'El Sol', 'La Luna', 'Las Estrellas', 'El Viento', 'La Lluvia',
  'El Trueno', 'El Rayo', 'La Nieve', 'El Fuego', 'El Hielo',
  'La Flor', 'El Árbol', 'La Hoja', 'La Raíz', 'La Semilla',
  'El Pájaro', 'La Mariposa', 'El Colibrí', 'La Cigarra', 'El Grillo',
];

const descriptions = [
  'Un lugar único con ambiente acogedor y servicio excelente',
  'El mejor lugar de la ciudad para disfrutar en familia',
  'Experiencia gastronómica inigualable con ingredientes frescos',
  'Diseño moderno y funcional con las últimas tendencias',
  'Tradición y calidad desde hace más de 20 años',
  'Ambiente relajado ideal para disfrutar con amigos',
  'Servicio de primera calidad y atención personalizada',
  'Ubicación privilegiada con vistas impresionantes',
  'Menú variado con opciones para todos los gustos',
  'El lugar perfecto para celebrar ocasiones especiales',
];

function generatePlace(index: number) {
  const category = categories[index % categories.length];
  const neighborhood = neighborhoodNames[index % neighborhoodNames.length];
  const prefix = placePrefixes[index % placePrefixes.length];
  const name = placeNames[index % placeNames.length];
  const suffix = index > 200 ? ` ${Math.floor(index / 20) + 1}` : '';

  // Generate coordinates around Santa Cruz center with some spread
  const baseLat = -17.78;
  const baseLng = -63.18;
  const latOffset = (Math.random() - 0.5) * 0.05;
  const lngOffset = (Math.random() - 0.5) * 0.05;

  return {
    name: `${prefix} ${name}${suffix}`,
    description: descriptions[index % descriptions.length],
    descriptionEn: descriptions[index % descriptions.length],
    address: `${neighborhood}, Santa Cruz de la Sierra`,
    phone: `+591 3 ${String(300 + (index % 100)).padStart(3, '0')} ${String(1000 + index).padStart(4, '0')}`,
    latitude: baseLat + latOffset,
    longitude: baseLng + lngOffset,
    categoryId: category,
    isActive: true,
    isFeatured: index % 10 === 0, // Every 10th place is featured
    ratingAvg: 3.5 + Math.random() * 1.5,
    ratingCount: Math.floor(Math.random() * 50) + 1,
  };
}

async function main() {
  console.log('Seeding 1000 places...');

  // Get category IDs
  const categoryMap: Record<string, string> = {};
  const cats = await prisma.category.findMany();
  cats.forEach(c => { categoryMap[c.slug] = c.id; });

  let created = 0;
  const batchSize = 50;

  for (let i = 0; i < 1000; i += batchSize) {
    const batch = [];
    for (let j = 0; j < batchSize && i + j < 1000; j++) {
      const place = generatePlace(i + j);
      const categoryId = categoryMap[place.categoryId] || categoryMap['restaurantes'];

      batch.push({
        name: place.name,
        description: place.description,
        descriptionEn: place.descriptionEn,
        address: place.address,
        phone: place.phone,
        latitude: place.latitude,
        longitude: place.longitude,
        categoryId,
        isActive: place.isActive,
        isFeatured: place.isFeatured,
        ratingAvg: place.ratingAvg,
        ratingCount: place.ratingCount,
      });
    }

    await prisma.place.createMany({ data: batch });
    created += batch.length;
    console.log(`Created ${created}/1000 places`);
  }

  console.log('Done!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
