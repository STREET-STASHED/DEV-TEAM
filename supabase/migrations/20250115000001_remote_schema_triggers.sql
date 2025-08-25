


-- Ensure the handle_new_user function exists before this trigger
-- Create the trigger for new user registration
-- This needs to be run with appropriate permissions (e.g., as a superuser or using the service role)
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();