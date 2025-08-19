import { z } from 'zod';

// Review submission schema
export const reviewSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
  subjectType: z.enum(['seller', 'stylist', 'driver'], {
    errorMap: () => ({ message: 'Subject type must be seller, stylist, or driver' })
  }),
  subjectId: z.string().uuid('Invalid subject ID'),
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  comment: z.string().max(500, 'Comment must be less than 500 characters').optional(),
});

export type ReviewSubmission = z.infer<typeof reviewSchema>;

// Review response schema
export const reviewResponseSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  reviewerId: z.string().uuid(),
  subjectType: z.enum(['seller', 'stylist', 'driver']),
  subjectId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().nullable(),
  createdAt: z.string().datetime(),
  reviewer: z.object({
    fullName: z.string().nullable(),
    avatarUrl: z.string().nullable(),
  }).optional(),
});

export type ReviewResponse = z.infer<typeof reviewResponseSchema>;

// Reviews query schema
export const reviewsQuerySchema = z.object({
  subjectType: z.enum(['seller', 'stylist', 'driver']).optional(),
  subjectId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type ReviewsQuery = z.infer<typeof reviewsQuerySchema>;

// Referral leaderboard query schema
export const leaderboardQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type LeaderboardQuery = z.infer<typeof leaderboardQuerySchema>;

// Push notification subscription schema
export const pushSubscriptionSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  platform: z.enum(['web', 'ios', 'android']).optional(),
});

export type PushSubscription = z.infer<typeof pushSubscriptionSchema>;

// Share link generation schema
export const shareLinkSchema = z.object({
  type: z.enum(['product', 'storefront', 'bundle']),
  id: z.string().min(1, 'ID is required'),
  platform: z.enum(['web', 'ios', 'android']).optional(),
});

export type ShareLinkRequest = z.infer<typeof shareLinkSchema>;

// Analytics event schema
export const analyticsEventSchema = z.object({
  event: z.enum([
    'view_product',
    'add_to_cart', 
    'checkout_started',
    'order_completed',
    'share_clicked',
    'review_submitted',
    'referral_created',
    'leaderboard_viewed'
  ]),
  properties: z.record(z.string(), z.unknown()).optional(),
  userId: z.string().uuid().optional(),
});

export type AnalyticsEvent = z.infer<typeof analyticsEventSchema>;
