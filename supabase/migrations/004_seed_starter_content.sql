-- Signature Beyond: OPTIONAL starter content. Run AFTER 001 and 003. Safe to run more than once.
--
-- Everything is created as a DRAFT, so nothing appears on the public website until you
-- open it in the admin, check it, add images and press Publish.
-- Titles and gallery details come from the gallery's current website and brief.
-- Settings are only filled where they are still empty, so your own edits are never overwritten.

-- Gallery details (only where empty) ----------------------------------------
update public.website_settings set
  established_year = coalesce(established_year, 1992),
  address          = case when address = '' then E'107 Awolowo Road\nIkoyi, Lagos' else address end,
  whatsapp_number  = case when whatsapp_number = '' then '2348033177676' else whatsapp_number end,
  social = jsonb_build_object(
    'facebook',  coalesce(nullif(social->>'facebook', ''),  'https://www.facebook.com/signatureandsogal'),
    'instagram', coalesce(nullif(social->>'instagram', ''), 'https://www.instagram.com/signatureandsogal'),
    'twitter',   coalesce(nullif(social->>'twitter', ''),   'https://twitter.com/SignatureSogal'),
    'youtube',   coalesce(social->>'youtube', ''),
    'tiktok',    coalesce(social->>'tiktok', ''),
    'linkedin',  coalesce(social->>'linkedin', '')
  )
where id = 1;

-- Auctions (SOGAL) -----------------------------------------------------------
insert into public.auctions (slug, title, status) values
  ('african-original-2023', 'African Original 2023', 'draft'),
  ('african-original-2022', 'African Original 2022', 'draft'),
  ('contemporary-2021',     'Contemporary 2021',     'draft'),
  ('acquire-2018',          'Acquire 2018',          'draft')
on conflict (slug) do nothing;

-- Exhibitions ----------------------------------------------------------------
insert into public.exhibitions (slug, title, status) values
  ('interwoven-forms',   'Interwoven Forms',   'draft'),
  ('ghetto-impressions', 'Ghetto Impressions', 'draft'),
  ('toys-for-troys',     'Toys for Troys',     'draft'),
  ('room-morning-dance', 'Room Morning Dance', 'draft')
on conflict (slug) do nothing;

-- Artworks (price on request until you set one) ---------------------------------
insert into public.artworks (slug, title, status, featured) values
  ('african-beauty', 'African Beauty', 'draft', true),
  ('untitled',       'Untitled',       'draft', true),
  ('beetle-ijapa',   'Beetle (Ijapa)', 'draft', true),
  ('self-adoration', 'Self-Adoration', 'draft', true),
  ('damsel',         'Damsel',         'draft', false)
on conflict (slug) do nothing;
