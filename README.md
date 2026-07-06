# Whereabouts

A personal journal PWA to track where you're leaning between two places — and why. Log daily, spot patterns, and share your journal with a partner if you choose.

Works on **iPhone, Android, and desktop** — install from the browser or add to your home screen.

## Stack

- Expo (React Native Web) + TypeScript
- Expo Router
- Supabase (auth + database)
- Deployed on **Vercel**

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Supabase project

1. Create a project at [supabase.com](https://supabase.com)
2. Copy `.env.example` → `.env` and set:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
3. Run **`supabase/schema.sql`** in the SQL Editor (creates tables + RLS for multi-user + sharing)
4. If you have existing anonymous entries to migrate, sign up first then run **`supabase/migrate-data.sql`**

### 3. Supabase Auth settings

In **Authentication → Providers → Email**:

- Enable email provider
- For personal use, you may disable **Confirm email** so sign-up works instantly

Add your Vercel URL to **Authentication → URL configuration → Redirect URLs** when deployed.

### 4. Run locally

```bash
npm run web
```

Open [http://localhost:8081](http://localhost:8081)

## Deploy to Vercel

1. Push this repo to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Add environment variables:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`

   **Important:** Expo bakes `EXPO_PUBLIC_*` into the static bundle at **build time**. In Vercel, enable these for **Production** (and Preview if you use branch deploys), then redeploy.
4. Deploy (uses `npm run build:web` → `dist/`)

On your phone: open the Vercel URL → **Share → Add to Home Screen** (iOS) or **Install app** (Android).

## Accounts & sharing

- **Sign up** with email + password — your entries are private to your account
- **Settings → Places you're comparing** — name your two places (defaults: India / Australia)
- **Settings → Share with someone** — invite a partner by email
- They sign up with that email, accept the invite, then **View journal** (read-only)
- Each person logs their own entries; sharing is one-way per invite (both can invite each other)

## Project structure

```
app/                  # Expo Router (login + tabs)
screens/              # Screen implementations
components/           # UI components
lib/                  # Auth, Supabase, storage, sharing
supabase/schema.sql   # Database schema + RLS
```

## Lean scale

Each end of the slider is one of your two places (set in Settings). The scale is the same for everyone:

| Value | Meaning |
|-------|---------|
| 1–2   | Strongly leaning place A |
| 3–4   | Leaning place A |
| 5     | Genuinely unsure |
| 6–7   | Leaning place B |
| 8–10  | Strongly leaning place B |
