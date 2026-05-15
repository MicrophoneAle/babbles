import "dotenv/config";
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { apiClerkMiddleware, requireOwner } from "./auth.js";
import { getRandomPrompts } from "./prompts.js";
import { calculateStreaks } from "./stats.js";

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 4000;
const corsOrigins = [
  ...(process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",").map((url) => url.trim()).filter(Boolean)
    : []),
  "http://localhost:5173"
].filter((v, i, a) => a.indexOf(v) === i);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (
        corsOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        origin.endsWith(".onrender.com")
      ) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"]
  })
);
app.use(apiClerkMiddleware());
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[health] database check failed:", error);
    return res.status(503).json({
      status: "error",
      database: "disconnected",
      timestamp: new Date().toISOString()
    });
  }
});

function dateParamToDate(dateParam) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) return null;
  const date = new Date(`${dateParam}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function parseEntryId(param) {
  const id = Number.parseInt(param, 10);
  if (!Number.isInteger(id) || id < 1) return null;
  return id;
}

function countWords(text = "") {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function entryToFullJson(entry) {
  return {
    id: entry.id,
    date: entry.date.toISOString().slice(0, 10),
    title: entry.title ?? "",
    content: entry.content,
    plainText: entry.plainText,
    wordCount: entry.wordCount,
    tags: entry.tags.map((tag) => tag.name),
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString()
  };
}

async function connectTags(tags = []) {
  const normalized = tags.map((tag) => (typeof tag === "string" ? tag : tag?.name || ""));
  const unique = [...new Set(normalized.map((tag) => tag.trim().toLowerCase()).filter(Boolean))];
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

async function getAdjacentByEntryId(id) {
  const [previous, next] = await Promise.all([
    prisma.entry.findFirst({
      where: { id: { lt: id } },
      orderBy: { id: "desc" },
      select: { id: true }
    }),
    prisma.entry.findFirst({
      where: { id: { gt: id } },
      orderBy: { id: "asc" },
      select: { id: true }
    })
  ]);

  return {
    previous: previous ? previous.id : null,
    next: next ? next.id : null
  };
}

app.get("/api/entries", async (req, res) => {
  const search = (req.query.search || "").toString().trim().toLowerCase();

  const entries = await prisma.entry.findMany({
    where: search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { plainText: { contains: search, mode: "insensitive" } },
            { tags: { some: { name: { contains: search, mode: "insensitive" } } } }
          ]
        }
      : undefined,
    include: { tags: true },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }]
  });

  res.json(
    entries.map((entry) => {
      const title = (entry.title || "").trim();
      const previewSource = title ? entry.plainText || "" : title || entry.plainText || "";
      return {
        id: entry.id,
        date: entry.date.toISOString().slice(0, 10),
        title: entry.title ?? "",
        preview: previewSource.slice(0, 100),
        wordCount: entry.wordCount,
        tags: entry.tags.map((tag) => tag.name),
        createdAt: entry.createdAt.toISOString()
      };
    })
  );
});

app.get("/api/entries/adjacent/:id", async (req, res) => {
  const id = parseEntryId(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid entry id" });

  const exists = await prisma.entry.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return res.status(404).json({ error: "Entry not found" });

  const adjacent = await getAdjacentByEntryId(id);
  return res.json(adjacent);
});

app.get("/api/entries/id/:id", async (req, res) => {
  const id = parseEntryId(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid entry id" });

  const entry = await prisma.entry.findUnique({
    where: { id },
    include: { tags: true }
  });

  if (!entry) return res.status(404).json({ error: "Entry not found" });

  return res.json(entryToFullJson(entry));
});

app.get("/api/entries/:date", async (req, res) => {
  const date = dateParamToDate(req.params.date);
  if (!date) return res.status(400).json({ error: "Invalid date format" });

  const entries = await prisma.entry.findMany({
    where: { date },
    include: { tags: true },
    orderBy: { createdAt: "asc" }
  });

  return res.json(entries.map(entryToFullJson));
});

app.post("/api/entries", requireOwner, async (req, res) => {
  const { date, title = "", content = {}, plainText = "", tags = [] } = req.body;
  const parsedDate = dateParamToDate(date);
  if (!parsedDate) return res.status(400).json({ error: "Invalid date format" });

  const tagConnections = await connectTags(tags);
  const titleStr = (title ?? "").toString();

  const created = await prisma.entry.create({
    data: {
      date: parsedDate,
      title: titleStr,
      content,
      plainText: plainText ?? "",
      wordCount: countWords(plainText ?? ""),
      tags: { connect: tagConnections }
    },
    include: { tags: true }
  });

  return res.status(201).json(entryToFullJson(created));
});

app.put("/api/entries/id/:id", requireOwner, async (req, res) => {
  const id = parseEntryId(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid entry id" });

  const existing = await prisma.entry.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: "Entry not found" });

  const { title, content = {}, plainText = "", tags = [] } = req.body;
  const tagConnections = await connectTags(tags);
  const titleStr = title !== undefined ? String(title) : existing.title;

  const updated = await prisma.entry.update({
    where: { id },
    data: {
      title: titleStr,
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

  return res.json(entryToFullJson(updated));
});

app.delete("/api/entries/id/:id", requireOwner, async (req, res) => {
  const id = parseEntryId(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid entry id" });

  const existing = await prisma.entry.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: "Not found" });

  await prisma.entry.delete({ where: { id } });
  return res.status(204).send();
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
  const uniqueDates = entries.map((e) => e.date);
  const { currentStreak, longestStreak } = calculateStreaks(uniqueDates);

  const wordsByDate = new Map();
  for (const e of entries) {
    const key = e.date.toISOString().slice(0, 10);
    wordsByDate.set(key, (wordsByDate.get(key) || 0) + e.wordCount);
  }
  const heatmap = [...wordsByDate.entries()]
    .map(([date, wordCount]) => ({ date, wordCount }))
    .sort((a, b) => a.date.localeCompare(b.date));

  res.json({
    currentStreak,
    longestStreak,
    totalEntries,
    totalWords,
    heatmap
  });
});

app.get("/api/tags", async (_req, res) => {
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

app.post("/api/tags", requireOwner, async (req, res) => {
  const tagName = (req.body?.name || "").toString().trim().toLowerCase();
  if (!tagName) return res.status(400).json({ error: "Tag name is required" });

  const tag = await prisma.tag.upsert({
    where: { name: tagName },
    update: {},
    create: { name: tagName }
  });

  return res.status(201).json({ name: tag.name });
});

app.delete("/api/tags/:name", requireOwner, async (req, res) => {
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
