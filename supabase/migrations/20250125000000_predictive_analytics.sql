-- Predictive Analytics & Smart Inventory Migration
-- Creates tables and functions for AI-powered inventory management
-- Inventory tracking with enhanced analytics
CREATE TABLE IF NOT EXISTS inventory_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    current_stock INTEGER NOT NULL DEFAULT 0,
    reserved_stock INTEGER NOT NULL DEFAULT 0,
    available_stock INTEGER GENERATED ALWAYS AS (current_stock - reserved_stock) STORED,
    cost_price DECIMAL(10, 2) NOT NULL,
    selling_price DECIMAL(10, 2) NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    brand TEXT,
    size_category TEXT,
    color_category TEXT,
    seasonality TEXT CHECK (
        seasonality IN (
            'spring',
            'summer',
            'fall',
            'winter',
            'year-round'
        )
    ),
    tags TEXT [] DEFAULT '{}',
    last_sold_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
-- Sales data for analytics
CREATE TABLE IF NOT EXISTS sales_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE
    SET NULL,
        buyer_id UUID REFERENCES auth.users(id) ON DELETE
    SET NULL,
        seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10, 2) NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        discount_amount DECIMAL(10, 2) DEFAULT 0,
        seasonality TEXT,
        weather_condition TEXT,
        marketing_campaign TEXT,
        traffic_source TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
);
-- Demand forecasts
CREATE TABLE IF NOT EXISTS demand_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    forecast_period INTEGER NOT NULL,
    -- days
    predicted_demand DECIMAL(10, 2) NOT NULL,
    confidence_lower DECIMAL(10, 2) NOT NULL,
    confidence_upper DECIMAL(10, 2) NOT NULL,
    seasonality_factor DECIMAL(5, 3) NOT NULL DEFAULT 1.0,
    trend_factor DECIMAL(5, 3) NOT NULL DEFAULT 1.0,
    marketing_factor DECIMAL(5, 3) NOT NULL DEFAULT 1.0,
    competitor_factor DECIMAL(5, 3) NOT NULL DEFAULT 1.0,
    weather_factor DECIMAL(5, 3) NOT NULL DEFAULT 1.0,
    accuracy_score DECIMAL(5, 3),
    -- Filled after forecast period
    generated_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL
);
-- Price optimizations
CREATE TABLE IF NOT EXISTS price_optimizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    current_price DECIMAL(10, 2) NOT NULL,
    recommended_price DECIMAL(10, 2) NOT NULL,
    price_elasticity DECIMAL(8, 4) NOT NULL,
    competitor_avg_price DECIMAL(10, 2),
    demand_sensitivity DECIMAL(5, 3) NOT NULL,
    profit_impact DECIMAL(12, 2) NOT NULL,
    recommendation_reason TEXT NOT NULL,
    confidence_score DECIMAL(5, 3) NOT NULL DEFAULT 0.5,
    implemented BOOLEAN DEFAULT false,
    implemented_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);
-- Trend analysis
CREATE TABLE IF NOT EXISTS trend_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    subcategory TEXT,
    trend_type TEXT NOT NULL CHECK (
        trend_type IN ('emerging', 'declining', 'stable', 'seasonal')
    ),
    confidence_score DECIMAL(5, 3) NOT NULL,
    predicted_growth DECIMAL(8, 4) NOT NULL,
    timeframe TEXT NOT NULL CHECK (timeframe IN ('short', 'medium', 'long')),
    influencers TEXT [] DEFAULT '{}',
    keywords TEXT [] DEFAULT '{}',
    social_mentions INTEGER DEFAULT 0,
    search_volume INTEGER DEFAULT 0,
    competitor_activity JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL
);
-- Supplier performance metrics
CREATE TABLE IF NOT EXISTS supplier_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    supplier_name TEXT NOT NULL,
    reliability_score DECIMAL(5, 3) NOT NULL DEFAULT 0.5,
    quality_score DECIMAL(5, 3) NOT NULL DEFAULT 0.5,
    avg_delivery_time DECIMAL(8, 2) NOT NULL,
    -- days
    cost_efficiency DECIMAL(5, 3) NOT NULL DEFAULT 0.5,
    trend_alignment DECIMAL(5, 3) NOT NULL DEFAULT 0.5,
    risk_score DECIMAL(5, 3) NOT NULL DEFAULT 0.5,
    total_orders INTEGER DEFAULT 0,
    on_time_deliveries INTEGER DEFAULT 0,
    quality_issues INTEGER DEFAULT 0,
    last_evaluated_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);
