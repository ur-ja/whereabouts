# Where do I belong?

A personal journal app to track where you're leaning — India or Australia — and why. Log daily, spot patterns, and make sense of a big life decision over time.

## Stack

- Expo (React Native, TypeScript)
- Supabase (persistent storage)
- Expo Router (bottom tab navigation)
- react-native-gifted-charts (analytics charts)
- @react-native-community/slider

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env
```

Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` from your Supabase project settings.

### 3. Create the database table

Run this SQL in the Supabase SQL editor:

```sql
create table entries (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  lean integer not null check (lean >= 1 and lean <= 10),
  tags text[] default '{}',
  note text default '',
  created_at timestamptz default now()
);

-- Required: allow the app to read/write without auth
alter table entries enable row level security;

create policy "Allow anonymous access"
on entries for all
to anon
using (true)
with check (true);
```

### 4. Run the app

```bash
npx expo start
```

Scan the QR code with **Expo Go** on your phone to preview. This project uses **Expo SDK 54** to match the current App Store version of Expo Go.

**Important:** Stop any old dev servers first (`Ctrl+C`), then start fresh with a cleared cache:

```bash
npx expo start --clear
```

### 5. Install permanently on your iPhone

See **[DEPLOY.md](./DEPLOY.md)** for the full guide: every account to create, Mac steps, iPhone steps, AltStore setup, EAS build, and troubleshooting.

Quick version:

```bash
npm install -g eas-cli && eas login && eas init
eas device:create
eas env:create --environment preview --name EXPO_PUBLIC_SUPABASE_URL --value "YOUR_URL"
eas env:create --environment preview --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "YOUR_KEY"
npm run build:ios
```

Download the `.ipa` → AirDrop to iPhone → install via AltStore.

---

## Project structure

```
app/                  # Expo Router navigation
  (tabs)/             # Log, Dashboard, History tabs
components/           # Reusable UI components
constants/            # Theme tokens, predefined tags
lib/                  # Supabase client, storage, lean helpers
screens/              # Screen implementations
```

## Offline-first (future)

To add offline support later:

1. Install `@react-native-async-storage/async-storage`
2. In `lib/storage.ts`, read/write a local cache of the last 30 entries on every fetch/save
3. On app launch, show cached data immediately while syncing to Supabase in the background
4. Queue failed writes and retry when connectivity returns

## Lean scale

| Value | Meaning |
|-------|---------|
| 1–2   | Strongly leaning India |
| 3–4   | Leaning India |
| 5     | Genuinely unsure |
| 6–7   | Leaning Australia |
| 8–10  | Strongly leaning Australia |

A **pivot** is when lean crosses the midpoint (5) between consecutive entries.
