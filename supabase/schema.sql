
-- USERS
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text unique,
  role text check (role in ('buyer', 'seller', 'stylist', 'driver'))
);

-- PRODUCTS
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text,
  price numeric,
  seller_id uuid references users(id)
);

-- ORDERS
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references users(id),
  product_id uuid references products(id),
  status text
);
