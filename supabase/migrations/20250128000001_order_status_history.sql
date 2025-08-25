-- Create order_status_history table for tracking delivery status updates
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  driver_id UUID REFERENCES public.driver_profiles(id),
  driver_name VARCHAR(255),
  driver_phone VARCHAR(20),
  location TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON public.order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_timestamp ON public.order_status_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_order_status_history_status ON public.order_status_history(status);
CREATE INDEX IF NOT EXISTS idx_order_status_history_driver_id ON public.order_status_history(driver_id);
-- Enable Row Level Security
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
-- RLS Policies
CREATE POLICY "Users can view status history for their own orders" ON public.order_status_history FOR
SELECT USING (
    order_id IN (
      SELECT id
      FROM public.orders
      WHERE buyer_id = auth.uid()
    )
  );
CREATE POLICY "Drivers can view status history for orders assigned to them" ON public.order_status_history FOR
SELECT USING (
    order_id IN (
      SELECT id
      FROM public.orders
      WHERE driver_id = auth.uid()
    )
  );
CREATE POLICY "System can insert status history" ON public.order_status_history FOR
INSERT WITH CHECK (true);
CREATE POLICY "System can update status history" ON public.order_status_history FOR
UPDATE USING (true);
-- Create function to automatically add status history when order status changes
CREATE OR REPLACE FUNCTION public.add_order_status_history() RETURNS TRIGGER AS $$ BEGIN -- Only add history if status actually changed
  IF OLD.status IS DISTINCT
FROM public.NEW.status THEN
INSERT INTO public.order_status_history (
    order_id,
    status,
    driver_id,
    driver_name,
    driver_phone,
    location,
    notes
  )
VALUES (
    NEW.id,
    NEW.status,
    NEW.driver_id,
    (
      SELECT full_name
      FROM public.driver_profiles
      WHERE user_id = NEW.driver_id
    ),
    (
      SELECT phone
      FROM public.driver_profiles
      WHERE user_id = NEW.driver_id
    ),
    CASE
      WHEN NEW.status = 'picked_up' THEN 'Picked up from seller location'
      WHEN NEW.status = 'in_transit' THEN 'En route to delivery location'
      WHEN NEW.status = 'delivered' THEN 'Delivered to buyer'
      ELSE NULL
    END,
    CASE
      WHEN NEW.status = 'assigned_to_driver' THEN 'Driver assigned to order'
      WHEN NEW.status = 'picked_up' THEN 'Order picked up successfully'
      WHEN NEW.status = 'in_transit' THEN 'Order in transit to delivery location'
      WHEN NEW.status = 'delivered' THEN 'Order delivered successfully'
      ELSE 'Status updated'
    END
  );
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Create trigger to automatically add status history
DROP TRIGGER IF EXISTS trigger_add_order_status_history ON public.orders;
CREATE TRIGGER trigger_add_order_status_history
AFTER
UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.add_order_status_history();
-- Insert initial status history for existing orders
INSERT INTO public.order_status_history (order_id, status, timestamp, notes)
SELECT id,
  status,
  created_at,
  'Order created'
FROM public.orders
WHERE NOT EXISTS (
    SELECT 1
    FROM public.order_status_history
    WHERE order_id = orders.id
  );