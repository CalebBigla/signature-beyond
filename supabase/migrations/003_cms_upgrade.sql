-- Signature Beyond: CMS upgrade. Run AFTER 001_schema.sql (and 002). Paste into Supabase > SQL Editor > Run.
-- Additive and safe to re-run: it only adds what is missing.
--
-- 1. Adds tables and columns the website code already uses but 001 never created
--    (faq_items, legal_pages, website_settings.logo_path).
-- 2. Adds the split homepage hero: a second (right-hand) image, alt text and editable buttons.
-- 3. Adds "last updated" timestamps to every content table, kept current by a trigger.

-- Website settings: logo and homepage hero ----------------------------------
alter table public.website_settings
  add column if not exists logo_path text,
  add column if not exists hero_image_right_path text,
  add column if not exists hero_image_alt text not null default '',
  add column if not exists hero_image_right_alt text not null default '',
  add column if not exists hero_eyebrow text not null default '',
  add column if not exists hero_primary_label text not null default 'View the collection',
  add column if not exists hero_primary_href text not null default '/artworks',
  add column if not exists hero_secondary_label text not null default '',
  add column if not exists hero_secondary_href text not null default '';

-- FAQ questions (Admin > FAQs) ------------------------------------------------
create table if not exists public.faq_items (
  id uuid primary key default gen_random_uuid(),
  category text not null default 'general',
  question text not null,
  answer text not null,
  link_label text,
  link_href text check (link_href is null or link_href ~ '^(/[^/]|/$|https://)'),
  sort_order int not null default 1000,
  status public.publish_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists faq_items_status_order on public.faq_items (status, sort_order);

-- Legal pages (Admin > Legal pages) -------------------------------------------
create table if not exists public.legal_pages (
  id uuid primary key default gen_random_uuid(),
  page_key text not null unique check (page_key in ('privacy-policy', 'terms', 'auction-terms')),
  title text not null,
  content text not null check (char_length(content) <= 60000),
  last_updated date,
  show_draft_notice boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Row Level Security for the new tables ----------------------------------------
alter table public.faq_items enable row level security;
alter table public.legal_pages enable row level security;

drop policy if exists "admins manage faq_items" on public.faq_items;
create policy "admins manage faq_items" on public.faq_items for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "public reads published faq" on public.faq_items;
create policy "public reads published faq" on public.faq_items for select to anon, authenticated using (status = 'published');

drop policy if exists "admins manage legal_pages" on public.legal_pages;
create policy "admins manage legal_pages" on public.legal_pages for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "public reads legal pages" on public.legal_pages;
create policy "public reads legal pages" on public.legal_pages for select to anon, authenticated using (true);

-- "Last updated" on every content table ---------------------------------------
alter table public.artists       add column if not exists updated_at timestamptz not null default now();
alter table public.auctions      add column if not exists updated_at timestamptz not null default now();
alter table public.exhibitions   add column if not exists updated_at timestamptz not null default now();
alter table public.journal_posts add column if not exists updated_at timestamptz not null default now();
alter table public.testimonials  add column if not exists updated_at timestamptz not null default now();

create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['artists','artworks','auctions','exhibitions','journal_posts','testimonials','faq_items','legal_pages'] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end $$;
