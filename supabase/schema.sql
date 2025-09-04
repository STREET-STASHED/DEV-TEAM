-- USERS
-- PROFILES
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  license_number text,
  verification_url text,
  role text check (role in ('buyer', 'seller', 'stylist', 'driver')),
  created_at timestamp with time zone default now()
);
-- Enable Row Level Security
alter table profiles enable row level security;
-- RLS Policies
create policy "Users can view their profile" on profiles for
select using (auth.uid() = id);
create policy "Users can update their profile" on profiles for
update using (auth.uid() = id) with check (auth.uid() = id);
-- Trigger function to insert into profiles when user signs up
create or replace function public.handle_new_user() returns trigger as $$ begin
insert into public.profiles (id, role)
values (new.id, 'buyer');
-- default role
return new;
end;
$$ language plpgsql security definer;
-- Trigger on auth.users
create trigger on_auth_user_created
after
insert on auth.users for each row execute procedure public.handle_new_user();
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text unique not null,
  role text not null check (role in ('buyer', 'seller', 'stylist', 'driver'))
);
-- PRODUCTS
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(10, 2) not null,
  seller_id uuid not null references users(id),
  description text,
  category text,
  image text,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
-- ITEMS (for marketplace listings)
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  price numeric(10, 2) not null,
  description text,
  category text,
  image text,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
