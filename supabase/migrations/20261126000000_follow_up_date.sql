alter table public.tasks
  add column if not exists follow_up_date date;
