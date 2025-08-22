-- Add Notifications Table Migration
-- This migration creates the notifications table that the app is trying to query

-- =============================
-- NOTIFICATIONS TABLE
-- =============================
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info' CHECK (
    type IN ('info', 'success', 'warning', 'error', 'order', 'payment', 'social')
  ),
  read boolean DEFAULT false,
  read_at timestamptz,
  data jsonb, -- Additional data for the notification
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================
-- INDEXES FOR PERFORMANCE
-- =============================
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- =============================
-- ROW LEVEL SECURITY
-- =============================
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read, etc.)
CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

-- System can insert notifications for users
CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- =============================
-- FUNCTIONS
-- =============================

-- Function to create a notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_title text,
  p_message text,
  p_type text DEFAULT 'info',
  p_data jsonb DEFAULT '{}'::jsonb
) RETURNS uuid AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, data)
  VALUES (p_user_id, p_title, p_message, p_type, p_data)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION public.mark_notification_read(p_notification_id uuid) RETURNS void AS $$
BEGIN
  UPDATE public.notifications
  SET read = true, read_at = now()
  WHERE id = p_notification_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read(p_user_id uuid) RETURNS void AS $$
BEGIN
  UPDATE public.notifications
  SET read = true, read_at = now()
  WHERE user_id = p_user_id AND read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread count for a user
CREATE OR REPLACE FUNCTION public.get_unread_notifications_count(p_user_id uuid) RETURNS integer AS $$
DECLARE
  unread_count integer;
BEGIN
  SELECT COUNT(*) INTO unread_count
  FROM public.notifications
  WHERE user_id = p_user_id AND read = false;
  
  RETURN unread_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================
-- TRIGGERS
-- =============================

-- Trigger to automatically update updated_at column
CREATE TRIGGER set_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =============================
-- GRANTS
-- =============================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_notification TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_notification_read TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_all_notifications_read TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_unread_notifications_count TO authenticated;

-- =============================
-- SAMPLE DATA (Optional - for testing)
-- =============================
-- Insert some sample notifications for testing (remove in production)
-- INSERT INTO public.notifications (user_id, title, message, type, data)
-- SELECT 
--   p.id,
--   'Welcome to StreetStashed!',
--   'Thank you for joining our community. Start exploring our marketplace!',
--   'info',
--   '{"welcome": true}'::jsonb
-- FROM public.profiles p
-- WHERE p.id IS NOT NULL
-- LIMIT 5;

-- =============================
-- MIGRATION COMPLETE
-- =============================
SELECT 'Notifications table migration completed successfully' as status;

