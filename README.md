# ScamShield Nigeria

Community-powered platform to detect, report, and raise awareness about scams targeting Nigerians — phishing, bank impersonation, WhatsApp takeover, POS fraud, BVN/NIN scams, and more.

## Tech stack

| Layer | Choice |
|-------|--------|
| Build tool | Vite 5 |
| UI library | React 19 + TypeScript 5.8 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) + shadcn/ui |
| Backend | Supabase (Postgres, Auth, Edge Functions) |
| Package manager | **npm** (single `package-lock.json`) |

## Prerequisites

- Node.js >= 20
- npm (bundled with Node)

## Getting started

```bash
# Install dependencies
npm ci

# Create your local environment file
cp .env.example .env
# Edit .env with your Supabase project URL and anon key

# Start the dev server (port 3000)
npm run dev
```

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server on port 3000 |
| `npm run build` | Type-check and produce production bundle in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint across the project |
| `npm run typecheck` | Run TypeScript compiler in check-only mode |

## Environment variables

Both variables are **public by design** — the Supabase anon key is safe to ship to the browser because Row-Level Security (RLS) is the actual authorization boundary. Never place a `service_role` key in a `VITE_` variable.

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase public anon key |

## Supabase

- **Migrations:** apply with `supabase db push` from the project root.
- **Edge Functions:** `submit-report` (public report intake) and `create-admin` (staff provisioning). Deploy with `supabase functions deploy <name>`.

## Deployment

The app is a static SPA. Build output lives in `dist/`.

1. Run `npm run build`.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your host's environment/dashboard.
3. Deploy the `dist/` folder to Cloudflare Pages, Vercel, Netlify, or any static host.

> **Note:** `packageManager` field removed from `package.json`; `bun.lock` deleted. This project uses npm exclusively.