-- Inventory alerts
CREATE TABLE IF NOT EXISTS inventory_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type TEXT NOT NULL CHECK (
        alert_type IN (
            'low_stock',
            'overstock',
            'trend_opportunity',
            'price_alert',
            'supplier_issue'
        )
    ),
    severity TEXT NOT NULL CHECK (
        severity IN ('low', 'medium', 'high', 'critical')
    ),
    item_id UUID REFERENCES items(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    action_required TEXT NOT NULL,
    estimated_impact DECIMAL(12, 2) NOT NULL DEFAULT 0,
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES auth.users(id) ON DELETE
    SET NULL,
        created_at TIMESTAMPTZ DEFAULT now()
);
-- Market intelligence data
CREATE TABLE IF NOT EXISTS market_intelligence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    data_type TEXT NOT NULL CHECK (
        data_type IN (
            'competitor_price',
            'trend_data',
            'social_sentiment',
            'search_volume'
        )
    ),
    data_source TEXT NOT NULL,
    raw_data JSONB NOT NULL,
    processed_data JSONB,
    confidence_score DECIMAL(5, 3) DEFAULT 0.5,
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ
);
-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_analytics_item_id ON inventory_analytics(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_analytics_seller_id ON inventory_analytics(seller_id);
CREATE INDEX IF NOT EXISTS idx_inventory_analytics_category ON inventory_analytics(category);
CREATE INDEX IF NOT EXISTS idx_inventory_analytics_stock ON inventory_analytics(available_stock);
CREATE INDEX IF NOT EXISTS idx_sales_analytics_item_id ON sales_analytics(item_id);
CREATE INDEX IF NOT EXISTS idx_sales_analytics_created_at ON sales_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_analytics_seller_id ON sales_analytics(seller_id);
CREATE INDEX IF NOT EXISTS idx_demand_forecasts_item_id ON demand_forecasts(item_id);
CREATE INDEX IF NOT EXISTS idx_demand_forecasts_expires_at ON demand_forecasts(expires_at);
CREATE INDEX IF NOT EXISTS idx_price_optimizations_item_id ON price_optimizations(item_id);
CREATE INDEX IF NOT EXISTS idx_price_optimizations_created_at ON price_optimizations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trend_analyses_category ON trend_analyses(category);
CREATE INDEX IF NOT EXISTS idx_trend_analyses_trend_type ON trend_analyses(trend_type);
CREATE INDEX IF NOT EXISTS idx_trend_analyses_expires_at ON trend_analyses(expires_at);
CREATE INDEX IF NOT EXISTS idx_supplier_metrics_supplier_id ON supplier_metrics(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_metrics_reliability ON supplier_metrics(reliability_score DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_type_severity ON inventory_alerts(alert_type, severity);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_resolved ON inventory_alerts(is_resolved, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_intelligence_category ON market_intelligence(category);
CREATE INDEX IF NOT EXISTS idx_market_intelligence_expires_at ON market_intelligence(expires_at);
-- Enable RLS
ALTER TABLE inventory_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE demand_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_intelligence ENABLE ROW LEVEL SECURITY;
-- RLS Policies for inventory_analytics
CREATE POLICY "Sellers can view their inventory analytics" ON inventory_analytics FOR
SELECT USING (auth.uid() = seller_id);
CREATE POLICY "Sellers can update their inventory analytics" ON inventory_analytics FOR
UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Sellers can insert their inventory analytics" ON inventory_analytics FOR
INSERT WITH CHECK (auth.uid() = seller_id);
-- RLS Policies for sales_analytics
CREATE POLICY "Users can view their sales analytics" ON sales_analytics FOR
SELECT USING (
        auth.uid() = seller_id
        OR auth.uid() = buyer_id
    );
CREATE POLICY "System can insert sales analytics" ON sales_analytics FOR
INSERT WITH CHECK (true);
-- RLS Policies for demand_forecasts
CREATE POLICY "Sellers can view forecasts for their items" ON demand_forecasts FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM inventory_analytics ia
            WHERE ia.item_id = demand_forecasts.item_id
                AND ia.seller_id = auth.uid()
        )
    );
-- RLS Policies for price_optimizations
CREATE POLICY "Sellers can view price optimizations for their items" ON price_optimizations FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM inventory_analytics ia
            WHERE ia.item_id = price_optimizations.item_id
                AND ia.seller_id = auth.uid()
        )
    );
