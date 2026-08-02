# docgen — backend (Hono @ Vercel)

API untuk auth + penyimpanan dokumen multi-user docgen. Frontend (Cloudflare) hanya
ngobrol ke API ini; kredensial Supabase **tidak pernah** ada di frontend.

## Arsitektur

```
Cloudflare SPA  --Authorization: Bearer <jwt>-->  Hono @ Vercel  -->  Supabase (Postgres + Auth)
```

- Sesi: **Bearer token** (access + refresh JWT dari Supabase Auth).
- `service_role` key hanya dipakai server-side untuk query tabel `documents`.
- Login: email+password & Google OAuth.

## Setup

1. Buat project Supabase (free tier). Jalankan `supabase/schema.sql` di SQL Editor.
2. (Google) Auth -> Providers -> Google: aktifkan + isi Client ID/Secret.
   Auth -> URL Configuration -> Redirect URLs: tambahkan `${FRONTEND_URL}/auth/callback`.
3. (Opsional dev) Auth -> Providers -> Email: matikan "Confirm email" biar register
   langsung dapat sesi tanpa verifikasi.
4. `cp .env.example .env` lalu isi dari Supabase -> Project Settings -> **API Keys**:
   - `SUPABASE_PUBLISHABLE_KEY` = Publishable key (`sb_publishable_...`)
   - `SUPABASE_SECRET_KEY` = Secret key (`sb_secret_...`, section "Secret keys" -> Reveal)
   - (Legacy `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` juga didukung sbg fallback.)
5. `npm install`
6. `npm run dev` (butuh `vercel` login) → API di `http://localhost:3000/api/*`.

## Deploy (Vercel)

- Import repo, set **Root Directory = `server/`**.
- Set env `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `FRONTEND_URL`.
- Deploy. Endpoint jadi `https://<proj>.vercel.app/api/*`.

## Endpoints

| Method | Path | Auth | Body |
|---|---|---|---|
| GET  | `/api/health` | - | - |
| POST | `/api/auth/register` | - | `{email, password}` |
| POST | `/api/auth/login` | - | `{email, password}` |
| POST | `/api/auth/refresh` | - | `{refresh_token}` |
| GET  | `/api/auth/google` | - | redirect ke Google |
| GET  | `/api/auth/me` | Bearer | - |
| GET  | `/api/documents` | Bearer | - |
| POST | `/api/documents` | Bearer | `{data, status, title}` |
| GET  | `/api/documents/:id` | Bearer | - |
| PUT  | `/api/documents/:id` | Bearer | `{data, status, title}` |
| DELETE | `/api/documents/:id` | Bearer | - |
| GET  | `/api/templates` | Bearer | - |
| POST | `/api/templates` | Bearer | `{name, data}` |
| GET  | `/api/templates/:id` | Bearer | - |
| PUT  | `/api/templates/:id` | Bearer | `{name?, data?}` |
| DELETE | `/api/templates/:id` | Bearer | - |

`data` = objek `DocumentData` utuh dari frontend. `status` = `draft` | `final`.
