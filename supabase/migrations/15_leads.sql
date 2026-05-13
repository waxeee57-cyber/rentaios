-- Exit intent / newsletter lead capture table
create table if not exists leads (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  source      text not null default 'exit_intent',
  locale      text not null default 'en',
  created_at  timestamptz not null default now()
);

-- Prevent duplicate emails per source
create unique index if not exists leads_email_source_idx on leads (email, source);

-- RLS: service role only (no public reads or writes)
alter table leads enable row level security;

-- No public access; inserts go through the service role via the API route
