
-- Fix: Restrict workspace_integrations SELECT to admins only (defense-in-depth for encrypted API keys)
DROP POLICY IF EXISTS "Users can view workspace integrations" ON workspace_integrations;

CREATE POLICY "Admins can view workspace integrations"
  ON workspace_integrations FOR SELECT
  USING (has_workspace_access(workspace_id, auth.uid(), 'admin'::app_role));
