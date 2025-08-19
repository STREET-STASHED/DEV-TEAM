import {
  reviewSchema,
  reviewsQuerySchema,
  leaderboardQuerySchema,
  pushSubscriptionSchema,
  shareLinkSchema,
  analyticsEventSchema,
} from '@/lib/schemas/viral';

describe('Viral Feature Schemas', () => {
  describe('reviewSchema', () => {
    it('should validate a valid review submission', () => {
      const validReview = {
        orderId: '123e4567-e89b-12d3-a456-426614174000',
        subjectType: 'seller' as const,
        subjectId: '123e4567-e89b-12d3-a456-426614174001',
        rating: 5,
        comment: 'Great service!',
      };

      const result = reviewSchema.safeParse(validReview);
      expect(result.success).toBe(true);
    });

    it('should reject invalid rating', () => {
      const invalidReview = {
        orderId: '123e4567-e89b-12d3-a456-426614174000',
        subjectType: 'seller' as const,
        subjectId: '123e4567-e89b-12d3-a456-426614174001',
        rating: 6, // Invalid: > 5
        comment: 'Great service!',
      };

      const result = reviewSchema.safeParse(invalidReview);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Rating must be between 1 and 5');
      }
    });

    it('should reject invalid subject type', () => {
      const invalidReview = {
        orderId: '123e4567-e89b-12d3-a456-426614174000',
        subjectType: 'invalid' as any,
        subjectId: '123e4567-e89b-12d3-a456-426614174001',
        rating: 5,
      };

      const result = reviewSchema.safeParse(invalidReview);
      expect(result.success).toBe(false);
    });

    it('should accept review without comment', () => {
      const validReview = {
        orderId: '123e4567-e89b-12d3-a456-426614174000',
        subjectType: 'seller' as const,
        subjectId: '123e4567-e89b-12d3-a456-426614174001',
        rating: 4,
      };

      const result = reviewSchema.safeParse(validReview);
      expect(result.success).toBe(true);
    });

    it('should reject comment that is too long', () => {
      const longComment = 'a'.repeat(501);
      const invalidReview = {
        orderId: '123e4567-e89b-12d3-a456-426614174000',
        subjectType: 'seller' as const,
        subjectId: '123e4567-e89b-12d3-a456-426614174001',
        rating: 5,
        comment: longComment,
      };

      const result = reviewSchema.safeParse(invalidReview);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Comment must be less than 500 characters');
      }
    });
  });

  describe('reviewsQuerySchema', () => {
    it('should validate valid query parameters', () => {
      const validQuery = {
        subjectType: 'stylist' as const,
        subjectId: '123e4567-e89b-12d3-a456-426614174001',
        page: '2',
        pageSize: '15',
      };

      const result = reviewsQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.pageSize).toBe(15);
      }
    });

    it('should use default values for missing parameters', () => {
      const minimalQuery = {
        subjectType: 'driver' as const,
      };

      const result = reviewsQuerySchema.safeParse(minimalQuery);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.pageSize).toBe(20);
      }
    });

    it('should reject invalid page number', () => {
      const invalidQuery = {
        page: '0', // Invalid: must be >= 1
      };

      const result = reviewsQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });

    it('should reject invalid page size', () => {
      const invalidQuery = {
        pageSize: '101', // Invalid: must be <= 100
      };

      const result = reviewsQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });
  });

  describe('leaderboardQuerySchema', () => {
    it('should validate valid query parameters', () => {
      const validQuery = {
        limit: '25',
        offset: '10',
      };

      const result = leaderboardQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(25);
        expect(result.data.offset).toBe(10);
      }
    });

    it('should use default values for missing parameters', () => {
      const minimalQuery = {};

      const result = leaderboardQuerySchema.safeParse(minimalQuery);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(50);
        expect(result.data.offset).toBe(0);
      }
    });

    it('should reject invalid limit', () => {
      const invalidQuery = {
        limit: '101', // Invalid: must be <= 100
      };

      const result = leaderboardQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });

    it('should reject negative offset', () => {
      const invalidQuery = {
        offset: '-1', // Invalid: must be >= 0
      };

      const result = leaderboardQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });
  });

  describe('pushSubscriptionSchema', () => {
    it('should validate valid subscription data', () => {
      const validSubscription = {
        token: 'fcm_token_123',
        platform: 'ios' as const,
      };

      const result = pushSubscriptionSchema.safeParse(validSubscription);
      expect(result.success).toBe(true);
    });

    it('should accept subscription without platform', () => {
      const validSubscription = {
        token: 'fcm_token_123',
      };

      const result = pushSubscriptionSchema.safeParse(validSubscription);
      expect(result.success).toBe(true);
    });

    it('should reject empty token', () => {
      const invalidSubscription = {
        token: '',
      };

      const result = pushSubscriptionSchema.safeParse(invalidSubscription);
      expect(result.success).toBe(false);
    });

    it('should reject invalid platform', () => {
      const invalidSubscription = {
        token: 'fcm_token_123',
        platform: 'invalid' as any,
      };

      const result = pushSubscriptionSchema.safeParse(invalidSubscription);
      expect(result.success).toBe(false);
    });
  });

  describe('shareLinkSchema', () => {
    it('should validate valid share link request', () => {
      const validRequest = {
        type: 'product' as const,
        id: 'product_123',
        platform: 'web' as const,
      };

      const result = shareLinkSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should accept request without platform', () => {
      const validRequest = {
        type: 'storefront' as const,
        id: 'store_123',
      };

      const result = shareLinkSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should reject empty id', () => {
      const invalidRequest = {
        type: 'bundle' as const,
        id: '',
      };

      const result = shareLinkSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject invalid type', () => {
      const invalidRequest = {
        type: 'invalid' as any,
        id: 'test_123',
      };

      const result = shareLinkSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });
  });

  describe('analyticsEventSchema', () => {
    it('should validate valid analytics event', () => {
      const validEvent = {
        event: 'view_product' as const,
        properties: { productId: '123', category: 'sneakers' },
        userId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = analyticsEventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it('should accept event without properties and userId', () => {
      const validEvent = {
        event: 'add_to_cart' as const,
      };

      const result = analyticsEventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it('should reject invalid event type', () => {
      const invalidEvent = {
        event: 'invalid_event' as any,
      };

      const result = analyticsEventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it('should accept all valid event types', () => {
      const validEventTypes = [
        'view_product',
        'add_to_cart',
        'checkout_started',
        'order_completed',
        'share_clicked',
        'review_submitted',
        'referral_created',
        'leaderboard_viewed',
      ];

      validEventTypes.forEach(eventType => {
        const event = { event: eventType as any };
        const result = analyticsEventSchema.safeParse(event);
        expect(result.success).toBe(true);
      });
    });
  });
});