-- RLS Policies for trend_analyses (public read)
CREATE POLICY "Anyone can view trend analyses" ON trend_analyses FOR
SELECT USING (true);
-- RLS Policies for supplier_metrics
CREATE POLICY "Suppliers can view their own metrics" ON supplier_metrics FOR
SELECT USING (auth.uid() = supplier_id);
-- RLS Policies for inventory_alerts
CREATE POLICY "Users can view relevant alerts" ON inventory_alerts FOR
SELECT USING (
        auth.uid() = supplier_id
        OR EXISTS (
            SELECT 1
            FROM inventory_analytics ia
            WHERE ia.item_id = inventory_alerts.item_id
                AND ia.seller_id = auth.uid()
        )
    );
-- RLS Policies for market_intelligence (admin only for now)
CREATE POLICY "Admins can access market intelligence" ON market_intelligence FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE user_id = auth.uid()
                AND role = 'admin'
        )
    );
-- Functions for analytics calculations
-- Function to calculate demand forecast
CREATE OR REPLACE FUNCTION calculate_demand_forecast(
        p_item_id UUID,
        p_forecast_days INTEGER DEFAULT 30
    ) RETURNS TABLE (
        predicted_demand DECIMAL,
        confidence_lower DECIMAL,
        confidence_upper DECIMAL,
        seasonality_factor DECIMAL,
        trend_factor DECIMAL
    ) AS $$
DECLARE historical_sales RECORD;
avg_daily_sales DECIMAL;
sales_variance DECIMAL;
trend_multiplier DECIMAL;
seasonal_multiplier DECIMAL;
BEGIN -- Get historical sales data (last 90 days)
SELECT COALESCE(AVG(quantity), 0) as avg_sales,
    COALESCE(VARIANCE(quantity), 1) as variance INTO historical_sales
FROM sales_analytics
WHERE item_id = p_item_id
    AND created_at >= NOW() - INTERVAL '90 days';
avg_daily_sales := historical_sales.avg_sales;
sales_variance := GREATEST(historical_sales.variance, 1);
-- Simple trend calculation (recent vs older sales)
SELECT COALESCE(
        (
            SELECT AVG(quantity)
            FROM sales_analytics
            WHERE item_id = p_item_id
                AND created_at >= NOW() - INTERVAL '30 days'
        ) / NULLIF(
            (
                SELECT AVG(quantity)
                FROM sales_analytics
                WHERE item_id = p_item_id
                    AND created_at >= NOW() - INTERVAL '60 days'
                    AND created_at < NOW() - INTERVAL '30 days'
            ),
            0
        ),
        1.0
    ) INTO trend_multiplier;
-- Seasonal factor (simplified)
seasonal_multiplier := CASE
    WHEN EXTRACT(
        MONTH
        FROM NOW()
    ) IN (11, 12, 1) THEN 1.2 -- Winter/Holiday boost
    WHEN EXTRACT(
        MONTH
        FROM NOW()
    ) IN (6, 7, 8) THEN 1.1 -- Summer boost
    ELSE 1.0
END;
predicted_demand := avg_daily_sales * trend_multiplier * seasonal_multiplier * p_forecast_days;
confidence_lower := GREATEST(
    0,
    predicted_demand - (SQRT(sales_variance) * 1.96)
);
confidence_upper := predicted_demand + (SQRT(sales_variance) * 1.96);
seasonality_factor := seasonal_multiplier;
trend_factor := trend_multiplier;
RETURN QUERY
SELECT predicted_demand,
    confidence_lower,
    confidence_upper,
    seasonality_factor,
    trend_factor;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Function to update inventory analytics from sales
CREATE OR REPLACE FUNCTION update_inventory_from_sale() RETURNS TRIGGER AS $$ BEGIN -- Update stock levels
UPDATE inventory_analytics
SET current_stock = GREATEST(0, current_stock - NEW.quantity),
    last_sold_at = NEW.created_at,
    updated_at = NOW()
WHERE item_id = NEW.item_id;
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Function to generate low stock alerts
CREATE OR REPLACE FUNCTION check_low_stock_alerts() RETURNS VOID AS $$
DECLARE item_record RECORD;
forecast_record RECORD;
BEGIN FOR item_record IN
SELECT ia.*,
    i.name
FROM inventory_analytics ia
    JOIN items i ON ia.item_id = i.id
