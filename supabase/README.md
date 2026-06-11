# Garmin Wellness — Supabase

**Project:** [garmin-wellness](https://supabase.com/dashboard/project/wcwadwcjqutdxwbrkyai)  
**Ref:** `wcwadwcjqutdxwbrkyai`

## Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profile (auto-created on magic-link signup) |
| `subscriptions` | Gumroad purchases linked by email |
| `gumroad_webhook_events` | Webhook audit log (service role only) |
| `garmin_connections` | Encrypted Garmin session tokens (service role only) |
| `garmin_connection_status` | Safe view for clients (no `token_blob`) |
| `dashboard_snapshots` | Per-user wellness JSON after each sync |
| `sync_jobs` | Optional async sync queue |

## Auth

Enable **Email magic link** in Supabase Dashboard → Authentication → Providers.

**Redirect URLs** (add both):

- `http://localhost:3000/auth/callback`
- `https://garmin-woad.vercel.app/auth/callback`

## Migrations

```bash
supabase link --project-ref wcwadwcjqutdxwbrkyai
supabase db push
```

## Env vars

Copy keys from Dashboard → Settings → API into `.env`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only — never `NEXT_PUBLIC_`)
