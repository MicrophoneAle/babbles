import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const samples = [
  {
    date: "2026-05-05",
    text: "I took a long walk after lunch and noticed how much calmer I felt. I am grateful for small pauses and quiet spaces.",
    tags: ["gratitude", "wellness"]
  },
  {
    date: "2026-05-06",
    text: "Work felt intense, but I finished the hardest task first. That made the rest of the day lighter.",
    tags: ["work", "focus"]
  },
  {
    date: "2026-05-08",
    text: "Had dinner with family and laughed a lot. It reminded me how grounding familiar conversations can be.",
    tags: ["family", "joy"]
  },
  {
    date: "2026-05-09",
    text: "I am learning to say no to things that drain me. Boundaries are uncomfortable but necessary.",
    tags: ["reflection", "boundaries"]
  },
  {
    date: "2026-05-10",
    text: "A slow Sunday. I cleaned my room, planned the week, and listened to music without rushing.",
    tags: ["reset", "weekend"]
  },
  {
    date: "2026-05-11",
    text: "Today I wrote down my goals and they finally feel tangible. Tiny steps still count as progress.",
    tags: ["goals", "motivation"]
  }
];

function toDoc(text) {
  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text }]
      }
    ]
  };
}

function wordCount(text) {
  return text.trim().split(/\s+/).length;
}

async function main() {
  for (const sample of samples) {
    const tags = await Promise.all(
      sample.tags.map((name) =>
        prisma.tag.upsert({
          where: { name },
          update: {},
          create: { name }
        })
      )
    );

    await prisma.entry.upsert({
      where: { date: new Date(`${sample.date}T00:00:00.000Z`) },
      update: {},
      create: {
        date: new Date(`${sample.date}T00:00:00.000Z`),
        content: toDoc(sample.text),
        plainText: sample.text,
        wordCount: wordCount(sample.text),
        tags: { connect: tags.map((t) => ({ id: t.id })) }
      }
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