WHERE ia.available_stock > 0 LOOP -- Get demand forecast
SELECT * INTO forecast_record
FROM calculate_demand_forecast(item_record.item_id, 7);
-- Create alert if stock is low
IF item_record.available_stock < forecast_record.predicted_demand
AND forecast_record.predicted_demand > 0 THEN
INSERT INTO inventory_alerts (
        alert_type,
        severity,
        item_id,
        title,
        description,
        action_required,
        estimated_impact
    )
VALUES (
        'low_stock',
        CASE
            WHEN item_record.available_stock = 0 THEN 'critical'
            WHEN item_record.available_stock < forecast_record.predicted_demand * 0.3 THEN 'high'
            ELSE 'medium'
        END,
        item_record.item_id,
        'Low Stock Alert: ' || item_record.name,
        'Only ' || item_record.available_stock || ' units left, predicted demand: ' || forecast_record.predicted_demand,
        'Reorder inventory or adjust pricing',
        forecast_record.predicted_demand * item_record.selling_price
    ) ON CONFLICT DO NOTHING;
-- Avoid duplicate alerts
END IF;
END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Function to calculate price elasticity
CREATE OR REPLACE FUNCTION calculate_price_elasticity(p_item_id UUID) RETURNS DECIMAL AS $$
DECLARE elasticity DECIMAL;
BEGIN -- Simplified price elasticity calculation
-- In practice, this would use more sophisticated regression analysis
WITH price_quantity_data AS (
    SELECT unit_price,
        quantity,
        LAG(unit_price) OVER (
            ORDER BY created_at
        ) as prev_price,
        LAG(quantity) OVER (
            ORDER BY created_at
        ) as prev_quantity
    FROM sales_analytics
    WHERE item_id = p_item_id
        AND created_at >= NOW() - INTERVAL '90 days'
    ORDER BY created_at
),
elasticity_calc AS (
    SELECT AVG(
            CASE
                WHEN prev_price > 0
                AND prev_quantity > 0
                AND unit_price != prev_price THEN ((quantity - prev_quantity) / prev_quantity) / ((unit_price - prev_price) / prev_price)
                ELSE NULL
            END
        ) as calc_elasticity
    FROM price_quantity_data
    WHERE prev_price IS NOT NULL
)
SELECT COALESCE(calc_elasticity, -1.2) INTO elasticity
FROM elasticity_calc;
RETURN elasticity;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Trigger to update inventory from sales
CREATE TRIGGER update_inventory_on_sale
AFTER
INSERT ON sales_analytics FOR EACH ROW EXECUTE FUNCTION update_inventory_from_sale();
-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_analytics_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER update_inventory_analytics_updated_at BEFORE
UPDATE ON inventory_analytics FOR EACH ROW EXECUTE FUNCTION update_analytics_updated_at();
-- Grant permissions
GRANT SELECT,
    INSERT,
    UPDATE ON inventory_analytics TO authenticated;
GRANT SELECT,
    INSERT ON sales_analytics TO authenticated;
GRANT SELECT ON demand_forecasts TO authenticated;
GRANT SELECT ON price_optimizations TO authenticated;
GRANT SELECT ON trend_analyses TO authenticated;
GRANT SELECT ON supplier_metrics TO authenticated;
GRANT SELECT ON inventory_alerts TO authenticated;
GRANT SELECT ON market_intelligence TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_demand_forecast TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_price_elasticity TO authenticated;
GRANT EXECUTE ON FUNCTION check_low_stock_alerts TO authenticated;
-- Insert sample trend analyses
INSERT INTO trend_analyses (
        category,
        trend_type,
        confidence_score,
        predicted_growth,
        timeframe,
        influencers,
        keywords,
        expires_at
    )
VALUES (
        'streetwear',
        'emerging',
        0.85,
        0.45,
        'short',
        ARRAY ['@streetwear_king', '@urban_style_guru'],
        ARRAY ['oversized', 'vintage', 'y2k'],
        NOW() + INTERVAL '30 days'
    ),
    (
        'sneakers',
        'stable',
        0.72,
        0.12,
        'medium',
        ARRAY ['@sneaker_head_daily', '@kicks_on_fire'],
        ARRAY ['retro', 'chunky', 'basketball'],
        NOW() + INTERVAL '30 days'
    ),
    (
        'accessories',
        'seasonal',
        0.68,
        0.25,
        'medium',
        ARRAY ['@accessory_master', '@bling_boss'],
        ARRAY ['statement', 'minimalist', 'gold'],
        NOW() + INTERVAL '30 days'
    ) ON CONFLICT DO NOTHING;