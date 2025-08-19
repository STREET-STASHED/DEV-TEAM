-- StreetStashed Viral Features Database Deployment
-- Run this script in your Supabase SQL Editor
-- This script is safe and idempotent - can be run multiple times

-- 1. Reviews & Ratings Table
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  reviewer_id uuid not null references profiles(user_id) on delete cascade,
  subject_type text not null check (subject_type in ('seller','stylist','driver')),
  subject_id uuid not null, -- FK to profiles(user_id) by convention
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

-- Indexes for performance
create index if not exists idx_reviews_subject on reviews(subject_type, subject_id);
create index if not exists idx_reviews_order on reviews(order_id);
create index if not exists idx_reviews_reviewer on reviews(reviewer_id);
create index if not exists idx_reviews_created_at on reviews(created_at desc);

-- RLS Policies
alter table reviews enable row level security;
create policy if not exists reviews_insert_self on reviews
  for insert to authenticated
  with check (auth.uid() = reviewer_id);
create policy if not exists reviews_update_self on reviews
  for update to authenticated
  using (auth.uid() = reviewer_id)
  with check (auth.uid() = reviewer_id);
create policy if not exists reviews_delete_self on reviews
  for delete to authenticated
  using (auth.uid() = reviewer_id);
create policy if not exists reviews_select_public on reviews
  for select using (true);

-- 2. Push Notification Tokens Table
create table if not exists push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(user_id) on delete cascade,
  token text not null,
  platform text not null check (platform in ('web', 'ios', 'android')),
  created_at timestamptz not null default now(),
  last_used timestamptz not null default now(),
  is_active boolean not null default true
);

-- Indexes for push tokens
create index if not exists idx_push_tokens_user on push_tokens(user_id);
create index if not exists idx_push_tokens_active on push_tokens(is_active);
create unique index if not exists idx_push_tokens_unique on push_tokens(user_id, token);

-- RLS Policies for push tokens
alter table push_tokens enable row level security;
create policy if not exists push_tokens_insert_self on push_tokens
  for insert to authenticated
  with check (auth.uid() = user_id);
create policy if not exists push_tokens_select_self on push_tokens
  for select to authenticated
  using (auth.uid() = user_id);
create policy if not exists push_tokens_update_self on push_tokens
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy if not exists push_tokens_delete_self on push_tokens
  for delete to authenticated
  using (auth.uid() = user_id);

-- 3. Analytics Events Table
create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  properties jsonb,
  user_id uuid references profiles(user_id) on delete set null,
  session_id text,
  page_url text,
  user_agent text,
  created_at timestamptz not null default now()
);

-- Indexes for analytics
create index if not exists idx_analytics_events_type on analytics_events(event_type);
create index if not exists idx_analytics_events_user on analytics_events(user_id);
create index if not exists idx_analytics_events_session on analytics_events(session_id);
create index if not exists idx_analytics_events_created on analytics_events(created_at desc);

-- RLS Policies for analytics (public read, authenticated insert)
alter table analytics_events enable row level security;
create policy if not exists analytics_events_insert_authenticated on analytics_events
  for insert to authenticated
  with check (true);
create policy if not exists analytics_events_select_public on analytics_events
  for select using (true);

-- 4. Referral Leaderboard Support
-- Materialized view for top referrers (refreshable)
create materialized view if not exists referral_leaderboard as
  select
    r.referrer_id,
    p.full_name,
    p.avatar_url,
    count(*) as referred_orders,
    sum(case when o.status in ('delivered','completed') then 1 else 0 end) as completed_orders
  from referrals r
  left join orders o on o.buyer_id = r.referred_id
  left join profiles p on p.user_id = r.referrer_id
  group by r.referrer_id, p.full_name, p.avatar_url;

-- Index for leaderboard sorting
create index if not exists idx_referral_leaderboard on referral_leaderboard(completed_orders desc, referred_orders desc);

-- 5. Function to refresh leaderboard
create or replace function refresh_referral_leaderboard()
returns void
language plpgsql
security definer
as $$
begin
  refresh materialized view concurrently referral_leaderboard;
end;
$$;

grant execute on function refresh_referral_leaderboard() to authenticated;

-- 6. Helper function to get average rating
create or replace function get_average_rating(subject_type_param text, subject_id_param uuid)
returns numeric
language plpgsql
security definer
as $$
declare
  avg_rating numeric;
begin
  select coalesce(round(avg(rating)::numeric, 2), 0)
  into avg_rating
  from reviews
  where subject_type = subject_type_param
    and subject_id = subject_id_param;
  return avg_rating;
end;
$$;

grant execute on function get_average_rating(text, uuid) to authenticated;

-- 7. Helper function to get review count
create or replace function get_review_count(subject_type_param text, subject_id_param uuid)
returns integer
language plpgsql
security definer
as $$
declare
  review_count integer;
begin
  select count(*)
  into review_count
  from reviews
  where subject_type = subject_type_param
    and subject_id = subject_id_param;
  return review_count;
end;
$$;

grant execute on function get_review_count(text, uuid) to authenticated;

-- 8. Grant necessary permissions
grant usage on schema public to authenticated;
grant all on all tables in schema public to authenticated;
grant all on all sequences in schema public to authenticated;

-- 9. Verify deployment
select 
  'Reviews table' as feature,
  case when exists (select 1 from information_schema.tables where table_name = 'reviews') 
    then '✅ Created' else '❌ Failed' end as status
union all
select 
  'Push tokens table' as feature,
  case when exists (select 1 from information_schema.tables where table_name = 'push_tokens') 
    then '✅ Created' else '❌ Failed' end as status
union all
select 
  'Analytics table' as feature,
  case when exists (select 1 from information_schema.tables where table_name = 'analytics_events') 
    then '✅ Created' else '❌ Failed' end as status
union all
select 
  'Leaderboard view' as feature,
  case when exists (select 1 from information_schema.views where table_name = 'referral_leaderboard') 
    then '✅ Created' else '❌ Failed' end as status;
