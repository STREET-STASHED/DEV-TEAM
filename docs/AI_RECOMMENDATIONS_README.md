# StreetStashed AI Recommendation System

## 🚀 Overview

The AI Recommendation System is a comprehensive, production-ready recommendation engine that provides personalized product suggestions using multiple AI approaches. This system is designed to increase user engagement, conversion rates, and overall shopping experience.

## ✨ Features

### 1. **Multiple Recommendation Types**

- **Hybrid Recommendations**: Combines collaborative and content-based filtering
- **Collaborative Filtering**: Based on similar users' preferences
- **Content-Based Filtering**: Based on user's personal preferences
- **Real-Time Recommendations**: Updates based on current session
- **Contextual Recommendations**: Adapts to time, season, and context

### 2. **Advanced AI Algorithms**

- Machine learning-based preference learning
- Real-time behavior tracking and analysis
- Contextual awareness (time, season, location)
- Confidence scoring for recommendations
- Automatic preference updates

### 3. **Performance Optimizations**

- Caching system for recommendations
- Database indexing for fast queries
- Background processing for preference updates
- Efficient similarity calculations

## 🏗️ Architecture

### Database Schema

```sql
-- User behaviors tracking
user_behaviors (
  id, user_id, product_id, action, session_id,
  timestamp, metadata, created_at
)

-- User preferences storage
user_preferences (
  id, user_id, category, brand, price_range_min,
  price_range_max, style_tags, weight, confidence
)

-- Product features
product_features (
  id, product_id, brand, style_tags, condition,
  popularity_score, trend_score, seasonality
)

-- Recommendation cache
recommendation_cache (
  id, user_id, recommendation_type, product_ids,
  scores, reasons, confidence_scores, expires_at
)
```

### Core Components

1. **AI Recommendation Engine** (`lib/ai/recommendations.ts`)
   - Main recommendation logic
   - Multiple filtering algorithms
   - Behavior tracking
   - Preference learning

2. **API Endpoints** (`app/api/recommendations/route.ts`)
   - GET: Fetch recommendations
   - POST: Track user behavior

3. **React Components** (`components/ai/RecommendationSection.tsx`)
   - Display recommendations
   - User interaction handling
   - Real-time updates

4. **React Hooks** (`hooks/useAIRecommendations.ts`)
   - Easy integration
   - Type-safe API
   - Auto-refresh capabilities

## 🚀 Quick Start

### 1. Database Setup

```bash
# Apply the AI recommendations migration
supabase db push

# Or manually run the SQL
supabase db reset --linked
```

### 2. Basic Usage

```tsx
import { useAIRecommendations } from "@/hooks/useAIRecommendations";

function MyComponent() {
  const { recommendations, loading, error, trackBehavior } =
    useAIRecommendations({
      type: "hybrid",
      limit: 10,
    });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {recommendations.map((rec) => (
        <div key={rec.productId}>
          <h3>{rec.product.name}</h3>
          <p>Match: {Math.round(rec.confidence * 100)}%</p>
          <p>Reason: {rec.reason}</p>
          <button onClick={() => trackBehavior("like", rec.productId)}>
            Like
          </button>
        </div>
      ))}
    </div>
  );
}
```

### 3. Using the Component

```tsx
import RecommendationSection from "@/components/ai/RecommendationSection";

function HomePage() {
  return (
    <div>
      <RecommendationSection
        type="hybrid"
        title="Recommended for You"
        limit={8}
        showReason={true}
      />
    </div>
  );
}
```

## 📊 Recommendation Types

### 1. Hybrid Recommendations

**Best for**: General use, highest accuracy

```tsx
const { recommendations } = useAIRecommendations({ type: "hybrid" });
```

**How it works**: Combines collaborative filtering (60% weight) with content-based filtering (40% weight) for optimal results.

### 2. Collaborative Filtering

**Best for**: Social discovery, new users

```tsx
const { recommendations } = useCollaborativeRecommendations();
```

**How it works**: Finds users with similar preferences and recommends items they've liked.

### 3. Content-Based Filtering

**Best for**: Personalization, privacy-focused

```tsx
const { recommendations } = useContentBasedRecommendations();
```

**How it works**: Analyzes user's past interactions to understand preferences for categories, price ranges, and styles.

### 4. Real-Time Recommendations

**Best for**: Dynamic sessions, live updates

```tsx
const { recommendations } = useRealTimeRecommendations();
```

**How it works**: Updates recommendations based on current browsing session behavior.

### 5. Contextual Recommendations

**Best for**: Time-aware suggestions

```tsx
const { recommendations } = useContextualRecommendations();
```

**How it works**: Adapts recommendations based on time of day, season, and browsing context.

## 🎯 Behavior Tracking

### Trackable Actions

- `view`: Product viewed
- `like`: Product liked/favorited
- `cart`: Added to cart
- `purchase`: Product purchased
- `share`: Product shared

### Automatic Tracking

```tsx
// The component automatically tracks views when images load
<img onLoad={() => handleView(productId)} />;

// Manual tracking
const { trackBehavior } = useAIRecommendations();
trackBehavior("like", productId);
```

