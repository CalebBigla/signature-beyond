# Signature Beyond website

A responsive art gallery website with an admin dashboard.
Built with Next.js (App Router), TypeScript, Tailwind CSS, Motion and Supabase.

## What is in it
- Public pages: Home, Artworks (+ detail), Auctions (+ detail), Exhibitions (+ detail), Journal (+ articles), About, Contact (with enquiry form)
- WhatsApp Click-to-Chat button and artwork enquiry buttons, all controlled by one settings record
- Admin dashboard at `/admin`: artworks, artists, auctions, exhibitions, journal, testimonials, enquiries, website settings, image uploads
- Sitemap, robots.txt, page metadata, optional Google Analytics 4

## Run on your computer
1. Install Node.js 20 or newer.
2. In this folder run: `npm install`
3. Copy `.env.example` to `.env.local`
4. Run: `npm run dev` and open http://localhost:3000

With `NEXT_PUBLIC_DATA_MODE=demo` (the default) the site shows clearly marked sample content and nothing is saved. The admin area is switched off in demo mode.

## Connect Supabase (the real database)
Follow **docs/SUPABASE_SETUP.md**. In short: create a project, paste `supabase/migrations/001_schema.sql` into the SQL Editor, copy two keys into `.env.local`, create your admin user, paste `002_make_first_admin.sql`. Then check everything using **docs/TEST_CHECKLIST.md**.

## Put it online with Vercel
1. Put this project on GitHub.
2. In Vercel click **Add New > Project**, pick the repository, click Deploy.
3. In the Vercel project open **Settings > Environment Variables** and add:
   - `NEXT_PUBLIC_DATA_MODE` = `supabase`
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (same values as `.env.local`)
   - `NEXT_PUBLIC_SITE_URL` = your live address, e.g. `https://signaturebeyond.com`
   - Optional: `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`
4. Redeploy. In Supabase open **Authentication > URL Configuration** and set the Site URL to your live address.
5. Submit `https://YOUR-ADDRESS/sitemap.xml` in Google Search Console.

Never add the Supabase `service_role` key anywhere. This app does not need it.

## Useful commands
- `npm run dev` start while working
- `npm run typecheck` check types
- `npm run lint` check code style
- `npm run build` make the production build (run this before deploying)

## How the code is organised
- `app/(site)/` public pages, `app/admin/` admin pages
- `types/` data shapes
- `lib/services/` the only place pages get data from (demo or Supabase)
- `lib/supabase/` Supabase connection and database-to-app mapping
- `lib/admin/` admin login check, content-type settings, save/delete actions
- `lib/whatsapp.ts` WhatsApp link builder
- `supabase/migrations/` SQL to paste into Supabase
- `components/` reusable pieces

## Content you must supply
Photos of artworks and the gallery (the hero uses a gradient until you add a photo), the WhatsApp number, emails, phone, address, social links, About text, and anything marked "to be confirmed". Nothing has been invented: the sample artwork titles come from the project brief only.
