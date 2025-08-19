# StreetStashed Viral Features System

This document describes the comprehensive viral features system implemented for StreetStashed, designed to increase user engagement and drive organic growth.

## 🚀 Overview

The viral features system includes:

- **Reviews & Ratings**: User-generated content for sellers, stylists, and drivers
- **Social Sharing**: Deep link generation and native sharing capabilities
- **Referral Leaderboard**: Gamified referral system with rankings
- **Push Notifications**: Cross-platform notification system
- **Analytics**: User behavior tracking and insights

## 🔧 Feature Flags

All features are controlled by environment variables for safe deployment:

```bash
# Engagement & Virality Features
ENABLE_PUSH=true
ENABLE_REVIEWS=true
ENABLE_SHARE=true
ENABLE_LEADERBOARD=true
ENABLE_DEEP_LINKS=true
ENABLE_ANALYTICS=true

# Push Providers (choose one)
NEXT_PUBLIC_ONESIGNAL_APP_ID=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=
ONESIGNAL_REST_API_KEY=

# Base URLs
NEXT_PUBLIC_BASE_URL=https://streetstashed.com
NEXT_PUBLIC_FALLBACK_URL=https://streetstashed.com
```

## 📊 Reviews & Ratings System

### Database Schema

```sql
-- reviews table
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  reviewer_id uuid not null references profiles(user_id) on delete cascade,
  subject_type text not null check (subject_type in ('seller','stylist','driver')),
  subject_id uuid not null, -- FK to profiles(user_id)
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

-- Helper functions
get_average_rating(subject_type, subject_id)
get_review_count(subject_type, subject_id)
```

### API Endpoints

- `POST /api/reviews` - Create a review
- `GET /api/reviews` - List reviews with pagination

### Usage

```tsx
import ReviewDisplay from "@/components/viral/ReviewDisplay";

// Show reviews for a seller
<ReviewDisplay
  subjectType="seller"
  subjectId="seller-uuid"
  showForm={true}
  onReviewSubmit={() => console.log("Review submitted!")}
/>;
```

### Features

- ⭐ 1-5 star rating system
- 💬 Optional comments (max 500 characters)
- 🔒 RLS policies ensure users can only review their own orders
- 📱 Responsive design with loading states
- 🔄 Pagination support

## 🔗 Social Sharing System

### Deep Link Generation

```tsx
import { generateUniversalLink, shareContent } from "@/lib/deeplink";

// Generate a shareable link
const shareUrl = generateUniversalLink({
  type: "product",
  id: "product-uuid",
  platform: "web",
});

// Share content
await shareContent({
  title: "Check this out!",
  text: "Amazing product on StreetStashed",
  url: shareUrl,
});
```

### Components

```tsx
import ShareButton from '@/components/viral/ShareButton';

// Full button
<ShareButton
  type="product"
  id="product-uuid"
  title="Amazing product!"
  variant="default"
  size="md"
/>

// Icon-only button
<QuickShareButton
  type="storefront"
  id="store-uuid"
  title="Great store!"
/>
```

### Features

- 🌐 Universal links (web + mobile)
- 📱 Native sharing on mobile devices
- 📋 Clipboard fallback on web
- 🎨 Multiple button variants and sizes
- ⚡ Automatic platform detection

## 🏆 Referral Leaderboard

### Database Schema

```sql
-- Materialized view for performance
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

-- Refresh function
refresh_referral_leaderboard()
```

### API Endpoints

- `GET /api/leaderboard/referrals` - Get leaderboard data
- `POST /api/leaderboard/referrals` - Refresh leaderboard (admin only)

### Usage

```tsx
import ReferralLeaderboard from "@/components/viral/ReferralLeaderboard";

<ReferralLeaderboard />;
```

### Features

- 🏅 Top 50 referrers with rankings
- 📊 Referral counts and completion rates
- 🔄 Materialized view for performance
- 📱 Responsive design with loading states
- 🔄 Pagination support

## 🔔 Push Notifications

### System Architecture

```tsx
import { registerToken, sendToUser } from "@/lib/push";

// Register user token
await registerToken(userId, token, "web");

// Send notification
await sendToUser(userId, {
  title: "Order Update",
  body: "Your order has been delivered!",
  data: { orderId: "123" },
});
```

### Supported Providers

1. **OneSignal** (recommended)
   - Easy setup
   - Cross-platform support
   - Rich analytics

2. **Firebase Cloud Messaging**
   - Google ecosystem integration
   - Advanced targeting
   - Free tier available

### Features

- 🔌 Provider-agnostic implementation
- 📱 Cross-platform support (web, iOS, Android)
- 🛡️ Graceful fallback without provider keys
- 🧹 Automatic token cleanup (30-day inactivity)
- 📊 Bulk notification support

## 📈 Analytics System

### Event Tracking

