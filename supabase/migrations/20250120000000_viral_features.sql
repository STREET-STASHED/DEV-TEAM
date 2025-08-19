-- StreetStashed Viral Features Migration
-- Adds reviews, ratings, and referral leaderboard support
-- Safe, backwards-compatible, with proper RLS

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

-- Users can only insert reviews for themselves
create policy reviews_insert_self on reviews
  for insert to authenticated
  with check (auth.uid() = reviewer_id);

-- Users can only update their own reviews
create policy reviews_update_self on reviews
  for update to authenticated
  using (auth.uid() = reviewer_id)
  with check (auth.uid() = reviewer_id);

-- Users can only delete their own reviews
create policy reviews_delete_self on reviews
  for delete to authenticated
  using (auth.uid() = reviewer_id);

-- Public read access to reviews
create policy reviews_select_public on reviews
  for select using (true);

-- 2. Referral Leaderboard Support
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

-- 3. Function to refresh leaderboard
create or replace function refresh_referral_leaderboard()
returns void
language plpgsql
security definer
as $$
begin
  refresh materialized view concurrently referral_leaderboard;
end;
$$;

-- Grant execute to authenticated users (they can trigger refresh)
grant execute on function refresh_referral_leaderboard() to authenticated;

-- 4. Helper function to get average rating
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

-- Grant execute to authenticated users
grant execute on function get_average_rating(text, uuid) to authenticated;

-- 5. Helper function to get review count
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

-- Grant execute to authenticated users
grant execute on function get_review_count(text, uuid) to authenticated;
