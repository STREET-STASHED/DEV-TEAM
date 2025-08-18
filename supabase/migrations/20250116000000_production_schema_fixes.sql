-- 🚀 StreetStashed Production Schema Fixes
-- This migration fixes all schema inconsistencies and adds missing production tables
-- 1. Fix duplicate table definitions and add missing tables
-- =====================================================
-- Add missing notifications table for user notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type text NOT NULL,
    title text,
    message text,
    data jsonb,
    read boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
-- Add missing error_logs table for monitoring
CREATE TABLE IF NOT EXISTS public.error_logs (
    id bigserial PRIMARY KEY,
    message text NOT NULL,
    stack text,
    component text,
    user_id uuid REFERENCES public.profiles(id),
    session_id text,
    timestamp timestamptz NOT NULL,
    url text,
    user_agent text,
    metadata jsonb,
    environment text DEFAULT 'production',
    severity text DEFAULT 'error' CHECK (
        severity IN ('debug', 'info', 'warn', 'error', 'fatal')
    ),
    created_at timestamptz DEFAULT now()
);
-- Add missing performance_metrics table
CREATE TABLE IF NOT EXISTS public.performance_metrics (
    id bigserial PRIMARY KEY,
    name text NOT NULL,
    value numeric NOT NULL,
    category text NOT NULL,
    user_id uuid REFERENCES public.profiles(id),
    session_id text,
    timestamp timestamptz NOT NULL,
    url text,
    metadata jsonb,
    created_at timestamptz DEFAULT now()
);
-- Add missing user_events table for analytics
CREATE TABLE IF NOT EXISTS public.user_events (
    id bigserial PRIMARY KEY,
    event text NOT NULL,
    user_id uuid REFERENCES public.profiles(id),
    session_id text NOT NULL,
    timestamp timestamptz NOT NULL,
    url text,
    properties jsonb,
    created_at timestamptz DEFAULT now()
);
-- Add missing stripe_accounts table for seller verification
CREATE TABLE IF NOT EXISTS public.stripe_accounts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    stripe_account_id text UNIQUE NOT NULL,
    charges_enabled boolean DEFAULT false,
    payouts_enabled boolean DEFAULT false,
    verification_status text DEFAULT 'pending',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
-- Add missing subscriptions table for premium features
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    stripe_subscription_id text UNIQUE NOT NULL,
    status text NOT NULL,
    tier text DEFAULT 'free',
    current_period_start timestamptz,
    current_period_end timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
-- 2. Fix existing table structures
-- ===============================
-- Fix profiles table - add missing columns and constraints
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
    ADD COLUMN IF NOT EXISTS phone text,
    ADD COLUMN IF NOT EXISTS avatar_url text,
    ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS last_active timestamptz DEFAULT now();
-- Fix orders table - add missing columns for production
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
    ADD COLUMN IF NOT EXISTS stripe_charge_id text,
    ADD COLUMN IF NOT EXISTS charge_amount numeric,
    ADD COLUMN IF NOT EXISTS charge_currency text DEFAULT 'usd',
    ADD COLUMN IF NOT EXISTS charge_status text,
    ADD COLUMN IF NOT EXISTS paid_at timestamptz,
    ADD COLUMN IF NOT EXISTS payment_failed_at timestamptz,
    ADD COLUMN IF NOT EXISTS charge_failed_at timestamptz,
    ADD COLUMN IF NOT EXISTS estimated_delivery timestamptz,
    ADD COLUMN IF NOT EXISTS actual_delivery timestamptz,
    ADD COLUMN IF NOT EXISTS delivery_notes text,
    ADD COLUMN IF NOT EXISTS cancellation_reason text,
    ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;
-- Fix products table - add missing columns
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS sku text,
    ADD COLUMN IF NOT EXISTS inventory_count integer DEFAULT 0,
    ADD COLUMN IF NOT EXISTS weight numeric,
    ADD COLUMN IF NOT EXISTS dimensions jsonb,
    ADD COLUMN IF NOT EXISTS tags text [],
    ADD COLUMN IF NOT EXISTS condition text DEFAULT 'new',
    ADD COLUMN IF NOT EXISTS brand text,
    ADD COLUMN IF NOT EXISTS model text,
    ADD COLUMN IF NOT EXISTS year integer,
    ADD COLUMN IF NOT EXISTS size text,
    ADD COLUMN IF NOT EXISTS color text;
