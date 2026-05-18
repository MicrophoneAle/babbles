# Michael's Babbles

A personal journaling web app with a realistic open book UI, rich text editing, tags, stats, and a sticky note calendar.

**Live:** https://michaels-babbles.vercel.app

## Tech stack

- **Frontend:** React, Vite, Tailwind CSS, Tiptap
- **Backend:** Node.js, Express
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Fonts:** Carattere, Dancing Script, Lora (Google Fonts)
- **Hosting:** Vercel (frontend), Render (backend), Neon (database)

## Features

- Open book UI with wood desk, leather cover, maroon border and aged parchment pages, all with texture overlays
- Layered page stack depth effect on outer edges of both pages
- Spine shadow gradient between pages
- Multiple journal entries per day, newest first
- Rich text editor (Tiptap) with bold, italic, underline, bullet lists, numbered lists, headings, blockquotes and multicolour highlights
- Fullscreen editor that expands to fill the entire right page
- Auto-save every 10 seconds plus a manual save button
- Entry titles (optional) with fallback "Untitled Babble"
- Tags: create, attach to entries, delete, with autocomplete
- Past Babbles page with date navigation arrows, sort options (newest, oldest, longest, shortest) and keyword/tag search
- Clickable sticky note calendar on Stats page that navigates to the entry date
- Stats page with writing streaks, word counts and sticky note calendar
- Reading time estimate alongside word count
- Entry navigation arrows between adjacent entries
- View and Edit modes per entry
- Back button navigation
- Export/print entry as PDF
- Custom confirmation modals for all destructive actions
- Daily writing prompts on the sidebar with hide per day
- Clerk authentication: owner has full write access, visitors are read only
- Pluralization fixed throughout

## Local development

### Prerequisites

- Node.js (LTS)
- PostgreSQL installed locally (or any Postgres URL for `DATABASE_URL`)
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/MicrophoneAle/babbles.git
   cd babbles
   ```

2. **Install dependencies**

   ```bash
   npm run install:all
   ```

3. **Environment variables**

   Create `frontend/.env`:

   ```env
   VITE_API_URL=your-render-url
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx
   VITE_OWNER_EMAIL=your-email
   VITE_OWNER_USER_ID=user_xxx
   ```

   Create `backend/.env`:

   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/journal_app
   FRONTEND_URL=http://localhost:5173
   CLERK_SECRET_KEY=sk_test_xxx
   CLERK_PUBLISHABLE_KEY=pk_test_xxx
   OWNER_EMAIL=your-email
   OWNER_USER_ID=user_xxx
   PORT=4000
   ```

   For production on Render, also set `NODE_ENV=production` in `backend/.env` or in the Render dashboard.

4. **Database**

   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate deploy
   node prisma/seed.js
   cd ..
   ```

5. **Run the app** (two terminals from the repo root)

   ```bash
   npm run dev:backend
   ```

   ```bash
   npm run dev:frontend
   ```

6. Open **http://localhost:5173**

## Production hosting

### Frontend (Vercel)

- **Root directory:** `frontend`
- **Environment variable:** `VITE_API_URL` — your Render service URL (no trailing slash), e.g. `https://your-api.onrender.com`

### Backend (Render)

- **Root directory:** `backend`
- **Build command:** `npm install && npx prisma generate`
- **Start command:** `node src/index.js`
- **Environment variables (example):**

  ```env
  DATABASE_URL=your-neon-connection-string
  FRONTEND_URL=https://michaels-babbles.vercel.app
  NODE_ENV=production
  ```

  `FRONTEND_URL` may be a comma-separated list if you use multiple origins. CORS also allows `*.vercel.app` and `*.onrender.com` hostnames.

### Database (Neon)

- Serverless PostgreSQL
- Use a **direct** connection URL for migrations (`prisma migrate deploy`) when Neon recommends it
- Use a **pooled** connection URL for the running app in production when Neon recommends it

## Pushing updates

```bash
git add .
git commit -m "Describe your changes"
git push
```

Vercel and Render redeploy from the default branch when you push (if those integrations are enabled on the repo).

## API (reference)

- `GET /api/entries` - list all entries
- `GET /api/entries/:date` - entries for a date
- `GET /api/entries/id/:id` - single entry by id
- `POST /api/entries` - create entry
- `PUT /api/entries/id/:id` - update entry
- `DELETE /api/entries/id/:id` - delete entry
- `GET /api/entries/adjacent/:id` - adjacent ids
- `GET /api/prompts` - 3 random prompts
- `GET /api/stats` - streak and word stats
- `GET /api/tags` - list all tags
- `POST /api/tags` - create tag
- `DELETE /api/tags/:name` - delete tag
- `GET /api/health` - health check

From `backend`: `npm run test:db` tests the database connection. `npm run clear:entries` removes all entries (destructive).
