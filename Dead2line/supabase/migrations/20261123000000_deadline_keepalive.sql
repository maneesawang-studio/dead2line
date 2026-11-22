create or replace function public.deadline_keepalive()
returns timestamptz
language sql
stable
set search_path = ''
as $$
  select pg_catalog.now();
$$;

revoke all on function public.deadline_keepalive() from public, anon, authenticated;
grant execute on function public.deadline_keepalive() to anon;