-- 3. Add missing indexes for performance
-- =====================================
-- Performance indexes for orders
CREATE INDEX IF NOT EXISTS orders_stripe_payment_intent_id_idx ON public.orders(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS orders_updated_at_idx ON public.orders(updated_at);
CREATE INDEX IF NOT EXISTS orders_status_created_at_idx ON public.orders(status, created_at);
-- Performance indexes for products
CREATE INDEX IF NOT EXISTS products_sku_idx ON public.products(sku);
CREATE INDEX IF NOT EXISTS products_brand_idx ON public.products(brand);
CREATE INDEX IF NOT EXISTS products_category_idx ON public.products(category);
CREATE INDEX IF NOT EXISTS products_price_idx ON public.products(price);
CREATE INDEX IF NOT EXISTS products_created_at_idx ON public.products(created_at);
-- Performance indexes for notifications
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_type_idx ON public.notifications(type);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON public.notifications(read);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications(created_at);
-- Performance indexes for error_logs
CREATE INDEX IF NOT EXISTS error_logs_user_id_idx ON public.error_logs(user_id);
CREATE INDEX IF NOT EXISTS error_logs_severity_idx ON public.error_logs(severity);
CREATE INDEX IF NOT EXISTS error_logs_timestamp_idx ON public.error_logs(timestamp);
CREATE INDEX IF NOT EXISTS error_logs_environment_idx ON public.error_logs(environment);
-- Performance indexes for performance_metrics
CREATE INDEX IF NOT EXISTS performance_metrics_user_id_idx ON public.performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS performance_metrics_category_idx ON public.performance_metrics(category);
CREATE INDEX IF NOT EXISTS performance_metrics_timestamp_idx ON public.performance_metrics(timestamp);
-- Performance indexes for user_events
CREATE INDEX IF NOT EXISTS user_events_user_id_idx ON public.user_events(user_id);
CREATE INDEX IF NOT EXISTS user_events_event_idx ON public.user_events(event);
CREATE INDEX IF NOT EXISTS user_events_timestamp_idx ON public.user_events(timestamp);
-- 4. Enable RLS on new tables
-- ============================
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
-- 5. Add RLS policies for new tables
-- ===================================
-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR
UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- Error logs policies (admin only for production)
CREATE POLICY "Admins can view all error logs" ON public.error_logs FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid()
            AND p.role = 'admin'
    )
);
-- Performance metrics policies
CREATE POLICY "Users can view their own performance metrics" ON public.performance_metrics FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own performance metrics" ON public.performance_metrics FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- User events policies
CREATE POLICY "Users can view their own events" ON public.user_events FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own events" ON public.user_events FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Stripe accounts policies
CREATE POLICY "Users can view their own stripe account" ON public.stripe_accounts FOR
SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Users can manage their own stripe account" ON public.stripe_accounts FOR ALL USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);
-- Subscriptions policies
CREATE POLICY "Users can view their own subscription" ON public.subscriptions FOR
SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Users can manage their own subscription" ON public.subscriptions FOR ALL USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);
-- 6. Add admin bypass policies for all new tables
-- ===============================================
CREATE POLICY "Admin bypass - notifications" ON public.notifications FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid()
            AND p.role = 'admin'
    )
);
CREATE POLICY "Admin bypass - stripe_accounts" ON public.stripe_accounts FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid()
            AND p.role = 'admin'
    )
);
CREATE POLICY "Admin bypass - subscriptions" ON public.subscriptions FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid()
            AND p.role = 'admin'
    )
);
-- 7. Add triggers for updated_at columns
-- ======================================
-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Add updated_at triggers to new tables
CREATE TRIGGER set_notifications_updated_at BEFORE
UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_stripe_accounts_updated_at BEFORE
UPDATE ON public.stripe_accounts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_subscriptions_updated_at BEFORE
UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
-- 8. Add database functions for common operations
-- ==============================================
-- Function to get order total from order_items
CREATE OR REPLACE FUNCTION public.get_order_total(order_uuid uuid) RETURNS numeric AS $$
DECLARE total numeric;
BEGIN
SELECT COALESCE(SUM(price * quantity), 0) INTO total
FROM public.order_items
WHERE order_id = order_uuid;
RETURN total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Function to update order total when items change
CREATE OR REPLACE FUNCTION public.update_order_total() RETURNS TRIGGER AS $$ BEGIN IF TG_OP = 'DELETE' THEN
UPDATE public.orders
SET total = public.get_order_total(OLD.order_id),
    updated_at = NOW()
