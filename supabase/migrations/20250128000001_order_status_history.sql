-- Create order_status_history table for tracking delivery status updates
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  driver_id UUID REFERENCES driver_profiles(user_id),
  driver_name VARCHAR(255),
  driver_phone VARCHAR(20),
  location TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_timestamp ON order_status_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_order_status_history_status ON order_status_history(status);
CREATE INDEX IF NOT EXISTS idx_order_status_history_driver_id ON order_status_history(driver_id);

-- Enable Row Level Security
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view status history for their own orders" ON order_status_history
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM orders WHERE buyer_id = auth.uid()
    )
  );

CREATE POLICY "Drivers can view status history for orders assigned to them" ON order_status_history
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM orders WHERE driver_id = auth.uid()
    )
  );

CREATE POLICY "System can insert status history" ON order_status_history
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update status history" ON order_status_history
  FOR UPDATE USING (true);

-- Create function to automatically add status history when order status changes
CREATE OR REPLACE FUNCTION add_order_status_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Only add history if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_history (
      order_id,
      status,
      driver_id,
      driver_name,
      driver_phone,
      location,
      notes
    ) VALUES (
      NEW.id,
      NEW.status,
      NEW.driver_id,
      (SELECT full_name FROM driver_profiles WHERE user_id = NEW.driver_id),
      (SELECT phone FROM driver_profiles WHERE user_id = NEW.driver_id),
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
DROP TRIGGER IF EXISTS trigger_add_order_status_history ON orders;
CREATE TRIGGER trigger_add_order_status_history
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION add_order_status_history();

-- Insert initial status history for existing orders
INSERT INTO order_status_history (order_id, status, timestamp, notes)
SELECT 
  id,
  status,
  created_at,
  'Order created'
FROM orders
WHERE NOT EXISTS (
  SELECT 1 FROM order_status_history WHERE order_id = orders.id
);
