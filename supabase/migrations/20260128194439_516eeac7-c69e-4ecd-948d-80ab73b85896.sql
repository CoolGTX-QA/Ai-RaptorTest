-- Allow managers to manage workspace members and allow invited users to self-join

-- Drop existing admin-only policies
DROP POLICY IF EXISTS "Admins can manage members" ON public.workspace_members;
DROP POLICY IF EXISTS "Admins can update members" ON public.workspace_members;
DROP POLICY IF EXISTS "Admins can remove members" ON public.workspace_members;

-- Managers+ can manage members (invite/add/update/remove)
CREATE POLICY "Managers+ can add members"
ON public.workspace_members
FOR INSERT
TO authenticated
WITH CHECK (public.has_workspace_access(workspace_id, auth.uid(), 'manager'::public.app_role));

CREATE POLICY "Managers+ can update members"
ON public.workspace_members
FOR UPDATE
TO authenticated
USING (public.has_workspace_access(workspace_id, auth.uid(), 'manager'::public.app_role));

CREATE POLICY "Managers+ can remove members"
ON public.workspace_members
FOR DELETE
TO authenticated
USING (public.has_workspace_access(workspace_id, auth.uid(), 'manager'::public.app_role));

-- Invited users can add themselves as a member (prevents role escalation by matching invite.role)
DROP POLICY IF EXISTS "Invited users can join workspace" ON public.workspace_members;
CREATE POLICY "Invited users can join workspace"
ON public.workspace_members
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND accepted_at IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.workspace_invites wi
      ON wi.workspace_id = workspace_members.workspace_id
     AND wi.email = p.email
    WHERE p.id = auth.uid()
      AND wi.accepted_at IS NULL
      AND wi.expires_at > now()
      AND wi.role = workspace_members.role
  )
);
