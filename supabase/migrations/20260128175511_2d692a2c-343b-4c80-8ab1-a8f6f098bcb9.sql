-- Drop existing policies for workspace_settings
DROP POLICY IF EXISTS "Admins can create workspace settings" ON public.workspace_settings;
DROP POLICY IF EXISTS "Admins can update workspace settings" ON public.workspace_settings;

-- Create new policies that allow managers (not just admins)
CREATE POLICY "Managers can create workspace settings" 
ON public.workspace_settings 
FOR INSERT 
WITH CHECK (has_workspace_access(workspace_id, auth.uid(), 'manager'::app_role));

CREATE POLICY "Managers can update workspace settings" 
ON public.workspace_settings 
FOR UPDATE 
USING (has_workspace_access(workspace_id, auth.uid(), 'manager'::app_role));