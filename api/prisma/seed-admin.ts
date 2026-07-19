import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@boliviaexperience.com';
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!password) {
    throw new Error('ADMIN_SEED_PASSWORD environment variable is required');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hashedPassword },
    create: {
      email,
      name: 'Administrador',
      password: hashedPassword,
      role: 'admin',
      language: 'es',
    },
  });

  console.log(`User seeded: ${user.email} (role: ${user.role})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
