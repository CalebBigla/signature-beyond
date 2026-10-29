-- Signature Beyond: admin login rate limit (5 failed attempts per 15 minutes). Run AFTER 001. Safe to re-run.
-- The website calls these functions from the server. Keys are SHA-256 hashes of email + IP, so no
-- email address or IP is stored in clear. Old rows are cleaned up automatically.

create table if not exists public.login_attempts (
  key text not null,
  attempted_at timestamptz not null default now()
);
create index if not exists login_attempts_key_time on public.login_attempts (key, attempted_at desc);
alter table public.login_attempts enable row level security; -- no policies: only the functions below can touch it

-- Failed attempts in the last 15 minutes for this key, and seconds until the oldest one expires.
create or replace function public.login_rate_status(p_key text)
returns table (failures int, retry_after_seconds int)
language sql security definer set search_path = public as $$
  select count(*)::int,
         coalesce(ceil(extract(epoch from (min(attempted_at) + interval '15 minutes' - now())))::int, 0)
  from public.login_attempts
  where key = p_key and attempted_at > now() - interval '15 minutes';
$$;

-- Records one failed attempt (and prunes anything older than a day).
create or replace function public.login_rate_fail(p_key text)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_key !~ '^[0-9a-f]{64}$' then return; end if; -- only accept hashes from the website
  delete from public.login_attempts where attempted_at < now() - interval '1 day';
  insert into public.login_attempts (key) values (p_key);
end $$;

-- Clears the counter after a successful sign-in. Only a signed-in user can call it.
create or replace function public.login_rate_reset(p_key text)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return; end if;
  delete from public.login_attempts where key = p_key;
end $$;

revoke all on function public.login_rate_status(text) from public;
revoke all on function public.login_rate_fail(text) from public;
revoke all on function public.login_rate_reset(text) from public;
grant execute on function public.login_rate_status(text) to anon, authenticated;
grant execute on function public.login_rate_fail(text) to anon, authenticated;
grant execute on function public.login_rate_reset(text) to authenticated;
