# Supabase setup (simple steps)

Button names in Supabase can change slightly. If one looks different, look for the closest match.

## 1. Create the project
1. Go to https://supabase.com and sign in. Click **New project**.
2. Pick a name and a database password. Save the password somewhere safe. You will not need it in this app.

## 2. Create the tables (one paste)
1. In your project, open **SQL Editor**, then **New query**.
2. Open `supabase/migrations/001_schema.sql` from this project, copy everything, paste it in, click **Run**.
3. You should see "Success". This creates the tables, the security rules and the image storage.
4. Click **New query** again, paste everything from `supabase/migrations/003_cms_upgrade.sql`, click **Run**. This adds the FAQ and legal-page tables, the logo and split homepage hero fields, and "last updated" dates. It is safe to run again.
5. Then, the same way: `005_hero_layout.sql` (hero image side and background), `006_login_rate_limit.sql` (admin sign-in is paused for 15 minutes after 5 failed attempts) and `007_pdf_documents.sql` (PDF uploads for artworks, exhibitions and journal articles). `004_seed_starter_content.sql` is optional starter content.

## 3. Connect the website
1. In Supabase open **Project Settings > API** (or "API Keys").
2. Copy the **Project URL** and the **publishable** key (older projects call it **anon public**).
3. In this project, copy `.env.example` to a new file named `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` = the Project URL
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = the publishable key
   - `NEXT_PUBLIC_DATA_MODE` = `supabase`
4. Stop and restart `npm run dev`.

Never copy the `service_role` or "secret" key into this project. It is not needed.

## 4. Create the first administrator
1. In Supabase open **Authentication > Users > Add user**. Enter your email and a password.
2. Open `supabase/migrations/002_make_first_admin.sql`, replace the email address in it with that email, paste it in the SQL Editor, click **Run**.
3. Restart `npm run dev`, open `/admin`, and sign in. You land on the dashboard.

## 4b. Allow the password-reset link (do this once)
Supabase only sends people back to addresses you allow. Without this, the reset email opens the wrong address and nothing happens.
1. Open **Authentication > URL Configuration**.
2. **Site URL**: the address you use, e.g. `http://localhost:3001` while developing, your real domain once live.
3. **Redirect URLs** > **Add URL**: `http://localhost:3001/admin/auth/callback` (and later `https://your-domain/admin/auth/callback`). Save.
4. Recommended, so the link works in any browser or on your phone: **Authentication > Emails > Reset Password**, and set the link in the template to
   `{{ .SiteURL }}/admin/auth/callback?token_hash={{ .TokenHash }}&type=recovery`
   You can also skip the link: the reset page has an "I already have a code" option for the code in the email.

## 5. Check it works
With the site running in `supabase` mode, the pages show "no content yet" messages. That is correct: the database is empty. The admin area (next stage) is where you add content.

## When deploying to Vercel
Add the same three environment variables in the Vercel project settings, then deploy.
