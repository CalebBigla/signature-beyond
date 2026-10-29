-- Signature Beyond: homepage hero layout options. Run AFTER 003. Safe to run more than once.
-- The hero is now text on one side and an image on the other. These two settings choose
-- which side the image sits on and the background behind the text (Admin > Homepage).

alter table public.website_settings
  add column if not exists hero_layout text not null default 'image-right',
  add column if not exists hero_tone text not null default 'light';

alter table public.website_settings drop constraint if exists website_settings_hero_layout_check;
alter table public.website_settings add constraint website_settings_hero_layout_check check (hero_layout in ('image-right', 'image-left'));
alter table public.website_settings drop constraint if exists website_settings_hero_tone_check;
alter table public.website_settings add constraint website_settings_hero_tone_check check (hero_tone in ('light', 'bone', 'dark'));
