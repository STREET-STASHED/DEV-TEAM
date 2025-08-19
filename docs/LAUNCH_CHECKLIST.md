# StreetStashed MVP Launch Checklist

## 🚀 Pre-Launch Setup

### Environment Variables

```bash
# Core Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key

# Redis (if using)
REDIS_URL=your_redis_url

# Engagement & Virality Features
ENABLE_PUSH=true
ENABLE_REVIEWS=true
ENABLE_SHARE=true
ENABLE_LEADERBOARD=true
ENABLE_DEEP_LINKS=true
ENABLE_ANALYTICS=true

# Push Providers (choose one; wire stubs gracefully if keys absent)
NEXT_PUBLIC_ONESIGNAL_APP_ID=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=
ONESIGNAL_REST_API_KEY=

# Base URLs
NEXT_PUBLIC_BASE_URL=https://streetstashed.com
NEXT_PUBLIC_FALLBACK_URL=https://streetstashed.com
```

### Database Setup

```bash
# Apply migrations
1. Run: supabase db push
2. Verify tables: reviews, referral_leaderboard, push_tokens, analytics_events
3. Check RLS policies are active
4. Verify functions: get_average_rating, get_review_count, refresh_referral_leaderboard
```

### Feature Flags Verification

```bash
# Test with flags disabled (should show no UI changes)
ENABLE_PUSH=false
ENABLE_REVIEWS=false
ENABLE_SHARE=false
ENABLE_LEADERBOARD=false
ENABLE_DEEP_LINKS=false
ENABLE_ANALYTICS=false

# Test with flags enabled (should show all features)
ENABLE_PUSH=true
ENABLE_REVIEWS=true
ENABLE_SHARE=true
ENABLE_LEADERBOARD=true
ENABLE_DEEP_LINKS=true
ENABLE_ANALYTICS=true
```

## 🧪 Testing Checklist

### Core Features

- [ ] **Authentication System**
  - [ ] User registration
  - [ ] User login/logout
  - [ ] Password reset
  - [ ] Email verification

- [ ] **User Roles & Permissions**
  - [ ] Buyer access
  - [ ] Seller access
  - [ ] Stylist access
  - [ ] Driver access
  - [ ] Admin access

- [ ] **Marketplace**
  - [ ] Product browsing
  - [ ] Product search
  - [ ] Product filtering
  - [ ] Product details
  - [ ] Add to cart
  - [ ] Checkout process

- [ ] **Order Management**
  - [ ] Order creation
  - [ ] Order tracking
  - [ ] Order status updates
  - [ ] Order history

### New Viral Features

- [ ] **Reviews & Ratings System**
  - [ ] Submit review for completed order
  - [ ] View reviews on seller/stylist/driver profiles
  - [ ] Rating validation (1-5 stars)
  - [ ] Comment submission (optional, max 500 chars)
  - [ ] Review pagination
  - [ ] RLS policies working (users can only review their own orders)

- [ ] **Social Sharing**
  - [ ] Share product links
  - [ ] Share storefront links
  - [ ] Share bundle links
  - [ ] Deep link generation
  - [ ] Native sharing on mobile
  - [ ] Clipboard fallback on web
  - [ ] Share button visibility (feature flag controlled)

- [ ] **Referral Leaderboard**
  - [ ] View top referrers
  - [ ] Pagination (20 per page)
  - [ ] Materialized view fallback
  - [ ] Admin refresh capability
  - [ ] Leaderboard visibility (feature flag controlled)

- [ ] **Push Notifications**
  - [ ] Token registration
  - [ ] Token storage in database
  - [ ] Graceful fallback without provider keys
  - [ ] Notification sending (behind feature flag)
  - [ ] Token cleanup (30-day inactivity)

- [ ] **Analytics System**
  - [ ] Event tracking (page views, conversions, etc.)
  - [ ] Session management
  - [ ] Data storage in Supabase
  - [ ] Analytics dashboard data
  - [ ] Data cleanup (90-day retention)

### API Endpoints

- [ ] **Reviews API**
  - [ ] POST /api/reviews (create review)
  - [ ] GET /api/reviews (list reviews)
  - [ ] Rate limiting (5 per minute)
  - [ ] Zod validation
  - [ ] RLS enforcement

- [ ] **Leaderboard API**
  - [ ] GET /api/leaderboard/referrals
  - [ ] POST /api/leaderboard/referrals (admin refresh)
  - [ ] Rate limiting (30 per minute)
  - [ ] Pagination support

- [ ] **Push Notifications API**
  - [ ] POST /api/notifications/subscribe
  - [ ] DELETE /api/notifications/subscribe
  - [ ] GET /api/notifications/subscribe
  - [ ] Rate limiting (10 per minute)

- [ ] **Share Links API**
  - [ ] POST /api/share/signed-link
  - [ ] GET /api/share/signed-link
  - [ ] Rate limiting (20 per minute)
  - [ ] Deep link generation

### UI Components

