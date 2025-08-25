-- Update Orders Table Migration
-- Adds driver-related fields and payment tracking
-- Add driver-related columns to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS driver_id UUID REFERENCES public.driver_profiles(user_id),
  ADD COLUMN IF NOT EXISTS driver_assigned_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS driver_picked_up_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS driver_delivered_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_intent_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (
    payment_status IN (
      'pending',
      'processing',
      'completed',
      'failed',
      'refunded'
    )
  ),
  ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(8, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS driver_pay DECIMAL(8, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS platform_margin DECIMAL(8, 2) DEFAULT 0.00;
-- Add indexes for driver-related queries
CREATE INDEX IF NOT EXISTS idx_orders_driver_id ON public.orders(driver_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_ready_for_pickup ON public.orders(status, driver_id)
WHERE status = 'ready_for_pickup';
-- Update existing orders to have default values
UPDATE public.orders
SET delivery_fee = COALESCE(delivery_fee, 0.00),
  driver_pay = COALESCE(driver_pay, 0.00),
  platform_margin = COALESCE(platform_margin, 0.00)
WHERE delivery_fee IS NULL
  OR driver_pay IS NULL
  OR platform_margin IS NULL;
-- Function to calculate delivery fees and driver pay
CREATE OR REPLACE FUNCTION public.calculate_order_fees(
    order_distance DECIMAL,
    order_total DECIMAL
  ) RETURNS TABLE(
    delivery_fee DECIMAL,
    driver_pay DECIMAL,
    platform_margin DECIMAL
  ) AS $$ BEGIN -- Base delivery fee: $5 + $2 per mile
  delivery_fee := 5.00 + (order_distance * 2.00);
-- Driver gets 70% of delivery fee
driver_pay := delivery_fee * 0.70;
-- Platform margin: 30% of delivery fee
platform_margin := delivery_fee * 0.30;
RETURN QUERY
SELECT delivery_fee,
  driver_pay,
  platform_margin;
END;
$$ LANGUAGE plpgsql;
-- Function to update order fees when distance changes
CREATE OR REPLACE FUNCTION public.update_order_fees() RETURNS TRIGGER AS $$
DECLARE fee_calc RECORD;
BEGIN -- Only update if distance changed
IF OLD.distance_miles IS DISTINCT
FROM public.NEW.distance_miles THEN
SELECT * INTO fee_calc
FROM public.calculate_order_fees(NEW.distance_miles, NEW.total_amount);
NEW.delivery_fee := fee_calc.delivery_fee;
NEW.driver_pay := fee_calc.driver_pay;
NEW.platform_margin := fee_calc.platform_margin;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Drop existing trigger if it exists, then create new one
DROP TRIGGER IF EXISTS trigger_update_order_fees ON public.orders;
CREATE TRIGGER trigger_update_order_fees BEFORE
UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_order_fees();
-- Function to get orders ready for driver assignment
CREATE OR REPLACE FUNCTION public.get_orders_ready_for_drivers() RETURNS TABLE(
    order_id UUID,
    buyer_name TEXT,
    seller_name TEXT,
    pickup_address TEXT,
    delivery_address TEXT,
    total_amount DECIMAL,
    distance_miles DECIMAL,
    created_at TIMESTAMPTZ
  ) AS $$ BEGIN RETURN QUERY
SELECT o.id,
  b.full_name,
  s.full_name,
  o.pickup_address,
  o.delivery_address,
  o.total_amount,
  o.distance_miles,
  o.created_at
FROM public.orders o
  LEFT JOIN public.profiles b ON o.buyer_id = b.user_id
  LEFT JOIN public.profiles s ON o.seller_id = s.user_id
WHERE public.o.status = 'ready_for_pickup'
  AND o.driver_id IS NULL
ORDER BY o.created_at ASC;
END;
$$ LANGUAGE plpgsql;
-- Function to get driver's active orders
CREATE OR REPLACE FUNCTION public.get_driver_active_orders(driver_uuid UUID) RETURNS TABLE(
    order_id UUID,
    status TEXT,
    pickup_address TEXT,
    delivery_address TEXT,
    total_amount DECIMAL,
    distance_miles DECIMAL,
    assigned_at TIMESTAMPTZ
  ) AS $$ BEGIN RETURN QUERY
SELECT o.id,
  o.status,
  o.pickup_address,
  o.delivery_address,
  o.total_amount,
  o.distance_miles,
  o.driver_assigned_at
FROM public.orders o
WHERE public.o.driver_id = driver_uuid
  AND o.status IN ('assigned_to_driver', 'picked_up', 'in_transit')
ORDER BY o.driver_assigned_at ASC;
END;
$$ LANGUAGE plpgsql;
-- Function to get driver's earnings for a period
CREATE OR REPLACE FUNCTION public.get_driver_earnings(
    driver_uuid UUID,
    start_date DATE,
    end_date DATE
  ) RETURNS TABLE(
    total_orders INTEGER,
    total_distance DECIMAL,
    total_earnings DECIMAL,
    average_per_order DECIMAL
  ) AS $$ BEGIN RETURN QUERY
SELECT COUNT(*)::INTEGER,
  COALESCE(SUM(o.distance_miles), 0.00),
  COALESCE(SUM(o.driver_pay), 0.00),
  COALESCE(AVG(o.driver_pay), 0.00)
FROM public.orders o
WHERE public.o.driver_id = driver_uuid
  AND o.status = 'delivered'
  AND o.driver_delivered_at::DATE BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;
-- Update RLS policies for orders table
-- Allow drivers to see orders assigned to them
CREATE POLICY orders_select_assigned_driver ON public.orders FOR
SELECT USING (
    driver_id = auth.uid()
    OR buyer_id = auth.uid()
    OR seller_id = auth.uid()
  );
-- Allow drivers to update orders assigned to them
CREATE POLICY orders_update_assigned_driver ON public.orders FOR
UPDATE USING (driver_id = auth.uid());
-- Allow order participants to update order status
CREATE POLICY orders_update_participants ON public.orders FOR
UPDATE USING (
    buyer_id = auth.uid()
    OR seller_id = auth.uid()
  );
-- Insert sample data for testing (optional)
-- UPDATE public.orders 
-- SET delivery_fee = 8.00, driver_pay = 5.60, platform_margin = 2.40
-- WHERE delivery_fee = 0.00;