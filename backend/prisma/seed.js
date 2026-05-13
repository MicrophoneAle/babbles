import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Curated starter tags (lowercase to match entry tag flow). */
const CURATED_TAGS = [
  "pondering",
  "reviews",
  "gym",
  "work",
  "personal",
  "gratitude",
  "goals",
  "family",
  "health",
  "travel"
];

async function main() {
  for (const name of CURATED_TAGS) {
    await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
