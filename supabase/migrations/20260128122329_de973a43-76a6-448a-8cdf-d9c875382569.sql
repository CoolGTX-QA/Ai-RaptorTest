-- =============================================
-- WORKSPACE MODULE ENHANCEMENTS
-- =============================================

-- 1. Workspace Tags (reusable across projects)
CREATE TABLE public.workspace_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, name)
);

-- 2. Workspace Templates (save project configurations)
CREATE TABLE public.workspace_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Workspace Settings (admin tool configuration)
CREATE TABLE public.workspace_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE UNIQUE,
  enabled_tools JSONB NOT NULL DEFAULT '{"ai_tools": true, "reports": true, "analytics": true, "risk_assessment": true}'::jsonb,
  enabled_integrations JSONB NOT NULL DEFAULT '{"jira": false, "clickup": false, "linear": false, "raptorassist": false}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- PROJECT MODULE ENHANCEMENTS
-- =============================================

-- 4. Project Members (hybrid approach - explicit assignment for testers/viewers)
CREATE TABLE public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'tester' CHECK (role IN ('lead', 'tester', 'viewer')),
  assigned_by UUID NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- 5. Project Milestones & Releases
CREATE TABLE public.project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'delayed')),
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Project Settings (custom configuration per project)
CREATE TABLE public.project_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE UNIQUE,
  custom_priorities JSONB DEFAULT '["critical", "high", "medium", "low"]'::jsonb,
  custom_statuses JSONB DEFAULT '["draft", "ready", "in_review", "approved", "obsolete"]'::jsonb,
  custom_fields JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. Workspace Integrations (workspace-level connections)
CREATE TABLE public.workspace_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  integration_type TEXT NOT NULL CHECK (integration_type IN ('jira', 'clickup', 'linear', 'raptorassist', 'slack', 'github')),
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  api_key_encrypted TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  connected_by UUID NOT NULL,
  connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, integration_type)
);

-- 8. Project Integrations (project-specific integration settings)
CREATE TABLE public.project_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  workspace_integration_id UUID NOT NULL REFERENCES public.workspace_integrations(id) ON DELETE CASCADE,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, workspace_integration_id)
);

-- 9. Project Tags (link tags to projects)
CREATE TABLE public.project_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.workspace_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, tag_id)
);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.workspace_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tags ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES - WORKSPACE TAGS
-- =============================================

CREATE POLICY "Users can view workspace tags"
ON public.workspace_tags FOR SELECT
USING (has_workspace_access(workspace_id, auth.uid(), 'viewer'::app_role));

CREATE POLICY "Managers+ can create workspace tags"
ON public.workspace_tags FOR INSERT
WITH CHECK (has_workspace_access(workspace_id, auth.uid(), 'manager'::app_role));

CREATE POLICY "Managers+ can update workspace tags"
ON public.workspace_tags FOR UPDATE
USING (has_workspace_access(workspace_id, auth.uid(), 'manager'::app_role));

CREATE POLICY "Managers+ can delete workspace tags"
ON public.workspace_tags FOR DELETE
USING (has_workspace_access(workspace_id, auth.uid(), 'manager'::app_role));

-- =============================================
-- RLS POLICIES - WORKSPACE TEMPLATES
-- =============================================

CREATE POLICY "Users can view workspace templates"
ON public.workspace_templates FOR SELECT
USING (has_workspace_access(workspace_id, auth.uid(), 'viewer'::app_role));

CREATE POLICY "Managers+ can create workspace templates"
ON public.workspace_templates FOR INSERT
WITH CHECK (has_workspace_access(workspace_id, auth.uid(), 'manager'::app_role));

CREATE POLICY "Managers+ can update workspace templates"
ON public.workspace_templates FOR UPDATE
USING (has_workspace_access(workspace_id, auth.uid(), 'manager'::app_role));

CREATE POLICY "Managers+ can delete workspace templates"
ON public.workspace_templates FOR DELETE
USING (has_workspace_access(workspace_id, auth.uid(), 'manager'::app_role));

