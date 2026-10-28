-- Signature Beyond: database setup. Paste this whole file into Supabase > SQL Editor > Run.
-- Safe to run once on a new project.

create type public.publish_status as enum ('draft', 'published');
create type public.availability as enum ('available', 'sold', 'on_request');

-- Who is an administrator --------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  role text not null default 'admin' check (role = 'admin'),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Content tables -----------------------------------------------------------
create table public.artists (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  biography text,
  status public.publish_status not null default 'draft',
  created_at timestamptz not null default now()
);

create table public.artworks (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  artist_id uuid references public.artists (id) on delete set null,
  medium text,
  dimensions text,
  year int,
  description text,
  price numeric,
  currency text,
  price_on_request boolean not null default true,
  availability public.availability not null default 'on_request',
  featured boolean not null default false,
  status public.publish_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.artworks (status, featured);
create index on public.artworks (artist_id);

create table public.artwork_images (
  id uuid primary key default gen_random_uuid(),
  artwork_id uuid not null references public.artworks (id) on delete cascade,
  storage_path text not null,
  alt text not null default '',
  is_main boolean not null default false,
  sort_order int not null default 0
);
create index on public.artwork_images (artwork_id);

create table public.auctions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  start_date date,
  end_date date,
  description text,
  cover_image_path text,
  featured boolean not null default false,
  status public.publish_status not null default 'draft',
  created_at timestamptz not null default now()
);

create table public.auction_artworks (
  auction_id uuid not null references public.auctions (id) on delete cascade,
  artwork_id uuid not null references public.artworks (id) on delete cascade,
  primary key (auction_id, artwork_id)
);

create table public.exhibitions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  year int,
  start_date date,
  end_date date,
  description text,
  cover_image_path text,
  featured boolean not null default false,
  status public.publish_status not null default 'draft',
  created_at timestamptz not null default now()
);

create table public.exhibition_artworks (
  exhibition_id uuid not null references public.exhibitions (id) on delete cascade,
  artwork_id uuid not null references public.artworks (id) on delete cascade,
  primary key (exhibition_id, artwork_id)
);

create table public.exhibition_artists (
  exhibition_id uuid not null references public.exhibitions (id) on delete cascade,
  artist_id uuid not null references public.artists (id) on delete cascade,
  primary key (exhibition_id, artist_id)
);

create table public.journal_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content text not null default '',
  cover_image_path text,
  author text,
  published_at timestamptz,
  status public.publish_status not null default 'draft',
  created_at timestamptz not null default now()
);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  author text not null,
  role text,
  status public.publish_status not null default 'draft',
  created_at timestamptz not null default now()
);

-- One single row of site-wide settings (id is always 1) --------------------
create table public.website_settings (
  id int primary key default 1 check (id = 1),
  site_name text not null default 'Signature Beyond',
  established_year int,
  home_heading text not null default 'Welcome to Signature Beyond',
  home_intro text not null default '',
  about_summary text not null default '',
  whatsapp_number text not null default '',
  whatsapp_default_message text not null default 'Hello Signature Beyond, I would like to make an enquiry.',
  whatsapp_artwork_template text not null default 'Hello Signature Beyond, I am interested in the artwork {title} by {artist}. Please provide more information.',
  primary_email text not null default '',
  additional_emails text[] not null default '{}',
  phone_numbers text[] not null default '{}',
  address text not null default '',
  virtual_tour_url text not null default '',
  hero_image_path text,
  tile_auctions_path text,
  tile_exhibitions_path text,
  tile_artworks_path text,
  tile_tour_path text,
  social jsonb not null default '{}'::jsonb
);
insert into public.website_settings (id) values (1);

-- Messages from the contact form -------------------------------------------
create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 200),
  phone text check (char_length(phone) <= 40),
  subject text check (char_length(subject) <= 200),
  message text not null check (char_length(message) between 1 and 5000),
  artwork_id uuid references public.artworks (id) on delete set null,
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

-- Row Level Security: the database itself enforces who can do what ---------
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','artists','artworks','artwork_images','auctions','auction_artworks',
    'exhibitions','exhibition_artworks','exhibition_artists','journal_posts',
    'testimonials','website_settings','enquiries'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "admins manage %1$s" on public.%1$I for all to authenticated
         using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

create policy "read own profile" on public.profiles for select to authenticated using (id = auth.uid());

-- Visitors can read ONLY published content
create policy "public reads published artists" on public.artists for select to anon, authenticated using (status = 'published');
create policy "public reads published artworks" on public.artworks for select to anon, authenticated using (status = 'published');
create policy "public reads published auctions" on public.auctions for select to anon, authenticated using (status = 'published');
create policy "public reads published exhibitions" on public.exhibitions for select to anon, authenticated using (status = 'published');
create policy "public reads published journal" on public.journal_posts for select to anon, authenticated using (status = 'published');
create policy "public reads published testimonials" on public.testimonials for select to anon, authenticated using (status = 'published');
create policy "public reads settings" on public.website_settings for select to anon, authenticated using (true);

create policy "public reads images of published artworks" on public.artwork_images for select to anon, authenticated
  using (exists (select 1 from public.artworks a where a.id = artwork_id and a.status = 'published'));
create policy "public reads published auction links" on public.auction_artworks for select to anon, authenticated
  using (exists (select 1 from public.auctions a where a.id = auction_id and a.status = 'published'));
create policy "public reads published exhibition artwork links" on public.exhibition_artworks for select to anon, authenticated
  using (exists (select 1 from public.exhibitions e where e.id = exhibition_id and e.status = 'published'));
create policy "public reads published exhibition artist links" on public.exhibition_artists for select to anon, authenticated
  using (exists (select 1 from public.exhibitions e where e.id = exhibition_id and e.status = 'published'));

-- Visitors can SEND an enquiry but never read any
create policy "anyone sends enquiries" on public.enquiries for insert to anon, authenticated with check (handled = false);

-- Image storage: one public bucket called "media" --------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "anyone views media" on storage.objects for select to anon, authenticated using (bucket_id = 'media');
create policy "admins upload media" on storage.objects for insert to authenticated with check (bucket_id = 'media' and public.is_admin());
create policy "admins update media" on storage.objects for update to authenticated using (bucket_id = 'media' and public.is_admin());
create policy "admins delete media" on storage.objects for delete to authenticated using (bucket_id = 'media' and public.is_admin());
