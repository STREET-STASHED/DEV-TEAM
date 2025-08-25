-- 🚀 StreetStashed Fee Fields Migration
-- Add new fee structure fields to orders table

-- Add new fee fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS distance_miles NUMERIC(8,2),
ADD COLUMN IF NOT EXISTS eta_minutes INTEGER,
ADD COLUMN IF NOT EXISTS driver_payout_amount NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS delivery_fee_amount NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS platform_margin_amount NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS support_fee_buyer NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS support_fee_seller NUMERIC(10,2);

-- Add comments for documentation
COMMENT ON COLUMN public.orders.distance_miles IS 'Delivery distance in miles';
COMMENT ON COLUMN public.orders.eta_minutes IS 'Estimated delivery time in minutes';
COMMENT ON COLUMN public.orders.driver_payout_amount IS 'Amount paid to driver for delivery';
COMMENT ON COLUMN public.orders.delivery_fee_amount IS 'Total delivery fee paid by buyer';
COMMENT ON COLUMN public.orders.platform_margin_amount IS 'Platform margin from delivery fee';
COMMENT ON COLUMN public.orders.support_fee_buyer IS 'Support fee paid by buyer';
COMMENT ON COLUMN public.orders.support_fee_seller IS 'Support fee paid by seller';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_distance_miles ON public.orders(distance_miles);
CREATE INDEX IF NOT EXISTS idx_orders_driver_payout ON public.orders(driver_payout_amount);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_fee ON public.orders(delivery_fee_amount);

-- Update existing orders with default values (if any exist)
UPDATE public.orders SET
  distance_miles = COALESCE(distance_miles, 0),
  eta_minutes = COALESCE(eta_minutes, 0),
  driver_payout_amount = COALESCE(driver_payout_amount, 0),
  delivery_fee_amount = COALESCE(delivery_fee_amount, 0),
  platform_margin_amount = COALESCE(platform_margin_amount, 0),
  support_fee_buyer = COALESCE(support_fee_buyer, 0),
  support_fee_seller = COALESCE(support_fee_seller, 0)
WHERE distance_miles IS NULL;

-- Add constraints for data integrity
ALTER TABLE public.orders 
ADD CONSTRAINT check_distance_miles CHECK (distance_miles >= 0),
ADD CONSTRAINT check_eta_minutes CHECK (eta_minutes >= 0),
ADD CONSTRAINT check_driver_payout CHECK (driver_payout_amount >= 0),
ADD CONSTRAINT check_delivery_fee CHECK (delivery_fee_amount >= 0),
ADD CONSTRAINT check_platform_margin CHECK (platform_margin_amount >= 0),
ADD CONSTRAINT check_support_fees CHECK (support_fee_buyer >= 0 AND support_fee_seller >= 0);

-- Create a function to calculate fees (for future use)
CREATE OR REPLACE FUNCTION public.calculate_order_fees(
  p_distance_miles NUMERIC,
  p_item_total NUMERIC,
  p_hour INTEGER DEFAULT EXTRACT(HOUR FROM NOW())
) RETURNS TABLE(
  driver_payout NUMERIC,
  delivery_fee NUMERIC,
  platform_margin NUMERIC,
  support_fee_buyer NUMERIC,
  support_fee_seller NUMERIC
) AS $$
DECLARE
  base_pay NUMERIC := 6.00;
  per_mile_rate NUMERIC := 0.60;
  night_bonus NUMERIC := 0;
  long_trip_bonus NUMERIC := 0;
  platform_margin_rate NUMERIC := 1.00;
  support_fee_rate NUMERIC := 0.005;
BEGIN
  -- Calculate driver pay
  driver_payout := base_pay + (per_mile_rate * p_distance_miles);
  
  -- Apply night bonus (after 10 PM)
  IF p_hour >= 22 THEN
    night_bonus := 1.00;
    driver_payout := driver_payout + night_bonus;
  END IF;
  
  -- Apply long trip bonus (10+ miles)
  IF p_distance_miles >= 10 THEN
    long_trip_bonus := 2.00;
    driver_payout := driver_payout + long_trip_bonus;
  END IF;
  
  -- Calculate delivery fee (driver pay + platform margin)
  delivery_fee := driver_payout + platform_margin_rate;
  
  -- Calculate support fees
  support_fee_buyer := GREATEST(0.25, LEAST(p_item_total * support_fee_rate, 4.00));
  support_fee_seller := GREATEST(0.25, LEAST(p_item_total * support_fee_rate, 4.00));
  
  RETURN QUERY SELECT
    ROUND(driver_payout, 2),
    ROUND(delivery_fee, 2),
    ROUND(platform_margin_rate, 2),
    ROUND(support_fee_buyer, 2),
    ROUND(support_fee_seller, 2);
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.calculate_order_fees TO authenticated;

-- Create a trigger to automatically update fee fields when order is created/updated
CREATE OR REPLACE FUNCTION public.update_order_fees()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if distance_miles is provided
  IF NEW.distance_miles IS NOT NULL AND NEW.distance_miles > 0 THEN
    -- Calculate fees using the function
    SELECT
      driver_payout,
      delivery_fee,
      platform_margin,
      support_fee_buyer,
      support_fee_seller
    INTO
      NEW.driver_payout_amount,
      NEW.delivery_fee_amount,
      NEW.platform_margin_amount,
      NEW.support_fee_buyer,
      NEW.support_fee_seller
    FROM public.calculate_order_fees(
      NEW.distance_miles,
      COALESCE(NEW.item_total, 0),
      EXTRACT(HOUR FROM public.NOW())
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_order_fees ON public.orders;
CREATE TRIGGER trigger_update_order_fees
  BEFORE INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_order_fees();
