-- Signature Beyond: PDF documents for artworks, exhibitions and journal articles. Run AFTER 001. Safe to re-run.
-- Adds an optional PDF to each, shown on the website behind a "Read more" button, and lets the
-- image bucket also hold PDFs (up to 25 MB; the admin still limits images to 5 MB).

alter table public.artworks      add column if not exists pdf_path text;
alter table public.exhibitions   add column if not exists pdf_path text;
alter table public.journal_posts add column if not exists pdf_path text;

update storage.buckets
set allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    file_size_limit = 26214400
where id = 'media';
