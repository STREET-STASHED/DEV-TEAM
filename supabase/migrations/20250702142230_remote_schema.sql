create table "public"."bookings" (
    "id" uuid not null default gen_random_uuid(),
    "stylist_id" uuid,
    "client_id" uuid,
    "description" text,
    "date" date not null,
    "time_slot" text,
    "status" text default 'requested'::text,
    "created_at" timestamp without time zone default now()
);


alter table "public"."bookings" enable row level security;

create table "public"."deliveries" (
    "id" uuid not null default gen_random_uuid(),
    "order_id" uuid,
    "driver_id" uuid,
    "status" text default 'assigned'::text,
    "destination" text,
    "pickup_location" text,
    "scheduled_time" timestamp with time zone,
    "pay_estimate" numeric
);


alter table "public"."deliveries" enable row level security;

create table "public"."drivers" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "vehicle_type" text,
    "license_number" text,
    "delivery_radius" integer,
    "is_online" boolean default false,
    "current_lat" double precision,
    "current_lng" double precision,
    "created_at" timestamp without time zone default CURRENT_TIMESTAMP,
    "payout_method" text
);


alter table "public"."drivers" enable row level security;

create table "public"."order_items" (
    "id" uuid not null default gen_random_uuid(),
    "order_id" uuid,
    "product_id" uuid,
    "quantity" integer not null,
    "price" numeric(10,2) not null
);


alter table "public"."order_items" enable row level security;

create table "public"."orders" (
    "id" uuid not null default gen_random_uuid(),
    "buyer_id" uuid,
    "status" text default 'pending'::text,
    "total" numeric(10,2),
    "delivery_address" text,
    "created_at" timestamp without time zone default now(),
    "commission_amount" numeric,
    "support_fee" numeric,
    "delivery_fee" numeric,
    "seller_id" uuid,
    "total_price" numeric(10,2),
    "guest_id" uuid default gen_random_uuid(),
    "is_guest" boolean default false,
    "customer_type" text default 'buyer'::text,
    "product_id" uuid not null
);


alter table "public"."orders" enable row level security;

create table "public"."payouts" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "amount" numeric(10,2) not null,
    "status" text default 'pending'::text,
    "payout_method" text,
    "created_at" timestamp without time zone default now()
);


alter table "public"."payouts" enable row level security;

create table "public"."products" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "description" text,
    "image_url" text,
    "price" numeric(10,2) not null,
    "stock" integer default 0,
    "seller_id" uuid,
    "storefront_id" uuid,
    "created_at" timestamp without time zone default now()
);


alter table "public"."products" enable row level security;

create table "public"."profiles" (
    "id" uuid not null,
    "role" text not null default 'buyer'::text,
    "full_name" text,
    "created_at" timestamp with time zone default now(),
    "email" text,
    "first_name" text,
    "last_name" text
);


alter table "public"."profiles" enable row level security;

create table "public"."sellers" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "store_name" text,
    "store_description" text,
    "payout_method" text,
    "logo_url" text,
    "subscription_tier" text,
    "created_at" timestamp without time zone default CURRENT_TIMESTAMP
);


alter table "public"."sellers" enable row level security;

create table "public"."storefronts" (
    "id" uuid not null default gen_random_uuid(),
    "owner_id" uuid,
    "name" text not null,
    "description" text,
    "location" text,
    "created_at" timestamp without time zone default now(),
    "payout_method" text
);


alter table "public"."storefronts" enable row level security;

create table "public"."stylist_applications" (
    "id" uuid not null default gen_random_uuid(),
    "full_name" text not null,
    "email" text not null,
    "instagram" text,
    "city" text,
    "phone" text,
    "specialty" text,
    "portfolio_url" text,
    "bio" text,
    "booking_link" text,
    "created_at" timestamp with time zone default timezone('utc'::text, now()),
    "bundles" text,
    "specialties" text,
    "user_id" uuid
);


alter table "public"."stylist_applications" enable row level security;

create table "public"."stylists" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "specialty" text,
    "bio" text,
    "instagram" text,
    "booking_link" text,
    "created_at" timestamp without time zone default CURRENT_TIMESTAMP,
    "payout_method" text
);


alter table "public"."stylists" enable row level security;

create table "public"."users" (
    "id" uuid not null default auth.uid(),
    "email" text not null,
    "full_name" text,
    "role" text,
    "created_at" timestamp without time zone default now(),
    "is_active" boolean default true,
    "profile_image_url" text,
    "name" text,
    "details_complete" boolean default false,
    "verified" boolean default false,
    "store_name" text,
    "store_description" text,
    "vehicle_type" text,
    "license_number" text,
    "specialties" text,
    "portfolio" text,
    "onboarded" boolean default false,
    "phone" text,
    "updated_at" timestamp with time zone default now(),
    "payout_method" text,
    "referral_code" text,
    "verification_url" text,
    "has_completed_onboarding" boolean default false,
    "verification_complete" boolean default false,
    "dummy_patch" boolean default false
);


