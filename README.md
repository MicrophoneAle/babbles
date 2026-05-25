# Michael's Babbles

A personal journaling web app with a realistic open book UI on desktop, a dedicated mobile layout on small screens, rich text editing, tags, stats, and a sticky note calendar.

**Live:** https://michaels-babbles.vercel.app

## Tech stack

- **Frontend:** React, Vite, Tailwind CSS, Tiptap (including image extension)
- **Backend:** Node.js, Express
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Auth:** Clerk (owner write access, public read)
- **Fonts:** Carattere, Dancing Script, Lora (Google Fonts)
- **Hosting:** Vercel (frontend), Render (backend), Neon (database)

## Project structure

This repo is an npm workspaces monorepo:

| Path | Purpose |
|------|---------|
| `frontend/` | React SPA (Vite). Deploy this folder to Vercel. |
| `backend/` | Express API + Prisma. Deploy this folder to Render. |
| `package.json` | Root workspace scripts (`install:all`, `dev:frontend`, `dev:backend`) |

## Features

### Desktop (768px and up)

- Open book UI with wood desk, leather cover, maroon border and aged parchment pages, all with texture overlays
- Hardcover depth via layered shadows on the outer maroon frame
- Layered page stack effect on outer edges of both pages
- Spine shadow gradient between pages
- Left sidebar: navigation, daily prompts (hide per day), sign-in

### Mobile (below 768px)

- Single-column parchment layout (no book chrome)
- Top bar with title and hamburger menu
- Slide-in drawer: navigation, prompts on home route, sign-in
- Touch-friendly controls (44px targets where appropriate)
- Stats calendar and Past Babbles date row adapted for narrow screens
- Fullscreen editor uses `100dvh` on mobile

### Writing and entries

- Multiple journal entries per day, newest first
- Rich text editor (Tiptap): bold, italic, underline, lists, headings, blockquotes, multicolour highlights
- **Images:** insert JPG or PNG from the toolbar; stored as base64 in the entry `content` JSON (no extra backend storage)
- Fullscreen editor on the right page (desktop) or full viewport (mobile)
- Auto-save every 10 seconds plus manual save
- Optional entry titles with fallback "Untitled Babble"
- Tags: create, attach, delete, autocomplete
- View and Edit modes per entry; prev/next navigation between entries
- Custom confirmation modals for destructive actions

### Browse and stats

- Past Babbles: date arrows, sort (newest, oldest, longest, shortest), keyword/tag search
- Stats: writing streaks, word totals, reading time estimate, sticky-note calendar (click a day to open Past Babbles on that date)
- Tags page: list, search via Past Babbles, owner create/delete

### Access

- Clerk authentication: owner can write; everyone else is read-only
- Pluralization helpers used consistently in the UI

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
   VITE_API_URL=http://localhost:4000
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx
   VITE_OWNER_EMAIL=your-email
   VITE_OWNER_USER_ID=user_xxx
   ```

   Create `backend/.env` (see also `backend/.env.example`):

   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/journal_app
   FRONTEND_URL=http://localhost:5173
   CLERK_SECRET_KEY=sk_test_xxx
   CLERK_PUBLISHABLE_KEY=pk_test_xxx
   OWNER_EMAIL=your-email
   OWNER_USER_ID=user_xxx
   PORT=4000
   ```

   For production on Render, also set `NODE_ENV=production` in the Render dashboard.

   `OWNER_EMAIL` may be a comma- or semicolon-separated list. Matching `OWNER_USER_ID` (from the Clerk dashboard) also grants owner access.

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
- **Environment variables (example):**

  ```env
  VITE_API_URL=https://your-api.onrender.com
  VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxx
  VITE_OWNER_EMAIL=your-email
  VITE_OWNER_USER_ID=user_xxx
  ```

  Use your Render API URL with no trailing slash. `vercel.json` rewrites all routes to `index.html` for client-side routing.

### Backend (Render)

- **Root directory:** `backend`
- **Build command:** `npm install && npx prisma generate`
- **Start command:** `node src/index.js`
- **Environment variables (example):**

  ```env
  DATABASE_URL=your-neon-connection-string
  FRONTEND_URL=https://michaels-babbles.vercel.app
  NODE_ENV=production
  CLERK_SECRET_KEY=sk_live_xxx
  CLERK_PUBLISHABLE_KEY=pk_live_xxx
  OWNER_EMAIL=your-email
  OWNER_USER_ID=user_xxx
  PORT=4000
  ```

  `FRONTEND_URL` may be a comma-separated list if you use multiple origins. CORS also allows `*.vercel.app` and `*.onrender.com` hostnames.

### Database (Neon)

- Serverless PostgreSQL
- Use a **direct** connection URL for migrations (`prisma migrate deploy`) when Neon recommends it
- Use a **pooled** connection URL for the running app in production when Neon recommends it

## Images in entries

Images are embedded as base64 data URLs inside each entry’s Tiptap `content` field. No new database columns or upload API are required. Large images (over 2MB) show a warning in the editor because they increase payload size and save time.

## Pushing updates

```bash
git add .
git commit -m "Describe your changes"
git push
```

Vercel and Render redeploy from the default branch when you push (if those integrations are enabled on the repo).

## API (reference)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/health` | — | Health check |
| `GET` | `/api/entries` | — | List entries (`?search=` optional) |
| `GET` | `/api/entries/:date` | — | Entries for a date (`YYYY-MM-DD`) |
| `GET` | `/api/entries/id/:id` | — | Single entry |
| `GET` | `/api/entries/adjacent/:id` | — | Previous/next entry ids |
| `POST` | `/api/entries` | Owner | Create entry |
| `PUT` | `/api/entries/id/:id` | Owner | Update entry |
| `DELETE` | `/api/entries/id/:id` | Owner | Delete entry |
| `GET` | `/api/prompts` | — | Three random prompts |
| `GET` | `/api/stats` | — | Streaks, totals, calendar heatmap |
| `GET` | `/api/tags` | — | List tags with counts |
| `POST` | `/api/tags` | Owner | Create tag |
| `DELETE` | `/api/tags/:name` | Owner | Delete tag |

From `backend`:

- `npm run test:db` — database connection smoke test
- `npm run clear:entries` — delete all entries (destructive)
