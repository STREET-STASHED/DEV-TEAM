-- Driver System Migration
-- Creates comprehensive driver management system
-- Driver profiles table already exists from earlier migration
-- Adding additional columns if they don't exist
ALTER TABLE public.driver_profiles
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS insurance_info JSONB,
  ADD COLUMN IF NOT EXISTS background_check_status TEXT DEFAULT 'pending' CHECK (
    background_check_status IN ('pending', 'approved', 'rejected')
  );
-- Driver assignments tracking
CREATE TABLE IF NOT EXISTS public.driver_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES public.driver_profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  picked_up_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  assignment_method TEXT DEFAULT 'smart_matching' CHECK (
    assignment_method IN ('manual', 'smart_matching', 'first_come')
  ),
  driver_rating DECIMAL(3, 2),
  driver_completion_rate INTEGER,
  assignment_score DECIMAL(3, 2),
  -- How well the driver matched the order
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- Driver earnings tracking
CREATE TABLE IF NOT EXISTS public.driver_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES public.driver_profiles(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  base_delivery_fee DECIMAL(8, 2) NOT NULL,
  distance_bonus DECIMAL(8, 2) DEFAULT 0.00,
  time_bonus DECIMAL(8, 2) DEFAULT 0.00,
  tip_amount DECIMAL(8, 2) DEFAULT 0.00,
  total_earnings DECIMAL(8, 2) NOT NULL,
  platform_fee DECIMAL(8, 2) NOT NULL,
  driver_payout DECIMAL(8, 2) NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (
    payment_status IN ('pending', 'processing', 'paid', 'failed')
  ),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- Driver availability schedule
CREATE TABLE IF NOT EXISTS public.driver_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES public.driver_profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (
    day_of_week >= 0
    AND day_of_week <= 6
  ),
  -- 0 = Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(driver_id, day_of_week)
);
-- Driver performance metrics
CREATE TABLE IF NOT EXISTS public.driver_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES public.driver_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  orders_completed INTEGER DEFAULT 0,
  orders_cancelled INTEGER DEFAULT 0,
  total_distance DECIMAL(8, 2) DEFAULT 0.00,
  total_earnings DECIMAL(8, 2) DEFAULT 0.00,
  average_delivery_time INTEGER DEFAULT 0,
  -- in minutes
  customer_rating DECIMAL(3, 2),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(driver_id, date)
);
-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_driver_profiles_online ON public.driver_profiles(is_online, is_available);
CREATE INDEX IF NOT EXISTS idx_driver_profiles_rating ON public.driver_profiles(rating DESC);
CREATE INDEX IF NOT EXISTS idx_driver_assignments_order ON public.driver_assignments(order_id);
CREATE INDEX IF NOT EXISTS idx_driver_assignments_driver ON public.driver_assignments(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_earnings_driver ON public.driver_earnings(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_earnings_date ON public.driver_earnings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_driver_schedules_driver ON public.driver_schedules(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_metrics_driver_date ON public.driver_metrics(driver_id, date DESC);
-- Basic RLS enablement (policies will be added in a separate migration)
ALTER TABLE public.driver_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_metrics ENABLE ROW LEVEL SECURITY;
-- Simple function for driver availability
CREATE OR REPLACE FUNCTION public.update_driver_availability() RETURNS TRIGGER AS $$ BEGIN -- Update driver availability when order status changes
  IF NEW.status = 'delivered'
  AND OLD.status != 'delivered' THEN
UPDATE public.driver_profiles
SET is_available = true,
  current_order_id = NULL
WHERE id = NEW.driver_id;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Trigger to automatically update driver availability
CREATE TRIGGER trigger_update_driver_availability
AFTER
UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_driver_availability();