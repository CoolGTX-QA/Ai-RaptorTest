-- Fix PUBLIC_DATA_EXPOSURE: Restrict profiles visibility to workspace members only

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create restricted policy: users can only see their own profile OR profiles of members in shared workspaces
CREATE POLICY "Users can view profiles in their workspaces" 
ON public.profiles FOR SELECT TO authenticated 
USING (
  id = auth.uid() OR  -- Always see your own profile
  EXISTS (
    SELECT 1 FROM public.workspace_members wm1
    JOIN public.workspace_members wm2 
      ON wm1.workspace_id = wm2.workspace_id
    WHERE wm1.user_id = auth.uid() 
      AND wm2.user_id = profiles.id
      AND wm1.accepted_at IS NOT NULL
      AND wm2.accepted_at IS NOT NULL
  )
);