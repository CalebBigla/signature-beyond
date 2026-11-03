-- Signature Beyond: PDF documents for auctions. Run AFTER 007 (which lets the media bucket hold PDFs). Safe to re-run.
-- Adds an optional PDF to each auction, shown on the website behind a "Read more" button.

alter table public.auctions add column if not exists pdf_path text;
