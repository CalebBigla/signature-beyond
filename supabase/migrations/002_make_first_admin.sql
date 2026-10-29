-- Run AFTER you create your user in Supabase > Authentication > Users.
-- Put YOUR email on the line below (keep the quotes), then click Run. Safe to run more than once.

with target as (select lower(trim('degasconcept@gmail.com')) as email)

-- 1. Confirm the account, so Supabase allows it to sign in (users added without "Auto Confirm" are blocked).
, confirmed as (
  update auth.users u set email_confirmed_at = coalesce(u.email_confirmed_at, now())
  from target t where lower(u.email) = t.email
  returning u.id, u.email
)

-- 2. Make it an administrator (the profiles row is what grants admin access).
insert into public.profiles (id, email)
select id, email from confirmed
on conflict (id) do nothing;

-- 3. Check: this should list your email with is_admin = true and a confirmed date.
--    No rows = no user with that email exists yet (check the spelling in Authentication > Users).
select u.email, u.email_confirmed_at is not null as confirmed, (p.id is not null) as is_admin
from auth.users u left join public.profiles p on p.id = u.id
where lower(u.email) = lower(trim('degasconcept@gmail.com'));