```tsx
import { track, trackPageView, trackConversion } from "@/lib/analytics";

// Track custom events
track("view_product", { productId: "123", category: "sneakers" });

// Track page views
trackPageView("/marketplace");

// Track conversions
trackConversion("purchase", 99.99, { productId: "123" });
```

### Tracked Events

- `view_product` - Product page views
- `add_to_cart` - Cart additions
- `checkout_started` - Checkout initiation
- `order_completed` - Successful orders
- `share_clicked` - Share button clicks
- `review_submitted` - Review submissions
- `referral_created` - New referrals
- `leaderboard_viewed` - Leaderboard views

### Features

- 📊 Session-based tracking
- 🔄 Batch processing for performance
- 🗄️ Supabase storage backend
- 🧹 Automatic data cleanup (90-day retention)
- 📈 Admin dashboard integration

## 🎨 UI Components

### Component Library

All viral feature components are located in `components/viral/`:

- `ReviewForm.tsx` - Review submission form
- `ReviewDisplay.tsx` - Reviews list with pagination
- `ShareButton.tsx` - Social sharing buttons
- `ReferralLeaderboard.tsx` - Leaderboard display

### Design System

- **Colors**: Black & Gold theme (brand colors)
- **Typography**: Consistent with existing design
- **Spacing**: Tailwind CSS spacing scale
- **Responsive**: Mobile-first design approach
- **Accessibility**: ARIA labels and keyboard navigation

## 🧪 Testing

### Unit Tests

```bash
# Run all viral feature tests
pnpm test __tests__/viral/

# Run specific test file
pnpm test __tests__/viral/schemas.test.ts
```

### Test Coverage

- ✅ Zod validation schemas
- ✅ Component rendering
- ✅ API endpoint validation
- ✅ Feature flag behavior
- ✅ Error handling

## 🚀 Deployment

### 1. Environment Setup

```bash
# Copy and configure environment variables
cp .env.example .env.local

# Set feature flags
ENABLE_REVIEWS=true
ENABLE_SHARE=true
ENABLE_LEADERBOARD=true
ENABLE_PUSH=true
ENABLE_ANALYTICS=true
```

### 2. Database Migration

```bash
# Apply viral features migration
supabase db push

# Verify tables created
supabase db inspect --table reviews
supabase db inspect --table referral_leaderboard
```

### 3. Build and Deploy

```bash
# Build application
pnpm build

# Start production server
pnpm start
```

## 🔒 Security Considerations

### Row Level Security (RLS)

- Users can only review their own orders
- Push tokens are user-scoped
- Analytics events respect user privacy
- Leaderboard data is publicly readable

### Rate Limiting

- Reviews: 5 per minute per user
- Leaderboard: 30 requests per minute per IP
- Push subscriptions: 10 per minute per user
- Share links: 20 per minute per user

### Data Validation

- Zod schemas for all inputs
- SQL injection prevention
- XSS protection
- Input sanitization

## 📱 Mobile Integration

### Capacitor Support

- Deep link handling for mobile apps
- Native sharing integration
- Push notification tokens
- Platform-specific optimizations

### App Links

- `streetstashed://product/:id`
- `streetstashed://storefront/:id`
- `streetstashed://bundle/:id`

## 🔄 Rollback Procedures

### Quick Disable

```bash
# Disable all viral features
ENABLE_PUSH=false
ENABLE_REVIEWS=false
ENABLE_SHARE=false
ENABLE_LEADERBOARD=false
ENABLE_DEEP_LINKS=false
ENABLE_ANALYTICS=false

# Restart application
pnpm build && pnpm start
```

### Database Rollback

```bash
# Revert migration
supabase db reset

# Or manually drop tables
DROP TABLE IF EXISTS reviews CASCADE;
DROP MATERIALIZED VIEW IF EXISTS referral_leaderboard;
```

## 📊 Performance Monitoring

### Key Metrics

- API response times
- Database query performance
- Materialized view refresh times
- Push notification delivery rates
- Analytics event processing

### Alerts

- Error rates > 5%
- Response times > 2s
- Database connection failures
- High memory/CPU usage

## 🎯 Future Enhancements

### Planned Features

- **Review Moderation**: Admin review approval system
- **Advanced Analytics**: Cohort analysis and user journeys
- **A/B Testing**: Feature flag experimentation
- **Personalization**: AI-powered recommendations
- **Gamification**: Points, badges, and achievements

### Integration Opportunities

- **Email Marketing**: Review-based email campaigns
- **Social Media**: Automated social sharing
- **CRM Systems**: Customer feedback integration
- **Business Intelligence**: Advanced reporting dashboards

## 📞 Support

### Documentation

- [API Reference](./API_REFERENCE.md)
- [Component Library](./COMPONENT_LIBRARY.md)
- [Database Schema](./DATABASE_SCHEMA.md)

### Getting Help

- Check feature flag status
- Review environment variables
- Test individual components
- Check browser console for errors
- Verify database connectivity

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Status**: Production Ready ✅
