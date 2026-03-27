create table public.users (
  id uuid not null default extensions.uuid_generate_v4 (),
  email text not null,
  nom text not null,
  prenom text not null,
  password text not null,
  created_at timestamp with time zone not null default now(),
  constraint users_pkey primary key (id),
  constraint users_email_key unique (email)
) TABLESPACE pg_default;


-- ============================================================
-- TABLE: vehicles (avec videos)
-- ============================================================
create extension if not exists "uuid-ossp";

create table public.vehicles (
  id            uuid primary key default uuid_generate_v4(),
  brand         text not null,
  model         text not null,
  year          integer not null,
  price         numeric not null,
  price_per_day numeric,
  type          text not null check (type in ('sale', 'rental')),
  status        text not null default 'available' check (status in ('available', 'sold', 'rented', 'reserved')),
  fuel          text not null,
  transmission  text not null,
  mileage       integer not null default 0,
  seats         integer not null default 5,
  color         text,
  description   text,
  images        jsonb not null default '[]',
  videos        jsonb not null default '[]',
  location      text not null,
  featured      integer not null default 0,
  view_count    integer not null default 0,
  user_id       uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger vehicles_updated_at before update on public.vehicles
  for each row execute function set_updated_at();

-- RLS
alter table public.vehicles enable row level security;
create policy "vehicles_public_read" on public.vehicles for select using (true);
create policy "vehicles_admin_write" on public.vehicles for all using (auth.role() = 'service_role');
create policy "vehicles_anon_write"  on public.vehicles for all using (true);

-- Index
create index on public.vehicles (type);
create index on public.vehicles (status);
create index on public.vehicles (featured);
create index on public.vehicles (location);

-- ============================================================
-- RLS POLICIES: listings
-- ============================================================
alter table public.listings enable row level security;
create policy "listings_anon_insert" on public.listings for insert with check (true);
create policy "listings_anon_read"   on public.listings for select using (true);
create policy "listings_anon_update" on public.listings for update using (true);
create policy "listings_anon_delete" on public.listings for delete using (true);
