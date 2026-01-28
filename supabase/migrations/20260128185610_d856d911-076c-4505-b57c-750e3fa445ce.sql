-- Create activity_logs table to track user actions
CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  action_type text NOT NULL, -- e.g., 'create', 'update', 'delete', 'execute'
  entity_type text NOT NULL, -- e.g., 'test_case', 'test_run', 'defect', 'project'
  entity_id uuid,
  entity_name text,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_workspace_id ON public.activity_logs(workspace_id);
CREATE INDEX idx_activity_logs_project_id ON public.activity_logs(project_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all activities in their workspaces
CREATE POLICY "Admins can view all workspace activities"
ON public.activity_logs
FOR SELECT
USING (
  has_workspace_access(workspace_id, auth.uid(), 'admin'::app_role)
);

-- Managers can view activities in projects they have access to
CREATE POLICY "Managers can view project activities"
ON public.activity_logs
FOR SELECT
USING (
  has_workspace_access(workspace_id, auth.uid(), 'manager'::app_role)
  AND project_id IS NOT NULL
);

-- Testers and viewers can only see their own activities
CREATE POLICY "Users can view own activities"
ON public.activity_logs
FOR SELECT
USING (
  user_id = auth.uid()
);

-- Any authenticated user can insert their own activities
CREATE POLICY "Users can create own activities"
ON public.activity_logs
FOR INSERT
WITH CHECK (user_id = auth.uid());