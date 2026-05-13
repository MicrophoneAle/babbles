# Pastel Journal App

A full-stack personal journaling web app built with React (Vite), Tailwind CSS, Express, PostgreSQL, Prisma, and Tiptap.

## Features

- One journal entry per day with auto-save every 10 seconds.
- Guided daily prompts (randomized, dismissible).
- Rich text editing (bold, italic, underline, headings, lists, blockquote, highlight).
- Tags with autocomplete from previously used tags.
- Past entries page with search by content/tag.
- Stats dashboard: current streak, longest streak, total entries, total words, heatmap calendar.

## Project Structure

- `frontend`: React + Vite + Tailwind app
- `backend`: Express API + Prisma/PostgreSQL

## Setup

1. Install dependencies:

```bash
npm run install:all
```

2. Configure backend env:

- Copy `backend/.env.example` to `backend/.env`
- Update `DATABASE_URL` for your PostgreSQL instance

3. Run Prisma migrations and generate client:

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate -- --name init
```

4. Seed sample entries:

```bash
npm run prisma:seed
```

5. Start backend and frontend in separate terminals:

```bash
npm run dev:backend
npm run dev:frontend
```

## Routes

Frontend:
- `/` Today entry editor
- `/entries` Past entries list + search
- `/stats` Writing stats + heatmap
- `/entry/:date` Edit/view specific date entry

Backend API:
- `GET /api/entries`
- `GET /api/entries/:date`
- `POST /api/entries`
- `PUT /api/entries/:date`
- `GET /api/prompts`
- `GET /api/stats`
- `GET /api/tags` (returns `{ name, count }[]`)
- `GET /api/health` (database connectivity check)

Run database smoke test from `backend`:

```bash
npm run test:db
```
