select cron.unschedule(jobid)
from cron.job
where jobname = 'delete-finished-tasks-after-15-days';

drop trigger if exists set_task_finished_at on public.tasks;
drop function if exists public.set_task_finished_at();
drop index if exists public.tasks_finished_at_idx;

alter table public.tasks
  drop column if exists finished_at;

notify pgrst, 'reload schema';
