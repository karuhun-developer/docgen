-- docgen — Supabase schema
-- Run in Supabase SQL Editor. Safe to re-run.

create table if not exists public.documents (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  doc_type   text not null,
  doc_number text,
  title      text,                                        -- short label for listing
  status     text not null default 'draft'
             check (status in ('draft', 'final')),
  data       jsonb not null,                              -- full DocumentData blob
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists documents_user_updated_idx
  on public.documents (user_id, updated_at desc);

-- Defense-in-depth: the backend uses the service_role key (which bypasses RLS) and
-- always filters by user_id, but we enable RLS anyway so a leaked anon key can't read
-- other users' rows.
alter table public.documents enable row level security;

drop policy if exists "own documents" on public.documents;
create policy "own documents" on public.documents
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Templates: named, reusable DocumentData snapshots. "Create document from template".

create table if not exists public.templates (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null,
  data       jsonb not null,                              -- DocumentData snapshot
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists templates_user_updated_idx
  on public.templates (user_id, updated_at desc);

alter table public.templates enable row level security;

drop policy if exists "own templates" on public.templates;
create policy "own templates" on public.templates
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Reserved for future billing (NOT used yet):
-- create table if not exists public.profiles (
--   user_id uuid primary key references auth.users (id) on delete cascade,
--   plan text not null default 'free' check (plan in ('free', 'pro'))
-- );