-- =============================================
-- RLS POLICIES - WORKSPACE SETTINGS
-- =============================================

CREATE POLICY "Users can view workspace settings"
ON public.workspace_settings FOR SELECT
USING (has_workspace_access(workspace_id, auth.uid(), 'viewer'::app_role));

CREATE POLICY "Admins can create workspace settings"
ON public.workspace_settings FOR INSERT
WITH CHECK (has_workspace_access(workspace_id, auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update workspace settings"
ON public.workspace_settings FOR UPDATE
USING (has_workspace_access(workspace_id, auth.uid(), 'admin'::app_role));

-- =============================================
-- RLS POLICIES - PROJECT MEMBERS
-- =============================================

CREATE POLICY "Users can view project members"
ON public.project_members FOR SELECT
USING (EXISTS (
  SELECT 1 FROM projects p
  WHERE p.id = project_members.project_id
  AND has_workspace_access(p.workspace_id, auth.uid(), 'viewer'::app_role)
));

CREATE POLICY "Managers+ can add project members"
ON public.project_members FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM projects p
  WHERE p.id = project_members.project_id
  AND has_workspace_access(p.workspace_id, auth.uid(), 'manager'::app_role)
));

CREATE POLICY "Managers+ can update project members"
ON public.project_members FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM projects p
  WHERE p.id = project_members.project_id
  AND has_workspace_access(p.workspace_id, auth.uid(), 'manager'::app_role)
));

CREATE POLICY "Managers+ can remove project members"
ON public.project_members FOR DELETE
USING (EXISTS (
  SELECT 1 FROM projects p
  WHERE p.id = project_members.project_id
  AND has_workspace_access(p.workspace_id, auth.uid(), 'manager'::app_role)
));

-- =============================================
-- RLS POLICIES - PROJECT MILESTONES
-- =============================================

CREATE POLICY "Users can view project milestones"
ON public.project_milestones FOR SELECT
USING (EXISTS (
  SELECT 1 FROM projects p
  WHERE p.id = project_milestones.project_id
  AND has_workspace_access(p.workspace_id, auth.uid(), 'viewer'::app_role)
));

CREATE POLICY "Testers+ can create project milestones"
ON public.project_milestones FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM projects p
  WHERE p.id = project_milestones.project_id
  AND has_workspace_access(p.workspace_id, auth.uid(), 'tester'::app_role)
));

CREATE POLICY "Testers+ can update project milestones"
ON public.project_milestones FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM projects p
  WHERE p.id = project_milestones.project_id
  AND has_workspace_access(p.workspace_id, auth.uid(), 'tester'::app_role)
));

CREATE POLICY "Managers+ can delete project milestones"
ON public.project_milestones FOR DELETE
USING (EXISTS (
  SELECT 1 FROM projects p
  WHERE p.id = project_milestones.project_id
  AND has_workspace_access(p.workspace_id, auth.uid(), 'manager'::app_role)
));

-- =============================================
-- RLS POLICIES - PROJECT SETTINGS
-- =============================================

CREATE POLICY "Users can view project settings"
ON public.project_settings FOR SELECT
USING (EXISTS (
  SELECT 1 FROM projects p
  WHERE p.id = project_settings.project_id
  AND has_workspace_access(p.workspace_id, auth.uid(), 'viewer'::app_role)
));

CREATE POLICY "Managers+ can create project settings"
ON public.project_settings FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM projects p
  WHERE p.id = project_settings.project_id
  AND has_workspace_access(p.workspace_id, auth.uid(), 'manager'::app_role)
));

CREATE POLICY "Managers+ can update project settings"
ON public.project_settings FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM projects p
  WHERE p.id = project_settings.project_id
  AND has_workspace_access(p.workspace_id, auth.uid(), 'manager'::app_role)
));

-- =============================================
-- RLS POLICIES - WORKSPACE INTEGRATIONS
-- =============================================

CREATE POLICY "Users can view workspace integrations"
ON public.workspace_integrations FOR SELECT
USING (has_workspace_access(workspace_id, auth.uid(), 'viewer'::app_role));