alter table "public"."users" enable row level security;

CREATE UNIQUE INDEX bookings_pkey ON public.bookings USING btree (id);

CREATE UNIQUE INDEX deliveries_pkey ON public.deliveries USING btree (id);

CREATE UNIQUE INDEX drivers_pkey ON public.drivers USING btree (id);

CREATE UNIQUE INDEX drivers_user_id_unique ON public.drivers USING btree (user_id);

CREATE UNIQUE INDEX order_items_pkey ON public.order_items USING btree (id);

CREATE INDEX orders_buyer_id_index ON public.orders USING btree (buyer_id);

CREATE UNIQUE INDEX orders_pkey ON public.orders USING btree (id);

CREATE INDEX orders_product_id_index ON public.orders USING btree (product_id);

CREATE UNIQUE INDEX payouts_pkey ON public.payouts USING btree (id);

CREATE UNIQUE INDEX products_pkey ON public.products USING btree (id);

CREATE INDEX products_seller_id_index ON public.products USING btree (seller_id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX sellers_pkey ON public.sellers USING btree (id);

CREATE UNIQUE INDEX sellers_user_id_unique ON public.sellers USING btree (user_id);

CREATE INDEX storefronts_owner_id_index ON public.storefronts USING btree (owner_id);

CREATE UNIQUE INDEX storefronts_pkey ON public.storefronts USING btree (id);

CREATE UNIQUE INDEX stylist_applications_pkey ON public.stylist_applications USING btree (id);

CREATE UNIQUE INDEX stylists_pkey ON public.stylists USING btree (id);

CREATE UNIQUE INDEX stylists_user_id_unique ON public.stylists USING btree (user_id);

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

alter table "public"."bookings" add constraint "bookings_pkey" PRIMARY KEY using index "bookings_pkey";

alter table "public"."deliveries" add constraint "deliveries_pkey" PRIMARY KEY using index "deliveries_pkey";

alter table "public"."drivers" add constraint "drivers_pkey" PRIMARY KEY using index "drivers_pkey";

alter table "public"."order_items" add constraint "order_items_pkey" PRIMARY KEY using index "order_items_pkey";

alter table "public"."orders" add constraint "orders_pkey" PRIMARY KEY using index "orders_pkey";

alter table "public"."payouts" add constraint "payouts_pkey" PRIMARY KEY using index "payouts_pkey";

alter table "public"."products" add constraint "products_pkey" PRIMARY KEY using index "products_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."sellers" add constraint "sellers_pkey" PRIMARY KEY using index "sellers_pkey";

alter table "public"."storefronts" add constraint "storefronts_pkey" PRIMARY KEY using index "storefronts_pkey";

alter table "public"."stylist_applications" add constraint "stylist_applications_pkey" PRIMARY KEY using index "stylist_applications_pkey";

alter table "public"."stylists" add constraint "stylists_pkey" PRIMARY KEY using index "stylists_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."bookings" add constraint "bookings_client_id_fkey" FOREIGN KEY (client_id) REFERENCES users(id) not valid;

alter table "public"."bookings" validate constraint "bookings_client_id_fkey";

alter table "public"."bookings" add constraint "bookings_status_check" CHECK ((status = ANY (ARRAY['requested'::text, 'confirmed'::text, 'completed'::text, 'cancelled'::text]))) not valid;

alter table "public"."bookings" validate constraint "bookings_status_check";

alter table "public"."bookings" add constraint "bookings_stylist_id_fkey" FOREIGN KEY (stylist_id) REFERENCES users(id) not valid;

alter table "public"."bookings" validate constraint "bookings_stylist_id_fkey";

alter table "public"."deliveries" add constraint "deliveries_driver_id_fkey" FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."deliveries" validate constraint "deliveries_driver_id_fkey";

alter table "public"."deliveries" add constraint "deliveries_order_id_fkey" FOREIGN KEY (order_id) REFERENCES orders(id) not valid;

alter table "public"."deliveries" validate constraint "deliveries_order_id_fkey";

alter table "public"."drivers" add constraint "drivers_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."drivers" validate constraint "drivers_user_id_fkey";

alter table "public"."drivers" add constraint "drivers_user_id_unique" UNIQUE using index "drivers_user_id_unique";

alter table "public"."order_items" add constraint "order_items_order_id_fkey" FOREIGN KEY (order_id) REFERENCES orders(id) not valid;

alter table "public"."order_items" validate constraint "order_items_order_id_fkey";

alter table "public"."order_items" add constraint "order_items_product_id_fkey" FOREIGN KEY (product_id) REFERENCES products(id) not valid;

alter table "public"."order_items" validate constraint "order_items_product_id_fkey";

alter table "public"."orders" add constraint "orders_buyer_id_fkey" FOREIGN KEY (buyer_id) REFERENCES users(id) not valid;

alter table "public"."orders" validate constraint "orders_buyer_id_fkey";

alter table "public"."orders" add constraint "orders_product_id_fkey" FOREIGN KEY (product_id) REFERENCES products(id) not valid;

alter table "public"."orders" validate constraint "orders_product_id_fkey";

alter table "public"."orders" add constraint "orders_seller_id_fkey" FOREIGN KEY (seller_id) REFERENCES auth.users(id) not valid;

alter table "public"."orders" validate constraint "orders_seller_id_fkey";

alter table "public"."orders" add constraint "orders_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'in_transit'::text, 'delivered'::text, 'cancelled'::text]))) not valid;

alter table "public"."orders" validate constraint "orders_status_check";

alter table "public"."payouts" add constraint "payouts_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'paid'::text, 'failed'::text]))) not valid;

alter table "public"."payouts" validate constraint "payouts_status_check";

alter table "public"."payouts" add constraint "payouts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."payouts" validate constraint "payouts_user_id_fkey";

alter table "public"."products" add constraint "products_seller_id_fkey" FOREIGN KEY (seller_id) REFERENCES users(id) not valid;

alter table "public"."products" validate constraint "products_seller_id_fkey";

alter table "public"."products" add constraint "products_storefront_id_fkey" FOREIGN KEY (storefront_id) REFERENCES storefronts(id) ON DELETE CASCADE not valid;

alter table "public"."products" validate constraint "products_storefront_id_fkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."sellers" add constraint "sellers_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."sellers" validate constraint "sellers_user_id_fkey";

alter table "public"."sellers" add constraint "sellers_user_id_unique" UNIQUE using index "sellers_user_id_unique";

alter table "public"."storefronts" add constraint "storefronts_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."storefronts" validate constraint "storefronts_owner_id_fkey";

alter table "public"."stylists" add constraint "stylists_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."stylists" validate constraint "stylists_user_id_fkey";

alter table "public"."stylists" add constraint "stylists_user_id_unique" UNIQUE using index "stylists_user_id_unique";

alter table "public"."users" add constraint "users_email_key" UNIQUE using index "users_email_key";

alter table "public"."users" add constraint "users_role_check" CHECK (((role = ANY (ARRAY['buyer'::text, 'seller'::text, 'stylist'::text, 'driver'::text])) OR (role IS NULL))) not valid;

alter table "public"."users" validate constraint "users_role_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_delivery_on_order()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- your logic here
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_delivery_on_order(order_id bigint, delivery_address text)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Function logic to create a delivery on an order
    INSERT INTO deliveries (order_id, address)
    VALUES (order_id, delivery_address);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_delivery_on_order(order_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
    is_guest boolean;  -- Assuming you have a way to determine if the order is from a guest
BEGIN
    -- Logic to determine if the order is from a guest
    SELECT o.is_guest INTO is_guest FROM orders o WHERE o.id = order_id;  -- Replace 'orders' with your actual orders table name

    IF is_guest THEN
        -- Logic for guest delivery
        -- You can add your specific logic here
    ELSE
        -- Logic for regular customer delivery
        -- You can add your specific logic here
    END IF;

    -- Additional logic for creating delivery can be added here

END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_delivery_on_order(order_id uuid, driver_id uuid DEFAULT NULL::uuid, status text DEFAULT 'assigned'::text, destination text DEFAULT NULL::text, pickup_location text DEFAULT NULL::text, scheduled_time timestamp with time zone DEFAULT NULL::timestamp with time zone)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
    new_delivery_id uuid;
BEGIN
    INSERT INTO deliveries (order_id, driver_id, status, destination, pickup_location, scheduled_time)
    VALUES (order_id, driver_id, status, destination, pickup_location, scheduled_time)
    RETURNING id INTO new_delivery_id;

    RETURN new_delivery_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_role_data()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- Your logic here
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    auth.uid(),
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',  -- snake_case
      NEW.raw_user_meta_data->>'fullName'     -- camelCase
    )
  );
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.new_handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  user_role text := (auth.jwt() -> 'user_metadata' ->> 'role');
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    user_role
  );
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_guest_customer_type()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    SET search_path = '';  -- Set to a specific schema if needed

    IF NEW.is_guest THEN
        NEW.customer_type := 'guest';
    ELSE
        NEW.customer_type := 'buyer';
    END IF;

    RETURN NEW;
