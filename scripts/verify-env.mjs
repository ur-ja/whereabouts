const required = ['EXPO_PUBLIC_SUPABASE_URL', 'EXPO_PUBLIC_SUPABASE_ANON_KEY'];
const missing = required.filter((key) => !process.env[key]?.trim());

if (missing.length > 0) {
  console.error('\nMissing required environment variables for web build:\n');
  for (const key of missing) {
    console.error(`  - ${key}`);
  }
  console.error(
    '\nAdd them in Vercel → Project → Settings → Environment Variables.\n' +
      'Enable them for Production (and Preview). Then redeploy.\n' +
      'Expo inlines EXPO_PUBLIC_* vars at build time — runtime-only env vars are not enough.\n',
  );
  process.exit(1);
}
