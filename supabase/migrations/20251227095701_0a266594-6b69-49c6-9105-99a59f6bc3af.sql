-- Create roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'tester', 'viewer');

-- Create workspaces table
CREATE TABLE public.workspaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workspace_members table (for role-based access)
CREATE TABLE public.workspace_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role public.app_role NOT NULL DEFAULT 'viewer',
  invited_by UUID,
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(workspace_id, user_id)
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workspace_invites table for email invites
CREATE TABLE public.workspace_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role public.app_role NOT NULL DEFAULT 'viewer',
  invited_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(workspace_id, email)
);

-- Enable RLS on all tables
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_invites ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user role in workspace
CREATE OR REPLACE FUNCTION public.get_user_workspace_role(p_workspace_id UUID, p_user_id UUID)
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.workspace_members 
  WHERE workspace_id = p_workspace_id AND user_id = p_user_id AND accepted_at IS NOT NULL
  LIMIT 1
$$;

-- Create function to check if user has minimum role
CREATE OR REPLACE FUNCTION public.has_workspace_access(p_workspace_id UUID, p_user_id UUID, p_min_role public.app_role DEFAULT 'viewer')
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members 
    WHERE workspace_id = p_workspace_id 
      AND user_id = p_user_id 
      AND accepted_at IS NOT NULL
      AND (
        (p_min_role = 'viewer') OR
        (p_min_role = 'tester' AND role IN ('admin', 'manager', 'tester')) OR
        (p_min_role = 'manager' AND role IN ('admin', 'manager')) OR
        (p_min_role = 'admin' AND role = 'admin')
      )
  )
$$;

-- Profile policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Workspace policies
CREATE POLICY "Users can view workspaces they are members of" ON public.workspaces 
FOR SELECT TO authenticated 
USING (public.has_workspace_access(id, auth.uid(), 'viewer'));

CREATE POLICY "Users can create workspaces" ON public.workspaces 
FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update workspaces" ON public.workspaces 
FOR UPDATE TO authenticated 
USING (public.has_workspace_access(id, auth.uid(), 'admin'));

CREATE POLICY "Admins can delete workspaces" ON public.workspaces 
FOR DELETE TO authenticated 
USING (public.has_workspace_access(id, auth.uid(), 'admin'));

-- Project policies
CREATE POLICY "Users can view projects in their workspaces" ON public.projects 
FOR SELECT TO authenticated 
USING (public.has_workspace_access(workspace_id, auth.uid(), 'viewer'));

CREATE POLICY "Managers+ can create projects" ON public.projects 
FOR INSERT TO authenticated 
WITH CHECK (public.has_workspace_access(workspace_id, auth.uid(), 'manager'));

CREATE POLICY "Managers+ can update projects" ON public.projects 
FOR UPDATE TO authenticated 
USING (public.has_workspace_access(workspace_id, auth.uid(), 'manager'));

CREATE POLICY "Admins can delete projects" ON public.projects 
FOR DELETE TO authenticated 
USING (public.has_workspace_access(workspace_id, auth.uid(), 'admin'));

-- Workspace members policies
CREATE POLICY "Members can view other members in their workspace" ON public.workspace_members 
FOR SELECT TO authenticated 
USING (public.has_workspace_access(workspace_id, auth.uid(), 'viewer'));

CREATE POLICY "Admins can manage members" ON public.workspace_members 
FOR INSERT TO authenticated 
WITH CHECK (public.has_workspace_access(workspace_id, auth.uid(), 'admin'));

CREATE POLICY "Admins can update members" ON public.workspace_members 
FOR UPDATE TO authenticated 
USING (public.has_workspace_access(workspace_id, auth.uid(), 'admin'));

CREATE POLICY "Admins can remove members" ON public.workspace_members 
FOR DELETE TO authenticated 
USING (public.has_workspace_access(workspace_id, auth.uid(), 'admin'));

-- Workspace invites policies
CREATE POLICY "Admins can view invites" ON public.workspace_invites 
FOR SELECT TO authenticated 
USING (public.has_workspace_access(workspace_id, auth.uid(), 'admin'));

CREATE POLICY "Admins can create invites" ON public.workspace_invites 
FOR INSERT TO authenticated 
WITH CHECK (public.has_workspace_access(workspace_id, auth.uid(), 'admin'));

CREATE POLICY "Admins can delete invites" ON public.workspace_invites 
FOR DELETE TO authenticated 
USING (public.has_workspace_access(workspace_id, auth.uid(), 'admin'));

-- Trigger to auto-add creator as admin when workspace is created
CREATE OR REPLACE FUNCTION public.handle_new_workspace()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.workspace_members (workspace_id, user_id, role, accepted_at)
  VALUES (NEW.id, NEW.created_by, 'admin', now());
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_workspace_created
  AFTER INSERT ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_workspace();

-- Trigger to create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON public.workspaces FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();