// Centralized Database Query Library for StreetStashed MVP
// This file contains all optimized database queries for the application

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// =============================
// MARKETPLACE ANALYTICS
// =============================

export const marketplaceQueries = {
  /**
   * Get daily marketplace statistics using materialized view
   */
  getDailyStats: async (days: number = 30) => {
    const { data, error } = await supabase
      .from('daily_marketplace_stats')
      .select('*')
      .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get overall marketplace statistics using optimized function
   */
  getOverview: async () => {
    const { data, error } = await supabase.rpc('get_marketplace_stats');
    if (error) throw error;
    return data[0];
  },

  /**
   * Get top performing products
   */
  getTopProducts: async (limit: number = 10) => {
    const { data, error } = await supabase
      .from('product_performance_metrics')
      .select('*')
      .order('total_revenue', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }
};

// =============================
// USER ANALYTICS
// =============================

export const userQueries = {
  /**
   * Get user engagement metrics using materialized view
   */
  getEngagement: async (userId: string) => {
    const { data, error } = await supabase
      .from('user_engagement_metrics')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get comprehensive user statistics using optimized function
   */
  getStats: async (userId: string) => {
    const { data, error } = await supabase.rpc('get_user_stats', { user_uuid: userId });
    if (error) throw error;
    return data[0];
  },

  /**
   * Get active users (engaged in last 7 days)
   */
  getActiveUsers: async () => {
    const { data, error } = await supabase
      .from('user_engagement_metrics')
      .select('user_id, username, total_orders, last_order_date')
      .eq('engagement_level', 'active')
      .order('last_order_date', { ascending: false });

    if (error) throw error;
    return data;
  }
};

// =============================
// ORDER MANAGEMENT
// =============================

export const orderQueries = {
  /**
   * Get active orders with stasher information using optimized view
   */
  getActiveOrders: async () => {
    const { data, error } = await supabase
      .from('active_orders_view')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get user orders with optimized composite index
   */
  getUserOrders: async (userId: string, status?: string) => {
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
  },

  /**
   * Get seller orders with optimized composite index
   */
  getSellerOrders: async (sellerId: string, status?: string) => {
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
};

// =============================
// PRODUCT ANALYTICS
// =============================

export const productQueries = {
  /**
   * Get product performance metrics using materialized view
   */
  getPerformance: async (sellerId?: string) => {
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
};

// =============================
// STASHER MANAGEMENT
// =============================

export const stasherQueries = {
  /**
   * Get stasher performance metrics using materialized view
   */
  getPerformance: async () => {
    const { data, error } = await supabase
      .from('stasher_performance_metrics')
      .select('*')
      .order('total_payouts', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get available stashers using optimized partial index
   */
  getAvailable: async () => {
    const { data, error } = await supabase
      .from('stasher_profiles')
      .select('*')
      .eq('is_available', true)
      .eq('is_online', true)
      .order('rating', { ascending: false });

    if (error) throw error;
    return data;
  }
};

// =============================
// SOCIAL FEATURES
// =============================

export const socialQueries = {
  /**
   * Get user social activity using optimized indexes
   */
  getUserActivity: async (userId: string) => {
    const { data, error } = await supabase
      .from('social_posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get social interactions using optimized composite index
   */
  getInteractions: async (userId: string, type?: string) => {
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
};

// =============================
// NOTIFICATIONS
// =============================

export const notificationQueries = {
  /**
   * Get user notifications using optimized composite index
   */
  getUserNotifications: async (userId: string, unreadOnly: boolean = false) => {
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
  },

  /**
   * Get unread notification count using optimized index
   */
  getUnreadCount: async (userId: string) => {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
    return count || 0;
  }
};

// =============================
// ANALYTICS EVENTS
// =============================

export const analyticsQueries = {
  /**
   * Get user analytics events using optimized composite index
   */
  getUserEvents: async (userId: string, eventType?: string) => {
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
};

// =============================
// MAINTENANCE & MONITORING
// =============================

export const maintenanceQueries = {
  /**
   * Get maintenance status
   */
  getStatus: async () => {
    const { data, error } = await supabase.rpc('get_maintenance_status');
    if (error) throw error;
    return data;
  },

  /**
   * Get partition statistics
   */
  getPartitionStats: async () => {
    const { data, error } = await supabase.rpc('get_partition_statistics');
    if (error) throw error;
    return data;
  },

  /**
   * Manually refresh materialized views
   */
  refreshViews: async () => {
    const { data, error } = await supabase.rpc('refresh_all_materialized_views');
    if (error) throw error;
    return data;
  },

  /**
   * Get recent maintenance logs
   */
  getLogs: async (limit: number = 50) => {
    const { data, error } = await supabase
      .from('maintenance_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }
};

// =============================
// DASHBOARD QUERIES
// =============================

export const dashboardQueries = {
  /**
   * Get comprehensive dashboard data
   */
  getData: async () => {
    const [
      marketplaceStats,
      activeOrders,
      topProducts,
      availableStashers,
      maintenanceStatus
    ] = await Promise.all([
      marketplaceQueries.getOverview(),
      orderQueries.getActiveOrders(),
      marketplaceQueries.getTopProducts(5),
      stasherQueries.getAvailable(),
      maintenanceQueries.getStatus()
    ]);

    return {
      marketplace: marketplaceStats,
      activeOrders: activeOrders.length,
      topProducts,
      availableStashers: availableStashers.length,
      maintenance: maintenanceStatus
    };
  },

  /**
   * Get user dashboard data
   */
  getUserData: async (userId: string) => {
    const [
      userStats,
      userEngagement,
      recentOrders,
      notifications
    ] = await Promise.all([
      userQueries.getStats(userId),
      userQueries.getEngagement(userId),
      orderQueries.getUserOrders(userId, 'pending'),
      notificationQueries.getUserNotifications(userId, true)
    ]);

    return {
      stats: userStats,
      engagement: userEngagement,
      pendingOrders: recentOrders.length,
      unreadNotifications: notifications.length
    };
  }
};

// =============================
// PERFORMANCE MONITORING
// =============================

export const performanceQueries = {
  /**
   * Monitor query performance
   */
  monitorPerformance: async () => {
    const startTime = Date.now();
    
    try {
      const data = await dashboardQueries.getData();
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
};

// Export all query groups
export default {
  marketplace: marketplaceQueries,
  user: userQueries,
  order: orderQueries,
  product: productQueries,
  stasher: stasherQueries,
  social: socialQueries,
  notification: notificationQueries,
  analytics: analyticsQueries,
  maintenance: maintenanceQueries,
  dashboard: dashboardQueries,
  performance: performanceQueries
};
