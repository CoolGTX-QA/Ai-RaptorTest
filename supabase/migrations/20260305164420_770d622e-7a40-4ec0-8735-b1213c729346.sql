
-- Autonomous test projects
CREATE TABLE public.autonomous_test_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  test_name text NOT NULL,
  base_url text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.autonomous_test_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view autonomous test projects" ON public.autonomous_test_projects
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM projects p WHERE p.id = autonomous_test_projects.project_id
    AND has_workspace_access(p.workspace_id, auth.uid(), 'viewer'::app_role)
  ));

CREATE POLICY "Testers+ can create autonomous test projects" ON public.autonomous_test_projects
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects p WHERE p.id = autonomous_test_projects.project_id
    AND has_workspace_access(p.workspace_id, auth.uid(), 'tester'::app_role)
  ));

CREATE POLICY "Testers+ can update autonomous test projects" ON public.autonomous_test_projects
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM projects p WHERE p.id = autonomous_test_projects.project_id
    AND has_workspace_access(p.workspace_id, auth.uid(), 'tester'::app_role)
  ));

CREATE POLICY "Managers+ can delete autonomous test projects" ON public.autonomous_test_projects
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM projects p WHERE p.id = autonomous_test_projects.project_id
    AND has_workspace_access(p.workspace_id, auth.uid(), 'manager'::app_role)
  ));

-- Autonomous test APIs
CREATE TABLE public.autonomous_test_apis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  autonomous_project_id uuid REFERENCES public.autonomous_test_projects(id) ON DELETE CASCADE NOT NULL,
  api_name text NOT NULL,
  endpoint_url text NOT NULL,
  auth_type text NOT NULL DEFAULT 'none',
  auth_config jsonb DEFAULT '{}'::jsonb,
  extra_info text,
  doc_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.autonomous_test_apis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view autonomous test apis" ON public.autonomous_test_apis
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM autonomous_test_projects atp
    JOIN projects p ON p.id = atp.project_id
    WHERE atp.id = autonomous_test_apis.autonomous_project_id
    AND has_workspace_access(p.workspace_id, auth.uid(), 'viewer'::app_role)
  ));

CREATE POLICY "Testers+ can manage autonomous test apis" ON public.autonomous_test_apis
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM autonomous_test_projects atp
    JOIN projects p ON p.id = atp.project_id
    WHERE atp.id = autonomous_test_apis.autonomous_project_id
    AND has_workspace_access(p.workspace_id, auth.uid(), 'tester'::app_role)
  ));

-- Autonomous test URLs
CREATE TABLE public.autonomous_test_urls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  autonomous_project_id uuid REFERENCES public.autonomous_test_projects(id) ON DELETE CASCADE NOT NULL,
  url_name text NOT NULL,
  start_url text NOT NULL,
  login_email text,
  login_password text,
  extra_instructions text,
  doc_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.autonomous_test_urls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view autonomous test urls" ON public.autonomous_test_urls
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM autonomous_test_projects atp
    JOIN projects p ON p.id = atp.project_id
    WHERE atp.id = autonomous_test_urls.autonomous_project_id
    AND has_workspace_access(p.workspace_id, auth.uid(), 'viewer'::app_role)
  ));

CREATE POLICY "Testers+ can manage autonomous test urls" ON public.autonomous_test_urls
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM autonomous_test_projects atp
    JOIN projects p ON p.id = atp.project_id
    WHERE atp.id = autonomous_test_urls.autonomous_project_id
    AND has_workspace_access(p.workspace_id, auth.uid(), 'tester'::app_role)
  ));

-- Autonomous test cases (AI-generated)
CREATE TABLE public.autonomous_test_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  autonomous_project_id uuid REFERENCES public.autonomous_test_projects(id) ON DELETE CASCADE NOT NULL,
  test_number integer NOT NULL,
  priority text NOT NULL DEFAULT 'medium',
  test_name text NOT NULL,
  test_description text,
  is_enabled boolean NOT NULL DEFAULT true,
  test_type text NOT NULL DEFAULT 'frontend',
  generated_script text,
  status text NOT NULL DEFAULT 'draft',
  error_message text,
  trace text,
  cause text,
  fix_suggestion text,
  duration_ms integer,
  executed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.autonomous_test_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view autonomous test cases" ON public.autonomous_test_cases
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM autonomous_test_projects atp
    JOIN projects p ON p.id = atp.project_id
    WHERE atp.id = autonomous_test_cases.autonomous_project_id
    AND has_workspace_access(p.workspace_id, auth.uid(), 'viewer'::app_role)
  ));

CREATE POLICY "Testers+ can manage autonomous test cases" ON public.autonomous_test_cases
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM autonomous_test_projects atp
    JOIN projects p ON p.id = atp.project_id
    WHERE atp.id = autonomous_test_cases.autonomous_project_id
    AND has_workspace_access(p.workspace_id, auth.uid(), 'tester'::app_role)
  ));

-- Triggers
CREATE TRIGGER update_autonomous_test_projects_updated_at
  BEFORE UPDATE ON public.autonomous_test_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_autonomous_test_cases_updated_at
  BEFORE UPDATE ON public.autonomous_test_cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
