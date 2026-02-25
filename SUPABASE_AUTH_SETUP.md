# Supabase Auth Redirect URLs

Magic links must redirect to your app. Configure once:

## 1. Get a Personal Access Token

1. Go to https://supabase.com/dashboard/account/tokens
2. Create a new token
3. Copy it

## 2. Run the script

```bash
SUPABASE_ACCESS_TOKEN=your_token_here npm run supabase:auth-urls
```

This sets:
- **Site URL:** `https://mod-cellular.netlify.app`
- **Redirect URLs:** All app routes on that domain (no wildcards)

## 3. Netlify env vars

In Netlify → Site settings → Environment variables, add:

- `VITE_SUPABASE_URL` = `https://cpgzsjqmkvhmshcvnyyf.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = your anon key

Rebuild after adding.