## 🔧 Configuration

### Environment Variables

```bash
# Enable AI recommendations
ENABLE_AI_RECOMMENDATIONS=true

# Cache settings
RECOMMENDATION_CACHE_TTL=3600 # 1 hour
RECOMMENDATION_CACHE_SIZE=1000

# Performance settings
MAX_RECOMMENDATIONS_PER_REQUEST=50
BEHAVIOR_BATCH_SIZE=100
```

### Database Functions

```sql
-- Update user preferences
SELECT update_user_preferences('user-uuid');

-- Get trending products
SELECT * FROM get_trending_products(20);

-- Get similar users
SELECT * FROM get_similar_users('user-uuid', 10);
```

## 📈 Performance & Monitoring

### Caching Strategy

- Recommendations cached for 1 hour by default
- User preferences updated in background
- Popularity scores updated via triggers

### Monitoring Queries

```sql
-- Check recommendation performance
SELECT
  recommendation_type,
  COUNT(*) as total_recommendations,
  AVG(confidence_scores) as avg_confidence
FROM recommendation_cache
GROUP BY recommendation_type;

-- Monitor user engagement
SELECT
  action,
  COUNT(*) as count,
  DATE(timestamp) as date
FROM user_behaviors
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY action, DATE(timestamp)
ORDER BY date DESC, count DESC;
```

## 🧪 Testing

### Unit Tests

```bash
# Run AI recommendation tests
pnpm test __tests__/ai/

# Test specific components
pnpm test components/ai/RecommendationSection.test.tsx
```

### Integration Tests

```bash
# Test API endpoints
pnpm test app/api/recommendations/route.test.ts

# Test database functions
pnpm test lib/ai/recommendations.test.ts
```

### Demo Page

Visit `/ai-recommendations-demo` to see all recommendation types in action.

## 🔒 Privacy & Security

### Data Protection

- All user data is anonymized for recommendations
- Personal information never shared between users
- Users can control their data preferences
- GDPR compliant data handling

### Security Measures

- Row Level Security (RLS) on all tables
- Input validation and sanitization
- Rate limiting on API endpoints
- Secure session management

## 🚀 Deployment

### 1. Database Migration

```bash
# Apply migrations
supabase db push

# Verify tables
supabase db inspect --table user_behaviors
supabase db inspect --table user_preferences
supabase db inspect --table product_features
```

### 2. Environment Setup

```bash
# Add to .env.local
ENABLE_AI_RECOMMENDATIONS=true
```

### 3. Build & Deploy

```bash
# Build application
pnpm build

# Deploy
pnpm deploy
```

## 📊 Analytics & Insights

### Key Metrics

- **Click-through Rate**: How often users click recommendations
- **Conversion Rate**: How often recommendations lead to purchases
- **Engagement Score**: User interaction with recommended items
- **Preference Accuracy**: How well recommendations match user behavior

### Dashboard Integration

```tsx
// Add to admin dashboard
import { useAIRecommendations } from "@/hooks/useAIRecommendations";

function AdminDashboard() {
  const { recommendations } = useAIRecommendations({
    type: "hybrid",
    limit: 100,
  });

  // Display analytics and insights
}
```

## 🔮 Future Enhancements

### Planned Features

1. **Deep Learning Models**: Neural network-based recommendations
2. **Visual Similarity**: Image-based product matching
3. **Voice Search**: Natural language product discovery
4. **Predictive Analytics**: Anticipate user needs
5. **A/B Testing**: Optimize recommendation algorithms

### Integration Opportunities

- **AR Try-On**: Combine with virtual fitting room
- **Social Features**: Friend recommendations
- **Voice Assistants**: Voice-powered shopping
- **IoT Integration**: Smart wardrobe suggestions

## 📚 API Reference

### GET /api/recommendations

```typescript
interface GetRecommendationsParams {
  type?: "hybrid" | "collaborative" | "content" | "realtime" | "contextual";
  limit?: number;
  sessionId?: string;
  context?: object;
}

interface GetRecommendationsResponse {
  recommendations: AIRecommendation[];
  type: string;
  total: number;
  timestamp: string;
}
```

### POST /api/recommendations

```typescript
interface TrackBehaviorRequest {
  action: "view" | "like" | "cart" | "purchase" | "share";
  productId: string;
  sessionId: string;
  metadata?: object;
}

interface TrackBehaviorResponse {
  success: boolean;
  message: string;
  timestamp: string;
}
```

## 🤝 Contributing

### Development Setup

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Set up Supabase: `supabase start`
4. Apply migrations: `supabase db push`
5. Start development: `pnpm dev`

### Code Style

- TypeScript for type safety
- React hooks for state management
- Tailwind CSS for styling
- Framer Motion for animations

### Testing Guidelines

- Unit tests for all functions
- Integration tests for API endpoints
- E2E tests for user flows
- Performance testing for recommendations

---

**Built with ❤️ for StreetStashed**

This AI recommendation system is designed to provide the most personalized and engaging shopping experience possible while maintaining user privacy and system performance.
