# Social Commerce & Viral Features System

## 🚀 Overview

The Social Commerce & Viral Features system transforms StreetStashed into a viral social platform where users can create content, participate in challenges, earn rewards, and grow their influence. This system is designed to drive user engagement, increase retention, and create organic growth through viral mechanics.

## ✨ Key Features

### 1. **Social Posts & Content Creation**

- **Post Types**: Outfit showcases, product reviews, styling tips, haul videos, challenge submissions
- **Rich Media Support**: Multiple images, product linking, location tagging
- **Viral Algorithm**: AI-powered scoring system that rewards quality content
- **Engagement Tracking**: Real-time likes, shares, comments, and views

### 2. **Social Challenges**

- **Branded Challenges**: Create viral campaigns with real prizes
- **Prize System**: Cash, products, credits, and experiences
- **Participation Tracking**: Leaderboards and progress indicators
- **Automated Rewards**: Points and recognition for participation

### 3. **Viral Algorithm**

- **Smart Scoring**: Time-decay, engagement quality, and reach metrics
- **Trending Detection**: Real-time identification of viral content
- **Influence Metrics**: User influence scores and viral coefficients
- **Recommendation Engine**: AI-powered content discovery

### 4. **Rewards & Gamification**

- **Point System**: Earn points for creating and engaging with content
- **Achievement Badges**: Recognition for milestones and viral content
- **Influencer Program**: Exclusive opportunities for top creators
- **Cash Rewards**: Monetization opportunities for viral creators

### 5. **Social Features**

- **User Profiles**: Customizable profiles with social metrics
- **Follow System**: Build communities and follow favorite creators
- **Feed Algorithm**: Personalized content discovery
- **Multi-platform Sharing**: Share to Instagram, TikTok, Twitter, etc.

## 🏗️ Architecture

### Database Schema

```sql
-- Core Tables
social_posts          -- User-generated content
social_challenges     -- Branded challenges and contests
user_social_profiles  -- Enhanced user profiles
social_comments       -- Post comments and discussions
social_interactions   -- Likes, shares, views tracking
social_rewards        -- Points and rewards system
challenge_participants -- Challenge participation tracking
user_follows          -- Follow/unfollow relationships
```

### Key Functions

```sql
-- Viral Score Calculation
calculate_viral_score() -- AI-powered content scoring

-- Content Discovery
get_trending_posts()    -- Trending content algorithm
get_user_feed()         -- Personalized feed generation

-- Analytics
get_user_viral_metrics() -- User influence and reach metrics
```

### API Endpoints

```
POST   /api/social/posts          -- Create social posts
GET    /api/social/posts          -- Get trending/feed/user posts
POST   /api/social/interactions   -- Record likes, shares, comments
GET    /api/social/challenges     -- Get active challenges
POST   /api/social/challenges     -- Create challenges (influencers)
```

## 🎯 Viral Mechanics

### Viral Score Formula

```
Viral Score = (Engagement + Reach + Quality) × Time Decay

Where:
- Engagement = (likes × 1) + (shares × 3) + (comments × 2)
- Reach = views × 0.1
- Quality = (images × 5) + (products × 3)
- Time Decay = max(0.1, 1 - (hours_since_creation / 168))
```

### Engagement Rewards

| Action      | Creator Points | Engager Points |
| ----------- | -------------- | -------------- |
| Like        | 2              | 1              |
| Comment     | 3              | 2              |
| Share       | 5              | 3              |
| Create Post | 10             | -              |

### Influence Metrics

- **Viral Coefficient**: Shares / Views ratio
- **Engagement Rate**: (Likes + Comments) / Views
- **Reach Score**: Logarithmic scale based on total views
- **Influence Score**: Weighted combination of all metrics

## 🛠️ Implementation Guide

### 1. **Setup Database**

```bash
# Push the social commerce migration
supabase db push
```

### 2. **Install Components**

The system includes these React components:

