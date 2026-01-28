-- Drop existing INSERT policy for workspace_invites
DROP POLICY IF EXISTS "Admins can create invites" ON workspace_invites;

-- Create new policy that allows managers+ to create invites
CREATE POLICY "Managers+ can create invites" 
ON workspace_invites 
FOR INSERT 
WITH CHECK (has_workspace_access(workspace_id, auth.uid(), 'manager'::app_role));

-- Also add UPDATE policy so we can mark invites as accepted
DROP POLICY IF EXISTS "Users can update own invites" ON workspace_invites;

CREATE POLICY "Invited users can accept invites" 
ON workspace_invites 
FOR UPDATE 
USING (
  -- Allow the invited user (by email) to accept
  email = (SELECT email FROM profiles WHERE id = auth.uid())
  OR
  -- Allow admins/managers to update invites in their workspace
  has_workspace_access(workspace_id, auth.uid(), 'manager'::app_role)
);

-- Also allow users to view their own invites (by email)
DROP POLICY IF EXISTS "Users can view own invites" ON workspace_invites;

CREATE POLICY "Users can view their invites" 
ON workspace_invites 
FOR SELECT 
USING (
  -- Admins can view all invites in their workspace
  has_workspace_access(workspace_id, auth.uid(), 'admin'::app_role)
  OR
  -- Users can view invites sent to their email
  email = (SELECT email FROM profiles WHERE id = auth.uid())
);