END;
$function$
;

grant delete on table "public"."bookings" to "anon";

grant insert on table "public"."bookings" to "anon";

grant references on table "public"."bookings" to "anon";

grant select on table "public"."bookings" to "anon";

grant trigger on table "public"."bookings" to "anon";

grant truncate on table "public"."bookings" to "anon";

grant update on table "public"."bookings" to "anon";

grant delete on table "public"."bookings" to "authenticated";

grant insert on table "public"."bookings" to "authenticated";

grant references on table "public"."bookings" to "authenticated";

grant select on table "public"."bookings" to "authenticated";

grant trigger on table "public"."bookings" to "authenticated";

grant truncate on table "public"."bookings" to "authenticated";

grant update on table "public"."bookings" to "authenticated";

grant delete on table "public"."bookings" to "service_role";

grant insert on table "public"."bookings" to "service_role";

grant references on table "public"."bookings" to "service_role";

grant select on table "public"."bookings" to "service_role";

grant trigger on table "public"."bookings" to "service_role";

grant truncate on table "public"."bookings" to "service_role";

grant update on table "public"."bookings" to "service_role";

grant delete on table "public"."deliveries" to "anon";

grant insert on table "public"."deliveries" to "anon";

grant references on table "public"."deliveries" to "anon";

grant select on table "public"."deliveries" to "anon";

