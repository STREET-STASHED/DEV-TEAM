# 🏗️ StreetStashed MVP - Complete Repository Walkthrough

**A Comprehensive Guide for Developers**

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack & Core Dependencies](#tech-stack--core-dependencies)
3. [Architecture Overview](#architecture-overview)
4. [Folder Structure Deep Dive](#folder-structure-deep-dive)
5. [Key Patterns & Conventions](#key-patterns--conventions)
6. [Database & Data Layer](#database--data-layer)
7. [Authentication & Authorization](#authentication--authorization)
8. [API Routes Architecture](#api-routes-architecture)
9. [State Management](#state-management)
10. [UI Components & Styling](#ui-components--styling)
11. [Development Workflow](#development-workflow)
12. [Getting Started Guide](#getting-started-guide)

---

## 🎯 Project Overview

**StreetStashed** is a multi-role marketplace platform connecting:
- **Buyers** - Shop for streetwear from local stores
- **Sellers** - List and manage products
- **Stylists** - Provide styling services and curation
- **Drivers** - Handle same-day delivery

### Key Features
- Multi-tenant role-based architecture
- Real-time order tracking
- AI-powered recommendations
- Same-day delivery system
- AR virtual try-on
- Social features & gamification
- Blockchain rewards system

---

## 🛠️ Tech Stack & Core Dependencies

### Core Framework
- **Next.js 15.5.2** - React framework with App Router
- **React 19.1.1** - UI library
- **TypeScript 5.9.2** - Type safety

### Backend & Database
- **Supabase** - Backend-as-a-Service (Auth, Database, Storage)
  - `@supabase/supabase-js` - Client library
  - `@supabase/ssr` - Server-side rendering support
- **PostgreSQL** - Database (via Supabase)

### Payment Processing
- **Stripe 18.5.0** - Payment processing
  - `@stripe/stripe-js` - Client SDK

### UI & Styling
- **Tailwind CSS 4.1.13** - Utility-first CSS
- **shadcn/ui** - Component library (Radix UI based)
- **Radix UI** - Headless UI primitives
  - `@radix-ui/react-avatar`
  - `@radix-ui/react-progress`
  - `@radix-ui/react-tabs`
- **Framer Motion 12.23.12** - Animations
- **Lucide React** - Icons
- **Heroicons** - Additional icons

### Forms & Validation
- **React Hook Form 7.62.0** - Form management
- **Zod 4.1.5** - Schema validation
- **@hookform/resolvers** - Form validation integration

### Real-time & WebSockets
- **Socket.io 4.8.1** - Real-time communication

### Maps & Location
- **@googlemaps/js-api-loader** - Google Maps integration

### Push Notifications
- **Firebase 12.2.1** - Push notifications
- **firebase-admin** - Server-side Firebase

### Caching & Performance
- **ioredis 5.7.0** - Redis client (optional)

### Mobile (Capacitor)
- **@capacitor/cli** - Native mobile app wrapper

### Testing
- **Jest 30.1.3** - Unit testing
- **Playwright** - E2E testing
- **@testing-library/jest-dom** - React testing utilities

### Development Tools
- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript linting
- **pnpm** - Package manager (required)

---

## 🏛️ Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js App Router                    │
│  (Server Components + Client Components + API Routes)    │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                   │                 │
        ▼                   ▼                 ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   Supabase   │   │    Stripe    │   │  Firebase    │
│  (Database,  │   │  (Payments)  │   │  (Push Notif) │
│    Auth,     │   │              │   │              │
│   Storage)   │   │              │   │              │
└──────────────┘   └──────────────┘   └──────────────┘
```

### Architecture Patterns

1. **Route Groups** - Organize routes by role without affecting URLs
2. **Server Components** - Default rendering on server
3. **Client Components** - Marked with `'use client'` for interactivity
4. **API Routes** - RESTful endpoints in `app/api/`
5. **Context Providers** - Global state management
6. **Custom Hooks** - Reusable logic

---

## 📁 Folder Structure Deep Dive

### Root Level

```
/
├── app/                    # Next.js App Router (pages, layouts, API routes)
├── components/            # React components (organized by feature)
├── context/               # React Context providers
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions, business logic
├── types/                 # TypeScript type definitions
├── styles/                # Global CSS and Tailwind config
├── public/                # Static assets
├── supabase/              # Database migrations and config
├── tests/                 # E2E tests
├── __tests__/             # Unit tests
└── scripts/               # Build and utility scripts
```

### `/app` - Application Routes

```
app/
├── (auth)/                # Route group: Authentication pages
│   ├── layout.tsx         # Auth-specific layout
│   ├── login/
│   └── signup/
│
├── (seller)/              # Route group: Seller dashboard
│   ├── layout.tsx         # Seller layout with SellerHeader
│   ├── SellerHeader.tsx
│   ├── seller-dashboard/
│   ├── advanced-dashboard/
│   └── upload/
│
├── (stylist)/             # Route group: Stylist dashboard
│   ├── layout.tsx         # Stylist layout with StylistHeader
│   ├── StylistHeader.tsx
│   ├── dashboard/
│   └── curation/
│
├── (driver)/               # Route group: Driver dashboard
│   └── driver-dashboard/
│
├── buyer/                 # Buyer section (no route group = appears in URL)
│   ├── layout.tsx         # Buyer layout with BuyerHeader
│   ├── BuyerHeader.tsx
│   ├── dashboard/
│   ├── marketplace/
│   ├── checkout/
│   └── orders/
│
├── api/                   # API Routes (REST endpoints)
│   ├── auth/
│   ├── cart/
│   ├── orders/
│   ├── products/
│   ├── driver/
│   ├── seller/
│   ├── stylist/
│   └── ...
│
├── admin/                 # Admin dashboard
├── ai-stylist/            # AI styling feature
├── ar-tryon/              # AR virtual try-on
├── blockchain-rewards/    # Blockchain rewards
├── onboarding/           # User onboarding
└── layout.tsx             # Root layout (wraps everything)
```

**Key Concept: Route Groups**
- Folders wrapped in parentheses `(auth)` don't appear in URLs
- `app/(auth)/login/page.tsx` → `/login` (not `/auth/login`)
- Allows shared layouts without URL nesting

### `/components` - React Components

```
components/
├── ui/                    # shadcn/ui base components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   └── ...
│
├── admin/                 # Admin-specific components
├── ai/                    # AI features
├── analytics/             # Analytics components
├── ar/                    # AR/VR components
├── checkout/              # Checkout flow
├── orders/                # Order management
├── seller/                # Seller dashboard components
├── stylist/               # Stylist components
├── social/                # Social features
├── rewards/               # Rewards system
└── ...
```

**Organization Pattern**: Feature-based, not type-based

### `/lib` - Business Logic & Utilities

```
lib/
├── supabase/              # Supabase client setup
│   ├── clients.ts         # Client factory functions
│   ├── typed.ts           # Type helpers
│   └── database.types.ts  # Generated types
│
├── ai/                    # AI/ML features
│   ├── recommendations.ts
│   ├── styleCreator.ts
│   └── stylistPersonality.ts
│
├── analytics/             # Analytics & monitoring
├── ar-vr/                 # AR/VR functionality
├── blockchain/            # Blockchain integration
├── brand/                 # Brand management
├── delivery/              # Delivery & logistics
├── fees.ts                # Fee calculation
├── orders.ts              # Order management
├── personalization/       # User personalization
├── onboarding/           # Onboarding system
├── config.ts              # App configuration
├── utils.ts               # General utilities
└── ...
```

### `/context` - Global State

```
context/
├── AuthContext.tsx         # Authentication state
├── CartContext.tsx        # Shopping cart state
├── WishlistContext.tsx    # Wishlist state
├── NotificationsContext.tsx # Notifications
└── SupabaseContext.tsx    # Supabase client context
```

### `/hooks` - Custom Hooks

```
hooks/
├── useAuth.ts             # Auth hook (from AuthContext)
├── useCart.ts             # Cart hook (from CartContext)
├── useSupabase.tsx        # Supabase client hook
├── useAIRecommendations.ts # AI recommendations
├── useGPSTracking.ts      # GPS/location tracking
├── useWebSocket.ts        # WebSocket connection
└── useDebounce.ts         # Debounce utility
```

---

## 🎨 Key Patterns & Conventions

### 1. File Naming
- **Components**: PascalCase (`UserProfile.tsx`)
- **Utilities**: camelCase (`utils.ts`, `feeConfig.ts`)
- **Types**: camelCase (`types.ts`, `cart.ts`)
- **API Routes**: `route.ts` (Next.js convention)

### 2. Component Structure

```typescript
// Server Component (default)
export default function ComponentName() {
  // Server-side logic
  return <div>...</div>
}

// Client Component
'use client'
export default function ComponentName() {
  // Client-side logic, hooks, state
  return <div>...</div>
}
```

### 3. TypeScript Path Aliases

Configured in `tsconfig.json`:
```typescript
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { createSupabaseServer } from '@/lib/supabase/clients'
```

### 4. Database Access Pattern

```typescript
// Server Component
import { createSupabaseServer } from '@/lib/supabase/clients'

export default async function Page() {
  const supabase = await createSupabaseServer()
  const { data } = await supabase.from('items').select('*')
  return <div>{/* render data */}</div>
}

// Client Component
'use client'
import { createSupabaseBrowser } from '@/app/lib/supabase/browser'

export default function Component() {
  const supabase = createSupabaseBrowser()
  // Use in useEffect, event handlers, etc.
}
```

### 5. API Route Pattern

```typescript
// app/api/items/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/clients'

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServer()
  const { data, error } = await supabase.from('items').select('*')
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ data })
}
```

---

## 🗄️ Database & Data Layer

### Database: Supabase (PostgreSQL)

**Location**: `supabase/`
- `schema.sql` - Base schema
- `migrations/` - Versioned migrations
- `config.toml` - Supabase configuration

### Key Tables

```sql
profiles          # User profiles (extends auth.users)
items             # Marketplace products
orders            # Customer orders
reviews            # Product reviews
wishlist           # User wishlists
disputes           # Order disputes
referrals          # Referral system
rewards            # Rewards/points
```

### Database Access

**Server Components & API Routes**:
```typescript
import { createSupabaseServer } from '@/lib/supabase/clients'
const supabase = await createSupabaseServer()
```

**Client Components**:
```typescript
import { createSupabaseBrowser } from '@/app/lib/supabase/browser'
const supabase = createSupabaseBrowser()
```

### Row Level Security (RLS)

All tables have RLS enabled. Policies defined in migrations.

---

## 🔐 Authentication & Authorization

### Auth Provider: Supabase Auth

**Context**: `context/AuthContext.tsx`

### Usage

```typescript
'use client'
import { useAuth } from '@/context/AuthContext'

export default function Component() {
  const { 
    user, 
    profile, 
    isAuthenticated, 
    userRole,
    signIn, 
    signOut 
  } = useAuth()
  
  if (!isAuthenticated) {
    return <div>Please sign in</div>
  }
  
  return <div>Welcome, {profile?.full_name}</div>
}
```

### Role-Based Access

```typescript
const { isSeller, isBuyer, isDriver, isAdmin } = useAuth()

if (isSeller) {
  // Seller-only content
}
```

### Protected Routes

Middleware in `middleware.ts` handles route protection:
- Admin routes require authentication
- Guest users can access most pages
- Role checks happen in API routes

---

## 🌐 API Routes Architecture

### Structure

All API routes in `app/api/` follow RESTful conventions:

```
app/api/
├── auth/              # Authentication
│   ├── signup/route.ts
│   ├── signout/route.ts
│   └── status/route.ts
│
├── cart/route.ts      # Shopping cart
├── orders/            # Order management
│   ├── route.ts       # GET, POST /api/orders
│   └── [orderId]/     # Dynamic routes
│       └── tracking/route.ts
│
├── driver/            # Driver endpoints
├── seller/            # Seller endpoints
├── stylist/           # Stylist endpoints
└── ...
```

### API Route Pattern

```typescript
// app/api/items/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/clients'

export const runtime = 'nodejs' // or 'edge'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer()
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('active', true)
    
    if (error) throw error
    
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    )
  }
}
```

### Authentication in API Routes

```typescript
const supabase = await createSupabaseServer()
const { data: { user } } = await supabase.auth.getUser()

if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

---

## 🎯 State Management

### Context API (Primary Pattern)

**Global State Providers**:
1. `AuthContext` - User authentication
2. `CartContext` - Shopping cart
3. `WishlistContext` - Wishlist items
4. `NotificationsContext` - Notifications
5. `SupabaseContext` - Supabase client

### Usage Pattern

```typescript
'use client'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'

export default function Component() {
  const { items, addItem, totalPrice } = useCart()
  const { user } = useAuth()
  
  // Component logic
}
```

### Local State

- Use `useState` for component-specific state
- Use `useReducer` for complex local state

### Server State

- Server Components fetch data directly
- No need for React Query (Next.js handles caching)

---

## 🎨 UI Components & Styling

### Component Library: shadcn/ui

**Configuration**: `components.json`

**Base Components** (in `components/ui/`):
- Button, Card, Input, Select, etc.
- Built on Radix UI primitives
- Fully customizable with Tailwind

### Styling: Tailwind CSS 4

**Config**: `tailwind.config.js`

**Custom Colors**:
- `brand.*` - StreetStashed brand colors
- `ink.*` - Neutral grays
- `success.*`, `warning.*`, `error.*` - Status colors

**Usage**:
```tsx
<div className="bg-black text-white p-4 rounded-lg">
  <button className="bg-brand-500 hover:bg-brand-600">
    Click me
  </button>
</div>
```

### Icons

- **Lucide React** - Primary icon library
- **Heroicons** - Additional icons

---

## 🔄 Development Workflow

### Package Manager: pnpm

**Required**: Use `pnpm`, not `npm` or `yarn`

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm lint             # Run ESLint
pnpm test             # Run tests
```

### Environment Variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_key
STRIPE_SECRET_KEY=your_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key

# App
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

### Development Server

```bash
pnpm dev              # http://localhost:3000
pnpm dev:https        # HTTPS version
```

### Testing

```bash
pnpm test             # Unit tests (Jest)
pnpm test:watch       # Watch mode
pnpm e2e              # E2E tests (Playwright)
```

### Code Quality

```bash
pnpm lint             # Check for issues
pnpm lint:fix         # Auto-fix issues
pnpm type-check       # TypeScript validation
```

---

## 🚀 Getting Started Guide

### Prerequisites

1. **Node.js** 18+ 
2. **pnpm** 8+
3. **Supabase Account** (for database/auth)
4. **Stripe Account** (for payments)
5. **Google Maps API Key** (for location features)

### Step 1: Clone & Install

```bash
git clone <repository-url>
cd streetstashed-mvp
pnpm install
```

### Step 2: Environment Setup

1. Copy `.env.example` to `.env.local`
2. Fill in all required environment variables
3. Get Supabase credentials from your project dashboard

### Step 3: Database Setup

```bash
# Option A: Use Supabase CLI (if available)
supabase db reset

# Option B: Manual setup
# 1. Go to Supabase Dashboard → SQL Editor
# 2. Run migrations from supabase/migrations/
```

### Step 4: Start Development

```bash
pnpm dev
```

Visit `http://localhost:3000`

### Step 5: Explore the Codebase

**Recommended Starting Points**:

1. **Root Layout**: `app/layout.tsx`
   - See how providers are set up
   - Understand the app structure

2. **Homepage**: `app/page.tsx`
   - Entry point of the application

3. **Auth Flow**: `app/(auth)/login/page.tsx`
   - See authentication in action

4. **Marketplace**: `app/buyer/marketplace/page.tsx`
   - Main shopping experience

5. **API Example**: `app/api/items/route.ts`
   - See how API routes work

6. **Component Example**: `components/ui/button.tsx`
   - Understand component structure

### Step 6: Test Pages

- `/test-phases` - Component testing interface
- `/test-onboarding` - Onboarding system test

---

## 📚 Key Documentation Files

- `ONBOARDING_SYSTEM.md` - Onboarding system details
- `INTEGRATION_COMPLETE.md` - Phase 3 & 4 integration
- `DATABASE_SETUP.md` - Database setup guide
- `PHASE_INTEGRATION_GUIDE.md` - Component integration
- `STRIPE_PRODUCTION_SETUP.md` - Payment setup
- `VERCEL_ENVIRONMENT_VARIABLES.md` - Deployment config

---

## 🎓 Learning Path for New Developers

### Week 1: Foundation
1. Understand Next.js App Router
2. Learn Supabase basics
3. Explore the folder structure
4. Set up local development

### Week 2: Core Features
1. Study authentication flow
2. Understand cart system
3. Learn API route patterns
4. Explore component library

### Week 3: Advanced Features
1. Real-time features (WebSockets)
2. Payment integration (Stripe)
3. AI recommendations
4. Delivery system

### Week 4: Specialized Areas
1. AR/VR features
2. Blockchain rewards
3. Analytics & monitoring
4. Performance optimization

---

## 🆘 Common Issues & Solutions

### Issue: "Module not found"
**Solution**: Run `pnpm install` to ensure all dependencies are installed

### Issue: Supabase connection errors
**Solution**: Check `.env.local` has correct Supabase credentials

### Issue: TypeScript errors
**Solution**: Run `pnpm type-check` to see detailed errors

### Issue: Build fails
**Solution**: Check `next.config.mjs` for configuration issues

---

## 📞 Support & Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com

---

## 🎯 Next Steps

1. **Read this guide thoroughly**
2. **Set up your development environment**
3. **Explore the test pages** (`/test-phases`, `/test-onboarding`)
4. **Pick a feature to work on**
5. **Ask questions in team channels**

---

**Happy Coding! 🚀**