- [ ] **Review Components**
  - [ ] ReviewForm (rating + comment)
  - [ ] ReviewDisplay (list + pagination)
  - [ ] Star rating system
  - [ ] Form validation
  - [ ] Loading states

- [ ] **Share Components**
  - [ ] ShareButton (full button)
  - [ ] QuickShareButton (icon only)
  - [ ] Native sharing integration
  - [ ] Clipboard fallback
  - [ ] Success feedback

- [ ] **Leaderboard Components**
  - [ ] ReferralLeaderboard
  - [ ] LeaderboardRow
  - [ ] Pagination
  - [ ] Loading skeletons
  - [ ] Error handling

## 🔧 Technical Validation

### Database

- [ ] **Migrations Applied**
  - [ ] reviews table created
  - [ ] referral_leaderboard materialized view
  - [ ] push_tokens table (if using push)
  - [ ] analytics_events table (if using analytics)
  - [ ] Helper functions created

- [ ] **RLS Policies**
  - [ ] reviews table policies
  - [ ] push_tokens table policies
  - [ ] analytics_events table policies

- [ ] **Indexes**
  - [ ] reviews table indexes
  - [ ] leaderboard indexes
  - [ ] Performance queries

### Performance

- [ ] **API Response Times**
  - [ ] Reviews API < 500ms
  - [ ] Leaderboard API < 1s
  - [ ] Share API < 200ms

- [ ] **Database Queries**
  - [ ] Review queries optimized
  - [ ] Leaderboard queries optimized
  - [ ] Materialized view refresh < 5s

### Security

- [ ] **Input Validation**
  - [ ] Zod schemas working
  - [ ] SQL injection prevention
  - [ ] XSS protection

- [ ] **Rate Limiting**
  - [ ] All endpoints rate limited
  - [ ] Limits appropriate for use case
  - [ ] Rate limit headers returned

- [ ] **Authentication**
  - [ ] JWT validation
  - [ ] User context verification
  - [ ] Role-based access control

## 🚨 Rollback Procedures

### Feature Flag Rollback

```bash
# Quick disable of all viral features
ENABLE_PUSH=false
ENABLE_REVIEWS=false
ENABLE_SHARE=false
ENABLE_LEADERBOARD=false
ENABLE_DEEP_LINKS=false
ENABLE_ANALYTICS=false

# Restart application after changing flags
pnpm build
pnpm start
```

### Database Rollback

```bash
# If database issues occur
1. Disable feature flags
2. Revert to previous migration
3. Restore from backup if needed
4. Update application code
```

### Application Rollback

```bash
# If application issues occur
1. Revert to previous git commit
2. Restart application
3. Clear any cached data
4. Verify functionality restored
```

## 📈 Post-Launch Monitoring

### Key Metrics to Watch

- [ ] **Error Rates**: Monitor 4xx/5xx responses
- [ ] **Response Times**: Track API endpoint performance
- [ ] **User Engagement**: Monitor referral usage
- [ ] **Dispute Volume**: Track dispute creation rates
- [ ] **Rewards Usage**: Monitor points spending patterns
- [ ] **Viral Features**: Track review submissions, shares, leaderboard views

### Alert Setup

```bash
# Set up monitoring alerts
1. Error rate > 5%
2. Response time > 2s
3. Database connection failures
4. High memory/CPU usage
5. Failed authentication attempts
6. Review submission failures
7. Leaderboard refresh failures
```

## ✅ Final Launch Checklist

### Technical

- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] RLS policies verified
- [ ] API endpoints tested
- [ ] Rate limiting working
- [ ] Audit logging enabled
- [ ] Error handling tested
- [ ] Performance benchmarks met
- [ ] Feature flags working
- [ ] Viral features tested

### Business

- [ ] Referral system functional
- [ ] Dispute resolution working
- [ ] Rewards system operational
- [ ] Admin dashboard accessible
- [ ] User roles properly restricted
- [ ] Copy and UX reviewed
- [ ] Support documentation ready
- [ ] Reviews system working
- [ ] Sharing functionality working
- [ ] Leaderboard displaying correctly

### Security

- [ ] Authentication working
- [ ] Authorization verified
- [ ] RLS policies tested
- [ ] API security validated
- [ ] Rate limiting enforced
- [ ] Audit trails active
- [ ] No sensitive data exposed
- [ ] Review validation working
- [ ] Share link security verified

## 🎯 Launch Commands

```bash
# Final deployment
git push origin main
pnpm build
pnpm start

# Verify deployment
curl -I https://yourdomain.com
curl -I https://yourdomain.com/api/health

# Monitor logs
pnpm logs
```

## 📞 Emergency Contacts

- **Technical Lead**: [Your Name] - [Phone/Email]
- **Database Admin**: [DBA Name] - [Phone/Email]
- **DevOps**: [DevOps Name] - [Phone/Email]
- **Business Owner**: [Owner Name] - [Phone/Email]

---

**Launch Date**: [Date]
**Launch Time**: [Time]
**Launch Coordinator**: [Name]
**Status**: 🟡 Pending Launch
