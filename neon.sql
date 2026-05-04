CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.users (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email      text NOT NULL UNIQUE,
  nom        text NOT NULL,
  prenom     text NOT NULL,
  password   text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.vehicles (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand         text NOT NULL,
  model         text NOT NULL,
  year          integer NOT NULL,
  price         numeric NOT NULL,
  price_per_day numeric,
  type          text NOT NULL CHECK (type IN ('sale', 'rental')),
  status        text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold', 'rented', 'reserved')),
  fuel          text NOT NULL,
  transmission  text NOT NULL,
  mileage       integer NOT NULL DEFAULT 0,
  seats         integer NOT NULL DEFAULT 5,
  color         text,
  description   text,
  images        jsonb NOT NULL DEFAULT '[]',
  videos        jsonb NOT NULL DEFAULT '[]',
  location      text NOT NULL,
  featured      integer NOT NULL DEFAULT 0,
  view_count    integer NOT NULL DEFAULT 0,
  user_id       uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.listings (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       uuid REFERENCES public.users(id) ON DELETE SET NULL,
  seller_name   text NOT NULL,
  seller_phone  text NOT NULL,
  seller_email  text,
  brand         text NOT NULL,
  model         text NOT NULL,
  year          integer NOT NULL,
  price         numeric NOT NULL,
  type          text NOT NULL CHECK (type IN ('sale', 'rental')),
  fuel          text NOT NULL,
  transmission  text NOT NULL,
  mileage       integer NOT NULL DEFAULT 0,
  color         text,
  description   text,
  images        jsonb NOT NULL DEFAULT '[]',
  location      text NOT NULL,
  status        text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes   text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.bookings (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id  uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  user_name   text NOT NULL,
  user_phone  text NOT NULL,
  user_email  text,
  type        text NOT NULL CHECK (type IN ('rental', 'purchase')),
  start_date  date,
  end_date    date,
  total_price numeric,
  status      text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.contact_messages (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       text NOT NULL,
  phone      text NOT NULL,
  email      text,
  message    text NOT NULL,
  status     text NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.blog (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  titre        text NOT NULL,
  contenu      text NOT NULL,
  images       jsonb NOT NULL DEFAULT '[]',
  videos       jsonb NOT NULL DEFAULT '[]',
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vehicles_updated_at  BEFORE UPDATE ON public.vehicles  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER listings_updated_at  BEFORE UPDATE ON public.listings  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER bookings_updated_at  BEFORE UPDATE ON public.bookings  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER blog_updated_at      BEFORE UPDATE ON public.blog      FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Indexes
CREATE INDEX ON public.vehicles (type);
CREATE INDEX ON public.vehicles (status);
CREATE INDEX ON public.vehicles (featured);
CREATE INDEX ON public.vehicles (location);
CREATE INDEX ON public.blog (published_at DESC);
