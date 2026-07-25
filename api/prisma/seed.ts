import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Detect database provider from schema
const isSQLite = process.env.DATABASE_URL?.includes('file:');

async function main() {
  console.log(`Starting seed... (database: ${isSQLite ? 'SQLite' : 'PostgreSQL'})`);

  // Clean existing data (order matters for foreign keys)
  await prisma.chatMessage.deleteMany();
  await prisma.chatConversation.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.tour.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.referralUse.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.tripItem.deleteMany();
  await prisma.tripDay.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.searchHistory.deleteMany();
  await prisma.reviewReply.deleteMany();
  await prisma.review.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.placePhoto.deleteMany();
  await prisma.placeHour.deleteMany();
  await prisma.place.deleteMany();
  await prisma.event.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  console.log('Cleaned existing data');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // ── Users ──────────────────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      email: 'admin@boliviaexperience.com',
      name: 'Administrador',
      password: hashedPassword,
      role: 'admin',
      language: 'es',
    },
  });

  const empresaUser = await prisma.user.create({
    data: {
      email: 'empresa@boliviaexperience.com',
      name: 'Carlos Mendoza',
      password: hashedPassword,
      role: 'empresa',
      language: 'es',
    },
  });

  const usuario1 = await prisma.user.create({
    data: {
      email: 'maria@gmail.com',
      name: 'María García',
      password: hashedPassword,
      role: 'usuario',
      language: 'es',
    },
  });

  const usuario2 = await prisma.user.create({
    data: {
      email: 'juan@gmail.com',
      name: 'Juan López',
      password: hashedPassword,
      role: 'usuario',
      language: 'es',
    },
  });

  const usuario3 = await prisma.user.create({
    data: {
      email: 'ana@gmail.com',
      name: 'Ana Morales',
      password: hashedPassword,
      role: 'usuario',
      language: 'es',
    },
  });

  console.log('Created 5 users');

  // ── Categories ─────────────────────────────────────────────
  const cats = [
    { name: 'Restaurantes', nameEn: 'Restaurants', icon: 'restaurant', slug: 'restaurantes', description: 'Lugares para comer en Santa Cruz', displayOrder: 1 },
    { name: 'Hoteles', nameEn: 'Hotels', icon: 'hotel', slug: 'hoteles', description: 'Alojamiento y hospedaje', displayOrder: 2 },
    { name: 'Bares y Vida Nocturna', nameEn: 'Bars & Nightlife', icon: 'nightlife', slug: 'bares', description: 'Bares, discotecas y vida nocturna', displayOrder: 3 },
    { name: 'Cafeterías', nameEn: 'Cafés', icon: 'coffee', slug: 'cafeterias', description: 'Cafés y repostería', displayOrder: 4 },
    { name: 'Atracciones Turísticas', nameEn: 'Tourist Attractions', icon: 'landscape', slug: 'atracciones', description: 'Sitios turísticos imperdibles', displayOrder: 5 },
    { name: 'Parques y Naturaleza', nameEn: 'Parks & Nature', icon: 'park', slug: 'parques', description: 'Parques, plazas y áreas verdes', displayOrder: 6 },
    { name: 'Museos y Galerías', nameEn: 'Museums & Galleries', icon: 'museum', slug: 'museos', description: 'Espacios culturales y artísticos', displayOrder: 7 },
    { name: 'Centros Comerciales', nameEn: 'Shopping Centers', icon: 'shopping_bag', slug: 'centros-comerciales', description: 'Malls y centros de compras', displayOrder: 8 },
    { name: 'Deportes y Recreación', nameEn: 'Sports & Recreation', icon: 'sports_soccer', slug: 'deportes', description: 'Actividades deportivas y recreativas', displayOrder: 9 },
    { name: 'Gastronomía Local', nameEn: 'Local Cuisine', icon: 'restaurant_menu', slug: 'gastronomia', description: 'Comida típica cruceña', displayOrder: 10 },
  ];

  const categories = await Promise.all(
    cats.map((c) => prisma.category.create({ data: c })),
  );
  console.log(`Created ${categories.length} categories`);

  const [catRestaurantes, catHoteles, catBares, catCafes, catAtracciones, catParques, catMuseos, catComercios, catDeportes, catGastro] = categories;

  // ── Places ─────────────────────────────────────────────────
  const placesData = [{
        name: 'El Palmar',
        description: 'Restaurante de comida cruceña tradicional. Famous por sus anticuchos y saice.',
        descriptionEn: 'Traditional Santa Cruz restaurant. Famous for its anticuchos and saice.',
        address: 'Av. Monseñor Ángel Uría 456, Santa Cruz',
        phone: '+591 3 345 6789',
        website: 'https://elpalmar.com.bo',
        latitude: -17.7833,
        longitude: -63.1821,
        ratingAvg: 0,
        ratingCount: 0,
        categoryId: catRestaurantes.id,
        ownerId: empresaUser.id,
        isFeatured: true,
        isActive: true,
      },
    {
        name: 'Cocina Mestiza',
        description: 'Fusión de sabores bolivianos con influencias internacionales. Menú ejecutivo y carta.',
        descriptionEn: 'Fusion of Bolivian flavors with international influences.',
        address: 'Calle Warnes 123, Equipetrol, Santa Cruz',
        phone: '+591 3 334 5678',
        latitude: -17.7754,
        longitude: -63.1715,
        ratingAvg: 0,
        ratingCount: 0,
        categoryId: catRestaurantes.id,
        ownerId: empresaUser.id,
        isFeatured: true,
        isActive: true,
      },
    {
        name: 'Hotel Buganvilia',
        description: 'Hotel boutique en el corazón de Equipetrol. Piscina, restaurante y spa.',
        descriptionEn: 'Boutique hotel in the heart of Equipetrol. Pool, restaurant and spa.',
        address: 'Av. San Martín 789, Equipetrol, Santa Cruz',
        phone: '+591 3 342 0000',
        website: 'https://hotelbuganvilia.com.bo',
        latitude: -17.7801,
        longitude: -63.1789,
        ratingAvg: 0,
        ratingCount: 0,
        categoryId: catHoteles.id,
        ownerId: empresaUser.id,
        isFeatured: true,
        isActive: true,
      },
    {
        name: 'Parque Municipal Lomas de Arena',
        description: 'Reserva natural con dunas de arena, lagunas y senderismo. Ideal para un día de aventura.',
        descriptionEn: 'Natural reserve with sand dunes, lagoons and hiking. Perfect for an adventure day.',
        address: 'Av. San Juan de Pampagrande, Santa Cruz',
        phone: '+591 3 335 1234',
        latitude: -17.8200,
        longitude: -63.2200,
        ratingAvg: 0,
        ratingCount: 0,
        categoryId: catParques.id,
        ownerId: null,
        isFeatured: true,
        isActive: true,
      },
    {
        name: 'Museo de Historia Natural Noel Kempff',
        description: 'Museo con exhibiciones de fauna y flora del departamento de Santa Cruz.',
        descriptionEn: 'Museum with exhibitions of fauna and flora of the Santa Cruz department.',
        address: 'Av. Iñigó de Balda 212, Santa Cruz',
        phone: '+591 3 336 1234',
        latitude: -17.7650,
        longitude: -63.1500,
        ratingAvg: 0,
        ratingCount: 0,
        categoryId: catMuseos.id,
        ownerId: null,
        isFeatured: true,
        isActive: true,
      },
    {
        name: 'Café Munaipata',
        description: 'Café artesanal con granos de Yungas. Desayunos, tortas y ambiente acogedor.',
        descriptionEn: 'Artisanal café with Yungas beans. Breakfasts, cakes and cozy atmosphere.',
        address: 'Calle Florida 456, Santa Cruz',
        phone: '+591 3 344 5678',
        latitude: -17.7810,
        longitude: -63.1850,
        ratingAvg: 0,
        ratingCount: 0,
        categoryId: catCafes.id,
        ownerId: empresaUser.id,
        isFeatured: true,
        isActive: true,
      },
    {
        name: 'Blue Velvet Bar',
        description: 'Bar de coctelería de autor con música en vivo. Noches de jazz y bossa nova.',
        descriptionEn: 'Cocktail bar with live music. Jazz and bossa nova nights.',
        address: 'Av. San Martín 321, Equipetrol, Santa Cruz',
        phone: '+591 3 345 9876',
        latitude: -17.7780,
        longitude: -63.1760,
        ratingAvg: 0,
        ratingCount: 0,
        categoryId: catBares.id,
        ownerId: empresaUser.id,
        isFeatured: false,
        isActive: true,
      },
    {
        name: 'Churrasquía Don Toto',
        description: 'Parrilla criolla con cortes premium y ensaladas. El mejor asado de la ciudad.',
        descriptionEn: 'Creole grill with premium cuts and salads. The best roast in town.',
        address: 'Av. Busch 890, Santa Cruz',
        phone: '+591 3 332 4567',
        latitude: -17.7890,
        longitude: -63.1950,
        ratingAvg: 0,
        ratingCount: 0,
        categoryId: catGastro.id,
        ownerId: empresaUser.id,
        isFeatured: true,
        isActive: true,
      },
    {
        name: 'CC Ventura',
        description: 'El centro comercial más grande de Santa Cruz. Tiendas, cine, gastronomía y entretenimiento.',
        descriptionEn: 'The largest shopping center in Santa Cruz. Shops, cinema, dining and entertainment.',
        address: 'Av. Santos Dumont 1500, Ventura, Santa Cruz',
        phone: '+591 3 356 0000',
        website: 'https://ccventura.com.bo',
        latitude: -17.7600,
        longitude: -63.1300,
        ratingAvg: 0,
        ratingCount: 0,
        categoryId: catComercios.id,
        ownerId: null,
        isFeatured: false,
        isActive: true,
      },
    {
        name: 'Coliseo de Domingo Savio',
        description: 'Coliseo deportivo para eventos, conciertos y encuentros deportivos.',
        descriptionEn: 'Sports coliseum for events, concerts and sports competitions.',
        address: 'Av. Pirai s/n, Santa Cruz',
        phone: '+591 3 336 7890',
        latitude: -17.7950,
        longitude: -63.2050,
        ratingAvg: 0,
        ratingCount: 0,
        categoryId: catDeportes.id,
        ownerId: null,
        isFeatured: false,
        isActive: true,
      },
    {
        name: 'Aero Club Santa Cruz',
        description: 'Club deportivo con piscina olímpica, canchas de tenis, fútbol y gym.',
        descriptionEn: 'Sports club with Olympic pool, tennis courts, soccer fields and gym.',
        address: 'Av. Equipetrol 456, Santa Cruz',
        phone: '+591 3 344 2222',
        latitude: -17.7740,
        longitude: -63.1680,
        ratingAvg: 0,
        ratingCount: 0,
        categoryId: catDeportes.id,
        ownerId: empresaUser.id,
        isFeatured: false,
        isActive: true,
      },
    {
        name: 'Cristo Redentor',
        description: 'Monumento icónico de Santa Cruz con vista panorámica de la ciudad.',
        descriptionEn: 'Iconic monument of Santa Cruz with panoramic views of the city.',
        address: 'Barrio San Joaquín, Santa Cruz',
        latitude: -17.7730,
        longitude: -63.1630,
        ratingAvg: 0,
        ratingCount: 0,
        categoryId: catAtracciones.id,
        ownerId: null,
        isFeatured: true,
        isActive: true,
      }];

  const places: any[] = [];
  for (const placeData of placesData) {
    const place = await prisma.place.create({ data: placeData });
    places.push(place);
  }
  console.log(`Created ${places.length} places`);

  // ── Place Photos ───────────────────────────────────────────
  const photoUrls = [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=800',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
  ];

  for (let i = 0; i < places.length; i++) {
    await prisma.placePhoto.create({
      data: {
        placeId: places[i].id,
        url: photoUrls[i % photoUrls.length],
        altText: `Foto de ${places[i].name}`,
        displayOrder: 1,
      },
    });
  }
  console.log('Created place photos');

  // ── Place Hours ────────────────────────────────────────────
  for (const place of places) {
    for (let day = 0; day < 7; day++) {
      const hourData: any = {
        placeId: place.id,
        dayOfWeek: day,
        isClosed: day === 6,
        openTime: day === 6 ? null : '08:00',
        closeTime: day === 6 ? null : (day === 5 ? '23:00' : '22:00'),
      };

      await prisma.placeHour.create({ data: hourData });
    }
  }
  console.log('Created place hours');

  // ── Events ─────────────────────────────────────────────────
  const now = new Date();
  const events = await Promise.all([
    prisma.event.create({
      data: {
        name: 'Festival de la Chinita',
        description: 'Festival cultural con música, danza y gastronomía típica cruceña.',
        descriptionEn: 'Cultural festival with music, dance and traditional Santa Cruz cuisine.',
        dateStart: new Date(now.getTime() + 7 * 86400000),
        dateEnd: new Date(now.getTime() + 10 * 86400000),
        location: 'Parque Urbano Lomas de Arena',
        latitude: -17.8200,
        longitude: -63.2200,
        category: 'Festival',
        isActive: true,
      },
    }),
    prisma.event.create({
      data: {
        name: 'Noche de Jazz en Equipetrol',
        description: 'Presentación de bandas locales de jazz con entrada libre.',
        descriptionEn: 'Local jazz bands performing with free admission.',
        dateStart: new Date(now.getTime() + 3 * 86400000),
        dateEnd: new Date(now.getTime() + 3 * 86400000 + 5 * 3600000),
        location: 'Av. San Martín, Equipetrol',
        latitude: -17.7754,
        longitude: -63.1715,
        category: 'Música',
        isActive: true,
      },
    }),
    prisma.event.create({
      data: {
        name: 'Feria Artesanal del Toro',
        description: 'Más de 100 artesanos exponen y venden sus creaciones.',
        descriptionEn: 'More than 100 artisans exhibiting and selling their creations.',
        dateStart: new Date(now.getTime() + 14 * 86400000),
        dateEnd: new Date(now.getTime() + 16 * 86400000),
        location: 'Plaza 24 de Septiembre',
        latitude: -17.7840,
        longitude: -63.1810,
        category: 'Feria',
        isActive: true,
      },
    }),
    prisma.event.create({
      data: {
        name: 'Maratón de Santa Cruz 2026',
        description: 'Carrera oficial de 10K y 21K por las principales avenidas de la ciudad.',
        descriptionEn: 'Official 10K and 21K race through the city main avenues.',
        dateStart: new Date(now.getTime() + 21 * 86400000),
        dateEnd: new Date(now.getTime() + 21 * 86400000 + 6 * 3600000),
        location: 'Av. Principal, Santa Cruz',
        latitude: -17.7833,
        longitude: -63.1821,
        category: 'Deporte',
        isActive: true,
      },
    }),
    prisma.event.create({
      data: {
        name: 'Festival Gastronómico Cruceño',
        description: 'Degustación de platos típicos cruceños con chefs reconocidos.',
        descriptionEn: 'Tasting of traditional Santa Cruz dishes with renowned chefs.',
        dateStart: new Date(now.getTime() + 5 * 86400000),
        dateEnd: new Date(now.getTime() + 7 * 86400000),
        location: 'CC Ventura',
        latitude: -17.7600,
        longitude: -63.1300,
        category: 'Gastronomía',
        isActive: true,
      },
    }),
    prisma.event.create({
      data: {
        name: 'Concierto Benéfico',
        description: 'Concierto a beneficio de los damnificados por inundaciones.',
        descriptionEn: 'Benefit concert for flood victims.',
        dateStart: new Date(now.getTime() + 1 * 86400000),
        dateEnd: new Date(now.getTime() + 1 * 86400000 + 4 * 3600000),
        location: 'Teatro AQP',
        latitude: -17.7810,
        longitude: -63.1790,
        category: 'Música',
        isActive: true,
      },
    }),
  ]);
  console.log(`Created ${events.length} events`);

  // ── Promotions ─────────────────────────────────────────────
  const futureEnd = new Date(now.getTime() + 30 * 86400000);
  const promotions = await Promise.all([
    prisma.promotion.create({
      data: {
        placeId: places[0].id,
        title: '2x1 en almuerzos',
        titleEn: '2x1 on lunches',
        description: 'Todos los martes y jueves, el segundo almuerzo es gratis.',
        descriptionEn: 'Every Tuesday and Thursday, the second lunch is free.',
        discountPercentage: 50,
        startDate: now,
        endDate: futureEnd,
        isActive: true,
      },
    }),
    prisma.promotion.create({
      data: {
        placeId: places[2].id,
        title: '15% OFF en hospedaje',
        titleEn: '15% OFF on lodging',
        description: 'Descuento para reservas de 3 noches o más.',
        descriptionEn: 'Discount for bookings of 3 nights or more.',
        discountPercentage: 15,
        startDate: now,
        endDate: futureEnd,
        isActive: true,
      },
    }),
    prisma.promotion.create({
      data: {
        placeId: places[5].id,
        title: 'Happy Hour todo el día',
        titleEn: 'Happy Hour all day',
        description: 'Todos los tragos a precio de happy hour los domingos.',
        descriptionEn: 'All drinks at happy hour price on Sundays.',
        discountPercentage: 30,
        startDate: now,
        endDate: futureEnd,
        isActive: true,
      },
    }),
    prisma.promotion.create({
      data: {
        placeId: places[7].id,
        title: 'Combo familiar',
        titleEn: 'Family combo',
        description: 'Parrillada familiar para 4 personas con bebida incluida a precio especial.',
        descriptionEn: 'Family grill for 4 people with drink included at special price.',
        discountPercentage: 20,
        startDate: now,
        endDate: futureEnd,
        isActive: true,
      },
    }),
    prisma.promotion.create({
      data: {
        placeId: places[1].id,
        title: 'Cena romántica',
        titleEn: 'Romantic dinner',
        description: 'Cena para dos con botella de vino incluida por solo Bs. 250.',
        descriptionEn: 'Dinner for two with bottle of wine included for just Bs. 250.',
        discountPercentage: 25,
        startDate: now,
        endDate: futureEnd,
        isActive: true,
      },
    }),
  ]);
  console.log(`Created ${promotions.length} promotions`);

  // ── Reviews ────────────────────────────────────────────────
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        userId: usuario1.id,
        placeId: places[0].id,
        rating: 5,
        comment: 'Los anticuchos son los mejores de Santa Cruz. Atención excelente.',
        photos: '[]',
        status: 'PUBLISHED',
      },
    }),
    prisma.review.create({
      data: {
        userId: usuario2.id,
        placeId: places[0].id,
        rating: 4,
        comment: 'Muy buena comida pero a veces tarda mucho en servir.',
        photos: '[]',
        status: 'PUBLISHED',
      },
    }),
    prisma.review.create({
      data: {
        userId: usuario3.id,
        placeId: places[1].id,
        rating: 4,
        comment: 'La fusión de sabores es interesante. Recomiendo el lomo al trapo.',
        photos: '[]',
        status: 'PUBLISHED',
      },
    }),
    prisma.review.create({
      data: {
        userId: usuario1.id,
        placeId: places[2].id,
        rating: 5,
        comment: 'Hotel increíble, la piscina y el spa son de primera.',
        photos: '[]',
        status: 'PUBLISHED',
      },
    }),
    prisma.review.create({
      data: {
        userId: usuario2.id,
        placeId: places[3].id,
        rating: 5,
        comment: 'Lugar perfecto para desconectar. Las dunas son impresionantes.',
        photos: '[]',
        status: 'PUBLISHED',
      },
    }),
    prisma.review.create({
      data: {
        userId: usuario3.id,
        placeId: places[4].id,
        rating: 4,
        comment: 'Muy interesante las exhibiciones. Los niños lo disfrutaron mucho.',
        photos: '[]',
        status: 'PUBLISHED',
      },
    }),
    prisma.review.create({
      data: {
        userId: usuario1.id,
        placeId: places[5].id,
        rating: 5,
        comment: 'El mejor café de la ciudad. El latte es espectacular.',
        photos: '[]',
        status: 'PUBLISHED',
      },
    }),
    prisma.review.create({
      data: {
        userId: usuario2.id,
        placeId: places[6].id,
        rating: 4,
        comment: 'Buen ambiente y cocteles creativos. La música en vivo es genial.',
        photos: '[]',
        status: 'PUBLISHED',
      },
    }),
    prisma.review.create({
      data: {
        userId: usuario3.id,
        placeId: places[7].id,
        rating: 5,
        comment: 'El mejor asado que he probado. Los cortes son top.',
        photos: '[]',
        status: 'PUBLISHED',
      },
    }),
    prisma.review.create({
      data: {
        userId: usuario1.id,
        placeId: places[11].id,
        rating: 5,
        comment: 'Vista panorámica hermosa. Obligatorio al atardecer.',
        photos: '[]',
        status: 'PUBLISHED',
      },
    }),
  ]);
  console.log(`Created ${reviews.length} reviews`);

  // ── Update place ratings based on reviews ──────────────────
  for (const place of places) {
    const placeReviews = await prisma.review.findMany({
      where: { placeId: place.id, status: 'PUBLISHED' },
    });
    if (placeReviews.length > 0) {
      const avg = placeReviews.reduce((sum, r) => sum + r.rating, 0) / placeReviews.length;
      await prisma.place.update({
        where: { id: place.id },
        data: { ratingAvg: avg, ratingCount: placeReviews.length },
      });
    }
  }
  console.log('Updated place ratings');

  // ── Favorites ──────────────────────────────────────────────
  const favorites = await Promise.all([
    prisma.favorite.create({ data: { userId: usuario1.id, placeId: places[0].id } }),
    prisma.favorite.create({ data: { userId: usuario1.id, placeId: places[3].id } }),
    prisma.favorite.create({ data: { userId: usuario1.id, placeId: places[11].id } }),
    prisma.favorite.create({ data: { userId: usuario2.id, placeId: places[2].id } }),
    prisma.favorite.create({ data: { userId: usuario2.id, placeId: places[5].id } }),
    prisma.favorite.create({ data: { userId: usuario3.id, placeId: places[7].id } }),
    prisma.favorite.create({ data: { userId: usuario3.id, placeId: places[4].id } }),
  ]);
  console.log(`Created ${favorites.length} favorites`);

  // ── Search History ─────────────────────────────────────────
  const searchHistory = await Promise.all([
    prisma.searchHistory.create({ data: { userId: usuario1.id, query: 'restaurantes', resultsCount: 4 } }),
    prisma.searchHistory.create({ data: { userId: usuario1.id, query: 'hoteles equipetrol', resultsCount: 2 } }),
    prisma.searchHistory.create({ data: { userId: usuario2.id, query: 'café', resultsCount: 3 } }),
    prisma.searchHistory.create({ data: { userId: usuario2.id, query: 'eventos hoy', resultsCount: 2 } }),
    prisma.searchHistory.create({ data: { userId: usuario3.id, query: 'playa', resultsCount: 0 } }),
  ]);
  console.log(`Created ${searchHistory.length} search history entries`);

  // ── Notifications ──────────────────────────────────────────
  const notifications = await Promise.all([
    prisma.notification.create({
      data: {
        userId: usuario1.id,
        title: 'Nuevo evento cerca tuyo',
        body: 'El Festival de la Chinita comenzará pronto. ¡No te lo pierdas!',
        type: 'event',
        data: JSON.stringify({ eventId: events[0].id }),
        isRead: false,
      },
    }),
    prisma.notification.create({
      data: {
        userId: usuario1.id,
        title: 'Promoción especial',
        body: '2x1 en almuerzos en El Palmar. Solo por tiempo limitado.',
        type: 'promotion',
        data: JSON.stringify({ promotionId: promotions[0].id }),
        isRead: false,
      },
    }),
    prisma.notification.create({
      data: {
        userId: usuario2.id,
        title: 'Tu reseña fue aprobada',
        body: 'Tu reseña sobre Hotel Buganvilia ya es visible para otros usuarios.',
        type: 'review',
        data: JSON.stringify({}),
        isRead: true,
      },
    }),
    prisma.notification.create({
      data: {
        userId: usuario3.id,
        title: 'Bienvenida a BoliviaExperience',
        body: 'Explora los mejores lugares de Santa Cruz. ¡Comienza ahora!',
        type: 'system',
        data: JSON.stringify({}),
        isRead: false,
      },
    }),
  ]);
  console.log(`Created ${notifications.length} notifications`);

  // ── Trip Demos ──────────────────────────────────────────────

  const trip1 = await prisma.trip.create({
    data: {
      userId: usuario1.id,
      name: 'Santa Cruz 3 Días — Low Cost',
      description: 'Recorrido económico por los mejores lugares de Santa Cruz',
      destination: 'Santa Cruz',
      startDate: new Date(now.getTime() + 14 * 86400000),
      endDate: new Date(now.getTime() + 17 * 86400000),
      budgetType: 'low_cost',
      budgetMin: 500,
      budgetMax: 1000,
      isPublic: true,
    },
  });

  const trip1Day1 = await prisma.tripDay.create({ data: { tripId: trip1.id, dayNumber: 1, date: new Date(now.getTime() + 14 * 86400000), description: 'Aventura en dunas' } });
  const trip1Day2 = await prisma.tripDay.create({ data: { tripId: trip1.id, dayNumber: 2, date: new Date(now.getTime() + 15 * 86400000), description: 'Cultura y gastronomía' } });
  const trip1Day3 = await prisma.tripDay.create({ data: { tripId: trip1.id, dayNumber: 3, date: new Date(now.getTime() + 16 * 86400000), description: 'Compras y vida nocturna' } });

  await prisma.tripItem.create({ data: { tripDayId: trip1Day1.id, placeId: places[3].id, title: 'Lomas de Arena', description: 'Senderismo y dunas', timeSlot: 'morning', orderIndex: 0 } });
  await prisma.tripItem.create({ data: { tripDayId: trip1Day1.id, placeId: places[7].id, title: 'Churrasquía Don Toto', description: 'Almuerzo criollo', timeSlot: 'afternoon', orderIndex: 1 } });
  await prisma.tripItem.create({ data: { tripDayId: trip1Day2.id, placeId: places[11].id, title: 'Cristo Redentor', description: 'Vista panorámica', timeSlot: 'morning', orderIndex: 0 } });
  await prisma.tripItem.create({ data: { tripDayId: trip1Day2.id, placeId: places[4].id, title: 'Museo Noel Kempff', description: 'Exhibiciones naturales', timeSlot: 'afternoon', orderIndex: 1 } });
  await prisma.tripItem.create({ data: { tripDayId: trip1Day2.id, placeId: places[5].id, title: 'Café Munaipata', description: 'Café artesanal', timeSlot: 'evening', orderIndex: 2 } });
  await prisma.tripItem.create({ data: { tripDayId: trip1Day3.id, placeId: places[8].id, title: 'CC Ventura', description: 'Compras', timeSlot: 'afternoon', orderIndex: 0 } });
  await prisma.tripItem.create({ data: { tripDayId: trip1Day3.id, placeId: places[6].id, title: 'Blue Velvet Bar', description: 'Coctelería de autor', timeSlot: 'evening', orderIndex: 1 } });

  const trip2 = await prisma.trip.create({
    data: {
      userId: usuario1.id,
      name: 'Santa Cruz Premium — 4 Días',
      description: 'Experiencia premium con los mejores lugares',
      destination: 'Santa Cruz',
      startDate: new Date(now.getTime() + 28 * 86400000),
      endDate: new Date(now.getTime() + 32 * 86400000),
      budgetType: 'luxury',
      budgetMin: 3000,
      budgetMax: 5000,
      isPublic: true,
    },
  });

  const trip2Day1 = await prisma.tripDay.create({ data: { tripId: trip2.id, dayNumber: 1, date: new Date(now.getTime() + 28 * 86400000), description: 'Llegada y check-in' } });
  const trip2Day2 = await prisma.tripDay.create({ data: { tripId: trip2.id, dayNumber: 2, date: new Date(now.getTime() + 29 * 86400000), description: 'Día de aventura' } });
  const trip2Day3 = await prisma.tripDay.create({ data: { tripId: trip2.id, dayNumber: 3, date: new Date(now.getTime() + 30 * 86400000), description: 'Gastronomía y cultura' } });
  const trip2Day4 = await prisma.tripDay.create({ data: { tripId: trip2.id, dayNumber: 4, date: new Date(now.getTime() + 31 * 86400000), description: 'Despedida' } });

  await prisma.tripItem.create({ data: { tripDayId: trip2Day1.id, placeId: places[2].id, title: 'Hotel Buganvilia', description: 'Check-in premium', timeSlot: 'morning', orderIndex: 0 } });
  await prisma.tripItem.create({ data: { tripDayId: trip2Day1.id, placeId: places[1].id, title: 'Cocina Mestiza', description: 'Cena de bienvenida', timeSlot: 'evening', orderIndex: 1 } });
  await prisma.tripItem.create({ data: { tripDayId: trip2Day2.id, placeId: places[3].id, title: 'Tour Lomas de Arena', description: 'Aventura completa', timeSlot: 'full_day', orderIndex: 0 } });
  await prisma.tripItem.create({ data: { tripDayId: trip2Day3.id, placeId: places[11].id, title: 'Cristo Redentor', description: 'Vista panorámica al amanecer', timeSlot: 'morning', orderIndex: 0 } });
  await prisma.tripItem.create({ data: { tripDayId: trip2Day3.id, placeId: places[0].id, title: 'El Palmar', description: 'Almuerzo tradicional', timeSlot: 'afternoon', orderIndex: 1 } });
  await prisma.tripItem.create({ data: { tripDayId: trip2Day3.id, placeId: places[6].id, title: 'Blue Velvet Bar', description: 'Noche de jazz', timeSlot: 'evening', orderIndex: 2 } });
  await prisma.tripItem.create({ data: { tripDayId: trip2Day4.id, placeId: places[10].id, title: 'Aero Club', description: 'Actividades deportivas', timeSlot: 'morning', orderIndex: 0 } });
  await prisma.tripItem.create({ data: { tripDayId: trip2Day4.id, placeId: places[5].id, title: 'Café Munaipata', description: 'Despedida con café', timeSlot: 'afternoon', orderIndex: 1 } });

  console.log('Created 2 demo trips with days and items');
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
