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
create policy "Users can view their profile"
on profiles for select
using (auth.uid() = id);

create policy "Users can update their profile"
on profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Trigger function to insert into profiles when user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'buyer'); -- default role
  return new;
end;
$$ language plpgsql security definer;

-- Trigger on auth.users
create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

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
  price numeric(10,2) not null,
  seller_id uuid not null references users(id)
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references users(id),
  product_id uuid not null references products(id),
  status text not null check (status in ('pending', 'processing', 'delivered', 'cancelled'))
);


-- Enable Row Level Security and Policies

-- USERS
alter table users enable row level security;

create policy "Users can read their own profile"
on users
for select
using (auth.uid() = id);

create policy "Users can update their own profile"
on users
for update
using (auth.uid() = id);

-- PRODUCTS
alter table products enable row level security;

create policy "Sellers can view their own products"
on products
for select
using (auth.uid() = seller_id);

create policy "Sellers can manage their own products"
on products
for all
using (auth.uid() = seller_id)
with check (auth.uid() = seller_id);

-- ORDERS
alter table orders enable row level security;

create policy "Buyers can view their own orders"
on orders
for select
using (auth.uid() = buyer_id);

create policy "Buyers can place orders"
on orders
for insert
with check (auth.uid() = buyer_id);
