# StreetStashed MVP: Agents and Their Roles

This document outlines the main agents in the StreetStashed MVP project, describing their purpose, key API endpoints, relevant Supabase tables and RLS (Row-Level Security) policies, and any currently missing features or TODOs.

---

## Buyer

**Purpose:**  
Buyers are users who browse and purchase items listed on the platform.

**Key API Endpoints:**

- `GET /api/items` – Browse available items
- `POST /api/orders` – Place an order
- `GET /api/orders/:id` – View order status/history

**Supabase Tables & RLS:**

- `items` – Buyers can read all active listings (RLS: public read)
- `orders` – Buyers can insert (create) and read their own orders (RLS: user_id = auth.uid())
- `users` – Read-only access to their own profile

**Missing Features / TODOs:**

- Wishlist/favorites functionality
- Enhanced order tracking (e.g., notifications)
- Buyer reviews/ratings for sellers

---

## Seller

**Purpose:**  
Sellers list items for sale and manage their inventory.

**Key API Endpoints:**

- `POST /api/items` – Create new item listing
- `PATCH /api/items/:id` – Update listing
- `GET /api/orders?seller_id=...` – View orders for their items

**Supabase Tables & RLS:**

- `items` – Sellers can insert and update their own listings (RLS: user_id = auth.uid())
- `orders` – Read orders where their item is involved (RLS: seller_id = auth.uid())
- `users` – Read/write own profile

**Missing Features / TODOs:**

- Bulk upload/editing of items
- Sales analytics/dashboard
- Automated payout integration

---

## Stylist

**Purpose:**  
Stylists provide curation, recommendations, and may manage special inventory.

**Key API Endpoints:**

- `GET /api/items/recommended` – Fetch stylist-curated items
- `POST /api/stylist/looks` – Create new curated looks or collections
- `GET /api/stylist/orders` – View orders involving their curated looks

**Supabase Tables & RLS:**

- `looks` – Stylists can create and manage their own looks (RLS: stylist_id = auth.uid())
- `items` – Read access to all items for curation
- `orders` – Read access to orders involving their looks

**Missing Features / TODOs:**

- Direct messaging between stylists and buyers
- Stylist analytics (e.g., engagement with looks)
- Commission tracking or payouts

---

## Driver

**Purpose:**  
Drivers handle pickup and delivery of items between sellers and buyers.

**Key API Endpoints:**

- `GET /api/driver/assignments` – View assigned pickups/deliveries
- `PATCH /api/driver/assignments/:id` – Update assignment status (e.g., picked up, delivered)

**Supabase Tables & RLS:**

- `assignments` – Drivers can read/update their own assignments (RLS: driver_id = auth.uid())
- `orders` – Read-only access to orders related to their assignments

**Missing Features / TODOs:**

- Route optimization
- Real-time location tracking
- Proof-of-delivery uploads (e.g., photo, signature)

---

## Admin

**Purpose:**  
Admins oversee the platform, manage users, listings, and resolve issues.

**Key API Endpoints:**

- `GET /api/admin/users` – Manage user accounts
- `GET /api/admin/items` – Moderate listings
- `GET /api/admin/orders` – View/manage all orders
- `PATCH /api/admin/settings` – Platform configuration

**Supabase Tables & RLS:**

- All tables – Full read/write access (RLS: admin role bypass)
- `logs` – Access to audit logs

**Missing Features / TODOs:**

- Automated fraud detection
- Advanced analytics dashboard
- Bulk moderation tools

---