WHERE id = OLD.order_id;
RETURN OLD;
ELSE
UPDATE public.orders
SET total = public.get_order_total(NEW.order_id),
    updated_at = NOW()
WHERE id = NEW.order_id;
RETURN NEW;
END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Add trigger to automatically update order totals
CREATE TRIGGER update_order_total_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON public.order_items FOR EACH ROW EXECUTE FUNCTION public.update_order_total();
-- 9. Add database constraints for data integrity
-- =============================================
-- Add check constraints for order status
ALTER TABLE public.orders
ADD CONSTRAINT orders_status_check CHECK (
        status IN (
            'pending',
            'processing',
            'paid',
            'shipped',
            'delivered',
            'cancelled',
            'refunded',
            'payment_failed',
            'charge_failed'
        )
    );
-- Add check constraints for product condition
ALTER TABLE public.products
ADD CONSTRAINT products_condition_check CHECK (
        condition IN (
            'new',
            'like_new',
            'excellent',
            'good',
            'fair',
            'poor'
        )
    );
-- Add check constraints for notification types
ALTER TABLE public.notifications
ADD CONSTRAINT notifications_type_check CHECK (
        type IN (
            'payment_received',
            'payment_confirmed',
            'payment_failed',
            'order_shipped',
            'order_delivered',
            'order_cancelled',
            'driver_assigned',
            'driver_update'
        )
    );
-- 10. Grant necessary permissions
-- ==============================
-- Grant usage on schema to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
-- Grant necessary permissions on new tables
GRANT SELECT,
    INSERT,
    UPDATE,
    DELETE ON public.notifications TO authenticated;
GRANT SELECT ON public.error_logs TO authenticated;
GRANT SELECT,
    INSERT ON public.performance_metrics TO authenticated;
GRANT SELECT,
    INSERT ON public.user_events TO authenticated;
GRANT SELECT,
    INSERT,
    UPDATE,
    DELETE ON public.stripe_accounts TO authenticated;
GRANT SELECT,
    INSERT,
    UPDATE,
    DELETE ON public.subscriptions TO authenticated;
-- Grant usage on sequences
GRANT USAGE,
    SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
-- 11. Create database views for common queries
-- ===========================================
-- View for order summary with items
CREATE OR REPLACE VIEW public.order_summary AS
SELECT o.id,
    o.buyer_id,
    o.seller_id,
    o.driver_id,
    o.status,
    o.total,
    o.city,
    o.created_at,
    o.updated_at,
    COUNT(oi.id) as item_count,
    ARRAY_AGG(oi.name) as item_names
FROM public.orders o
    LEFT JOIN public.order_items oi ON o.id = oi.order_id
GROUP BY o.id,
    o.buyer_id,
    o.seller_id,
    o.driver_id,
    o.status,
    o.total,
    o.city,
    o.created_at,
    o.updated_at;
-- View for user dashboard data
CREATE OR REPLACE VIEW public.user_dashboard AS
SELECT p.id,
    p.full_name,
    p.role,
    p.email,
    COUNT(DISTINCT o.id) as total_orders,
    COUNT(
        DISTINCT CASE
            WHEN o.status = 'delivered' THEN o.id
        END
    ) as completed_orders,
    COALESCE(
        SUM(
            CASE
                WHEN o.status = 'delivered' THEN o.total
            END
        ),
        0
    ) as total_spent
FROM public.profiles p
    LEFT JOIN public.orders o ON p.id = o.buyer_id
GROUP BY p.id,
    p.full_name,
    p.role,
    p.email;
-- Grant access to views
GRANT SELECT ON public.order_summary TO authenticated;
GRANT SELECT ON public.user_dashboard TO authenticated;
-- 12. Final cleanup and optimization
-- =================================
-- Analyze tables for query optimization
ANALYZE public.orders;
ANALYZE public.order_items;
ANALYZE public.products;
ANALYZE public.profiles;
ANALYZE public.notifications;
ANALYZE public.error_logs;
ANALYZE public.performance_metrics;
ANALYZE public.user_events;
ANALYZE public.stripe_accounts;
ANALYZE public.subscriptions;
-- Vacuum tables to reclaim space and update statistics
VACUUM ANALYZE;
-- Migration complete
SELECT 'Production schema fixes completed successfully' as status;