```tsx
// Social Feed Component
import SocialFeed from '@/components/social/SocialFeed'

// Social Challenges Component
import SocialChallenges from '@/components/social/SocialChallenges'

// Usage Examples
<SocialFeed type="trending" limit={10} />
<SocialChallenges limit={5} />
```

### 3. **API Integration**

```typescript
// Create a post
const response = await fetch("/api/social/posts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    type: "outfit",
    content: "Check out my new streetwear look!",
    images: ["image1.jpg", "image2.jpg"],
    productIds: ["product1", "product2"],
    tags: ["streetwear", "fashion", "ootd"],
  }),
});

// Record interaction
await fetch("/api/social/interactions", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    postId: "post-id",
    interactionType: "like",
  }),
});
```

### 4. **Viral Features Integration**

```typescript
// Get trending posts
const trendingPosts = await fetch("/api/social/posts?type=trending&limit=10");

// Get user feed
const userFeed = await fetch(
  "/api/social/posts?type=feed&userId=user-id&limit=20"
);

// Get active challenges
const challenges = await fetch("/api/social/challenges?type=active&limit=5");
```

## 📊 Analytics & Metrics

### Key Performance Indicators

1. **Content Metrics**
   - Posts created per day
   - Average viral score
   - Engagement rate
   - Share rate

2. **User Metrics**
   - Daily active users
   - User retention rate
   - Average session duration
   - Content creation rate

3. **Viral Metrics**
   - Viral coefficient
   - Content reach
   - Influence scores
   - Challenge participation

### Monitoring Dashboard

```sql
-- Get platform-wide metrics
SELECT
  COUNT(*) as total_posts,
  AVG(viral_score) as avg_viral_score,
  SUM(likes + shares + comments) as total_engagement,
  COUNT(DISTINCT user_id) as active_creators
FROM social_posts
WHERE created_at >= NOW() - INTERVAL '7 days';
```

## 🎨 UI/UX Features

### Design System

- **Black & Gold Theme**: Consistent with StreetStashed branding
- **Viral Indicators**: Fire emojis and badges for viral content
- **Progress Bars**: Challenge participation and reward progress
- **Interactive Elements**: Hover effects and smooth animations

### Mobile-First Design

- **Responsive Grid**: Adapts to all screen sizes
- **Touch-Friendly**: Large buttons and swipe gestures
- **Fast Loading**: Optimized images and lazy loading
- **Offline Support**: Cached content for offline viewing

## 🔧 Configuration

### Environment Variables

```env
# Social Commerce Settings
SOCIAL_POSTS_PER_PAGE=20
VIRAL_SCORE_DECAY_HOURS=168
MIN_VIRAL_SCORE=10
CHALLENGE_AUTO_APPROVE=true
```

### Feature Flags

```typescript
// Enable/disable features
const FEATURES = {
  socialPosts: true,
  challenges: true,
  rewards: true,
  influencerProgram: true,
  multiPlatformSharing: true,
};
```

## 🚀 Growth Strategies

### 1. **Viral Loops**

- **Content Creation** → **Viral Distribution** → **New Users** → **More Content**
- **Challenge Participation** → **Social Sharing** → **Brand Awareness** → **User Acquisition**
- **Rewards System** → **User Retention** → **Increased Engagement** → **Higher Rewards**

### 2. **Influencer Partnerships**

- **Micro-influencers**: 1K-10K followers, high engagement
- **Macro-influencers**: 10K-100K followers, broad reach
- **Celebrity partnerships**: 100K+ followers, mass appeal

### 3. **Content Strategy**

- **User-Generated Content**: Authentic, relatable, shareable
- **Branded Challenges**: Seasonal campaigns and product launches
- **Educational Content**: Styling tips, fashion guides, trend analysis

## 🔒 Privacy & Security

### Data Protection

- **User Consent**: Clear opt-in for social features
- **Data Minimization**: Only collect necessary information
- **Anonymization**: Aggregate analytics without personal data
- **GDPR Compliance**: Right to delete and export data

### Content Moderation

