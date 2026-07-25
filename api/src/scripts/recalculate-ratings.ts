import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Recalculating ratings...');

  const places = await prisma.place.findMany();
  let updated = 0;

  for (const place of places) {
    const stats = await prisma.review.aggregate({
      where: { placeId: place.id, status: 'PUBLISHED' },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.place.update({
      where: { id: place.id },
      data: {
        ratingAvg: stats._avg.rating ?? 0,
        ratingCount: stats._count.rating,
      },
    });

    updated++;
    if (updated % 100 === 0) {
      console.log(`  Updated ${updated}/${places.length} places...`);
    }
  }

  console.log(`Recalculated ratings for ${places.length} places`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
