const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

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

// Map: placeId -> producto que se crea (null = sin producto = POI puro)
// lugares reservables según categoría
const PRODUCT_BY_CATEGORY = {
  hoteles: { type: 'hospedaje', modalidad: 'instantanea', price: 250, policy: 'estandar', attrs: { tipoAlojamiento: 'hotel', capacidad: 2, comodidades: ['wifi', 'desayuno'] } },
  restaurantes: { type: 'mesa', modalidad: 'instantanea', price: 45, policy: 'estandar', attrs: { capacidad: 4, cocina: 'cruceña', requiereAnticipo: false } },
  cafeterias: { type: 'mesa', modalidad: 'instantanea', price: 30, policy: 'estandar', attrs: { capacidad: 4, cocina: 'cafetería' } },
  gastronomia: { type: 'mesa', modalidad: 'instantanea', price: 60, policy: 'estandar', attrs: { capacidad: 6, cocina: 'parrillada', requiereAnticipo: true } },
  bares: { type: 'mesa', modalidad: 'solicitud', price: 35, policy: 'estandar', attrs: { capacidad: 4 } },
  deportes: { type: 'actividad', modalidad: 'solicitud', price: 80, policy: 'flexible', attrs: { duracion: '2 horas', puntoEncuentro: 'Recepcion', incluyeEquipo: true } },
};

(async () => {
  // 1) Plantillas de política
  const policyRows = {};
  for (const [key, rules] of Object.entries(RULES)) {
    const names = { flexible: 'Flexible', estandar: 'Estándar', estricta: 'Estricta' };
    const desc = {
      flexible: 'Reembolso 100% hasta 72h, 50% hasta 24h, 0% después',
      estandar: 'Reembolso 100% hasta 48h, 50% hasta 24h, 0% después',
      estricta: 'Reembolso 50% hasta 48h, 0% después',
    };
    const existing = await p.cancellationPolicy.findFirst({ where: { name: names[key] } });
    if (existing) {
      policyRows[key] = existing.id;
    } else {
      const pol = await p.cancellationPolicy.create({
        data: { name: names[key], description: desc[key], rulesJson: rules },
      });
      policyRows[key] = pol.id;
    }
  }
  console.log('politicas:', policyRows);

  // 2) Config plataforma
  await p.platformConfig.upsert({
    where: { key: 'commission_rate' },
    update: {},
    create: { key: 'commission_rate', value: '0.10' },
  });
  await p.platformConfig.upsert({
    where: { key: 'solicitud_response_hours' },
    update: {},
    create: { key: 'solicitud_response_hours', value: '24' },
  });
  console.log('config ok');

  // 3) Productos por lugar
  const places = await p.place.findMany({ select: { id: true, name: true, ownerId: true, category: { select: { slug: true } } } });
  const placeProduct = new Map();
  let created = 0;
  let skipped = 0;
  for (const place of places) {
    const spec = PRODUCT_BY_CATEGORY[place.category.slug];
    if (!spec) {
      skipped++;
      console.log(`(sin producto) ${place.name}`);
      continue;
    }
    const existing = await p.product.findFirst({ where: { placeId: place.id } });
    if (existing) {
      placeProduct.set(place.id, existing.id);
      continue;
    }
    const prod = await p.product.create({
      data: {
        socioId: place.ownerId || 'cms298m5r0001ylp6dao7elh2', // empresa default del seed
        placeId: place.id,
        type: spec.type,
        name: place.name,
        description: `Servicio de ${spec.type} en ${place.name}`,
        price: spec.price,
        modalidadReserva: spec.modalidad,
        tourismType: 'urbano',
        budgetRange: 'medio',
        verificationStatus: 'verificado',
        priceUpdatedAt: new Date(),
        attributesJson: JSON.stringify(spec.attrs),
        policyId: policyRows[spec.policy],
        isActive: true,
      },
    });
    placeProduct.set(place.id, prod.id);
    created++;
    console.log(`(producto ${spec.type}/${spec.modalidad}) ${place.name}`);
  }

  // 4) Vincular reservas legacy al producto de su lugar
  const reservations = await p.reservation.findMany({ where: { productId: null } });
  let linked = 0;
  for (const res of reservations) {
    if (placeProduct.has(res.placeId)) {
      await p.reservation.update({
        where: { id: res.id },
        data: { productId: placeProduct.get(res.placeId) },
      });
      linked++;
    }
  }
  console.log(`creados: ${created}, sin producto: ${skipped}, reservas vinculadas: ${linked}`);
  await p.$disconnect();
})();