grant trigger on table "public"."deliveries" to "anon";

grant truncate on table "public"."deliveries" to "anon";

grant update on table "public"."deliveries" to "anon";

grant delete on table "public"."deliveries" to "authenticated";

grant insert on table "public"."deliveries" to "authenticated";

grant references on table "public"."deliveries" to "authenticated";

grant select on table "public"."deliveries" to "authenticated";

grant trigger on table "public"."deliveries" to "authenticated";

grant truncate on table "public"."deliveries" to "authenticated";

grant update on table "public"."deliveries" to "authenticated";

grant delete on table "public"."deliveries" to "service_role";

grant insert on table "public"."deliveries" to "service_role";

grant references on table "public"."deliveries" to "service_role";

grant select on table "public"."deliveries" to "service_role";

grant trigger on table "public"."deliveries" to "service_role";

grant truncate on table "public"."deliveries" to "service_role";

grant update on table "public"."deliveries" to "service_role";

grant delete on table "public"."drivers" to "anon";

grant insert on table "public"."drivers" to "anon";

grant references on table "public"."drivers" to "anon";

grant select on table "public"."drivers" to "anon";

grant trigger on table "public"."drivers" to "anon";

grant truncate on table "public"."drivers" to "anon";

grant update on table "public"."drivers" to "anon";

grant delete on table "public"."drivers" to "authenticated";

grant insert on table "public"."drivers" to "authenticated";

grant references on table "public"."drivers" to "authenticated";

grant select on table "public"."drivers" to "authenticated";

grant trigger on table "public"."drivers" to "authenticated";

grant truncate on table "public"."drivers" to "authenticated";

grant update on table "public"."drivers" to "authenticated";

grant delete on table "public"."drivers" to "service_role";

grant insert on table "public"."drivers" to "service_role";

grant references on table "public"."drivers" to "service_role";

grant select on table "public"."drivers" to "service_role";

grant trigger on table "public"."drivers" to "service_role";

grant truncate on table "public"."drivers" to "service_role";

grant update on table "public"."drivers" to "service_role";

grant delete on table "public"."order_items" to "anon";

grant insert on table "public"."order_items" to "anon";

grant references on table "public"."order_items" to "anon";

grant select on table "public"."order_items" to "anon";

grant trigger on table "public"."order_items" to "anon";

grant truncate on table "public"."order_items" to "anon";

grant update on table "public"."order_items" to "anon";

grant delete on table "public"."order_items" to "authenticated";

grant insert on table "public"."order_items" to "authenticated";

grant references on table "public"."order_items" to "authenticated";

grant select on table "public"."order_items" to "authenticated";

grant trigger on table "public"."order_items" to "authenticated";

grant truncate on table "public"."order_items" to "authenticated";

grant update on table "public"."order_items" to "authenticated";

grant delete on table "public"."order_items" to "service_role";

grant insert on table "public"."order_items" to "service_role";

grant references on table "public"."order_items" to "service_role";

grant select on table "public"."order_items" to "service_role";

grant trigger on table "public"."order_items" to "service_role";

grant truncate on table "public"."order_items" to "service_role";

grant update on table "public"."order_items" to "service_role";

