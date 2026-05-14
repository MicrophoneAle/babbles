# Michael's Babbles

A personal journaling web app with a realistic open book UI, rich text editing, tags, stats, and a sticky note calendar.

**Live:** https://michaels-babbles.vercel.app

## Tech stack

- **Frontend:** React, Vite, Tailwind CSS, Tiptap
- **Backend:** Node.js, Express
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Fonts:** Playfair Display, Lora, Nunito
- **Hosting:** Vercel (frontend), Render (backend), Neon (database)

## Features

- One journal entry per day with rich text formatting
- Auto-save every 10 seconds plus a manual save button
- Tags — create, attach to entries, and delete
- Past entries page with search and delete
- Stats page with writing streaks and a sticky note calendar
- Entry navigation arrows between adjacent dates
- Custom confirmation modals for destructive actions
- Responsive open book UI with an aged parchment look

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

   Create `backend/.env`:

   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/journal_app"
   FRONTEND_URL="http://localhost:5173"
   PORT=4000
   ```

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

- `GET /api/health` — health check
- `GET /api/entries`, `GET /api/entries/:date`, `POST /api/entries`, `PUT /api/entries/:date`, `DELETE /api/entries/:date`
- `GET /api/entries/adjacent/:date` — previous / next entry dates
- `GET /api/prompts`, `GET /api/stats`, `GET /api/tags`, `POST /api/tags`, `DELETE /api/tags/:name`

From `backend`: `npm run test:db` tests the database connection; `npm run clear:entries` removes all entries (destructive).
