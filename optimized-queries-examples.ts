// Optimized Queries Examples for StreetStashed MVP
// Demonstrates how to use the new materialized views, functions, and optimized queries

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// =============================
// MARKETPLACE ANALYTICS
// =============================

/**
 * Get daily marketplace statistics using materialized view
 * Much faster than calculating from raw data
 */
export async function getDailyMarketplaceStats(days: number = 30) {
  const { data, error } = await supabase
    .from('daily_marketplace_stats')
    .select('*')
    .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .order('date', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get overall marketplace statistics using optimized function
 */
export async function getMarketplaceOverview() {
  const { data, error } = await supabase
    .rpc('get_marketplace_stats');

  if (error) throw error;
  return data[0]; // Returns single row with all stats
}

// =============================
// USER ANALYTICS
// =============================

/**
 * Get user engagement metrics using materialized view
 */
export async function getUserEngagementMetrics(userId: string) {
  const { data, error } = await supabase
    .from('user_engagement_metrics')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get comprehensive user statistics using optimized function
 */
export async function getUserStats(userId: string) {
  const { data, error } = await supabase
    .rpc('get_user_stats', { user_uuid: userId });

  if (error) throw error;
  return data[0];
}

/**
 * Get active users (engaged in last 7 days)
 */
export async function getActiveUsers() {
  const { data, error } = await supabase
    .from('user_engagement_metrics')
    .select('user_id, username, total_orders, last_order_date')
    .eq('engagement_level', 'active')
    .order('last_order_date', { ascending: false });

  if (error) throw error;
  return data;
}

// =============================
// ORDER MANAGEMENT
// =============================

/**
 * Get active orders with stasher information using optimized view
 */
export async function getActiveOrders() {
  const { data, error } = await supabase
    .from('active_orders_view')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get user orders with optimized composite index
 */
export async function getUserOrders(userId: string, status?: string) {
  let query = supabase
    .from('orders')
    .select('*')
    .eq('buyer_id', userId)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Get seller orders with optimized composite index
 */
export async function getSellerOrders(sellerId: string, status?: string) {
  let query = supabase
    .from('orders')
    .select('*')
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// =============================
// PRODUCT ANALYTICS
// =============================

/**
 * Get product performance metrics using materialized view
 */
export async function getProductPerformance(sellerId?: string) {
  let query = supabase
    .from('product_performance_metrics')
    .select('*')
    .order('total_revenue', { ascending: false });

  if (sellerId) {
    query = query.eq('seller_id', sellerId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Get top performing products
 */
export async function getTopProducts(limit: number = 10) {
  const { data, error } = await supabase
    .from('product_performance_metrics')
    .select('*')
    .order('total_revenue', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

// =============================
// STASHER MANAGEMENT
// =============================

/**
 * Get stasher performance metrics using materialized view
 */
export async function getStasherPerformance() {
  const { data, error } = await supabase
    .from('stasher_performance_metrics')
    .select('*')
    .order('total_payouts', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get available stashers using optimized partial index
 */
export async function getAvailableStashers() {
  const { data, error } = await supabase
    .from('stasher_profiles')
    .select('*')
    .eq('is_available', true)
    .eq('is_online', true)
    .order('rating', { ascending: false });

  if (error) throw error;
  return data;
}

// =============================
// SOCIAL FEATURES
// =============================

/**
 * Get user social activity using optimized indexes
 */
export async function getUserSocialActivity(userId: string) {
  const { data, error } = await supabase
    .from('social_posts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get social interactions using optimized composite index
 */
export async function getSocialInteractions(userId: string, type?: string) {
  let query = supabase
    .from('social_interactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (type) {
    query = query.eq('interaction_type', type);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// =============================
// NOTIFICATIONS
// =============================

/**
 * Get user notifications using optimized composite index
 */
export async function getUserNotifications(userId: string, unreadOnly: boolean = false) {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (unreadOnly) {
    query = query.eq('read', false);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Get unread notification count using optimized index
 */
export async function getUnreadNotificationCount(userId: string) {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) throw error;
  return count || 0;
}

// =============================
// ANALYTICS EVENTS
// =============================

/**
 * Get user analytics events using optimized composite index
 */
export async function getUserAnalyticsEvents(userId: string, eventType?: string) {
  let query = supabase
    .from('analytics_events')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false });

  if (eventType) {
    query = query.eq('event_type', eventType);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// =============================
// MAINTENANCE & MONITORING
// =============================

/**
 * Get maintenance status
 */
export async function getMaintenanceStatus() {
  const { data, error } = await supabase
    .rpc('get_maintenance_status');

  if (error) throw error;
  return data;
}

/**
 * Get partition statistics
 */
export async function getPartitionStatistics() {
  const { data, error } = await supabase
    .rpc('get_partition_statistics');

  if (error) throw error;
  return data;
}

/**
 * Manually refresh materialized views
 */
export async function refreshMaterializedViews() {
  const { data, error } = await supabase
    .rpc('refresh_all_materialized_views');

  if (error) throw error;
  return data;
}

// =============================
// DASHBOARD QUERIES
// =============================

/**
 * Get comprehensive dashboard data
 */
export async function getDashboardData() {
  const [
    marketplaceStats,
    activeOrders,
    topProducts,
    availableStashers,
    maintenanceStatus
  ] = await Promise.all([
    getMarketplaceOverview(),
    getActiveOrders(),
    getTopProducts(5),
    getAvailableStashers(),
    getMaintenanceStatus()
  ]);

  return {
    marketplace: marketplaceStats,
    activeOrders: activeOrders.length,
    topProducts,
    availableStashers: availableStashers.length,
    maintenance: maintenanceStatus
  };
}

/**
 * Get user dashboard data
 */
export async function getUserDashboardData(userId: string) {
  const [
    userStats,
    userEngagement,
    recentOrders,
    notifications
  ] = await Promise.all([
    getUserStats(userId),
    getUserEngagementMetrics(userId),
    getUserOrders(userId, 'pending'),
    getUserNotifications(userId, true)
  ]);

  return {
    stats: userStats,
    engagement: userEngagement,
    pendingOrders: recentOrders.length,
    unreadNotifications: notifications.length
  };
}

// =============================
// PERFORMANCE MONITORING
// =============================

/**
 * Monitor query performance
 */
export async function monitorQueryPerformance() {
  const startTime = Date.now();
  
  try {
    const data = await getDashboardData();
    const endTime = Date.now();
    
    return {
      success: true,
      executionTime: endTime - startTime,
      data
    };
  } catch (error) {
    const endTime = Date.now();
    
    return {
      success: false,
      executionTime: endTime - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// =============================
// TYPE DEFINITIONS
// =============================

export interface MarketplaceStats {
  total_users: number;
  total_orders: number;
  total_revenue: number;
  active_stashers: number;
  total_products: number;
}

export interface UserStats {
  total_orders: number;
  completed_orders: number;
  total_spent: number;
  social_posts: number;
  social_interactions: number;
  member_since: string;
}

export interface UserEngagement {
  user_id: string;
  username: string;
  total_orders: number;
  completed_orders: number;
  social_posts: number;
  social_interactions: number;
  notifications_received: number;
  notifications_read: number;
  engagement_level: 'active' | 'recent' | 'inactive';
}

export interface ProductPerformance {
  product_id: string;
  product_name: string;
  seller_id: string;
  price: number;
  times_ordered: number;
  unique_buyers: number;
  total_quantity_sold: number;
  total_revenue: number;
  avg_order_value: number;
  total_reviews: number;
  avg_rating: number;
}

export interface StasherPerformance {
  stasher_id: string;
  user_id: string;
  rating: number;
  completion_rate: number;
  total_deliveries: number;
  total_earnings: number;
  total_orders_assigned: number;
  completed_deliveries: number;
  avg_payout_per_delivery: number;
  total_payouts: number;
  current_status: 'online' | 'available' | 'offline';
}

export interface MaintenanceStatus {
  maintenance_type: string;
  last_run: string;
  next_scheduled: string;
  status: string;
  details: any;
}
