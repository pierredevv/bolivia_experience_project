import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Step 1: Migrating is_approved to status...");

  // Migrar is_approved: 1 → PUBLISHED
  const published = await prisma.$executeRaw`
    UPDATE reviews SET status = 'PUBLISHED' WHERE is_approved = 1
  `;
  console.log(`  Migrated ${published} reviews to PUBLISHED`);

  // Migrar is_approved: 0 → UNDER_REVIEW
  const pending = await prisma.$executeRaw`
    UPDATE reviews SET status = 'UNDER_REVIEW' WHERE is_approved = 0
  `;
  console.log(`  Migrated ${pending} reviews to UNDER_REVIEW`);

  console.log("Step 1 complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