CREATE POLICY "Admins can create workspace integrations"
ON public.workspace_integrations FOR INSERT
WITH CHECK (has_workspace_access(workspace_id, auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update workspace integrations"
ON public.workspace_integrations FOR UPDATE
USING (has_workspace_access(workspace_id, auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete workspace integrations"
ON public.workspace_integrations FOR DELETE
USING (has_workspace_access(workspace_id, auth.uid(), 'admin'::app_role));

-- =============================================
-- RLS POLICIES - PROJECT INTEGRATIONS
-- =============================================

CREATE POLICY "Users can view project integrations"
ON public.project_integrations FOR SELECT
USING (EXISTS (
  SELECT 1 FROM projects p
  WHERE p.id = project_integrations.project_id
  AND has_workspace_access(p.workspace_id, auth.uid(), 'viewer'::app_role)
));

CREATE POLICY "Managers+ can create project integrations"
ON public.project_integrations FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM projects p
  WHERE p.id = project_integrations.project_id
  AND has_workspace_access(p.workspace_id, auth.uid(), 'manager'::app_role)
));

CREATE POLICY "Managers+ can update project integrations"
ON public.project_integrations FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM projects p
  WHERE p.id = project_integrations.project_id
  AND has_workspace_access(p.workspace_id, auth.uid(), 'manager'::app_role)
));

CREATE POLICY "Managers+ can delete project integrations"
ON public.project_integrations FOR DELETE
USING (EXISTS (
  SELECT 1 FROM projects p
  WHERE p.id = project_integrations.project_id
  AND has_workspace_access(p.workspace_id, auth.uid(), 'manager'::app_role)
));

-- =============================================
-- RLS POLICIES - PROJECT TAGS
-- =============================================

CREATE POLICY "Users can view project tags"
ON public.project_tags FOR SELECT
USING (EXISTS (
  SELECT 1 FROM projects p
  WHERE p.id = project_tags.project_id
  AND has_workspace_access(p.workspace_id, auth.uid(), 'viewer'::app_role)
));

CREATE POLICY "Testers+ can add project tags"
ON public.project_tags FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM projects p
  WHERE p.id = project_tags.project_id
  AND has_workspace_access(p.workspace_id, auth.uid(), 'tester'::app_role)
));

CREATE POLICY "Testers+ can remove project tags"
ON public.project_tags FOR DELETE
USING (EXISTS (
  SELECT 1 FROM projects p
  WHERE p.id = project_tags.project_id
  AND has_workspace_access(p.workspace_id, auth.uid(), 'tester'::app_role)
));

-- =============================================
-- TRIGGERS FOR updated_at
-- =============================================

CREATE TRIGGER update_workspace_templates_updated_at
BEFORE UPDATE ON public.workspace_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workspace_settings_updated_at
BEFORE UPDATE ON public.workspace_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_milestones_updated_at
BEFORE UPDATE ON public.project_milestones
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_settings_updated_at
BEFORE UPDATE ON public.project_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workspace_integrations_updated_at
BEFORE UPDATE ON public.workspace_integrations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_integrations_updated_at
BEFORE UPDATE ON public.project_integrations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- HELPER FUNCTION: Check project access (hybrid model)
-- =============================================

CREATE OR REPLACE FUNCTION public.has_project_access(
  p_project_id UUID,
  p_user_id UUID,
  p_min_role TEXT DEFAULT 'viewer'
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = p_project_id
    AND (
      -- Admins and Managers have access to all projects in their workspace
      has_workspace_access(p.workspace_id, p_user_id, 'manager'::app_role)
      OR
      -- Testers/Viewers need explicit project membership
      EXISTS (
        SELECT 1 FROM project_members pm
        WHERE pm.project_id = p_project_id
        AND pm.user_id = p_user_id
        AND (
          (p_min_role = 'viewer') OR
          (p_min_role = 'tester' AND pm.role IN ('lead', 'tester')) OR
          (p_min_role = 'lead' AND pm.role = 'lead')
        )
      )
    )
  )
$$;