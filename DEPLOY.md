# Deploy Whereabouts to your iPhone

A complete guide: every account, every step on your Mac, every step on your iPhone.

When you're done, **Whereabouts** sits on your home screen like a normal app. Your journal data lives in **Supabase** in the cloud — not trapped on the phone.

---

## What you'll end up with

| Thing | Where it lives |
|-------|----------------|
| The app (.ipa) | Built on **GitHub Actions** (cloud Mac), installed via AltStore |
| Your journal entries | Supabase database (safe across reinstalls) |
| Re-signing the app | Every ~7 days via AltStore (takes 30 seconds) |

---

## Accounts you need to create

Do these once. All have free tiers — you do **not** need a paid Apple Developer account ($99/year) for this setup.

| # | Service | URL | Why you need it | Cost |
|---|---------|-----|-----------------|------|
| 1 | **Supabase** | [supabase.com](https://supabase.com) | Stores your journal entries | Free |
| 2 | **Apple ID** | [appleid.apple.com](https://appleid.apple.com) | Signs the app so iOS will run it | Free |
| 3 | **GitHub** | [github.com](https://github.com) | Runs the iOS build in the cloud (no local Xcode) | Free |
| 4 | **AltStore** | [altstore.io](https://altstore.io) | Installs the app on your iPhone | Free |

**Optional:** [Expo](https://expo.dev) account — only if you later pay for Apple Developer and use EAS cloud builds.

**AltStore** does not need a separate account. It uses your Apple ID.

---

## What you need physically

- **Mac** (you have this) — for AltServer and transferring the app (no Xcode needed)
- **iPhone** — same Apple ID you'll use for signing
- **USB cable** (recommended for first AltStore install) — or same Wi‑Fi as your Mac
- **Your project** already cloned at `whereabouts/`

---

## Part A — Supabase (data backend)

Skip this if you already log entries in the app and see them in Supabase.

### A1. Create a Supabase project (browser, on Mac)

1. Go to [supabase.com](https://supabase.com) → **Start your project** → sign up (GitHub login is fine).
2. **New project** → pick a name (e.g. `whereabouts`), set a database password (save it somewhere), choose a region close to you (e.g. Singapore).
3. Wait ~2 minutes for the project to provision.

### A2. Create the `entries` table (browser)

1. In your project: **SQL Editor** → **New query**.
2. Paste and run:

```sql
create table entries (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  lean integer not null check (lean >= 1 and lean <= 10),
  tags text[] default '{}',
  note text default '',
  created_at timestamptz default now()
);

alter table entries enable row level security;

create policy "Allow anonymous access"
on entries for all
to anon
using (true)
with check (true);
```

3. You should see **Success**.

### A3. Get your API keys (browser)

1. **Project Settings** (gear icon) → **API**.
2. Copy:
   - **Project URL** → e.g. `https://abcdefgh.supabase.co`
   - **anon public** key (under Project API keys)

### A4. Local `.env` (Mac terminal)

In your project folder:

```bash
cd /Users/urjaarora/Code/Personal/whereabouts
cp .env.example .env
```

Edit `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Test in Expo Go: `npx expo start` → log an entry → check **Table Editor** → `entries` in Supabase.

---

## Part B — Apple & GitHub (free, no Xcode)

You do **not** need the $99/year Apple Developer Program or Xcode on your Mac.

### B1. Accept the free Apple agreement (browser, once)

1. Go to [developer.apple.com](https://developer.apple.com).
2. Sign in with your **Apple ID**.
3. Accept the **Apple Developer Agreement** if prompted (free — no payment).

Needed for AltStore signing on your iPhone.

### B2. Push the project to GitHub (browser + Mac terminal)

If the repo isn't on GitHub yet:

1. Create a new **private** repository on [github.com/new](https://github.com/new) (e.g. `whereabouts`).
2. In Terminal:

```bash
cd /Users/urjaarora/Code/Personal/whereabouts
git remote add origin https://github.com/YOUR_USERNAME/whereabouts.git
git add .
git commit -m "Add GitHub Actions iOS build"
git push -u origin main
```

Use your real GitHub username. If `origin` already exists, just `git push`.

### B3. Add Supabase secrets to GitHub (browser)

Cloud builds can't read your local `.env`. Add the same values as **repository secrets**:

1. GitHub → your **whereabouts** repo → **Settings** → **Secrets and variables** → **Actions**.
2. **New repository secret** for each:

| Name | Value |
|------|-------|
| `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL from Part A3 |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key from Part A3 |

Copy from your local `.env` — don't commit `.env` to GitHub.

---

<details>
<summary><strong>Optional: EAS cloud builds</strong> (requires $99/year Apple Developer — skip if not paying)</summary>

EAS cloud builds need a **paid** Apple Developer Program membership. `eas device:create` will fail with "no team" on a free Apple ID.

If you enroll later:

```bash
npm install -g eas-cli && eas login
eas device:create
eas env:create --environment preview --name EXPO_PUBLIC_SUPABASE_URL --value "YOUR_URL"
eas env:create --environment preview --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "YOUR_KEY"
npm run build:ios
```

</details>

---

## Part C — AltStore (install apps outside the App Store)

AltStore re-signs apps with your Apple ID so they run on your phone without the App Store.

> **In India (and most countries outside EU/Japan):** use **AltStore Classic**, not "AltStore PAL". PAL is only for the EU and Japan. Classic is installed via **AltServer** on your Mac — there is no direct iPhone download from the website.

### C1. Install AltServer on your Mac (browser + Mac)

1. Go to [altstore.io](https://altstore.io) → scroll to **AltStore Classic**.
2. Click **AltServer macOS** (requires macOS 11 or later).
3. Open the downloaded file → drag **AltServer** to **Applications**.
3. Open **AltServer** from Applications (menu bar icon — a diamond/alt icon appears top-right).

**If macOS blocks it:** System Settings → Privacy & Security → **Open Anyway**.

**Mail plug-in (if prompted):** AltServer may ask to install a Mail plug-in for wireless refresh — follow its instructions, or use USB only.

### C2. Install AltStore on your iPhone (Mac + iPhone)

1. Connect iPhone to Mac with **USB** (easiest first time).
2. Unlock iPhone → tap **Trust** this computer.
3. Click **AltServer** in the menu bar → **Install AltStore** → select your iPhone.
4. Enter your **Apple ID** and password when asked (used only for signing — stays local).
5. On iPhone: **Settings** → **General** → **VPN & Device Management** → trust your Apple ID / AltStore developer app.

**AltStore** should now appear on your home screen.

### C2b. Enable Developer Mode (iPhone — iOS 16+)

When you open AltStore (or right after install), iOS may say **Developer Mode is required**. This is normal for sideloaded apps.

1. On iPhone: **Settings** → **Privacy & Security** → scroll down → **Developer Mode**.
2. Turn **Developer Mode** **On**.
3. iPhone will **restart** — confirm when prompted after it boots.
4. Open **AltStore** again — it should launch.

**If you don't see Developer Mode:** open AltStore once (even if it shows the error), then check Settings again. It only appears after a dev/sideloaded app is installed.

### C3. Same Wi‑Fi (optional, for weekly refresh)

For AltStore to refresh apps without USB later:

- Mac and iPhone on the **same Wi‑Fi**
- AltServer running on Mac (menu bar)
- In AltStore on iPhone: **My Apps** → refresh when prompted

#### Automating refresh (recommended)

AltStore **already tries to refresh apps in the background** before they expire — you don't tap anything weekly if setup is right.

**One-time setup:**

1. **Wi‑Fi sync (Mac + iPhone, USB once)**  
   Connect iPhone via USB → open **Finder** → select your iPhone → check **Show this iPhone when on Wi‑Fi** (or "Sync over Wi‑Fi" on older macOS).

2. **Background App Refresh (iPhone)**  
   **Settings** → **General** → **Background App Refresh** → **On** (global) → find **AltStore** → **On**.

3. **AltServer at login (Mac)**  
   **System Settings** → **General** → **Login Items** → **+** → add **AltServer** from Applications. Leave it running in the menu bar.

4. **Same Wi‑Fi habit**  
   iPhone and Mac on the **same network name**. AltStore often refreshes when the phone is **charging at night** on home Wi‑Fi while the Mac is awake.

**What still isn't automatic:**

- Mac asleep or off → refresh won't run (wake it or plug in USB and refresh manually).
- Away from home Wi‑Fi → refresh when you're back, or use USB + AltServer.
- Free Apple ID apps still expire every **7 days** — automation just re-signs them before that if the above is working.

**Manual fallback:** AltStore → **My Apps** → **Refresh All** (or tap an app).

---

## Part D — Build the app with GitHub Actions (free, no Xcode)

The workflow file `.github/workflows/build-ios.yml` is already in the repo. It builds an unsigned `.ipa` on GitHub's Mac servers; AltStore re-signs it with your free Apple ID.

### D1. Run the workflow (browser)

1. GitHub → your **whereabouts** repo → **Actions** tab.
2. Click **Build iOS IPA** in the left sidebar.
3. Click **Run workflow** → **Run workflow** (green button).
4. Wait **~15–25 minutes** for the build to finish (yellow → green checkmark).

If it fails, click the run → open the failed step → read the log. Common fix: missing secrets from Part B3.

### D2. Download the `.ipa` (browser)

1. On the completed workflow run, scroll to **Artifacts**.
2. Click **whereabouts-ios** to download `whereabouts.ipa` (may arrive as a `.zip` — unzip if needed).

### D3. Rebuild after code changes

Push changes to GitHub → **Actions** → **Run workflow** again → download the new `.ipa` → reinstall via AltStore.

**GitHub free tier:** macOS build minutes are limited (~200 effective minutes/month). Each build uses ~15–25 minutes.

---

<details>
<summary><strong>Alternative: build on your Mac with Xcode</strong> (if you have ~12 GB free disk space)</summary>

```bash
cd /Users/urjaarora/Code/Personal/whereabouts
npx expo prebuild -p ios
xed ios
```

In Xcode: **Personal Team** signing → **Product → Archive** → **Distribute** → **Development** → export `.ipa`.

</details>

---

## Part E — Install on your iPhone

### E1. Transfer the `.ipa` to your phone

**Easiest — AirDrop:**

1. Right-click the `.ipa` in Finder → **Share** → **AirDrop** → your iPhone.
2. Accept on iPhone → file lands in **Files**.

**Or — iCloud Drive / email:**

Upload the `.ipa` to iCloud Drive or email it to yourself → open on iPhone → save to **Files**.

### E2. Install with AltStore (Mac + iPhone)

**AltServer must be running on your Mac during install** — AltStore re-signs the app through AltServer. Without it you get *"integrity could not be verified"*.

1. **Mac:** plug in iPhone via USB (or same Wi‑Fi) → open **AltServer** (menu bar diamond icon).
2. **iPhone:** open **AltStore** → **My Apps** → **+** (top left).
3. Browse to the `.ipa` in **Files** → tap → **Install**.
4. Wait ~30 seconds → **Whereabouts** appears on your home screen.

**Don't** tap the `.ipa` directly in Files expecting iOS to install it — only AltStore can sign it.

**If AltStore isn't in Share:** use the **+** button in AltStore (step 2), not Files → Share.

### E2b. "Integrity could not be verified"

1. **AltServer running on Mac** — menu bar icon visible, iPhone USB or same Wi‑Fi.
2. **3-app limit** — free Apple ID allows 3 sideloaded apps (AltStore counts as 1). Remove an unused sideloaded app if you have 3.
3. **Developer Mode** on — Settings → Privacy & Security → Developer Mode.
4. **Trust** — Settings → General → VPN & Device Management → trust your Apple ID.
5. **Re-download** the artifact from GitHub (don't rename the file).
6. Install via AltStore **+** button, not by tapping the `.ipa` alone.

### E3. Open the app (iPhone)

1. Tap **Whereabouts** on your home screen.
2. First launch may ask to allow network access — allow it.
3. Log an entry → confirm it appears in Supabase **Table Editor**.

You no longer need Expo Go for daily use.

---

## Part F — Verify your data is safe

1. Open [supabase.com](https://supabase.com) → your project.
2. **Table Editor** → **entries**.
3. You should see your logged days (lean, tags, note, date).

Your journal is in the database, not only on the phone. If you reinstall the app or get a new phone, entries remain as long as the same Supabase project and keys are in the build.

---

## Ongoing — every ~7 days

Apple limits free signing to **7 days**. AltStore fixes this:

1. Mac on same Wi‑Fi, **AltServer** running (menu bar).
2. Open **AltStore** on iPhone → **My Apps**.
3. Tap **Refresh All** (or it may prompt you automatically).

Takes ~30 seconds. If you skip this, the app won't open until you refresh.

---

## Quick reference — command checklist (GitHub Actions path)

**One-time setup:**

1. Push repo to GitHub (Part B2)
2. Add `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` as GitHub secrets (Part B3)

**Each build:**

1. GitHub → **Actions** → **Build iOS IPA** → **Run workflow**
2. Download **whereabouts-ios** artifact
3. AirDrop `.ipa` to iPhone → AltStore → Install

---

## Troubleshooting

### `eas device:create` — "no team associated with your Apple account"

Expected on a **free** Apple ID. Skip EAS — use **Part D** (GitHub Actions) instead.

### GitHub Actions build failed — missing secrets

Add `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` under repo **Settings → Secrets and variables → Actions**, then re-run the workflow.

### GitHub Actions build failed — xcodebuild / signing errors

Open the failed run log and read the red step. Re-run once; the workflow patches CocoaPods for unsigned builds. If it keeps failing, try the Xcode alternative in Part D.

### App installs but can't save entries

Check GitHub secrets match your Supabase project, **re-run the workflow**, and reinstall the new `.ipa`.

### "Untrusted Developer" on iPhone

**Settings** → **General** → **VPN & Device Management** → tap your Apple ID → **Trust**.

### AltStore "Could not find AltServer"

- Mac and iPhone on same Wi‑Fi
- AltServer running (menu bar on Mac)
- Or plug in USB and try again

### App won't open after ~7 days

Open AltStore → **Refresh All**. This is normal for sideloaded apps.

---

## After it's installed

1. **Use it** — log daily for a few weeks before changing code.
2. **Check Supabase** occasionally to confirm entries are saving.
3. **Refresh AltStore** weekly.
4. The dashboard gets interesting around **10–15 entries** when patterns show on the graph.

When you change the app later: bump `version` in `app.config.ts`, run `npm run build:ios` again, install the new `.ipa` over the old one via AltStore.
