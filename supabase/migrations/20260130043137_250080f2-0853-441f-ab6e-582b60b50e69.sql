-- =====================================================
-- Security Fix: Address warn-level security issues
-- =====================================================

-- 1. GDPR Compliance: Add DELETE policy to profiles table
-- Allows users to delete their own profile
CREATE POLICY "Users can delete own profile" 
  ON public.profiles 
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = id);

-- 2. Activity Logs: Drop and recreate policies to prevent cross-workspace leakage
-- First drop the existing policies that may overlap
DROP POLICY IF EXISTS "Admins can view all workspace activities" ON public.activity_logs;
DROP POLICY IF EXISTS "Managers can view project activities" ON public.activity_logs;
DROP POLICY IF EXISTS "Users can view own activities" ON public.activity_logs;

-- Create properly scoped policies that are mutually exclusive
-- Users can always view their own activities
CREATE POLICY "Users can view own activities" 
  ON public.activity_logs 
  FOR SELECT 
  TO authenticated
  USING (user_id = auth.uid());

-- Users can view activities from workspaces they have admin access to
-- This is scoped to only activities with a valid workspace_id that they have access to
CREATE POLICY "Admins can view workspace activities" 
  ON public.activity_logs 
  FOR SELECT 
  TO authenticated
  USING (
    workspace_id IS NOT NULL 
    AND has_workspace_access(workspace_id, auth.uid(), 'admin'::app_role)
  );

-- Managers can view project-level activities within workspaces they have manager access to
CREATE POLICY "Managers can view project activities" 
  ON public.activity_logs 
  FOR SELECT 
  TO authenticated
  USING (
    workspace_id IS NOT NULL 
    AND project_id IS NOT NULL
    AND has_workspace_access(workspace_id, auth.uid(), 'manager'::app_role)
  );