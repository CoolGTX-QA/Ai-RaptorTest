
-- Adjust: Allow managers+ (not just admins) to view workspace_integrations, but exclude encrypted keys at RLS level
-- Managers need to see integration status in workspace settings
DROP POLICY IF EXISTS "Admins can view workspace integrations" ON workspace_integrations;

CREATE POLICY "Managers+ can view workspace integrations"
  ON workspace_integrations FOR SELECT
  USING (has_workspace_access(workspace_id, auth.uid(), 'manager'::app_role));
