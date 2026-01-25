-- Drop the existing restrictive INSERT policy and create a permissive one
DROP POLICY IF EXISTS "Users can create workspaces" ON public.workspaces;

CREATE POLICY "Users can create workspaces" 
ON public.workspaces 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = created_by);