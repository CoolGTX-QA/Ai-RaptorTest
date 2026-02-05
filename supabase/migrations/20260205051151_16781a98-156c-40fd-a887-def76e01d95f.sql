
-- Fix the notification insert policy to be more secure
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Allow notifications to be created by authenticated users (for their own or system notifications)
CREATE POLICY "Authenticated users can create notifications" ON public.notifications
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