grant delete on table "public"."orders" to "anon";

grant insert on table "public"."orders" to "anon";

grant references on table "public"."orders" to "anon";

grant select on table "public"."orders" to "anon";

grant trigger on table "public"."orders" to "anon";

grant truncate on table "public"."orders" to "anon";

grant update on table "public"."orders" to "anon";

grant delete on table "public"."orders" to "authenticated";

grant insert on table "public"."orders" to "authenticated";

grant references on table "public"."orders" to "authenticated";

grant select on table "public"."orders" to "authenticated";

grant trigger on table "public"."orders" to "authenticated";

grant truncate on table "public"."orders" to "authenticated";

grant update on table "public"."orders" to "authenticated";

grant delete on table "public"."orders" to "service_role";

grant insert on table "public"."orders" to "service_role";

grant references on table "public"."orders" to "service_role";

grant select on table "public"."orders" to "service_role";

grant trigger on table "public"."orders" to "service_role";

grant truncate on table "public"."orders" to "service_role";

grant update on table "public"."orders" to "service_role";

grant delete on table "public"."payouts" to "anon";

grant insert on table "public"."payouts" to "anon";

grant references on table "public"."payouts" to "anon";

grant select on table "public"."payouts" to "anon";

grant trigger on table "public"."payouts" to "anon";

grant truncate on table "public"."payouts" to "anon";

grant update on table "public"."payouts" to "anon";

grant delete on table "public"."payouts" to "authenticated";

grant insert on table "public"."payouts" to "authenticated";

grant references on table "public"."payouts" to "authenticated";

grant select on table "public"."payouts" to "authenticated";

grant trigger on table "public"."payouts" to "authenticated";

grant truncate on table "public"."payouts" to "authenticated";

grant update on table "public"."payouts" to "authenticated";

grant delete on table "public"."payouts" to "service_role";

grant insert on table "public"."payouts" to "service_role";

grant references on table "public"."payouts" to "service_role";

grant select on table "public"."payouts" to "service_role";

grant trigger on table "public"."payouts" to "service_role";

grant truncate on table "public"."payouts" to "service_role";

grant update on table "public"."payouts" to "service_role";

grant delete on table "public"."products" to "anon";

grant insert on table "public"."products" to "anon";

grant references on table "public"."products" to "anon";

grant select on table "public"."products" to "anon";

grant trigger on table "public"."products" to "anon";

grant truncate on table "public"."products" to "anon";

grant update on table "public"."products" to "anon";

grant delete on table "public"."products" to "authenticated";

grant insert on table "public"."products" to "authenticated";

grant references on table "public"."products" to "authenticated";

grant select on table "public"."products" to "authenticated";

grant trigger on table "public"."products" to "authenticated";

grant truncate on table "public"."products" to "authenticated";

grant update on table "public"."products" to "authenticated";

grant delete on table "public"."products" to "service_role";

grant insert on table "public"."products" to "service_role";

grant references on table "public"."products" to "service_role";

grant select on table "public"."products" to "service_role";

grant trigger on table "public"."products" to "service_role";

grant truncate on table "public"."products" to "service_role";

grant update on table "public"."products" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."sellers" to "anon";

grant insert on table "public"."sellers" to "anon";

grant references on table "public"."sellers" to "anon";

grant select on table "public"."sellers" to "anon";

grant trigger on table "public"."sellers" to "anon";

grant truncate on table "public"."sellers" to "anon";

grant update on table "public"."sellers" to "anon";

grant delete on table "public"."sellers" to "authenticated";

grant insert on table "public"."sellers" to "authenticated";

grant references on table "public"."sellers" to "authenticated";

grant select on table "public"."sellers" to "authenticated";

grant trigger on table "public"."sellers" to "authenticated";

grant truncate on table "public"."sellers" to "authenticated";

grant update on table "public"."sellers" to "authenticated";

grant delete on table "public"."sellers" to "service_role";

grant insert on table "public"."sellers" to "service_role";

grant references on table "public"."sellers" to "service_role";

grant select on table "public"."sellers" to "service_role";

grant trigger on table "public"."sellers" to "service_role";

grant truncate on table "public"."sellers" to "service_role";

grant update on table "public"."sellers" to "service_role";

grant delete on table "public"."storefronts" to "anon";

grant insert on table "public"."storefronts" to "anon";

grant references on table "public"."storefronts" to "anon";

grant select on table "public"."storefronts" to "anon";

grant trigger on table "public"."storefronts" to "anon";

grant truncate on table "public"."storefronts" to "anon";

grant update on table "public"."storefronts" to "anon";

grant delete on table "public"."storefronts" to "authenticated";

grant insert on table "public"."storefronts" to "authenticated";

