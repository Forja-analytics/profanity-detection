// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ------- Blacklist -------
  await prisma.blacklistWord.createMany({
    data: [
      { phrase: 'damn', severity: 1 },
      { phrase: 'hell', severity: 1 },
      { phrase: 'crap', severity: 1 },
      { phrase: 'bastard', severity: 2 },
      { phrase: 'bitch', severity: 2 },
      { phrase: 'asshole', severity: 2 },
      { phrase: 'fuck', severity: 3 },
      { phrase: 'shit', severity: 3 },
      { phrase: 'motherfucker', severity: 3 },
      { phrase: 'ben dover', severity: 2 },
      { phrase: 'mike hunt', severity: 2 },
      { phrase: 'tomas turbado', severity: 2 },
      { phrase: 'hp', severity: 2 },
      { phrase: 'hijueputa', severity: 3 },
      { phrase: 'mamar gallo', severity: 2 },
      { phrase: 'viva petro', severity: 3 },
      { phrase: 'café con azucar', severity: 3 },
    ],
    skipDuplicates: true,
  });

  // ------- Whitelist -------
  await prisma.whitelistWord.createMany({
    data: [
      { phrase: 'dickinson' },
      { phrase: 'putah creek' },
      { phrase: 'cockburn' },
      { phrase: 'class assignment' },
      { phrase: 'massachusetts' },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seed completed');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
