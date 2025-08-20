-- Add username field to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS username text,
    ADD COLUMN IF NOT EXISTS email text;
-- Add unique constraint on username
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);
-- Add index on email for faster lookups
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
-- Update the handle_new_user function to include username
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$ BEGIN
INSERT INTO public.profiles (id, role, username, email)
VALUES (
        new.id,
        'buyer',
        new.raw_user_meta_data->>'username',
        new.email
    );
RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;