grant references on table "public"."storefronts" to "authenticated";

grant select on table "public"."storefronts" to "authenticated";

grant trigger on table "public"."storefronts" to "authenticated";

grant truncate on table "public"."storefronts" to "authenticated";

grant update on table "public"."storefronts" to "authenticated";

grant delete on table "public"."storefronts" to "service_role";

grant insert on table "public"."storefronts" to "service_role";

grant references on table "public"."storefronts" to "service_role";

grant select on table "public"."storefronts" to "service_role";

grant trigger on table "public"."storefronts" to "service_role";

grant truncate on table "public"."storefronts" to "service_role";

grant update on table "public"."storefronts" to "service_role";

grant delete on table "public"."stylist_applications" to "anon";

grant insert on table "public"."stylist_applications" to "anon";

grant references on table "public"."stylist_applications" to "anon";

grant select on table "public"."stylist_applications" to "anon";

grant trigger on table "public"."stylist_applications" to "anon";

grant truncate on table "public"."stylist_applications" to "anon";

grant update on table "public"."stylist_applications" to "anon";

grant delete on table "public"."stylist_applications" to "authenticated";

grant insert on table "public"."stylist_applications" to "authenticated";

grant references on table "public"."stylist_applications" to "authenticated";

grant select on table "public"."stylist_applications" to "authenticated";

grant trigger on table "public"."stylist_applications" to "authenticated";

grant truncate on table "public"."stylist_applications" to "authenticated";

grant update on table "public"."stylist_applications" to "authenticated";

grant delete on table "public"."stylist_applications" to "service_role";

grant insert on table "public"."stylist_applications" to "service_role";

grant references on table "public"."stylist_applications" to "service_role";

grant select on table "public"."stylist_applications" to "service_role";

grant trigger on table "public"."stylist_applications" to "service_role";

grant truncate on table "public"."stylist_applications" to "service_role";

grant update on table "public"."stylist_applications" to "service_role";

grant delete on table "public"."stylists" to "anon";

grant insert on table "public"."stylists" to "anon";

grant references on table "public"."stylists" to "anon";

grant select on table "public"."stylists" to "anon";

grant trigger on table "public"."stylists" to "anon";

grant truncate on table "public"."stylists" to "anon";

grant update on table "public"."stylists" to "anon";

grant delete on table "public"."stylists" to "authenticated";

grant insert on table "public"."stylists" to "authenticated";

grant references on table "public"."stylists" to "authenticated";

grant select on table "public"."stylists" to "authenticated";

grant trigger on table "public"."stylists" to "authenticated";

grant truncate on table "public"."stylists" to "authenticated";

grant update on table "public"."stylists" to "authenticated";

grant delete on table "public"."stylists" to "service_role";

grant insert on table "public"."stylists" to "service_role";

grant references on table "public"."stylists" to "service_role";

grant select on table "public"."stylists" to "service_role";

grant trigger on table "public"."stylists" to "service_role";

grant truncate on table "public"."stylists" to "service_role";

grant update on table "public"."stylists" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";

create policy "Buyer access to bookings"
on "public"."bookings"
as permissive
for all
to authenticated
using ((auth.uid() = client_id))
with check ((auth.uid() = client_id));


create policy "Clients can create bookings"
on "public"."bookings"
as permissive
for insert
to public
with check ((auth.uid() = client_id));


create policy "Clients can delete own bookings"
on "public"."bookings"
as permissive
for delete
to public
using ((auth.uid() = client_id));


create policy "Clients can update/cancel own bookings"
on "public"."bookings"
as permissive
for update
to public
using ((auth.uid() = client_id));


create policy "Clients can view their bookings"
on "public"."bookings"
as permissive
for select
to public
using ((auth.uid() = client_id));


create policy "Stylist view assigned bookings"
on "public"."bookings"
as permissive
for select
to authenticated
using ((auth.uid() = stylist_id));


create policy "Drivers can create deliveries"
on "public"."deliveries"
as permissive
for insert
to public
with check ((auth.uid() = driver_id));


create policy "Drivers can delete own deliveries"
on "public"."deliveries"
as permissive
for delete
to public
using ((auth.uid() = driver_id));


create policy "Drivers can update/cancel own deliveries"
on "public"."deliveries"
as permissive
for update
to public
using ((auth.uid() = driver_id));


create policy "Drivers can view their deliveries"
on "public"."deliveries"
as permissive
for select
to public
using ((auth.uid() = driver_id));


create policy "Drivers manage their deliveries"
on "public"."deliveries"
as permissive
for all
to authenticated
using ((auth.uid() = driver_id))
with check ((auth.uid() = driver_id));


