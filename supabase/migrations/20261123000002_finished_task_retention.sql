create extension if not exists pg_cron;

alter table public.tasks
  add column if not exists finished_at timestamptz;

comment on column public.tasks.finished_at is
  'Set when a task is marked finished; null for historical finished tasks without a recorded finish time.';

create index if not exists tasks_finished_at_idx
  on public.tasks (finished_at)
  where status = 'finish' and finished_at is not null;

create or replace function public.set_task_finished_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.finished_at := case
      when new.status = 'finish' then pg_catalog.now()
      else null
    end;
  elsif new.status = 'finish' then
    if old.status is distinct from new.status then
      new.finished_at := pg_catalog.now();
    else
      new.finished_at := old.finished_at;
    end if;
  else
    new.finished_at := null;
  end if;

  return new;
end;
$$;

drop trigger if exists set_task_finished_at on public.tasks;
create trigger set_task_finished_at
  before insert or update on public.tasks
  for each row execute function public.set_task_finished_at();

select cron.unschedule(jobid)
from cron.job
where jobname = 'delete-finished-tasks-after-15-days';

select cron.schedule(
  'delete-finished-tasks-after-15-days',
  '0 * * * *',
  $job$
    delete from public.tasks
    where status = 'finish'
      and finished_at is not null
      and finished_at <= pg_catalog.now() - interval '15 days';
  $job$
);

notify pgrst, 'reload schema';
