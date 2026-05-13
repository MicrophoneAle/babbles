# Michael's Babbles

A full-stack journaling app with a paper-inspired UI and daily writing flow.

- Frontend: React + Vite + Tailwind + Tiptap
- Backend: Express + Prisma + PostgreSQL

## Current Features

- Daily journal page with autosave every 10 seconds and manual save.
- Rich text editor (headings, lists, blockquote, underline, highlight, and more).
- Prompt cards for today's entry with dismiss/hide behavior.
- Tagging with autocomplete and "available tags" suggestions.
- Past entries list with search by text/tag and entry deletion.
- Date-based entry navigation (previous/next entry controls).
- Stats dashboard with streaks, totals, and monthly sticky-note style calendar.
- Tag management page (create, list with entry counts, filter view, delete).

## Project Structure

- `frontend`: Vite React client
- `backend`: Express API with Prisma

## Prerequisites

- Node.js 18+ recommended
- A PostgreSQL database

## Local Setup

1. Install dependencies from the repo root:

```bash
npm run install:all
```

2. Create backend env file:

- Copy `backend/.env.example` to `backend/.env`
- Set `DATABASE_URL`
- Optionally update `FRONTEND_URL` (comma-separated allowed origins)

3. Prepare the database (from `backend`):

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
```

4. Start the app in two terminals (from repo root):

```bash
npm run dev:backend
npm run dev:frontend
```

Frontend default URL: `http://localhost:5173`  
Backend default URL: `http://localhost:4000`

## Environment Variables

### Backend (`backend/.env`)

- `DATABASE_URL`: Prisma PostgreSQL connection string
- `PORT`: API port (default `4000`)
- `FRONTEND_URL`: allowed frontend origins (comma-separated)

### Frontend

- `VITE_API_URL`: base API origin (for example `http://localhost:4000`)
  - If omitted, frontend defaults to `http://localhost:4000`
  - `/api` is automatically appended when needed

## Scripts

### Root

- `npm run install:all` - install dependencies for all workspaces
- `npm run dev:frontend` - run frontend dev server
- `npm run dev:backend` - run backend dev server

### Backend (`cd backend`)

- `npm run dev` - start API with nodemon
- `npm run start` - start API with node
- `npm run prisma:generate` - generate Prisma client
- `npm run prisma:migrate` - run Prisma migrate dev
- `npm run prisma:seed` - seed curated tags
- `npm run test:db` - test database connection
- `npm run clear:entries` - remove all entries

## Frontend Routes

- `/` - journal page for today
- `/entry/:date` - journal page for a specific date
- `/entries` - entries list + search
- `/stats` - writing statistics dashboard
- `/tags` - tag management

## API Routes

- `GET /api/health` - DB connectivity check
- `GET /api/prompts` - random prompt set
- `GET /api/stats` - totals, streaks, and heatmap data

- `GET /api/entries` - list entries (supports `?search=...`)
- `GET /api/entries/adjacent/:date` - previous/next entry date
- `GET /api/entries/:date` - fetch one entry by date
- `POST /api/entries` - create dated entry
- `PUT /api/entries/:date` - update dated entry
- `DELETE /api/entries/:date` - delete dated entry

- `GET /api/tags` - list tags with usage counts (`{ name, count }[]`)
- `POST /api/tags` - create a tag
- `DELETE /api/tags/:name` - delete a tag

## Deployment Notes

- `frontend/vercel.json` includes an SPA rewrite to `index.html`.
- Backend CORS accepts:
  - origins from `FRONTEND_URL`
  - any `.vercel.app` and `.railway.app` origin
  - no-origin requests (e.g. server-to-server/health checks)
