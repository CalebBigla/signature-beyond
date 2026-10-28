-- Run AFTER you create your user in Supabase > Authentication > Users.
-- Replace the email below with YOUR email, then click Run.
insert into public.profiles (id, email)
select id, email from auth.users where email = 'wazamskid@gmail.com'
on conflict (id) do nothing;
