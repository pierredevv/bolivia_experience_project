const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
const isSQLite = process.env.DATABASE_URL?.includes('file:');

async function main() {
  console.log(`Starting seed... (database: ${isSQLite ? 'SQLite' : 'PostgreSQL'})`);

  await prisma.notification.deleteMany();
  await prisma.searchHistory.deleteMany();
  await prisma.reviewReply.deleteMany();
  await prisma.review.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.placePhoto.deleteMany();
  await prisma.placeHour.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.place.deleteMany();
  await prisma.event.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  console.log('Cleaned existing data');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({ data: { email: 'admin@boliviaexperience.com', name: 'Administrador', password: hashedPassword, role: 'admin', language: 'es' } });
  const empresaUser = await prisma.user.create({ data: { email: 'empresa@boliviaexperience.com', name: 'Carlos Mendoza', password: hashedPassword, role: 'empresa', language: 'es' } });
  const usuario1 = await prisma.user.create({ data: { email: 'maria@gmail.com', name: 'María García', password: hashedPassword, role: 'usuario', language: 'es' } });
  const usuario2 = await prisma.user.create({ data: { email: 'juan@gmail.com', name: 'Juan López', password: hashedPassword, role: 'usuario', language: 'es' } });
  const usuario3 = await prisma.user.create({ data: { email: 'ana@gmail.com', name: 'Ana Morales', password: hashedPassword, role: 'usuario', language: 'es' } });
  console.log('Created 5 users');

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
  const categories = await Promise.all(cats.map((c) => prisma.category.create({ data: c })));
  console.log(`Created ${categories.length} categories`);
  const [catR, catH, catB, catC, catA, catP, catM, catCo, catD, catG] = categories;

  const places = await Promise.all([
    prisma.place.create({ data: { name: 'El Palmar', description: 'Restaurante de comida cruceña tradicional.', descriptionEn: 'Traditional Santa Cruz restaurant.', address: 'Av. Monseñor Ángel Uría 456, Santa Cruz', phone: '+591 3 345 6789', website: 'https://elpalmar.com.bo', latitude: -17.7833, longitude: -63.1821, ratingAvg: 4.5, ratingCount: 128, categoryId: catR.id, ownerId: empresaUser.id, isFeatured: true, isActive: true } }),
    prisma.place.create({ data: { name: 'Cocina Mestiza', description: 'Fusión de sabores bolivianos.', descriptionEn: 'Fusion of Bolivian flavors.', address: 'Calle Warnes 123, Equipetrol', phone: '+591 3 334 5678', latitude: -17.7754, longitude: -63.1715, ratingAvg: 4.3, ratingCount: 87, categoryId: catR.id, ownerId: empresaUser.id, isFeatured: true, isActive: true } }),
    prisma.place.create({ data: { name: 'Hotel Buganvilia', description: 'Hotel boutique en Equipetrol.', descriptionEn: 'Boutique hotel in Equipetrol.', address: 'Av. San Martín 789, Equipetrol', phone: '+591 3 342 0000', website: 'https://hotelbuganvilia.com.bo', latitude: -17.7801, longitude: -63.1789, ratingAvg: 4.7, ratingCount: 203, categoryId: catH.id, ownerId: empresaUser.id, isFeatured: true, isActive: true } }),
    prisma.place.create({ data: { name: 'Parque Municipal Lomas de Arena', description: 'Reserva natural con dunas.', descriptionEn: 'Natural reserve with sand dunes.', address: 'Av. San Juan de Pampagrande', latitude: -17.82, longitude: -63.22, ratingAvg: 4.4, ratingCount: 342, categoryId: catP.id, isFeatured: true, isActive: true } }),
    prisma.place.create({ data: { name: 'Museo de Historia Natural', description: 'Exhibiciones de fauna y flora.', descriptionEn: 'Exhibitions of fauna and flora.', address: 'Av. Iñigó de Balda 212', latitude: -17.765, longitude: -63.15, ratingAvg: 4.2, ratingCount: 156, categoryId: catM.id, isFeatured: true, isActive: true } }),
    prisma.place.create({ data: { name: 'Café Munaipata', description: 'Café artesanal con granos de Yungas.', descriptionEn: 'Artisanal café with Yungas beans.', address: 'Calle Florida 456', latitude: -17.781, longitude: -63.185, ratingAvg: 4.6, ratingCount: 94, categoryId: catC.id, ownerId: empresaUser.id, isFeatured: true, isActive: true } }),
    prisma.place.create({ data: { name: 'Blue Velvet Bar', description: 'Bar de coctelería de autor.', descriptionEn: 'Cocktail bar with live music.', address: 'Av. San Martín 321, Equipetrol', latitude: -17.778, longitude: -63.176, ratingAvg: 4.1, ratingCount: 67, categoryId: catB.id, ownerId: empresaUser.id, isFeatured: false, isActive: true } }),
    prisma.place.create({ data: { name: 'Churrasquía Don Toto', description: 'Parrilla criolla con cortes premium.', descriptionEn: 'Creole grill with premium cuts.', address: 'Av. Busch 890', latitude: -17.789, longitude: -63.195, ratingAvg: 4.3, ratingCount: 178, categoryId: catG.id, ownerId: empresaUser.id, isFeatured: true, isActive: true } }),
    prisma.place.create({ data: { name: 'CC Ventura', description: 'Centro comercial más grande de SC.', descriptionEn: 'Largest shopping center in SC.', address: 'Av. Santos Dumont 1500', phone: '+591 3 356 0000', latitude: -17.76, longitude: -63.13, ratingAvg: 4.4, ratingCount: 521, categoryId: catCo.id, isFeatured: false, isActive: true } }),
    prisma.place.create({ data: { name: 'Coliseo Domingo Savio', description: 'Coliseo deportivo para eventos.', descriptionEn: 'Sports coliseum for events.', address: 'Av. Pirai s/n', latitude: -17.795, longitude: -63.205, ratingAvg: 4.0, ratingCount: 89, categoryId: catD.id, isFeatured: false, isActive: true } }),
    prisma.place.create({ data: { name: 'Aero Club Santa Cruz', description: 'Club deportivo con piscina olímpica.', descriptionEn: 'Sports club with Olympic pool.', address: 'Av. Equipetrol 456', latitude: -17.774, longitude: -63.168, ratingAvg: 4.5, ratingCount: 234, categoryId: catD.id, ownerId: empresaUser.id, isFeatured: false, isActive: true } }),
    prisma.place.create({ data: { name: 'Cristo Redentor', description: 'Monumento icónico con vista panorámica.', descriptionEn: 'Iconic monument with panoramic views.', address: 'Barrio San Joaquín', latitude: -17.773, longitude: -63.163, ratingAvg: 4.6, ratingCount: 412, categoryId: catA.id, isFeatured: true, isActive: true } }),
  ]);
  console.log(`Created ${places.length} places`);

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
    await prisma.placePhoto.create({ data: { placeId: places[i].id, url: photoUrls[i % photoUrls.length], altText: `Foto de ${places[i].name}`, displayOrder: 1 } });
  }
  console.log('Created place photos');

  for (const place of places) {
    for (let day = 0; day < 7; day++) {
      const hourData = { placeId: place.id, dayOfWeek: day, isClosed: day === 6 };
      if (isSQLite) {
        hourData.openTime = day === 6 ? null : '08:00';
        hourData.closeTime = day === 6 ? null : (day === 5 ? '23:00' : '22:00');
      } else {
        hourData.openTime = day === 6 ? null : new Date(1970, 0, 1, 8, 0, 0);
        hourData.closeTime = day === 6 ? null : new Date(1970, 0, 1, day === 5 ? 23 : 22, 0, 0);
      }
      await prisma.placeHour.create({ data: hourData });
    }
  }
  console.log('Created place hours');

  const now = new Date();
  const events = await Promise.all([
    prisma.event.create({ data: { name: 'Festival de la Chinita', description: 'Festival cultural con música y gastronomía.', dateStart: new Date(now.getTime() + 7*86400000), dateEnd: new Date(now.getTime() + 10*86400000), location: 'Parque Urbano Lomas de Arena', latitude: -17.82, longitude: -63.22, category: 'Festival', isActive: true } }),
    prisma.event.create({ data: { name: 'Noche de Jazz en Equipetrol', description: 'Bandas locales de jazz.', dateStart: new Date(now.getTime() + 3*86400000), dateEnd: new Date(now.getTime() + 3*86400000 + 5*3600000), location: 'Av. San Martín, Equipetrol', latitude: -17.7754, longitude: -63.1715, category: 'Música', isActive: true } }),
    prisma.event.create({ data: { name: 'Feria Artesanal del Toro', description: 'Más de 100 artesanos.', dateStart: new Date(now.getTime() + 14*86400000), dateEnd: new Date(now.getTime() + 16*86400000), location: 'Plaza 24 de Septiembre', latitude: -17.784, longitude: -63.181, category: 'Feria', isActive: true } }),
    prisma.event.create({ data: { name: 'Maratón de Santa Cruz 2026', description: 'Carrera de 10K y 21K.', dateStart: new Date(now.getTime() + 21*86400000), dateEnd: new Date(now.getTime() + 21*86400000 + 6*3600000), location: 'Av. Principal', latitude: -17.7833, longitude: -63.1821, category: 'Deporte', isActive: true } }),
    prisma.event.create({ data: { name: 'Festival Gastronómico Cruceño', description: 'Degustación de platos típicos.', dateStart: new Date(now.getTime() + 5*86400000), dateEnd: new Date(now.getTime() + 7*86400000), location: 'CC Ventura', latitude: -17.76, longitude: -63.13, category: 'Gastronomía', isActive: true } }),
    prisma.event.create({ data: { name: 'Concierto Benéfico', description: 'Concierto a beneficio de damnificados.', dateStart: new Date(now.getTime() + 1*86400000), dateEnd: new Date(now.getTime() + 1*86400000 + 4*3600000), location: 'Teatro AQP', latitude: -17.781, longitude: -63.179, category: 'Música', isActive: true } }),
  ]);
  console.log(`Created ${events.length} events`);

  const futureEnd = new Date(now.getTime() + 30*86400000);
  const promotions = await Promise.all([
    prisma.promotion.create({ data: { placeId: places[0].id, title: '2x1 en almuerzos', description: 'Todos los martes y jueves.', discountPercentage: 50, startDate: now, endDate: futureEnd, isActive: true } }),
    prisma.promotion.create({ data: { placeId: places[2].id, title: '15% OFF en hospedaje', description: 'Reservas de 3 noches o más.', discountPercentage: 15, startDate: now, endDate: futureEnd, isActive: true } }),
    prisma.promotion.create({ data: { placeId: places[5].id, title: 'Happy Hour todo el día', description: 'Todos los tragos en happy hour los domingos.', discountPercentage: 30, startDate: now, endDate: futureEnd, isActive: true } }),
    prisma.promotion.create({ data: { placeId: places[7].id, title: 'Combo familiar', description: 'Parrillada para 4 personas.', discountPercentage: 20, startDate: now, endDate: futureEnd, isActive: true } }),
    prisma.promotion.create({ data: { placeId: places[1].id, title: 'Cena romántica', description: 'Cena para dos con vino.', discountPercentage: 25, startDate: now, endDate: futureEnd, isActive: true } }),
  ]);
  console.log(`Created ${promotions.length} promotions`);

  const reviews = await Promise.all([
    prisma.review.create({ data: { userId: usuario1.id, placeId: places[0].id, rating: 5, comment: 'Los anticuchos son los mejores.', photos: '[]', isApproved: true } }),
    prisma.review.create({ data: { userId: usuario2.id, placeId: places[0].id, rating: 4, comment: 'Muy buena comida.', photos: '[]', isApproved: true } }),
    prisma.review.create({ data: { userId: usuario3.id, placeId: places[1].id, rating: 4, comment: 'Fusión interesante.', photos: '[]', isApproved: true } }),
    prisma.review.create({ data: { userId: usuario1.id, placeId: places[2].id, rating: 5, comment: 'Hotel increíble.', photos: '[]', isApproved: true } }),
    prisma.review.create({ data: { userId: usuario2.id, placeId: places[3].id, rating: 5, comment: 'Lugar perfecto.', photos: '[]', isApproved: true } }),
    prisma.review.create({ data: { userId: usuario3.id, placeId: places[4].id, rating: 4, comment: 'Muy interesante.', photos: '[]', isApproved: true } }),
    prisma.review.create({ data: { userId: usuario1.id, placeId: places[5].id, rating: 5, comment: 'El mejor café.', photos: '[]', isApproved: true } }),
    prisma.review.create({ data: { userId: usuario2.id, placeId: places[6].id, rating: 4, comment: 'Buen ambiente.', photos: '[]', isApproved: true } }),
    prisma.review.create({ data: { userId: usuario3.id, placeId: places[7].id, rating: 5, comment: 'El mejor asado.', photos: '[]', isApproved: true } }),
    prisma.review.create({ data: { userId: usuario1.id, placeId: places[11].id, rating: 5, comment: 'Vista panorámica hermosa.', photos: '[]', isApproved: true } }),
  ]);
  console.log(`Created ${reviews.length} reviews`);

  for (const place of places) {
    const placeReviews = await prisma.review.findMany({ where: { placeId: place.id, isApproved: true } });
    if (placeReviews.length > 0) {
      const avg = placeReviews.reduce((sum, r) => sum + r.rating, 0) / placeReviews.length;
      await prisma.place.update({ where: { id: place.id }, data: { ratingAvg: avg, ratingCount: placeReviews.length } });
    }
  }
  console.log('Updated place ratings');

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

  const searchHistory = await Promise.all([
    prisma.searchHistory.create({ data: { userId: usuario1.id, query: 'restaurantes', resultsCount: 4 } }),
    prisma.searchHistory.create({ data: { userId: usuario1.id, query: 'hoteles equipetrol', resultsCount: 2 } }),
    prisma.searchHistory.create({ data: { userId: usuario2.id, query: 'café', resultsCount: 3 } }),
    prisma.searchHistory.create({ data: { userId: usuario2.id, query: 'eventos hoy', resultsCount: 2 } }),
    prisma.searchHistory.create({ data: { userId: usuario3.id, query: 'playa', resultsCount: 0 } }),
  ]);
  console.log(`Created ${searchHistory.length} search history entries`);

  const notifications = await Promise.all([
    prisma.notification.create({ data: { userId: usuario1.id, title: 'Nuevo evento cerca tuyo', body: 'El Festival de la Chinita comenzará pronto.', type: 'event', data: JSON.stringify({ eventId: events[0].id }), isRead: false } }),
    prisma.notification.create({ data: { userId: usuario1.id, title: 'Promoción especial', body: '2x1 en almuerzos en El Palmar.', type: 'promotion', data: JSON.stringify({ promotionId: promotions[0].id }), isRead: false } }),
    prisma.notification.create({ data: { userId: usuario2.id, title: 'Tu reseña fue aprobada', body: 'Tu reseña sobre Hotel Buganvilia ya es visible.', type: 'review', data: JSON.stringify({}), isRead: true } }),
    prisma.notification.create({ data: { userId: usuario3.id, title: 'Bienvenida a BoliviaExperience', body: 'Explora los mejores lugares de Santa Cruz.', type: 'system', data: JSON.stringify({}), isRead: false } }),
  ]);
  console.log(`Created ${notifications.length} notifications`);

  console.log('Seed completed successfully!');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