-- Helpful indexes for items
create index if not exists items_seller_id_idx on public.items (seller_id);
create index if not exists items_category_idx on public.items (category);
create index if not exists items_active_idx on public.items (active);
create index if not exists items_created_at_idx on public.items (created_at);
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references users(id),
  product_id uuid not null references products(id),
  status text not null check (
    status in (
      'pending',
      'processing',
      'delivered',
      'cancelled'
    )
  )
);
-- Enable Row Level Security and Policies
-- USERS
alter table users enable row level security;
create policy "Users can read their own profile" on users for
select using (auth.uid() = id);
create policy "Users can update their own profile" on users for
update using (auth.uid() = id);
-- PRODUCTS
alter table products enable row level security;
create policy "Sellers can view their own products" on products for
select using (auth.uid() = seller_id);
create policy "Sellers can manage their own products" on products for all using (auth.uid() = seller_id) with check (auth.uid() = seller_id);
-- ITEMS
alter table public.items enable row level security;
-- Public read access to active items
create policy "Public can view active items" on public.items for
select using (active = true);
-- Sellers can manage their own items
create policy "Sellers can manage their own items" on public.items for all using (auth.uid() = seller_id) with check (auth.uid() = seller_id);
-- Admins can manage all items
create policy "Admins can manage all items" on public.items for all using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);
-- Admin role bypass policies for all tables
-- These policies allow admins to bypass RLS on all tables
create policy "Admin bypass - profiles" on profiles for all using (
  exists (
    select 1
    from profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);
create policy "Admin bypass - orders" on orders for all using (
  exists (
    select 1
    from profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);
create policy "Admin bypass - order_items" on order_items for all using (
  exists (
    select 1
    from profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);
create policy "Admin bypass - cart_items" on cart_items for all using (
  exists (
    select 1
    from profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);
create policy "Admin bypass - driver_stats" on driver_stats for all using (
  exists (
    select 1
    from profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);
create policy "Admin bypass - order_tracking" on order_tracking for all using (
  exists (
    select 1
    from profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);
-- ORDERS
alter table orders enable row level security;
create policy "Buyers can view their own orders" on orders for
select using (auth.uid() = buyer_id);
create policy "Buyers can place orders" on orders for
insert with check (auth.uid() = buyer_id);
-- =============================
-- CART ITEMS
-- =============================
create table if not exists public.cart_items (
  user_id uuid not null,
  id uuid not null,
  -- product id
  name text,
  price numeric,
  quantity int default 1,
  image text,
  category text,
  delivery_tier text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (user_id, id)
);
create unique index if not exists cart_items_user_id_id_idx on public.cart_items (user_id, id);
-- Enable RLS
alter table public.cart_items enable row level security;
-- RLS: user can CRUD only their rows
drop policy if exists cart_items_user_crud on public.cart_items;
create policy cart_items_user_crud on public.cart_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- =============================
-- ORDERS (augment existing table)
-- =============================
-- Ensure required columns exist
alter table public.orders
add column if not exists seller_id uuid,
  add column if not exists driver_id uuid,
  add column if not exists total numeric not null default 0,
  add column if not exists payment_intent text,
  add column if not exists city text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();
-- Normalize status default and remove strict check constraint if present
-- (Some Postgres setups auto-name check constraints; attempt safe drop)
do $$ begin if exists (
  select 1
  from information_schema.table_constraints
  where table_schema = 'public'
    and table_name = 'orders'
    and constraint_type = 'CHECK'
) then execute (
  select string_agg(
      'alter table public.orders drop constraint ' || quote_ident(tc.constraint_name),
      '; '
    )
  from information_schema.table_constraints tc
  where tc.table_schema = 'public'
    and tc.table_name = 'orders'
    and tc.constraint_type = 'CHECK'
);
end if;
end $$;
alter table public.orders
alter column status drop default;
alter table public.orders
alter column status type text;
alter table public.orders
alter column status
set default 'pending';
-- Helpful indexes
create index if not exists orders_buyer_id_idx on public.orders (buyer_id);
create index if not exists orders_seller_id_idx on public.orders (seller_id);
create index if not exists orders_driver_id_idx on public.orders (driver_id);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_city_idx on public.orders (city);
-- Enable RLS (already enabled above; ensure enabled)
alter table public.orders enable row level security;
-- RLS: buyers select/insert where buyer_id=auth.uid()
drop policy if exists orders_buyer_select_insert on public.orders;
create policy orders_buyer_select_insert on public.orders for
select using (buyer_id = auth.uid());
drop policy if exists orders_buyer_insert on public.orders;
create policy orders_buyer_insert on public.orders for
insert with check (buyer_id = auth.uid());
-- RLS: sellers select where seller_id=auth.uid()
drop policy if exists orders_seller_select on public.orders;
create policy orders_seller_select on public.orders for
select using (seller_id = auth.uid());
-- RLS: drivers select/update where driver_id=auth.uid()
drop policy if exists orders_driver_select_update on public.orders;
create policy orders_driver_select_update on public.orders for
select,
  update using (driver_id = auth.uid());
-- =============================
-- ORDER ITEMS
-- =============================
create table if not exists public.order_items (
  id bigserial primary key,
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid,
  name text,
  price numeric,
  quantity int,
  image text
);
create index if not exists order_items_order_id_idx on public.order_items (order_id);
-- Enable RLS
alter table public.order_items enable row level security;
-- RLS: buyer can select rows for orders they own
drop policy if exists order_items_buyer_select on public.order_items;
create policy order_items_buyer_select on public.order_items for
select using (
    exists (
      select 1
      from public.orders o
      where o.id = order_items.order_id
        and o.buyer_id = auth.uid()
    )
  );
-- =============================
-- DRIVER STATS
-- =============================
create table if not exists public.driver_stats (
  driver_id uuid primary key,
  tier text default 'Bronze',
  completed_orders int default 0,
  updated_at timestamptz default now()
);
-- Enable RLS
alter table public.driver_stats enable row level security;
-- RLS: driver can select/insert/update only own
drop policy if exists driver_stats_driver_crud on public.driver_stats;
create policy driver_stats_driver_crud on public.driver_stats for
select,
  insert,
  update using (driver_id = auth.uid()) with check (driver_id = auth.uid());
-- =============================
-- ORDER TRACKING
-- =============================
create table if not exists public.order_tracking (
  id bigserial primary key,
  order_id uuid references public.orders(id),
  driver_id uuid,
  lat double precision,
  lng double precision,
  status text default 'enroute',
  updated_at timestamptz default now()
);
create index if not exists order_tracking_order_id_idx on public.order_tracking (order_id);
create index if not exists order_tracking_driver_id_idx on public.order_tracking (driver_id);
-- Enable RLS
alter table public.order_tracking enable row level security;
-- RLS: buyer can select rows for their orders
drop policy if exists order_tracking_buyer_select on public.order_tracking;
create policy order_tracking_buyer_select on public.order_tracking for
select using (
    exists (
      select 1
      from public.orders o
      where o.id = order_tracking.order_id
        and o.buyer_id = auth.uid()
    )
  );
-- RLS: driver can insert/update rows where driver_id=auth.uid()
drop policy if exists order_tracking_driver_insert_update on public.order_tracking;
create policy order_tracking_driver_insert_update on public.order_tracking for
insert,
  update using (driver_id = auth.uid()) with check (driver_id = auth.uid());
-- =============================
-- PATCH: Reconcile roles, FKs, and profile address fields
-- =============================
-- Ensure pgcrypto for gen_random_uuid exists (safe if already installed)
create extension if not exists "pgcrypto";
-- 1) PROFILES: allow 'admin' role and add address fields
-- Drop any existing CHECK constraints on profiles (role) and replace with a broader check
DO $$ BEGIN IF EXISTS (
  SELECT 1
  FROM information_schema.table_constraints
  WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND constraint_type = 'CHECK'
) THEN EXECUTE (
  SELECT string_agg(
      'alter table public.profiles drop constraint ' || quote_ident(tc.constraint_name),
      '; '
    )
  FROM information_schema.table_constraints tc
  WHERE tc.table_schema = 'public'
    AND tc.table_name = 'profiles'
    AND tc.constraint_type = 'CHECK'
);
END IF;
END $$;
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_chk CHECK (
    role IN ('buyer', 'seller', 'stylist', 'driver', 'admin')
  );
-- Add address fields used by checkout/profile autofill
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS zip text;
-- 2) PRODUCTS: ensure seller_id references profiles(id) instead of a custom users table
DO $$
DECLARE con RECORD;
BEGIN FOR con IN
SELECT conname
FROM pg_constraint c
  JOIN pg_class t ON t.oid = c.conrelid
WHERE t.relname = 'products'
  AND c.contype = 'f' LOOP EXECUTE 'alter table public.products drop constraint ' || quote_ident(con.conname);
END LOOP;
END $$;
ALTER TABLE public.products
ADD CONSTRAINT products_seller_fk FOREIGN KEY (seller_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
-- 3) ORDERS: remove product_id (we use order_items) and ensure buyer_id ties to profiles(id)
-- Drop any existing foreign keys on orders, then re-add buyer FK to profiles
DO $$
DECLARE con RECORD;
BEGIN FOR con IN
SELECT conname
FROM pg_constraint c
  JOIN pg_class t ON t.oid = c.conrelid
WHERE t.relname = 'orders'
  AND c.contype = 'f' LOOP EXECUTE 'alter table public.orders drop constraint ' || quote_ident(con.conname);
END LOOP;
END $$;
ALTER TABLE public.orders DROP COLUMN IF EXISTS product_id,
  ALTER COLUMN buyer_id TYPE uuid;
ALTER TABLE public.orders
ADD CONSTRAINT orders_buyer_fk FOREIGN KEY (buyer_id) REFERENCES public.profiles(id) ON DELETE RESTRICT;
-- Helpful: keep prior indexes and RLS already defined above.
-- 4) (Safety) Ensure unique index for cart_items already exists (no-op if present)
CREATE UNIQUE INDEX IF NOT EXISTS cart_items_user_id_id_idx ON public.cart_items (user_id, id);

-- ROLE-SPECIFIC PROFILE TABLES
-- Seller Profiles
CREATE TABLE IF NOT EXISTS seller_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT,
  business_type TEXT,
  specialties TEXT[],
  experience_years INTEGER DEFAULT 0,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected', 'auto_approved')),
  auto_approved_at TIMESTAMP WITH TIME ZONE,
  approval_confidence DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Stylist Profiles
CREATE TABLE IF NOT EXISTS stylist_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  specialties TEXT[],
  experience_years INTEGER DEFAULT 0,
  services_offered TEXT[],
  hourly_rate DECIMAL(10,2) DEFAULT 50.00,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected', 'auto_approved')),
  auto_approved_at TIMESTAMP WITH TIME ZONE,
  approval_confidence DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Stasher (Driver) Profiles
CREATE TABLE IF NOT EXISTS stasher_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_type TEXT,
  is_online BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected', 'auto_approved')),
  auto_approved_at TIMESTAMP WITH TIME ZONE,
  approval_confidence DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- GAMIFICATION TABLES
-- User Progress
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  current_level INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  xp_to_next_level INTEGER DEFAULT 1000,
  completion_percentage DECIMAL(5,2) DEFAULT 0,
  streak INTEGER DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  achievement_description TEXT,
  category TEXT,
  points INTEGER DEFAULT 0,
  unlocked BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  progress INTEGER DEFAULT 0,
  max_progress INTEGER DEFAULT 1,
  reward_type TEXT,
  reward_value TEXT,
  reward_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Milestones
CREATE TABLE IF NOT EXISTS milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  milestone_id TEXT NOT NULL,
  milestone_name TEXT NOT NULL,
  milestone_description TEXT,
  target INTEGER NOT NULL,
  current INTEGER DEFAULT 0,
  reward TEXT,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, milestone_id)
);

-- Reward Claims
CREATE TABLE IF NOT EXISTS reward_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id TEXT NOT NULL,
  reward_name TEXT NOT NULL,
  reward_type TEXT NOT NULL,
  reward_value TEXT NOT NULL,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- XP Transactions
CREATE TABLE IF NOT EXISTS xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  points INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Approval History
CREATE TABLE IF NOT EXISTS approval_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  risk_score DECIMAL(3,2),
  confidence_score DECIMAL(3,2),
  auto_approved BOOLEAN DEFAULT false,
  verification_required TEXT[],
  restrictions TEXT[],
  approval_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stylist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stasher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for role profiles
CREATE POLICY "Users can view their own seller profile" ON seller_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own seller profile" ON seller_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own seller profile" ON seller_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own stylist profile" ON stylist_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own stylist profile" ON stylist_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own stylist profile" ON stylist_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own stasher profile" ON stasher_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own stasher profile" ON stasher_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own stasher profile" ON stasher_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for gamification tables
CREATE POLICY "Users can view their own progress" ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON user_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own progress" ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own achievements" ON achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own achievements" ON achievements FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own achievements" ON achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own milestones" ON milestones FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own milestones" ON milestones FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own milestones" ON milestones FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own reward claims" ON reward_claims FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own reward claims" ON reward_claims FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own XP transactions" ON xp_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own XP transactions" ON xp_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own approval history" ON approval_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own approval history" ON approval_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_seller_profiles_user_id ON seller_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_stylist_profiles_user_id ON stylist_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_stasher_profiles_user_id ON stasher_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_role ON user_progress(role);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_unlocked ON achievements(unlocked);
CREATE INDEX IF NOT EXISTS idx_milestones_user_id ON milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_milestones_role ON milestones(role);
CREATE INDEX IF NOT EXISTS idx_reward_claims_user_id ON reward_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user_id ON xp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_approval_history_user_id ON approval_history(user_id);