create policy "Allow driver to insert own profile"
on "public"."drivers"
as permissive
for insert
to authenticated
with check ((user_id = auth.uid()));


create policy "Drivers can create their profiles"
on "public"."drivers"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Drivers can delete their profiles"
on "public"."drivers"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Drivers can update their profiles"
on "public"."drivers"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Drivers can view their profiles"
on "public"."drivers"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "select_drivers"
on "public"."drivers"
as permissive
for select
to public
using ((auth.uid() IS NOT NULL));


create policy "Authenticated delete order_items"
on "public"."order_items"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = order_items.order_id) AND (orders.buyer_id = auth.uid())))));


create policy "Authenticated insert order_items"
on "public"."order_items"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = order_items.order_id) AND (orders.buyer_id = auth.uid())))));


create policy "Authenticated read order_items"
on "public"."order_items"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = order_items.order_id) AND (orders.buyer_id = auth.uid())))));


create policy "Authenticated update order_items"
on "public"."order_items"
as permissive
for update
to authenticated
using ((EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = order_items.order_id) AND (orders.buyer_id = auth.uid())))))
with check ((EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = order_items.order_id) AND (orders.buyer_id = auth.uid())))));


create policy "Authenticated users can create order items"
on "public"."order_items"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = order_items.order_id) AND (orders.buyer_id = auth.uid())))));


create policy "Authenticated users can delete their order items"
on "public"."order_items"
as permissive
for delete
to public
using ((EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = order_items.order_id) AND (orders.buyer_id = auth.uid())))));


create policy "Authenticated users can update their order items"
on "public"."order_items"
as permissive
for update
to public
using ((EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = order_items.order_id) AND (orders.buyer_id = auth.uid())))));


create policy "Authenticated users can view their order items"
on "public"."order_items"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM orders
  WHERE ((orders.id = order_items.order_id) AND (orders.buyer_id = auth.uid())))));


create policy "Allow guest and buyer order inserts"
on "public"."orders"
as permissive
for insert
to public
with check (((auth.role() = 'authenticated'::text) OR ((buyer_id IS NULL) AND (guest_id IS NOT NULL) AND (is_guest = true))));


create policy "Allow guests and buyers to insert orders"
on "public"."orders"
as permissive
for insert
to public
with check (((auth.role() = 'authenticated'::text) OR (buyer_id IS NULL)));


create policy "Anonymous users can place orders"
on "public"."orders"
as permissive
for insert
to anon
with check (true);


create policy "Buyers can create orders"
on "public"."orders"
as permissive
for insert
to public
with check ((auth.uid() = buyer_id));


create policy "Buyers can delete own orders"
on "public"."orders"
as permissive
for delete
to public
using ((auth.uid() = buyer_id));


create policy "Buyers can place orders"
on "public"."orders"
as permissive
for insert
to authenticated
with check ((auth.uid() = buyer_id));


create policy "Buyers can update/cancel own orders"
on "public"."orders"
as permissive
for update
to public
using ((auth.uid() = buyer_id));


create policy "Buyers can view their orders"
on "public"."orders"
as permissive
for select
to public
using ((auth.uid() = buyer_id));


create policy "Buyers can view their own orders"
on "public"."orders"
as permissive
for select
to authenticated
using ((auth.uid() = buyer_id));


create policy "Guest users can place orders"
on "public"."orders"
as permissive
for insert
to anon
with check (true);


create policy "Authenticated read/write payouts"
on "public"."payouts"
as permissive
for all
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


create policy "Users can create payouts"
on "public"."payouts"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can delete their payouts"
on "public"."payouts"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Users can update their payouts"
on "public"."payouts"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Users can view their payouts"
on "public"."payouts"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "Public read of products"
on "public"."products"
as permissive
for select
to public
using (true);


create policy "Sellers can manage their products"
on "public"."products"
as permissive
for all
to public
using ((auth.uid() = seller_id))
with check ((auth.uid() = seller_id));


create policy "Sellers can read their products"
on "public"."products"
as permissive
for select
to public
using ((auth.uid() = seller_id));


create policy "Allow buyer to insert own profile"
on "public"."profiles"
as permissive
for insert
to authenticated
with check ((id = auth.uid()));


create policy "Authenticated users can delete their own profile"
on "public"."profiles"
as permissive
for delete
to authenticated
using ((( SELECT auth.uid() AS uid) = id));


create policy "Authenticated users can insert their own profile"
on "public"."profiles"
as permissive
for insert
to authenticated
with check ((( SELECT auth.uid() AS uid) = id));


create policy "Authenticated users can select their own profile"
on "public"."profiles"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = id));


