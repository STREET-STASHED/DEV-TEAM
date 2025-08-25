-- Complete Stasher Migration
-- Migrates from driver_profiles to stasher_profiles and updates all references
-- 1. Update order_status_history to reference stasher_profiles instead of driver_profiles
ALTER TABLE public.order_status_history DROP CONSTRAINT IF EXISTS order_status_history_driver_id_fkey;
ALTER TABLE public.order_status_history
ADD CONSTRAINT order_status_history_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.stasher_profiles(id) ON DELETE
SET NULL;
-- 2. Update driver_assignments to reference stasher_profiles
ALTER TABLE public.driver_assignments DROP CONSTRAINT IF EXISTS driver_assignments_driver_id_fkey;
ALTER TABLE public.driver_assignments
ADD CONSTRAINT driver_assignments_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.stasher_profiles(id) ON DELETE CASCADE;
-- 3. Update driver_earnings to reference stasher_profiles
ALTER TABLE public.driver_earnings DROP CONSTRAINT IF EXISTS driver_earnings_driver_id_fkey;
ALTER TABLE public.driver_earnings
ADD CONSTRAINT driver_earnings_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.stasher_profiles(id) ON DELETE CASCADE;
-- 4. Update driver_schedules to reference stasher_profiles
ALTER TABLE public.driver_schedules DROP CONSTRAINT IF EXISTS driver_schedules_driver_id_fkey;
ALTER TABLE public.driver_schedules
ADD CONSTRAINT driver_schedules_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.stasher_profiles(id) ON DELETE CASCADE;
-- 5. Update driver_metrics to reference stasher_profiles
ALTER TABLE public.driver_metrics DROP CONSTRAINT IF EXISTS driver_metrics_driver_id_fkey;
ALTER TABLE public.driver_metrics
ADD CONSTRAINT driver_metrics_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.stasher_profiles(id) ON DELETE CASCADE;
-- 6. Update driver_stats to reference stasher_profiles
ALTER TABLE public.driver_stats DROP CONSTRAINT IF EXISTS driver_stats_driver_id_fkey;
ALTER TABLE public.driver_stats
ADD CONSTRAINT driver_stats_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.stasher_profiles(id) ON DELETE CASCADE;
-- 7. Update orders table to reference stasher_profiles
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_driver_id_fkey;
ALTER TABLE public.orders
ADD CONSTRAINT orders_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.stasher_profiles(id) ON DELETE
SET NULL;
-- 8. Update the add_order_status_history function to use stasher_profiles
CREATE OR REPLACE FUNCTION public.add_order_status_history() RETURNS TRIGGER AS $$ BEGIN -- Only add history if status actually changed
    IF OLD.status IS DISTINCT
FROM NEW.status THEN
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
            SELECT 'Stasher ' || id::text
            FROM public.stasher_profiles
            WHERE id = NEW.driver_id
        ),
        (
            SELECT 'N/A'
            FROM public.stasher_profiles
            WHERE id = NEW.driver_id
        ),
        CASE
            WHEN NEW.status = 'picked_up' THEN 'Picked up from seller location'
            WHEN NEW.status = 'in_transit' THEN 'En route to delivery location'
            WHEN NEW.status = 'delivered' THEN 'Delivered to buyer'
            ELSE NULL
        END,
        CASE
            WHEN NEW.status = 'assigned_to_driver' THEN 'Stasher assigned to order'
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
-- Log the migration completion
SELECT 'Stasher migration completed successfully' as status;