- **Automated Filtering**: AI-powered content screening
- **Community Reporting**: User-driven moderation
- **Manual Review**: Human oversight for flagged content
- **Appeal Process**: Fair review of removed content

## 📈 Performance Optimization

### Database Optimization

- **Indexing**: Optimized queries for viral content discovery
- **Caching**: Redis cache for trending posts and user feeds
- **Partitioning**: Time-based partitioning for large datasets
- **Connection Pooling**: Efficient database connections

### Frontend Optimization

- **Lazy Loading**: Load content as needed
- **Image Optimization**: WebP format and responsive images
- **Code Splitting**: Load components on demand
- **Service Workers**: Offline functionality and caching

## 🧪 Testing Strategy

### Unit Tests

```typescript
// Test viral score calculation
describe("Viral Score Calculation", () => {
  it("should calculate correct viral score", () => {
    const post = {
      likes: 100,
      shares: 50,
      comments: 25,
      views: 1000,
      images: ["img1.jpg", "img2.jpg"],
      productIds: ["prod1"],
      createdAt: new Date(),
    };

    const score = calculateViralScore(post);
    expect(score).toBeGreaterThan(0);
  });
});
```

### Integration Tests

```typescript
// Test social interactions
describe("Social Interactions", () => {
  it("should record like interaction", async () => {
    const response = await request(app).post("/api/social/interactions").send({
      postId: "test-post-id",
      interactionType: "like",
    });

    expect(response.status).toBe(200);
  });
});
```

## 🚀 Deployment

### Production Checklist

- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] CDN setup for image optimization
- [ ] Monitoring and analytics configured
- [ ] Content moderation rules active
- [ ] Rate limiting implemented
- [ ] Backup strategy in place

### Monitoring

```typescript
// Track viral content performance
const trackViralContent = (postId: string, metrics: ViralMetrics) => {
  analytics.track("viral_content_performance", {
    postId,
    viralScore: metrics.viralScore,
    engagementRate: metrics.engagementRate,
    reach: metrics.reach,
  });
};
```

## 🎯 Success Metrics

### Short-term Goals (30 days)

- 1,000+ social posts created
- 10,000+ interactions recorded
- 5+ active challenges
- 50+ users earning rewards

### Medium-term Goals (90 days)

- 10,000+ social posts
- 100,000+ interactions
- 20+ viral posts (score > 100)
- 500+ reward-earning users

### Long-term Goals (1 year)

- 100,000+ social posts
- 1M+ interactions
- 1,000+ viral posts
- 10,000+ reward-earning users
- 100+ influencer partnerships

## 🔮 Future Enhancements

### Planned Features

1. **Live Streaming**: Real-time fashion shows and Q&A sessions
2. **AR Try-On Integration**: Share AR experiences in posts
3. **Collaborative Challenges**: Team-based competitions
4. **Advanced Analytics**: Predictive viral scoring
5. **Creator Marketplace**: Direct brand partnerships
6. **NFT Integration**: Digital collectibles and rewards

### Technical Improvements

1. **Real-time Updates**: WebSocket integration for live engagement
2. **Advanced AI**: Machine learning for content recommendations
3. **Multi-language Support**: International expansion
4. **API Rate Limiting**: Scalable infrastructure
5. **Mobile App**: Native iOS/Android applications

## 📚 Resources

### Documentation

- [API Reference](./API_REFERENCE.md)
- [Component Library](./COMPONENT_LIBRARY.md)
- [Database Schema](./DATABASE_SCHEMA.md)

### Tools & Libraries

- [Supabase](https://supabase.com) - Backend as a Service
- [Next.js](https://nextjs.org) - React Framework
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Lucide React](https://lucide.dev) - Icons

### Support

- [GitHub Issues](https://github.com/streetstashed/social-commerce/issues)
- [Discord Community](https://discord.gg/streetstashed)
- [Email Support](mailto:support@streetstashed.com)

---

**Built with ❤️ by the StreetStashed Team**

_Last updated: January 2025_
