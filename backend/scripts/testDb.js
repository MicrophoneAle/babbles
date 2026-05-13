import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const TEST_TAG = "test-connection";

async function main() {
  const entries = await prisma.entry.findMany({
    orderBy: { date: "desc" },
    include: { tags: true }
  });
  // eslint-disable-next-line no-console
  console.log("Entries with tags:", entries.length);
  entries.slice(0, 5).forEach((e) => {
    // eslint-disable-next-line no-console
    console.log(`  ${e.date.toISOString().slice(0, 10)} — tags: [${e.tags.map((t) => t.name).join(", ")}]`);
  });

  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });
  // eslint-disable-next-line no-console
  console.log("Tags:", tags.length, tags.map((t) => t.name).join(", ") || "(none)");

  await prisma.tag.upsert({
    where: { name: TEST_TAG },
    update: {},
    create: { name: TEST_TAG }
  });
  await prisma.tag.delete({ where: { name: TEST_TAG } });

  // eslint-disable-next-line no-console
  console.log("Database connection successful");
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Database test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