create policy "Authenticated users can update their own profile"
on "public"."profiles"
as permissive
for update
to authenticated
using ((( SELECT auth.uid() AS uid) = id))
with check ((( SELECT auth.uid() AS uid) = id));


create policy "Allow seller to insert own profile"
on "public"."sellers"
as permissive
for insert
to authenticated
with check ((user_id = auth.uid()));


create policy "Sellers can create their profiles"
on "public"."sellers"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Sellers can delete their profiles"
on "public"."sellers"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "Sellers can update their profiles"
on "public"."sellers"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Sellers can view their profiles"
on "public"."sellers"
as permissive
for select
to public
using ((auth.uid() = user_id));


create policy "select_own_sellers"
on "public"."sellers"
as permissive
for select
to public
using ((user_id = auth.uid()));


create policy "Public read of storefronts"
on "public"."storefronts"
as permissive
for select
to public
using (true);


create policy "Storefront owners can create storefronts"
on "public"."storefronts"
as permissive
for insert
to public
with check ((auth.uid() = owner_id));


create policy "Storefront owners can delete their storefronts"
on "public"."storefronts"
as permissive
for delete
to public
using ((auth.uid() = owner_id));


create policy "Storefront owners can update their storefronts"
on "public"."storefronts"
as permissive
for update
to public
using ((auth.uid() = owner_id));


create policy "Storefront owners can view their storefronts"
on "public"."storefronts"
as permissive
for select
to public
using ((auth.uid() = owner_id));


create policy "Allow own inserts"
on "public"."stylist_applications"
as permissive
for insert
to authenticated
with check ((user_id = auth.uid()));


create policy "Allow stylist to insert own application"
on "public"."stylist_applications"
as permissive
for insert
to authenticated
with check ((user_id = auth.uid()));


create policy "Authenticated users can apply (insert)"
on "public"."stylist_applications"
as permissive
for insert
to authenticated
with check (true);


create policy "Public can read all stylist applications"
on "public"."stylist_applications"
as permissive
for select
to public
using (true);


create policy "Allow insert of stylist applications"
on "public"."stylists"
as permissive
for insert
to authenticated
with check ((auth.uid() = user_id));


create policy "Allow user insert own stylist"
on "public"."stylists"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Allow user update own stylist"
on "public"."stylists"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Authenticated stylist access only"
on "public"."stylists"
as permissive
for all
to authenticated
using ((auth.uid() = user_id));


create policy "Authenticated users can insert their own stylist row"
on "public"."stylists"
as permissive
for insert
to public
with check ((user_id = auth.uid()));


create policy "Only authenticated can access stylists"
on "public"."stylists"
as permissive
for all
to authenticated
using ((auth.uid() = user_id));


create policy "Public read of stylist profiles"
on "public"."stylists"
as permissive
for select
to public
using (true);


create policy "Stylists can update their profile"
on "public"."stylists"
as permissive
for update
to authenticated
using ((auth.uid() = user_id));


create policy "delete_stylist"
on "public"."stylists"
as permissive
for delete
to public
using ((user_id = auth.uid()));


create policy "insert_stylist"
on "public"."stylists"
as permissive
for insert
to public
with check ((user_id = auth.uid()));


create policy "select_stylist"
on "public"."stylists"
as permissive
for select
to public
using ((user_id = auth.uid()));


create policy "update_stylist"
on "public"."stylists"
as permissive
for update
to public
using ((user_id = auth.uid()));


create policy "Allow users to insert their own profile"
on "public"."users"
as permissive
for insert
to authenticated
with check ((auth.uid() = id));


create policy "Authenticated users can delete own record"
on "public"."users"
as permissive
for delete
to authenticated
using ((auth.uid() = id));


create policy "Authenticated users can insert own record"
on "public"."users"
as permissive
for insert
to authenticated
with check ((auth.uid() = id));


create policy "Authenticated users can select own record"
on "public"."users"
as permissive
for select
to authenticated
using ((auth.uid() = id));


create policy "Authenticated users can update own record"
on "public"."users"
as permissive
for update
to authenticated
using ((auth.uid() = id))
with check ((auth.uid() = id));


create policy "Delete own profile"
on "public"."users"
as permissive
for delete
to public
using ((auth.uid() = id));


create policy "Insert own profile"
on "public"."users"
as permissive
for insert
to public
with check ((auth.uid() = id));


create policy "Select own profile"
on "public"."users"
as permissive
for select
to public
using ((auth.uid() = id));


create policy "Update own profile"
on "public"."users"
as permissive
for update
to public
using ((auth.uid() = id))
with check ((auth.uid() = id));


CREATE TRIGGER trigger_set_guest_customer_type BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION set_guest_customer_type();


