import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Adding status column (ignore error if already exists)...");
  try {
    await prisma.$executeRawUnsafe(
      "ALTER TABLE reviews ADD COLUMN status TEXT NOT NULL DEFAULT 'PUBLISHED'",
    );
    console.log("Column added");
  } catch (e: any) {
    console.log("Column may already exist:", e.message?.substring(0, 80));
  }

  console.log("Migrating is_approved data to status...");
  await prisma.$executeRawUnsafe(
    "UPDATE reviews SET status = 'PUBLISHED' WHERE is_approved = 1",
  );
  await prisma.$executeRawUnsafe(
    "UPDATE reviews SET status = 'UNDER_REVIEW' WHERE is_approved = 0",
  );
  console.log("Done migrating data");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
