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
  await prisma.travelerPhotoLike.deleteMany();
  await prisma.travelerPhoto.deleteMany();
  await prisma.searchHistory.deleteMany();
  await prisma.reviewReply.deleteMany();
  await prisma.review.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.placePhoto.deleteMany();
  await prisma.placeHour.deleteMany();
  await prisma.place.deleteMany();
  await prisma.event.deleteMany();
  await prisma.safetyZone.deleteMany();
  await prisma.category.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.badge.deleteMany();
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
      businessName: 'Mendoza Tours & Experiencias',
    },
  });

  const usuario1 = await prisma.user.create({
    data: {
      email: 'maria@gmail.com',
      name: 'María García',
      password: hashedPassword,
      role: 'usuario',
      language: 'es',
      country: 'Bolivia',
      photoUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    },
  });

  const usuario2 = await prisma.user.create({
    data: {
      email: 'juan@gmail.com',
      name: 'Juan López',
      password: hashedPassword,
      role: 'usuario',
      language: 'es',
      country: 'Argentina',
      photoUrl:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    },
  });

  const usuario3 = await prisma.user.create({
    data: {
      email: 'ana@gmail.com',
      name: 'Ana Morales',
      password: hashedPassword,
      role: 'usuario',
      language: 'es',
      country: 'Perú',
      photoUrl:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
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
    // Tipos de cocina (categorías "ocultas" con prefijo cocina-*). Los grids públicos las filtran.
    { name: 'Cocina Boliviana', nameEn: 'Bolivian Cuisine', icon: 'restaurant_menu', slug: 'cocina-boliviana', description: 'Platos típicos bolivianos y cruceños', displayOrder: 11 },
    { name: 'Cocina Internacional', nameEn: 'International Cuisine', icon: 'public', slug: 'cocina-internacional', description: 'Sabores del mundo en Santa Cruz', displayOrder: 12 },
    { name: 'Comida Rápida', nameEn: 'Fast Food', icon: 'fastfood', slug: 'cocina-comida-rapida', description: 'Hamburguesas, pollos y comida al paso', displayOrder: 13 },
    { name: 'Vegetariana y Vegana', nameEn: 'Vegetarian & Vegan', icon: 'eco', slug: 'cocina-vegetariana-vegana', description: 'Opciones saludables sin carne', displayOrder: 14 },
    { name: 'Parrilla', nameEn: 'Grill', icon: 'outdoor_grill', slug: 'cocina-parrilla', description: 'Asados y carnes a la parrilla', displayOrder: 15 },
    { name: 'Mariscos', nameEn: 'Seafood', icon: 'set_meal', slug: 'cocina-mariscos', description: 'Pescados y mariscos frescos', displayOrder: 16 },
    { name: 'Cafetería', nameEn: 'Coffee Shop', icon: 'local_cafe', slug: 'cocina-cafeteria', description: 'Cafés, desayunos y repostería', displayOrder: 17 },
    { name: 'Postres y Repostería', nameEn: 'Desserts & Bakery', icon: 'cake', slug: 'cocina-postres', description: 'Dulces y repostería artesanal', displayOrder: 18 },
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
        isUrban: true,
        priceLevel: 2,
        priceUpdatedAt: new Date(),
        priceProposedBy: empresaUser.id,
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
        isUrban: true,
        priceLevel: 3,
        priceUpdatedAt: new Date(),
        priceProposedBy: empresaUser.id,
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
        isUrban: true,
        priceLevel: 4,
        priceUpdatedAt: new Date(),
        priceProposedBy: empresaUser.id,
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
        isUrban: false,
        priceLevel: 1,
        priceUpdatedAt: new Date(),
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
        isUrban: true,
        priceLevel: 1,
        priceUpdatedAt: new Date(),
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
        isUrban: true,
        priceLevel: 2,
        priceUpdatedAt: new Date(),
        priceProposedBy: empresaUser.id,
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
        isUrban: true,
        priceLevel: 3,
        priceUpdatedAt: new Date(),
        priceProposedBy: empresaUser.id,
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
        isUrban: true,
        priceLevel: 2,
        priceUpdatedAt: new Date(),
        priceProposedBy: empresaUser.id,
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
        isUrban: true,
        // priceLevel: null — intentionally left null for "price not verified" badge testing
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
        isUrban: true,
        // priceLevel: null — intentionally left null for "price not verified" badge testing
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
        isUrban: true,
        // priceLevel: null — intentionally left null for "price not verified" badge testing
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
        isUrban: false,
        // priceLevel: null — intentionally left null for "price not verified" badge testing
      },
    {
        name: 'Plaza 24 de Septiembre',
        description:
          'El corazón de Santa Cruz, rodeada de palmeras, la Catedral Metropolitana y la vida citadina.',
        descriptionEn:
          'The heart of Santa Cruz, surrounded by palm trees, the Metropolitan Cathedral and city life.',
        address: 'Calle 24 de Septiembre esq. Independencia, Centro, Santa Cruz',
        latitude: -17.7833,
        longitude: -63.1819,
        ratingAvg: 4.7,
        ratingCount: 512,
        categoryId: catParques.id,
        ownerId: null,
        isFeatured: true,
        isActive: true,
        isUrban: true,
        priceLevel: 1,
        priceUpdatedAt: new Date(),
      },
    {
        name: 'Hotel Los Tajibos',
        description:
          'Hotel 5 estrellas con piscina climatizada, spa y casino en pleno Equipetrol.',
        descriptionEn: '5-star hotel with heated pool, spa and casino in Equipetrol.',
        address: 'Av. San Martín 455, Equipetrol, Santa Cruz',
        phone: '+591 3 342 1010',
        website: 'https://hotellostajibos.com.bo',
        latitude: -17.7785,
        longitude: -63.1772,
        ratingAvg: 4.8,
        ratingCount: 320,
        categoryId: catHoteles.id,
        ownerId: empresaUser.id,
        isFeatured: true,
        isActive: true,
        isUrban: true,
        priceLevel: 4,
        priceUpdatedAt: new Date(),
        priceProposedBy: empresaUser.id,
        specialFeature: 'Piscina y Spa',
      },
    {
        name: 'Hotel Urbano',
        description:
          'Alojamiento céntrico y económico a pasos de la Plaza 24 de Septiembre.',
        descriptionEn: 'Central, budget-friendly lodging steps from the main square.',
        address: 'Calle Junín 250, Centro, Santa Cruz',
        phone: '+591 3 333 4567',
        latitude: -17.7840,
        longitude: -63.1825,
        ratingAvg: 4.1,
        ratingCount: 85,
        categoryId: catHoteles.id,
        ownerId: empresaUser.id,
        isFeatured: false,
        isActive: true,
        isUrban: true,
        priceLevel: 2,
        priceUpdatedAt: new Date(),
        priceProposedBy: empresaUser.id,
        specialFeature: 'Ubicación central',
      },
    {
        name: 'Jardín Urbano Boutique Hotel',
        description:
          'Boutique con diseño moderno, jardín interior y desayuno artesanal incluido.',
        descriptionEn: 'Boutique hotel with modern design, inner garden and artisan breakfast.',
        address: 'Calle Independencia 555, Centro, Santa Cruz',
        phone: '+591 3 334 8899',
        latitude: -17.7838,
        longitude: -63.1805,
        ratingAvg: 4.6,
        ratingCount: 140,
        categoryId: catHoteles.id,
        ownerId: empresaUser.id,
        isFeatured: true,
        isActive: true,
        isUrban: true,
        priceLevel: 3,
        priceUpdatedAt: new Date(),
        priceProposedBy: empresaUser.id,
        specialFeature: 'Jardín y desayuno incluido',
      },
    {
        name: 'Hotel Yotau',
        description:
          'Resort urbano con amplias piscinas, restaurantes y spa en zona norte.',
        descriptionEn: 'Urban resort with large pools, restaurants and spa in the north area.',
        address: 'Av. Monseñor Rivero 800, Santa Cruz',
        phone: '+591 3 345 2020',
        website: 'https://hotelyotau.com.bo',
        latitude: -17.7700,
        longitude: -63.1500,
        ratingAvg: 4.7,
        ratingCount: 210,
        categoryId: catHoteles.id,
        ownerId: empresaUser.id,
        isFeatured: true,
        isActive: true,
        isUrban: true,
        priceLevel: 4,
        priceUpdatedAt: new Date(),
        priceProposedBy: empresaUser.id,
        specialFeature: 'Piscinas y resort urbano',
      },
    {
        name: 'B&B Casa del Viajero',
        description:
          'Bed & breakfast familiar con ambiente acogedor y desayuno casero.',
        descriptionEn: 'Family-run bed & breakfast with cozy vibe and home-style breakfast.',
        address: 'Calle Los Cedros 120, Plan 3000, Santa Cruz',
        phone: '+591 3 355 7788',
        latitude: -17.8000,
        longitude: -63.2100,
        ratingAvg: 4.4,
        ratingCount: 60,
        categoryId: catHoteles.id,
        ownerId: empresaUser.id,
        isFeatured: false,
        isActive: true,
        isUrban: true,
        priceLevel: 1,
        priceUpdatedAt: new Date(),
        priceProposedBy: empresaUser.id,
        specialFeature: 'Ambiente familiar',
      },
    {
        name: 'Inn Los Cactus',
        description:
          'Inn tranquilo con patio arbolado, parqueo y mascotas permitidas.',
        descriptionEn: 'Quiet inn with tree-lined patio, parking and pets allowed.',
        address: 'Av. Tres Pasos al Frente, Santa Cruz',
        phone: '+591 3 366 4455',
        latitude: -17.7900,
        longitude: -63.1950,
        ratingAvg: 4.0,
        ratingCount: 45,
        categoryId: catHoteles.id,
        ownerId: empresaUser.id,
        isFeatured: false,
        isActive: true,
        isUrban: true,
        priceLevel: 2,
        priceUpdatedAt: new Date(),
        priceProposedBy: empresaUser.id,
        specialFeature: 'Pet friendly',
      },
    {
        name: 'Hotel El Mundo',
        description:
          'Hotel de negocios con salas de reuniones y servicios ejecutivos.',
        descriptionEn: 'Business hotel with meeting rooms and executive services.',
        address: 'Av. Cristo Redentor 1234, Santa Cruz',
        phone: '+591 3 332 9090',
        latitude: -17.7705,
        longitude: -63.1650,
        ratingAvg: 4.5,
        ratingCount: 175,
        categoryId: catHoteles.id,
        ownerId: empresaUser.id,
        isFeatured: true,
        isActive: true,
        isUrban: true,
        priceLevel: 3,
        priceUpdatedAt: new Date(),
        priceProposedBy: empresaUser.id,
        specialFeature: 'Centro de negocios',
      },
    {
        name: 'Hotel Mediterráneo',
        description:
          'Alojamiento elegante con terraza, restaurante y bar en la zona este.',
        descriptionEn: 'Elegant lodging with terrace, restaurant and bar in the east area.',
        address: 'Av. 2 de Agosto 987, Santa Cruz',
        phone: '+591 3 342 3131',
        latitude: -17.7860,
        longitude: -63.1700,
        ratingAvg: 4.7,
        ratingCount: 230,
        categoryId: catHoteles.id,
        ownerId: empresaUser.id,
        isFeatured: true,
        isActive: true,
        isUrban: true,
        priceLevel: 3,
        priceUpdatedAt: new Date(),
        priceProposedBy: empresaUser.id,
        specialFeature: 'Terraza y bar',
      },
    {
        name: 'Eco Hotel Lomas de Arena',
        description:
          'Eco alojamiento cerca de las dunas, ideal para desconectar en contacto con la naturaleza.',
        descriptionEn: 'Eco lodge near the dunes, ideal to disconnect in contact with nature.',
        address: 'Ruta a Lomas de Arena Km 18, Santa Cruz',
        phone: '+591 3 335 5555',
        latitude: -17.8150,
        longitude: -63.2150,
        ratingAvg: 4.3,
        ratingCount: 95,
        categoryId: catHoteles.id,
        ownerId: empresaUser.id,
        isFeatured: false,
        isActive: true,
        isUrban: false,
        priceLevel: 3,
        priceUpdatedAt: new Date(),
        priceProposedBy: empresaUser.id,
        specialFeature: 'Eco lodge',
      },
    {
        name: 'Gran Hotel Santa Cruz',
        description:
          'Hotel de lujo con torre panorámica, spa de primer nivel y gastronomía premium.',
        descriptionEn: 'Luxury hotel with panoramic tower, top-tier spa and premium dining.',
        address: 'Av. Las Américas 400, Santa Cruz',
        phone: '+591 3 340 5050',
        website: 'https://granhotelsantacruz.com.bo',
        latitude: -17.7750,
        longitude: -63.1830,
        ratingAvg: 4.9,
        ratingCount: 400,
        categoryId: catHoteles.id,
        ownerId: empresaUser.id,
        isFeatured: true,
        isActive: true,
        isUrban: true,
        priceLevel: 4,
        priceUpdatedAt: new Date(),
        priceProposedBy: empresaUser.id,
        specialFeature: 'Torre panorámica',
      },
    {
        name: 'Hostal El Torito',
        description:
          'Hostal económico con ambiente social, ideal para mochileros.',
        descriptionEn: 'Budget hostel with a social vibe, ideal for backpackers.',
        address: 'Calle 21 de Mayo 80, Santa Cruz',
        phone: '+591 3 322 1212',
        latitude: -17.7820,
        longitude: -63.1860,
        ratingAvg: 4.0,
        ratingCount: 130,
        categoryId: catHoteles.id,
        ownerId: empresaUser.id,
        isFeatured: false,
        isActive: true,
        isUrban: true,
        priceLevel: 1,
        priceUpdatedAt: new Date(),
        priceProposedBy: empresaUser.id,
        specialFeature: 'Ideal mochileros',
      },
    {
        name: 'La Casa de la Pascana',
        description: 'Cocina boliviana de altura con insumos andinos y platos del altiplano.',
        descriptionEn: 'Highland Bolivian cuisine with Andean ingredients and altiplano dishes.',
        address: 'Av. 26 de Febrero 321, Santa Cruz',
        phone: '+591 3 332 7788',
        latitude: -17.7620,
        longitude: -63.1730,
        ratingAvg: 0,
        ratingCount: 0,
        categoryId: catRestaurantes.id,
        ownerId: empresaUser.id,
        isFeatured: true,
        isActive: true,
        isUrban: true,
        cuisineType: 'Boliviana',
        priceLevel: 2,
        priceUpdatedAt: new Date(),
        priceProposedBy: empresaUser.id,
      },
    {
        name: 'Sushi Kobe',
        description: 'Cocina japonesa contemporánea con productos frescos y menú fusión.',
        descriptionEn: 'Contemporary Japanese cuisine with fresh ingredients and fusion menu.',
        address: 'Av. San Martín 678, Equipetrol, Santa Cruz',
        phone: '+591 3 343 9900',
        latitude: -17.7790,
        longitude: -63.1740,
        ratingAvg: 0,
        ratingCount: 0,
        categoryId: catRestaurantes.id,
        ownerId: empresaUser.id,
        isFeatured: false,
        isActive: true,
        isUrban: true,
        cuisineType: 'Japonesa',
        priceLevel: 3,
        priceUpdatedAt: new Date(),
        priceProposedBy: empresaUser.id,
      },
    {
        name: 'La Huerta Vegana',
        description: 'Restaurante vegetariano y vegano con menús saludables y sin gluten.',
        descriptionEn: 'Vegetarian and vegan restaurant with healthy and gluten-free menus.',
        address: 'Calle Los Cedros 340, Santa Cruz',
        phone: '+591 3 355 1122',
        latitude: -17.7880,
        longitude: -63.1900,
        ratingAvg: 0,
        ratingCount: 0,
        categoryId: catRestaurantes.id,
        ownerId: empresaUser.id,
        isFeatured: false,
        isActive: true,
        isUrban: true,
        cuisineType: 'Vegetariana',
        priceLevel: 2,
        priceUpdatedAt: new Date(),
        priceProposedBy: empresaUser.id,
      },
    {
        name: 'Burger House',
        description: 'Hamburguesas artesanales, papas y bebidas en ambiente casual.',
        descriptionEn: 'Artisanal burgers, fries and drinks in a casual setting.',
        address: 'Av. Banzer 1500, Santa Cruz',
        phone: '+591 3 351 4455',
        latitude: -17.7580,
        longitude: -63.1780,
        ratingAvg: 0,
        ratingCount: 0,
        categoryId: catRestaurantes.id,
        ownerId: empresaUser.id,
        isFeatured: true,
        isActive: true,
        isUrban: true,
        cuisineType: 'Comida rápida',
        priceLevel: 1,
        priceUpdatedAt: new Date(),
        priceProposedBy: empresaUser.id,
      },
    {
        name: 'Marisquería El Muelle',
        description: 'Pescados y mariscos frescos del oriente boliviano y del Pacífico.',
        descriptionEn: 'Fresh fish and seafood from the Bolivian east and the Pacific.',
        address: 'Av. Cristóbal de Mendoza 890, Santa Cruz',
        phone: '+591 3 336 7788',
        latitude: -17.7710,
        longitude: -63.1590,
        ratingAvg: 0,
        ratingCount: 0,
        categoryId: catRestaurantes.id,
        ownerId: empresaUser.id,
        isFeatured: true,
        isActive: true,
        isUrban: true,
        cuisineType: 'Mariscos',
        priceLevel: 3,
        priceUpdatedAt: new Date(),
        priceProposedBy: empresaUser.id,
      },
    {
        name: 'Dulce María Repostería',
        description: 'Postres, tortas y café de especialidad en un local acogedor.',
        descriptionEn: 'Desserts, cakes and specialty coffee in a cozy spot.',
        address: 'Calle Florida 880, Centro, Santa Cruz',
        phone: '+591 3 334 2211',
        latitude: -17.7835,
        longitude: -63.1840,
        ratingAvg: 0,
        ratingCount: 0,
        categoryId: catRestaurantes.id,
        ownerId: empresaUser.id,
        isFeatured: false,
        isActive: true,
        isUrban: true,
        cuisineType: 'Repostería',
        priceLevel: 1,
        priceUpdatedAt: new Date(),
        priceProposedBy: empresaUser.id,
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
    prisma.event.create({
      data: {
        name: 'Ruta del Vino y el Queso',
        description: 'Recorrido gastronómico por las mejores bodegas de la zona.',
        descriptionEn: 'Gastronomic tour through the best wineries in the area.',
        dateStart: now,
        dateEnd: new Date(now.getTime() + 6 * 3600000),
        location: 'Zona de Sacaba',
        latitude: -17.4000,
        longitude: -66.0500,
        category: 'Gastronomía',
        isActive: true,
      },
    }),
    prisma.event.create({
      data: {
        name: 'Almuerzo Cultural en la Chanchería',
        description: 'Almuerzo tradicional con shows de música en vivo.',
        descriptionEn: 'Traditional lunch with live music shows.',
        dateStart: new Date(now.getTime() + 5 * 3600000),
        dateEnd: new Date(now.getTime() + 8 * 3600000),
        location: 'La Chanchería, Centro',
        latitude: -17.7830,
        longitude: -63.1820,
        category: 'Gastronomía',
        isActive: true,
      },
    }),
  ]);
  console.log(`Created ${events.length} events`);

  // ── Safety Zones (Santa Cruz de la Sierra) ─────────────────
  const safetyZones = await Promise.all([
    prisma.safetyZone.create({
      data: {
        name: 'Plan 3000',
        latitude: -17.8400,
        longitude: -63.0900,
        radioKm: 2.5,
        nivelRiesgo: 'alto',
        description: 'Zona periférica con alta incidencia de delitos. Se recomienda evitar caminar de noche.',
        city: 'Santa Cruz de la Sierra',
        isActive: true,
      },
    }),
    prisma.safetyZone.create({
      data: {
        name: 'Mercado La Ramada',
        latitude: -17.7740,
        longitude: -63.1900,
        radioKm: 1.0,
        nivelRiesgo: 'alto',
        description: 'Zona comercial con riesgo de carterismo en horas pico.',
        city: 'Santa Cruz de la Sierra',
        isActive: true,
      },
    }),
    prisma.safetyZone.create({
      data: {
        name: 'Villa Primero de Mayo',
        latitude: -17.7400,
        longitude: -63.2100,
        radioKm: 2.0,
        nivelRiesgo: 'alto',
        description: 'Zona periférica con calles poco iluminadas.',
        city: 'Santa Cruz de la Sierra',
        isActive: true,
      },
    }),
    prisma.safetyZone.create({
      data: {
        name: 'Centro - Vida Nocturna',
        latitude: -17.7830,
        longitude: -63.1790,
        radioKm: 1.2,
        nivelRiesgo: 'medio',
        description: 'Zona céntrica con bares y locales nocturnos. Precaución en horarios tardíos.',
        city: 'Santa Cruz de la Sierra',
        isActive: true,
      },
    }),
    prisma.safetyZone.create({
      data: {
        name: 'Zona Norte - Av. Banzer',
        latitude: -17.7550,
        longitude: -63.1820,
        radioKm: 1.5,
        nivelRiesgo: 'bajo',
        description: 'Avenida principal bien iluminada y con alta concurrencia.',
        city: 'Santa Cruz de la Sierra',
        isActive: true,
      },
    }),
    prisma.safetyZone.create({
      data: {
        name: 'Equipetrol - Zona Sur',
        latitude: -17.7770,
        longitude: -63.1690,
        radioKm: 1.0,
        nivelRiesgo: 'bajo',
        description: 'Zona residencial y gastronómica con buenas condiciones de seguridad.',
        city: 'Santa Cruz de la Sierra',
        isActive: true,
      },
    }),
  ]);
  console.log(`Created ${safetyZones.length} safety zones`);

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

  // ── Traveler Photos ────────────────────────────────────────
  const travelerPhotosData = [
    {
      userId: usuario1.id,
      title: 'Atardecer en Lomas de Arena',
      description:
        'Las dunas de arena al atardecer son un espectáculo único. La laguna refleja el cielo naranja y rojo, vale la pena llegar temprano para subir la duna más alta.',
      imageUrl:
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200',
    },
    {
      userId: usuario2.id,
      title: 'Vista desde el Cristo Redentor',
      description:
        'Desde la cima se ve toda Santa Cruz. Fui al amanecer y la niebla sobre la ciudad era increíble. 365 escalones hasta arriba.',
      imageUrl:
        'https://images.unsplash.com/photo-1519840318084-a03230e3303c?w=1200',
    },
    {
      userId: usuario3.id,
      title: 'Paseo por el El Palmar',
      description:
        'Almorcé anticuchos y saice, la comida cruceña es deliciosa. El ambiente familiar y la atención de primera.',
      imageUrl:
        'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=1200',
    },
    {
      userId: usuario1.id,
      title: 'Plaza 24 de Septiembre',
      description:
        'El corazón de Santa Cruz. Las palmeras, la catedral y la gente paseando. Ideal para un café en la tarde.',
      imageUrl:
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200',
    },
    {
      userId: usuario2.id,
      title: 'Parque Ecológico Guembe',
      description:
        'El mariposario más grande del mundo está aquí. Miles de mariposas volando a tu alrededor, experiencia inolvidable.',
      imageUrl:
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200',
    },
    {
      userId: usuario3.id,
      title: 'El Palmar de las Islas',
      description:
        'Un paraíso escondido a 20 km de la ciudad. Palmeras, lagunas turquesas y tranquilidad total.',
      imageUrl:
        'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1200',
    },
    {
      userId: usuario1.id,
      title: 'Museo de Historia Natural Noel Kempff',
      description:
        'Perfecto para aprender sobre la fauna del oriente boliviano. Los dinosaurios y la colección de mariposas impresionan.',
      imageUrl:
        'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200',
    },
    {
      userId: usuario2.id,
      title: 'CC Ventura de noche',
      description:
        'El centro comercial más grande de Bolivia. De noche se ve espectacular con las luces. Ideal para compras y cine.',
      imageUrl:
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200',
    },
    {
      userId: usuario3.id,
      title: 'Bioparque Santa Cruz',
      description:
        'Un espacio verde enorme en plena ciudad. Perfecto para un paseo familiar, hay animales rescatados y senderos sombreados.',
      imageUrl:
        'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=1200',
    },
  ];

  const travelerPhotos = [];
  for (const photoData of travelerPhotosData) {
    const photo = await prisma.travelerPhoto.create({ data: photoData });
    travelerPhotos.push(photo);
  }
  console.log(`Created ${travelerPhotos.length} traveler photos`);

  // ── Traveler Photo Likes ───────────────────────────────────
  const likeCombos = [
    [travelerPhotos[0].id, usuario1.id],
    [travelerPhotos[0].id, usuario2.id],
    [travelerPhotos[0].id, usuario3.id],
    [travelerPhotos[1].id, usuario1.id],
    [travelerPhotos[1].id, usuario3.id],
    [travelerPhotos[2].id, usuario2.id],
    [travelerPhotos[3].id, usuario1.id],
    [travelerPhotos[3].id, usuario2.id],
    [travelerPhotos[4].id, usuario3.id],
    [travelerPhotos[5].id, usuario2.id],
    [travelerPhotos[6].id, usuario1.id],
    [travelerPhotos[7].id, usuario3.id],
  ];

  for (const [photoId, userId] of likeCombos) {
    await prisma.travelerPhotoLike.create({
      data: { photoId: photoId as string, userId: userId as string },
    });
  }
  console.log(`Created ${likeCombos.length} traveler photo likes`);

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
      tourismType: 'ambos',
      groupType: 'solo',
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
      tourismType: 'urbano',
      groupType: 'pareja',
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

  // ── Home Experiences (Productos tipo experiencia + reseñas) ──
  // Socio premium para probar el badge "Socio recomendado"
  const premiumSocio = await prisma.user.create({
    data: {
      email: 'premium@toursbolivia.com',
      name: 'Andrés Quiroga',
      password: hashedPassword,
      role: 'empresa',
      language: 'es',
      isPremium: true,
      businessName: 'Bolivia Premium Tours',
    },
  });

  // Características específicas por categoría
  await prisma.place.update({
    where: { id: places[2].id },
    data: { specialFeature: 'Piscina y Spa' },
  });
  await prisma.place.update({
    where: { id: places[0].id },
    data: { cuisineType: 'Cruceña' },
  });
  await prisma.place.update({
    where: { id: places[1].id },
    data: { cuisineType: 'Fusión' },
  });
  await prisma.place.update({
    where: { id: places[7].id },
    data: { cuisineType: 'Parrilla' },
  });

  // Categoría del lugar definida por el administrador (sección "Top atracciones")
  const categoriaPlaceUpdates: Record<number, string> = {
    0: 'Gastronomía',
    1: 'Gastronomía',
    3: 'Parques y Naturaleza',
    4: 'Sitio cultural',
    5: 'Cafetería',
    6: 'Bares y Vida Nocturna',
    7: 'Gastronomía',
    8: 'Shopping mall',
    9: 'Deportes y Recreación',
    10: 'Aire libre',
    11: 'Sitio turístico',
    12: 'Punto de referencia',
  };
  for (const [idx, categoriaPlace] of Object.entries(categoriaPlaceUpdates)) {
    const placeIdx = Number(idx);
    if (places[placeIdx]) {
      await prisma.place.update({
        where: { id: places[placeIdx].id },
        data: { categoriaPlace },
      });
    }
  }
  console.log('Updated place categoriaPlace');

  // Lugares curados para la colección "Experiencias imprescindibles"
  const essentialPlaceIdx = [0, 3, 4, 11, 12];
  for (const placeIdx of essentialPlaceIdx) {
    if (places[placeIdx]) {
      await prisma.place.update({
        where: { id: places[placeIdx].id },
        data: { esImprescindible: true },
      });
    }
  }
  console.log('Updated place esImprescindible');

  const experienceData = [
    {
      socioId: premiumSocio.id,
      placeId: places[3].id,
      name: 'Tour Salar de Uyuni',
      description: 'Recorrido completo por el mayor desierto de sal del mundo con espejo de agua y geyseres.',
      descriptionEn: 'Full tour of the world\'s largest salt flat with water mirror and geysers.',
      type: 'experiencia',
      experienceCategory: 'Aventura',
      subcategoriaTour: 'multi_dia',
      tramosPrecioJson: JSON.stringify([
        { min: 1, max: 3, precio: 320 },
        { min: 4, max: 6, precio: 280 },
        { min: 7, max: 15, precio: 250 },
      ]),
      price: 0,
      pricePerAdult: 250,
      priceVarByGroup: true,
      currency: 'BOB',
      modalidadReserva: 'solicitud',
      photoUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800',
      ratingAvg: 4.9,
      ratingCount: 24,
    },
    {
      socioId: premiumSocio.id,
      placeId: places[0].id,
      name: 'Cata y Maridaje de Comida Cruceña',
      description: 'Experiencia gastronómica con platos típicos y maridaje de vinos locales.',
      descriptionEn: 'Gastronomic experience with typical dishes and local wine pairing.',
      type: 'experiencia',
      experienceCategory: 'Gastronomía',
      subcategoriaTour: 'cultural_rural',
      tramosPrecioJson: JSON.stringify([
        { min: 1, max: 3, precio: 75 },
        { min: 4, max: 6, precio: 65 },
      ]),
      price: 0,
      pricePerAdult: 60,
      priceVarByGroup: true,
      currency: 'BOB',
      modalidadReserva: 'solicitud',
      photoUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
      ratingAvg: 4.8,
      ratingCount: 12,
    },
    {
      socioId: empresaUser.id,
      placeId: places[11].id,
      name: 'Atardecer en el Cristo Redentor',
      description: 'Caminata al mirador con vista panorámica de Santa Cruz al atardecer.',
      descriptionEn: 'Hike to the viewpoint with panoramic views of Santa Cruz at sunset.',
      type: 'experiencia',
      experienceCategory: 'Tours de Noche',
      subcategoriaTour: 'caminata_turistica',
      tramosPrecioJson: JSON.stringify([
        { min: 1, max: 4, precio: 35 },
        { min: 5, max: 12, precio: 30 },
      ]),
      price: 0,
      pricePerAdult: 35,
      priceVarByGroup: false,
      currency: 'BOB',
      modalidadReserva: 'instantanea',
      photoUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
      ratingAvg: 4.6,
      ratingCount: 18,
    },
    {
      socioId: empresaUser.id,
      placeId: places[3].id,
      name: 'Senderismo Lomas de Arena',
      description: 'Ruta guiada por las dunas, lagunas y flora nativa de la reserva.',
      descriptionEn: 'Guided route through the dunes, lagoons and native flora of the reserve.',
      type: 'experiencia',
      experienceCategory: 'Naturaleza',
      subcategoriaTour: 'naturaleza_vida_salvaje',
      tramosPrecioJson: JSON.stringify([
        { min: 1, max: 5, precio: 25 },
        { min: 6, max: 12, precio: 20 },
      ]),
      price: 0,
      pricePerAdult: 25,
      priceVarByGroup: false,
      currency: 'BOB',
      modalidadReserva: 'instantanea',
      photoUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
      ratingAvg: 4.2,
      ratingCount: 9,
    },
    {
      socioId: premiumSocio.id,
      placeId: places[10].id,
      name: 'Vuelo en Parapente sobre Santa Cruz',
      description: 'Vuelo tándem con instructor certificado sobre el río Piraí.',
      descriptionEn: 'Tandem flight with certified instructor over the Piraí river.',
      type: 'experiencia',
      experienceCategory: 'Aventura',
      price: 0,
      pricePerAdult: 120,
      priceVarByGroup: false,
      currency: 'BOB',
      modalidadReserva: 'solicitud',
      photoUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
      ratingAvg: 4.7,
      ratingCount: 15,
    },
    {
      socioId: empresaUser.id,
      placeId: places[4].id,
      name: 'Tour Guiado Museo Noel Kempff',
      description: 'Visita guiada con especialista por las colecciones de fauna y flora.',
      descriptionEn: 'Guided visit with a specialist through the fauna and flora collections.',
      type: 'experiencia',
      experienceCategory: 'Cultura',
      subcategoriaTour: 'recorrido_historico',
      tramosPrecioJson: JSON.stringify([
        { min: 1, max: 4, precio: 40 },
        { min: 5, max: 12, precio: 35 },
      ]),
      price: 0,
      pricePerAdult: 40,
      priceVarByGroup: false,
      currency: 'BOB',
      modalidadReserva: 'instantanea',
      photoUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
      ratingAvg: 4.3,
      ratingCount: 8,
    },
    {
      socioId: premiumSocio.id,
      placeId: places[1].id,
      name: 'Noche de Jazz en Blue Velvet',
      description: 'Mesa reservada con coctelería de autor y música en vivo.',
      descriptionEn: 'Reserved table with signature cocktails and live music.',
      type: 'experiencia',
      experienceCategory: 'Vida Nocturna',
      price: 0,
      pricePerAdult: 90,
      priceVarByGroup: false,
      currency: 'BOB',
      modalidadReserva: 'instantanea',
      photoUrl: 'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=800',
      ratingAvg: 4.5,
      ratingCount: 6,
    },
    {
      socioId: empresaUser.id,
      placeId: places[5].id,
      name: 'Taller de Café Artesanal',
      description: 'Aprende el proceso del grano a la taza con baristas locales.',
      descriptionEn: 'Learn the bean-to-cup process with local baristas.',
      type: 'experiencia',
      experienceCategory: 'Gastronomía',
      price: 0,
      pricePerAdult: 30,
      priceVarByGroup: false,
      currency: 'BOB',
      modalidadReserva: 'instantanea',
      photoUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
      ratingAvg: 4.1,
      ratingCount: 4,
    },
    {
      socioId: premiumSocio.id,
      placeId: places[3].id,
      name: 'Tras las huellas del jaguar: expedición de 3 días a Kaa-Iya',
      description: 'Expedición de 3 días a la mayor área protegida de Sudamérica en busca de vida salvaje.',
      descriptionEn: '3-day expedition to South America\'s largest protected area in search of wildlife.',
      type: 'experiencia',
      experienceCategory: 'Expedición',
      subcategoriaTour: 'naturaleza_vida_salvaje',
      tramosPrecioJson: JSON.stringify([
        { min: 1, max: 3, precio: 400 },
        { min: 4, max: 6, precio: 360 },
        { min: 7, max: 12, precio: 320 },
      ]),
      price: 0,
      pricePerAdult: 400,
      priceVarByGroup: true,
      currency: 'BOB',
      modalidadReserva: 'solicitud',
      photoUrl: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=800',
      ratingAvg: 4.8,
      ratingCount: 11,
    },
    {
      socioId: empresaUser.id,
      placeId: places[12].id,
      name: 'Tour Privado por el Centro Histórico de Santa Cruz',
      description: 'Recorrido privado a medida por las plazas y edificios históricos de la ciudad.',
      descriptionEn: 'Private tailor-made tour through the historic squares and buildings of the city.',
      type: 'experiencia',
      experienceCategory: 'Visitas Turísticas Privadas',
      subcategoriaTour: 'visita_privada',
      tramosPrecioJson: JSON.stringify([
        { min: 1, max: 2, precio: 90 },
        { min: 3, max: 6, precio: 70 },
      ]),
      price: 0,
      pricePerAdult: 90,
      priceVarByGroup: true,
      currency: 'BOB',
      modalidadReserva: 'instantanea',
      photoUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
      ratingAvg: 4.7,
      ratingCount: 14,
    },
    {
      socioId: premiumSocio.id,
      placeId: places[1].id,
      name: 'Experiencia Privada y de Lujo: Gastronomía con Maridaje Premium',
      description: 'Cena privada de lujo con chef personal, sommelier y traslado en vehículo de alta gama.',
      descriptionEn: 'Private luxury dinner with personal chef, sommelier and high-end vehicle transfer.',
      type: 'experiencia',
      experienceCategory: 'Privado y de Lujo',
      subcategoriaTour: 'privada_lujo',
      tramosPrecioJson: JSON.stringify([
        { min: 1, max: 2, precio: 220 },
        { min: 3, max: 6, precio: 180 },
      ]),
      price: 0,
      pricePerAdult: 220,
      priceVarByGroup: true,
      currency: 'BOB',
      modalidadReserva: 'solicitud',
      photoUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
      ratingAvg: 4.9,
      ratingCount: 9,
    },
    {
      socioId: empresaUser.id,
      placeId: places[11].id,
      name: 'Caminata Guiada por el Parque Ecológico',
      description: 'Caminata turística con guía especializado por senderos y áreas verdes.',
      descriptionEn: 'Guided walking tour through trails and green areas.',
      type: 'experiencia',
      experienceCategory: 'Caminata Turística',
      subcategoriaTour: 'caminata_turistica',
      tramosPrecioJson: JSON.stringify([
        { min: 1, max: 5, precio: 30 },
        { min: 6, max: 15, precio: 25 },
      ]),
      price: 0,
      pricePerAdult: 30,
      priceVarByGroup: true,
      currency: 'BOB',
      modalidadReserva: 'instantanea',
      photoUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
      ratingAvg: 4.4,
      ratingCount: 7,
    },
  ];

  const experiences: any[] = [];
  // Detalle de experiencia completado por el socio (mostrado en la pantalla de detalle)
  const experienceDetails: Record<number, Record<string, any>> = {
    0: {
      duration: '8 horas',
      minAge: 5,
      maxAge: 70,
      maxGroup: 15,
      guideLanguage: 'es',
      mobileTicket: true,
      advanceDays: 23,
      policiesJson: JSON.stringify(['Garantía de precio más bajo', 'Cancelación gratuita']),
    },
    1: {
      duration: '2 horas',
      minAge: 18,
      maxAge: 80,
      maxGroup: 12,
      guideLanguage: 'es',
      mobileTicket: true,
      advanceDays: 15,
      policiesJson: JSON.stringify(['Menú fijo confirmado al reservar', 'Reembolso 50% hasta 24 h']),
    },
    2: {
      duration: '3 horas',
      minAge: 5,
      maxAge: 80,
      maxGroup: 20,
      guideLanguage: 'es',
      mobileTicket: true,
      advanceDays: 7,
      policiesJson: JSON.stringify(['Llegar 30 min antes', 'Cancelación gratuita']),
    },
    3: {
      duration: '4 horas',
      minAge: 6,
      maxAge: 65,
      maxGroup: 18,
      guideLanguage: 'es',
      mobileTicket: true,
      advanceDays: 10,
      policiesJson: JSON.stringify(['Recomendado llevar agua', 'Garantía de precio más bajo']),
    },
    4: {
      duration: '1 hora',
      minAge: 12,
      maxAge: 60,
      maxGroup: 8,
      guideLanguage: 'es',
      mobileTicket: true,
      advanceDays: 30,
      policiesJson: JSON.stringify(['Prohibido para embarazadas', 'Reembolso 50% hasta 48 h']),
    },
    5: {
      duration: '3 horas',
      minAge: 8,
      maxAge: 80,
      maxGroup: 15,
      guideLanguage: 'es',
      mobileTicket: true,
      advanceDays: 5,
      policiesJson: JSON.stringify(['Entrada incluida', 'Cancelación gratuita']),
    },
    6: {
      duration: '4 horas',
      minAge: 18,
      maxAge: 80,
      maxGroup: 10,
      guideLanguage: 'es',
      mobileTicket: true,
      advanceDays: 14,
      policiesJson: JSON.stringify(['Código de vestimenta informal', 'Reembolso 50% hasta 24 h']),
    },
    7: {
      duration: '2 horas',
      minAge: 10,
      maxAge: 80,
      maxGroup: 16,
      guideLanguage: 'es',
      mobileTicket: true,
      advanceDays: 3,
      policiesJson: JSON.stringify(['Grupo reducido', 'Cancelación gratuita']),
    },
  };

  for (let i = 0; i < experienceData.length; i++) {
    const created = await prisma.product.create({
      data: { ...experienceData[i], ...(experienceDetails[i] ?? {}) },
    });
    experiences.push(created);
  }
  console.log(`Created ${experiences.length} home experiences`);

  // Duración real en días + colección curada "Experiencias imprescindibles"
  const essentialProductIdx = [0, 1, 3, 4, 8, 10];
  const duracionDiasByIdx: Record<number, number> = { 0: 3, 8: 3 };
  for (let i = 0; i < experiences.length; i++) {
    await prisma.product.update({
      where: { id: experiences[i].id },
      data: {
        duracionDias: duracionDiasByIdx[i] ?? 1,
        esImprescindible: essentialProductIdx.includes(i),
      },
    });
  }
  console.log('Updated experience duracionDias & esImprescindible');

  // ── Slots de disponibilidad ("Reserva tu lugar") ─────────────
  const isoDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const slotTimes = ['09:00', '14:00', '18:00'];
  for (let i = 0; i < experiences.length; i++) {
    const base = new Date(now.getTime() + ((i % 3) + 1) * 86400000);
    await prisma.productSlot.create({
      data: {
        productId: experiences[i].id,
        date: isoDate(base),
        time: slotTimes[i % slotTimes.length],
        capacity: 10,
      },
    });
    await prisma.productSlot.create({
      data: {
        productId: experiences[i].id,
        date: isoDate(new Date(base.getTime() + 86400000)),
        time: slotTimes[(i + 1) % slotTimes.length],
        capacity: 10,
      },
    });
  }
  console.log(`Created ${experiences.length * 2} product slots`);

  // ── Product Reviews ─────────────────────────────────────────
  const reviewCombos: Array<[number, string, number, string]> = [
    [0, usuario1.id, 5, 'Increíble, el espejo de agua es de otro mundo.'],
    [0, usuario2.id, 5, 'Guías excelentes y organización impecable.'],
    [0, usuario3.id, 4, 'Muy lindo, aunque el viaje fue algo largo.'],
    [1, usuario1.id, 5, 'La mejor cata que he probado en Bolivia.'],
    [1, usuario2.id, 5, 'Comida increíble y buen maridaje.'],
    [2, usuario1.id, 5, 'Vistas espectaculares al atardecer.'],
    [2, usuario3.id, 4, 'Muy recomendado, ideal para fotos.'],
    [4, usuario2.id, 5, 'Aventura única con total seguridad.'],
    [4, usuario3.id, 4, 'Emocionante, vale cada centavo.'],
    [6, usuario1.id, 5, 'Noche perfecta con buena música.'],
  ];

  for (const [expIdx, userId, rating, comment] of reviewCombos) {
    await prisma.productReview.create({
      data: {
        productId: experiences[expIdx].id,
        userId,
        rating,
        comment,
        status: 'PUBLISHED',
      },
    });
  }
  console.log(`Created ${reviewCombos.length} product reviews`);

  // ── Políticas de cancelación (plantillas reutilizables) ─────────
  const RULES = {
    flexible: JSON.stringify([
      { hastaHoras: 72, reembolso: 100 },
      { hastaHoras: 24, reembolso: 50 },
      { reembolso: 0 },
    ]),
    estandar: JSON.stringify([
      { hastaHoras: 48, reembolso: 100 },
      { hastaHoras: 24, reembolso: 50 },
      { reembolso: 0 },
    ]),
    estricta: JSON.stringify([
      { hastaHoras: 48, reembolso: 50 },
      { reembolso: 0 },
    ]),
  };
  const policyNames: Record<string, string> = {
    flexible: 'Flexible',
    estandar: 'Estándar',
    estricta: 'Estricta',
  };
  const policyDescs: Record<string, string> = {
    flexible: 'Reembolso 100% hasta 72h, 50% hasta 24h, 0% después',
    estandar: 'Reembolso 100% hasta 48h, 50% hasta 24h, 0% después',
    estricta: 'Reembolso 50% hasta 48h, 0% después',
  };
  const policyRows: Record<string, string> = {};
  for (const [key, rules] of Object.entries(RULES)) {
    const existing = await prisma.cancellationPolicy.findFirst({
      where: { name: policyNames[key] },
    });
    if (existing) {
      policyRows[key] = existing.id;
    } else {
      const pol = await prisma.cancellationPolicy.create({
        data: {
          name: policyNames[key],
          description: policyDescs[key],
          rulesJson: rules,
        },
      });
      policyRows[key] = pol.id;
    }
  }
  console.log('Created cancellation policies');

  // ── Productos hospedaje (hoteles) ───────────────────────────────
  // 1 producto hospedaje por hotel con los campos de la tarjeta de hotel.
  const hotelProductSeeds = [
    {
      placeName: 'Hotel Buganvilia',
      name: 'Habitación Standard',
      price: 80,
      capacity: 2,
      caracteristicas: 'Hotel boutique en el corazón de Equipetrol con piscina, restaurante y spa.',
      comodidades: ['wifi', 'piscina', 'parqueo', 'restaurante', 'spa'],
      tipoPropiedad: 'hotel',
      estrellas: 4,
      textoPrecio: 'Precio por noche (incluye comisiones)',
      cashbackActivo: true,
      cashbackPorcentaje: 5,
      premiado: false,
      tieneOferta: false,
      reembolsable: false,
      pagoDiferido: false,
    },
    {
      placeName: 'Hotel Los Tajibos',
      name: 'Habitación Deluxe',
      price: 140,
      capacity: 2,
      caracteristicas: '5 estrellas con piscina climatizada, spa, casino y restaurantes de autor.',
      comodidades: ['wifi', 'piscina', 'parqueo', 'restaurante', 'gimnasio', 'spa', 'bar', 'negocio'],
      tipoPropiedad: 'hotel',
      estrellas: 5,
      textoPrecio: 'Precio por noche (impuestos no incluidos)',
      cashbackActivo: true,
      cashbackPorcentaje: 8,
      premiado: false,
      tieneOferta: false,
      reembolsable: false,
      pagoDiferido: false,
    },
    {
      placeName: 'Hotel Urbano',
      name: 'Habitación Ejecutiva',
      price: 60,
      capacity: 2,
      caracteristicas: 'Alojamiento céntrico y económico a pasos de la Plaza 24 de Septiembre.',
      comodidades: ['wifi', 'desayuno', 'restaurante'],
      tipoPropiedad: 'hotel',
      estrellas: 3,
      textoPrecio: 'Precio por noche (incluye comisiones)',
      cashbackActivo: false,
      cashbackPorcentaje: null,
      premiado: false,
      tieneOferta: false,
      reembolsable: true,
      pagoDiferido: false,
    },
    {
      placeName: 'Jardín Urbano Boutique Hotel',
      name: 'Habitación Jardín',
      price: 90,
      capacity: 2,
      caracteristicas: 'Boutique con diseño moderno, jardín interior y desayuno artesanal incluido.',
      comodidades: ['wifi', 'desayuno', 'aire', 'accesible'],
      tipoPropiedad: 'hotel',
      estrellas: 4,
      textoPrecio: 'Precio por noche (con desayuno)',
      cashbackActivo: true,
      cashbackPorcentaje: 5,
      premiado: true,
      tieneOferta: false,
      reembolsable: true,
      pagoDiferido: true,
    },
    {
      placeName: 'Hotel Yotau',
      name: 'Habitación Familiar',
      price: 120,
      capacity: 4,
      caracteristicas: 'Resort urbano con amplias piscinas, restaurantes y spa en zona norte.',
      comodidades: ['wifi', 'piscina', 'parqueo', 'restaurante', 'bar', 'gimnasio'],
      tipoPropiedad: 'hotel',
      estrellas: 4,
      textoPrecio: 'Precio por noche (impuestos no incluidos)',
      cashbackActivo: true,
      cashbackPorcentaje: 10,
      premiado: false,
      tieneOferta: true,
      reembolsable: false,
      pagoDiferido: false,
    },
    {
      placeName: 'B&B Casa del Viajero',
      name: 'Habitación Doble',
      price: 35,
      capacity: 2,
      caracteristicas: 'Bed & breakfast familiar con ambiente acogedor y desayuno casero.',
      comodidades: ['wifi', 'desayuno'],
      tipoPropiedad: 'bnb',
      estrellas: 2,
      textoPrecio: 'Precio por noche (incluye comisiones)',
      cashbackActivo: false,
      cashbackPorcentaje: null,
      premiado: false,
      tieneOferta: false,
      reembolsable: true,
      pagoDiferido: false,
    },
    {
      placeName: 'Inn Los Cactus',
      name: 'Habitación con Patio',
      price: 50,
      capacity: 3,
      caracteristicas: 'Inn tranquilo con patio arbolado, parqueo y mascotas permitidas.',
      comodidades: ['wifi', 'parqueo', 'mascotas'],
      tipoPropiedad: 'inn',
      estrellas: 3,
      textoPrecio: 'Precio por noche (incluye comisiones)',
      cashbackActivo: true,
      cashbackPorcentaje: 3,
      premiado: true,
      tieneOferta: false,
      reembolsable: false,
      pagoDiferido: true,
    },
    {
      placeName: 'Hotel El Mundo',
      name: 'Habitación Negocios',
      price: 85,
      capacity: 3,
      caracteristicas: 'Hotel de negocios con salas de reuniones y servicios ejecutivos.',
      comodidades: ['wifi', 'piscina', 'parqueo', 'restaurante', 'negocio'],
      tipoPropiedad: 'hotel',
      estrellas: 4,
      textoPrecio: 'Precio por noche (incluye comisiones)',
      cashbackActivo: true,
      cashbackPorcentaje: 6,
      premiado: false,
      tieneOferta: true,
      reembolsable: false,
      pagoDiferido: false,
    },
    {
      placeName: 'Hotel Mediterráneo',
      name: 'Habitación Superior',
      price: 110,
      capacity: 2,
      caracteristicas: 'Alojamiento elegante con terraza, restaurante y bar en la zona este.',
      comodidades: ['wifi', 'restaurante', 'bar', 'gimnasio', 'aire'],
      tipoPropiedad: 'hotel',
      estrellas: 4,
      textoPrecio: 'Precio por noche (impuestos no incluidos)',
      cashbackActivo: false,
      cashbackPorcentaje: null,
      premiado: false,
      tieneOferta: false,
      reembolsable: true,
      pagoDiferido: false,
    },
    {
      placeName: 'Eco Hotel Lomas de Arena',
      name: 'Cabaña Ecológica',
      price: 70,
      capacity: 2,
      caracteristicas: 'Eco alojamiento cerca de las dunas, ideal para desconectar con la naturaleza.',
      comodidades: ['wifi', 'desayuno', 'mascotas', 'accesible'],
      tipoPropiedad: 'hotel',
      estrellas: 3,
      textoPrecio: 'Precio por noche (con desayuno)',
      cashbackActivo: true,
      cashbackPorcentaje: 7,
      premiado: false,
      tieneOferta: false,
      reembolsable: true,
      pagoDiferido: true,
    },
    {
      placeName: 'Gran Hotel Santa Cruz',
      name: 'Suite Panorámica',
      price: 150,
      capacity: 2,
      caracteristicas: 'Hotel de lujo con torre panorámica, spa de primer nivel y gastronomía premium.',
      comodidades: ['wifi', 'piscina', 'parqueo', 'restaurante', 'gimnasio', 'spa', 'bar', 'negocio'],
      tipoPropiedad: 'hotel',
      estrellas: 5,
      textoPrecio: 'Precio por noche (impuestos no incluidos)',
      cashbackActivo: true,
      cashbackPorcentaje: 12,
      premiado: true,
      tieneOferta: true,
      reembolsable: false,
      pagoDiferido: true,
    },
    {
      placeName: 'Hostal El Torito',
      name: 'Cama Compartida',
      price: 25,
      capacity: 1,
      caracteristicas: 'Hostal económico con ambiente social, ideal para mochileros.',
      comodidades: ['wifi', 'bar'],
      tipoPropiedad: 'bnb',
      estrellas: 1,
      textoPrecio: 'Precio por noche (incluye comisiones)',
      cashbackActivo: false,
      cashbackPorcentaje: null,
      premiado: false,
      tieneOferta: false,
      reembolsable: false,
      pagoDiferido: false,
    },
  ];

  for (const seed of hotelProductSeeds) {
    const place = places.find((p: any) => p.name === seed.placeName);
    if (!place) continue;
    await prisma.product.create({
      data: {
        socioId: premiumSocio.id,
        placeId: place.id,
        type: 'hospedaje',
        name: seed.name,
        description: place.description,
        descriptionEn: place.descriptionEn,
        price: seed.price,
        currency: 'BOB',
        capacity: seed.capacity,
        modalidadReserva: 'instantanea',
        policyId: policyRows.estandar,
        caracteristicas: seed.caracteristicas,
        comodidadesJson: JSON.stringify(seed.comodidades),
        tipoPropiedad: seed.tipoPropiedad,
        estrellas: seed.estrellas,
        textoPrecio: seed.textoPrecio,
        cashbackActivo: seed.cashbackActivo,
        cashbackPorcentaje: seed.cashbackPorcentaje,
        premiado: seed.premiado,
        tieneOferta: seed.tieneOferta,
        reembolsable: seed.reembolsable,
        pagoDiferido: seed.pagoDiferido,
        priceUpdatedAt: new Date(),
      },
    });
  }
  console.log(`Created ${hotelProductSeeds.length} hotel products`);

  // ── Mesas de restaurantes (colección "Restaurantes") ────────────
  // 1 producto type 'mesa' por restaurante con modalidad de reserva
  // 5 instantanea / 2 solicitud / 2 ninguna (informativa, sin reserva).
  const catBySlug = new Map(categories.map((c: any) => [c.slug, c.id]));
  const restaurantProductSeeds = [
    { placeName: 'El Palmar', name: 'Mesa para 2 personas', price: 60, capacity: 2, modalidadReserva: 'instantanea', cocinaSlug: 'cocina-boliviana', cashbackActivo: true, cashbackPorcentaje: 5, comodidades: ['wifi', 'aire', 'terraza', 'música'], caracteristicas: 'Comida cruceña tradicional con anticuchos y saice, atención familiar y ambiente típico.', photoUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800' },
    { placeName: 'Cocina Mestiza', name: 'Mesa para 4 personas', price: 85, capacity: 4, modalidadReserva: 'instantanea', cocinaSlug: 'cocina-internacional', cashbackActivo: true, cashbackPorcentaje: 8, comodidades: ['wifi', 'aire', 'reservas', 'música', 'cócteles'], caracteristicas: 'Fusión de sabores bolivianos con influencias internacionales y menú ejecutivo.', photoUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800' },
    { placeName: 'Churrasquía Don Toto', name: 'Mesa para 6 personas', price: 70, capacity: 6, modalidadReserva: 'solicitud', cocinaSlug: 'cocina-parrilla', cashbackActivo: false, cashbackPorcentaje: null, comodidades: ['aire', 'parqueo', 'reservas', 'música', 'niños'], caracteristicas: 'Parrilla criolla con cortes premium, ensaladas y el mejor asado de la ciudad.', photoUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?w=800' },
    { placeName: 'La Casa de la Pascana', name: 'Mesa para 2 personas', price: 55, capacity: 2, modalidadReserva: 'instantanea', cocinaSlug: 'cocina-boliviana', cashbackActivo: true, cashbackPorcentaje: 5, comodidades: ['wifi', 'aire', 'terraza', 'reservas'], caracteristicas: 'Cocina boliviana de altura con insumos andinos y platos del altiplano.', photoUrl: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?w=800' },
    { placeName: 'Sushi Kobe', name: 'Mesa para 2 personas', price: 95, capacity: 2, modalidadReserva: 'instantanea', cocinaSlug: 'cocina-internacional', cashbackActivo: true, cashbackPorcentaje: 10, comodidades: ['wifi', 'aire', 'barra', 'delivery'], caracteristicas: 'Cocina japonesa contemporánea con productos frescos y menú fusión.', photoUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800' },
    { placeName: 'La Huerta Vegana', name: 'Mesa para 2 personas', price: 45, capacity: 2, modalidadReserva: 'solicitud', cocinaSlug: 'cocina-vegetariana-vegana', cashbackActivo: false, cashbackPorcentaje: null, comodidades: ['wifi', 'aire', 'terraza', 'vegana'], caracteristicas: 'Menús vegetarianos y veganos, saludables y sin gluten en un ambiente acogedor.', photoUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800' },
    { placeName: 'Burger House', name: 'Mesa para 4 personas', price: 30, capacity: 4, modalidadReserva: 'ninguna', cocinaSlug: 'cocina-comida-rapida', cashbackActivo: false, cashbackPorcentaje: null, comodidades: ['wifi', 'aire', 'delivery', 'niños', 'música'], caracteristicas: 'Hamburguesas artesanales, papas y bebidas en ambiente casual. Solo información, sin reserva online.', photoUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800' },
    { placeName: 'Marisquería El Muelle', name: 'Mesa para 6 personas', price: 110, capacity: 6, modalidadReserva: 'instantanea', cocinaSlug: 'cocina-mariscos', cashbackActivo: true, cashbackPorcentaje: 5, comodidades: ['aire', 'parqueo', 'música', 'barra', 'reservas'], caracteristicas: 'Pescados y mariscos frescos del oriente boliviano y del Pacífico, con reserva inmediata.', photoUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800' },
    { placeName: 'Dulce María Repostería', name: 'Mesa para 2 personas', price: 25, capacity: 2, modalidadReserva: 'ninguna', cocinaSlug: 'cocina-postres', cashbackActivo: false, cashbackPorcentaje: null, comodidades: ['wifi', 'aire', 'terraza', 'niños'], caracteristicas: 'Postres, tortas y café de especialidad en un local acogedor. Solo información, sin reserva online.', photoUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800' },
  ];

  for (const seed of restaurantProductSeeds) {
    const place = places.find((p: any) => p.name === seed.placeName);
    if (!place) continue;
    await prisma.product.create({
      data: {
        socioId: premiumSocio.id,
        placeId: place.id,
        type: 'mesa',
        name: seed.name,
        description: place.description,
        descriptionEn: place.descriptionEn,
        price: seed.price,
        currency: 'BOB',
        capacity: seed.capacity,
        modalidadReserva: seed.modalidadReserva,
        policyId: seed.modalidadReserva === 'ninguna' ? null : policyRows.estandar,
        caracteristicas: seed.caracteristicas,
        comodidadesJson: JSON.stringify(seed.comodidades),
        textoPrecio: 'Precio promedio por persona',
        tipoCocinaId: catBySlug.get(seed.cocinaSlug) ?? null,
        cashbackActivo: seed.cashbackActivo,
        cashbackPorcentaje: seed.cashbackPorcentaje,
        premiado: false,
        tieneOferta: false,
        reembolsable: true,
        pagoDiferido: false,
        photoUrl: seed.photoUrl,
        priceUpdatedAt: new Date(),
      },
    });
  }
  console.log(`Created ${restaurantProductSeeds.length} restaurant mesa products`);

  // ── Fotos específicas de hoteles y plaza ────────────────────────
  const placePhotoOverride: Record<string, string[]> = {
    'Plaza 24 de Septiembre': [
      'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
    ],
    'Hotel Buganvilia': [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
    ],
    'Hotel Los Tajibos': [
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
    ],
    'Hotel Urbano': [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800',
    ],
    'Jardín Urbano Boutique Hotel': [
      'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800',
    ],
    'Hotel Yotau': [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
      'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800',
    ],
    'B&B Casa del Viajero': [
      'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
    ],
    'Inn Los Cactus': [
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
    ],
    'Hotel El Mundo': [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
      'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800',
    ],
    'Hotel Mediterráneo': [
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
    ],
    'Eco Hotel Lomas de Arena': [
      'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800',
    ],
    'Gran Hotel Santa Cruz': [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
    ],
    'Hostal El Torito': [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
      'https://images.unsplash.com/photo-1520277739336-7bf67edfa768?w=800',
    ],
    'La Casa de la Pascana': [
      'https://images.unsplash.com/photo-1543353071-873f17a7a088?w=800',
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800',
    ],
    'Sushi Kobe': [
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800',
      'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800',
    ],
    'La Huerta Vegana': [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
    ],
    'Burger House': [
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
      'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=800',
    ],
    'Marisquería El Muelle': [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
      'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=800',
    ],
    'Dulce María Repostería': [
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800',
      'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=800',
    ],
  };
  for (const [placeName, urls] of Object.entries(placePhotoOverride)) {
    const place = places.find((p: any) => p.name === placeName);
    if (!place) continue;
    await prisma.placePhoto.deleteMany({ where: { placeId: place.id } });
    for (let i = 0; i < urls.length; i++) {
      await prisma.placePhoto.create({
        data: {
          placeId: place.id,
          url: urls[i],
          altText: `Foto de ${placeName}`,
          displayOrder: i + 1,
        },
      });
    }
  }
  console.log(`Updated photos for ${Object.keys(placePhotoOverride).length} places`);

  // ── Gamificación ──────────────────────────────────────────
  const badgeDefs = [
    { key: 'explorador', name: 'Explorador', nameEn: 'Explorer', description: 'Completa tu primera reserva', descriptionEn: 'Complete your first booking', icon: 'explore', condition: 'reservations>=1', points: 100 },
    { key: 'viajero-frecuente', name: 'Viajero Frecuente', nameEn: 'Frequent Traveler', description: 'Completa 5 reservas', descriptionEn: 'Complete 5 bookings', icon: 'flight', condition: 'reservations>=5', points: 250 },
    { key: 'aventurero', name: 'Aventurero', nameEn: 'Adventurer', description: 'Completa 10 reservas', descriptionEn: 'Complete 10 bookings', icon: 'hiking', condition: 'reservations>=10', points: 500 },
    { key: 'reviewer', name: 'Crítico Turístico', nameEn: 'Travel Critic', description: 'Publica 3 reseñas', descriptionEn: 'Publish 3 reviews', icon: 'rate_review', condition: 'reviews>=3', points: 150 },
    { key: 'coleccionista', name: 'Coleccionista', nameEn: 'Collector', description: 'Guarda 5 favoritos', descriptionEn: 'Save 5 favorites', icon: 'favorite', condition: 'favorites>=5', points: 100 },
  ];
  const badges = await Promise.all(
    badgeDefs.map((b) =>
      prisma.badge.upsert({
        where: { key: b.key },
        update: b,
        create: b,
      }),
    ),
  );
  const badgeByKey = Object.fromEntries(badges.map((b) => [b.key, b]));

  await prisma.userBadge.createMany({
    data: [
      { userId: usuario1.id, badgeId: badgeByKey.explorador.id },
      { userId: usuario1.id, badgeId: badgeByKey.reviewer.id },
      { userId: usuario1.id, badgeId: badgeByKey.coleccionista.id },
      { userId: usuario2.id, badgeId: badgeByKey.explorador.id },
      { userId: usuario2.id, badgeId: badgeByKey.reviewer.id },
      { userId: usuario3.id, badgeId: badgeByKey.explorador.id },
    ],
  });
  await prisma.user.updateMany({
    where: { id: { in: [usuario1.id, usuario2.id, usuario3.id] } },
    data: { points: { increment: 350 } },
  });
  console.log(`Created ${badges.length} badges`);

  // ── Configuración de plataforma ─────────────────────────────
  const platformConfigs = [
    // Tasa de conversión BOB → USD para cobros con proveedores en USD
    // (stripe / paypal). El QR del banco opera en BOB y no usa esta tasa.
    { key: 'exchange_rate_usd_bob', value: '6.96' },
    { key: 'commission_rate', value: '0.1' },
    { key: 'instantanea_payment_minutes', value: '15' },
    // Feature flags de proveedores de pago (default: stripe=true, resto=false)
    { key: 'payments_provider_stripe_enabled', value: 'true' },
    { key: 'payments_provider_paypal_enabled', value: 'true' },
    { key: 'payments_provider_qr_banco_local_enabled', value: 'false' },
  ];
  for (const cfg of platformConfigs) {
    await prisma.platformConfig.upsert({
      where: { key: cfg.key },
      update: { value: cfg.value },
      create: { key: cfg.key, value: cfg.value },
    });
  }
  console.log(`Seeded ${platformConfigs.length} platform configs`);

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
