import "dotenv/config";
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { getRandomPrompts } from "./prompts.js";
import { calculateStreaks } from "./stats.js";

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

function dateParamToDate(dateParam) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) return null;
  const date = new Date(`${dateParam}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function countWords(text = "") {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

async function connectTags(tags = []) {
  const unique = [...new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))];
  if (!unique.length) return [];

  const upserted = await Promise.all(
    unique.map((name) =>
      prisma.tag.upsert({
        where: { name },
        update: {},
        create: { name }
      })
    )
  );
  return upserted.map((tag) => ({ id: tag.id }));
}

app.get("/api/entries", async (req, res) => {
  const search = (req.query.search || "").toString().trim().toLowerCase();

  const entries = await prisma.entry.findMany({
    where: search
      ? {
          OR: [
            { plainText: { contains: search, mode: "insensitive" } },
            { tags: { some: { name: { contains: search, mode: "insensitive" } } } }
          ]
        }
      : undefined,
    include: { tags: true },
    orderBy: { date: "desc" }
  });

  res.json(
    entries.map((entry) => ({
      id: entry.id,
      date: entry.date.toISOString().slice(0, 10),
      preview: entry.plainText.slice(0, 100),
      tags: entry.tags.map((tag) => tag.name)
    }))
  );
});

app.get("/api/entries/:date", async (req, res) => {
  const date = dateParamToDate(req.params.date);
  if (!date) return res.status(400).json({ error: "Invalid date format" });

  const entry = await prisma.entry.findUnique({
    where: { date },
    include: { tags: true }
  });

  if (!entry) return res.status(404).json({ error: "Entry not found" });

  return res.json({
    id: entry.id,
    date: entry.date.toISOString().slice(0, 10),
    content: entry.content,
    plainText: entry.plainText,
    wordCount: entry.wordCount,
    tags: entry.tags.map((tag) => tag.name)
  });
});

app.post("/api/entries", async (req, res) => {
  const { date, content = {}, plainText = "", tags = [] } = req.body;
  const parsedDate = dateParamToDate(date);
  if (!parsedDate) return res.status(400).json({ error: "Invalid date format" });

  const exists = await prisma.entry.findUnique({ where: { date: parsedDate } });
  if (exists) return res.status(409).json({ error: "Entry already exists for this date" });

  const tagConnections = await connectTags(tags);

  const created = await prisma.entry.create({
    data: {
      date: parsedDate,
      content,
      plainText,
      wordCount: countWords(plainText),
      tags: { connect: tagConnections }
    },
    include: { tags: true }
  });

  return res.status(201).json({
    id: created.id,
    date: created.date.toISOString().slice(0, 10),
    tags: created.tags.map((tag) => tag.name)
  });
});

app.put("/api/entries/:date", async (req, res) => {
  const parsedDate = dateParamToDate(req.params.date);
  if (!parsedDate) return res.status(400).json({ error: "Invalid date format" });

  const { content = {}, plainText = "", tags = [] } = req.body;
  const existing = await prisma.entry.findUnique({ where: { date: parsedDate } });
  if (!existing) return res.status(404).json({ error: "Entry not found" });

  const tagConnections = await connectTags(tags);

  const updated = await prisma.entry.update({
    where: { date: parsedDate },
    data: {
      content,
      plainText,
      wordCount: countWords(plainText),
      tags: {
        set: [],
        connect: tagConnections
      }
    },
    include: { tags: true }
  });

  return res.json({
    id: updated.id,
    date: updated.date.toISOString().slice(0, 10),
    tags: updated.tags.map((tag) => tag.name),
    wordCount: updated.wordCount
  });
});

app.get("/api/prompts", (_req, res) => {
  res.json({ prompts: getRandomPrompts(3) });
});

app.get("/api/stats", async (_req, res) => {
  const entries = await prisma.entry.findMany({
    select: { date: true, wordCount: true }
  });

  const totalEntries = entries.length;
  const totalWords = entries.reduce((sum, entry) => sum + entry.wordCount, 0);
  const { currentStreak, longestStreak } = calculateStreaks(entries.map((e) => e.date));
  const heatmap = entries.map((e) => ({
    date: e.date.toISOString().slice(0, 10),
    count: 1
  }));

  res.json({
    currentStreak,
    longestStreak,
    totalEntries,
    totalWords,
    heatmap
  });
});

app.get("/api/tags", async (_req, res) => {
  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });
  res.json(tags.map((tag) => tag.name));
});

app.get("/api/tags/summary", async (_req, res) => {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { entries: true }
      }
    }
  });
  res.json(tags.map((tag) => ({ name: tag.name, count: tag._count.entries })));
});

app.post("/api/tags", async (req, res) => {
  const name = (req.body?.name || "").toString().trim().toLowerCase();
  if (!name) return res.status(400).json({ error: "Tag name is required" });

  const tag = await prisma.tag.upsert({
    where: { name },
    update: {},
    create: { name }
  });

  return res.status(201).json({ name: tag.name });
});

app.delete("/api/tags/:name", async (req, res) => {
  const name = decodeURIComponent(req.params.name || "").trim().toLowerCase();
  if (!name) return res.status(400).json({ error: "Tag name is required" });

  const tag = await prisma.tag.findUnique({ where: { name } });
  if (!tag) return res.status(404).json({ error: "Tag not found" });

  await prisma.tag.delete({ where: { name } });
  return res.status(204).send();
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${PORT}`);
});
