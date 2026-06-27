import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const categories = await Promise.all(
    [
      { name: 'Restaurantes', nameEn: 'Restaurants', icon: 'restaurant', slug: 'restaurantes', description: 'Lugares para comer', displayOrder: 1 },
      { name: 'Hoteles', nameEn: 'Hotels', icon: 'hotel', slug: 'hoteles', description: 'Alojamiento', displayOrder: 2 },
      { name: 'Bares y Vida Nocturna', nameEn: 'Bars & Nightlife', icon: 'local_bar', slug: 'bares', description: 'Bares y discotecas', displayOrder: 3 },
      { name: 'Cafeterías', nameEn: 'Cafés', icon: 'local_cafe', slug: 'cafeterias', description: 'Cafés', displayOrder: 4 },
      { name: 'Atracciones Turísticas', nameEn: 'Tourist Attractions', icon: 'place', slug: 'atracciones', description: 'Lugares turísticos', displayOrder: 5 },
      { name: 'Parques y Naturaleza', nameEn: 'Parks & Nature', icon: 'park', slug: 'parques', description: 'Parques y jardines', displayOrder: 6 },
      { name: 'Museos y Galerías', nameEn: 'Museums & Galleries', icon: 'museum', slug: 'museos', description: 'Espacios culturales', displayOrder: 7 },
      { name: 'Centros Comerciales', nameEn: 'Shopping Centers', icon: 'shopping_cart', slug: 'centros-comerciales', description: 'Malls', displayOrder: 8 },
      { name: 'Deportes y Recreación', nameEn: 'Sports & Recreation', icon: 'sports_soccer', slug: 'deportes', description: 'Actividades deportivas', displayOrder: 9 },
      { name: 'Servicios', nameEn: 'Services', icon: 'build', slug: 'servicios', description: 'Servicios esenciales', displayOrder: 10 },
      { name: 'Iglesias y Templos', nameEn: 'Churches & Temples', icon: 'church', slug: 'iglesias', description: 'Patrimonio religioso', displayOrder: 11 },
      { name: 'Transporte', nameEn: 'Transportation', icon: 'directions_bus', slug: 'transporte', description: 'Transporte', displayOrder: 12 },
    ].map((cat) =>
      prisma.category.upsert({
        where: { slug: cat.slug },
        update: cat,
        create: cat,
      }),
    ),
  );
  console.log(`Created ${categories.length} categories`);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@boliviaexperience.com' },
    update: {},
    create: {
      email: 'admin@boliviaexperience.com',
      name: 'Administrador',
      role: 'admin',
      language: 'es',
    },
  });
  console.log(`Created admin user: ${admin.email}`);

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
