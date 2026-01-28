-- Recreate INSERT policy with explicit role + schema-qualified function
DROP POLICY IF EXISTS "Managers+ can create invites" ON public.workspace_invites;

CREATE POLICY "Managers+ can create invites"
ON public.workspace_invites
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_workspace_access(workspace_id, auth.uid(), 'manager'::public.app_role)
);

-- Keep admins delete/view policies as-is; ensure view policy also targets authenticated
DROP POLICY IF EXISTS "Users can view their invites" ON public.workspace_invites;
CREATE POLICY "Users can view their invites"
ON public.workspace_invites
FOR SELECT
TO authenticated
USING (
  public.has_workspace_access(workspace_id, auth.uid(), 'admin'::public.app_role)
  OR email = (SELECT profiles.email FROM public.profiles WHERE profiles.id = auth.uid())
);

-- Ensure accept policy targets authenticated too
DROP POLICY IF EXISTS "Invited users can accept invites" ON public.workspace_invites;
CREATE POLICY "Invited users can accept invites"
ON public.workspace_invites
FOR UPDATE
TO authenticated
USING (
  email = (SELECT profiles.email FROM public.profiles WHERE profiles.id = auth.uid())
  OR public.has_workspace_access(workspace_id, auth.uid(), 'manager'::public.app_role)
)
WITH CHECK (
  email = (SELECT profiles.email FROM public.profiles WHERE profiles.id = auth.uid())
  OR public.has_workspace_access(workspace_id, auth.uid(), 'manager'::public.app_role)
);
