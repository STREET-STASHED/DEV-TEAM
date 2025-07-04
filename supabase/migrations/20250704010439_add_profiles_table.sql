

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text default 'buyer',
  full_name text,
  has_completed_onboarding boolean default false,
  details_complete boolean default false,
  created_at timestamp with time zone default now(),
  onboarding_step text default 'role'
);


-- Conditionally create the trigger only if it doesn't already exist
do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'on_auth_user_created'
  ) then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute function public.handle_new_user();
  end if;
end;
$$;