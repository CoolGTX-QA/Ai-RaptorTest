-- Create test_cases table for the test repository
CREATE TABLE public.test_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  preconditions TEXT,
  steps JSONB DEFAULT '[]'::jsonb,
  expected_result TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'deprecated')),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create test_runs table for test execution sessions
CREATE TABLE public.test_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'aborted')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create test_executions table for individual test case executions
CREATE TABLE public.test_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_run_id UUID NOT NULL REFERENCES public.test_runs(id) ON DELETE CASCADE,
  test_case_id UUID NOT NULL REFERENCES public.test_cases(id) ON DELETE CASCADE,
  executed_by UUID,
  status TEXT NOT NULL DEFAULT 'not_run' CHECK (status IN ('not_run', 'passed', 'failed', 'blocked', 'skipped')),
  notes TEXT,
  executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create defects table for bug tracking
CREATE TABLE public.defects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  test_execution_id UUID REFERENCES public.test_executions(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'wont_fix')),
  reported_by UUID NOT NULL,
  assigned_to UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reports table for saved reports
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('test_summary', 'defect_summary', 'execution_trend', 'coverage')),
  filters JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.defects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for test_cases
CREATE POLICY "Users can view test cases in their projects"
ON public.test_cases FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.projects p
  WHERE p.id = test_cases.project_id
  AND has_workspace_access(p.workspace_id, auth.uid(), 'viewer'::app_role)
));

CREATE POLICY "Testers+ can create test cases"
ON public.test_cases FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.projects p
  WHERE p.id = test_cases.project_id
  AND has_workspace_access(p.workspace_id, auth.uid(), 'tester'::app_role)
));

CREATE POLICY "Testers+ can update test cases"
ON public.test_cases FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.projects p
  WHERE p.id = test_cases.project_id
  AND has_workspace_access(p.workspace_id, auth.uid(), 'tester'::app_role)
));

CREATE POLICY "Managers+ can delete test cases"
ON public.test_cases FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.projects p
  WHERE p.id = test_cases.project_id
  AND has_workspace_access(p.workspace_id, auth.uid(), 'manager'::app_role)
));

-- RLS Policies for test_runs
CREATE POLICY "Users can view test runs in their projects"
ON public.test_runs FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.projects p
  WHERE p.id = test_runs.project_id
  AND has_workspace_access(p.workspace_id, auth.uid(), 'viewer'::app_role)
));

CREATE POLICY "Testers+ can create test runs"
ON public.test_runs FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.projects p
  WHERE p.id = test_runs.project_id
  AND has_workspace_access(p.workspace_id, auth.uid(), 'tester'::app_role)
));

CREATE POLICY "Testers+ can update test runs"
ON public.test_runs FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.projects p
  WHERE p.id = test_runs.project_id
  AND has_workspace_access(p.workspace_id, auth.uid(), 'tester'::app_role)
));

CREATE POLICY "Managers+ can delete test runs"
ON public.test_runs FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.projects p
  WHERE p.id = test_runs.project_id
  AND has_workspace_access(p.workspace_id, auth.uid(), 'manager'::app_role)
));

-- RLS Policies for test_executions
CREATE POLICY "Users can view test executions"
ON public.test_executions FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.test_runs tr
  JOIN public.projects p ON p.id = tr.project_id
  WHERE tr.id = test_executions.test_run_id
  AND has_workspace_access(p.workspace_id, auth.uid(), 'viewer'::app_role)
));

CREATE POLICY "Testers+ can create test executions"
ON public.test_executions FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.test_runs tr
  JOIN public.projects p ON p.id = tr.project_id
  WHERE tr.id = test_executions.test_run_id
  AND has_workspace_access(p.workspace_id, auth.uid(), 'tester'::app_role)
));

CREATE POLICY "Testers+ can update test executions"
ON public.test_executions FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.test_runs tr
  JOIN public.projects p ON p.id = tr.project_id
  WHERE tr.id = test_executions.test_run_id
  AND has_workspace_access(p.workspace_id, auth.uid(), 'tester'::app_role)
));

-- RLS Policies for defects
CREATE POLICY "Users can view defects in their projects"
ON public.defects FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.projects p
  WHERE p.id = defects.project_id
  AND has_workspace_access(p.workspace_id, auth.uid(), 'viewer'::app_role)
));

CREATE POLICY "Testers+ can create defects"
ON public.defects FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.projects p
  WHERE p.id = defects.project_id
  AND has_workspace_access(p.workspace_id, auth.uid(), 'tester'::app_role)
));

CREATE POLICY "Testers+ can update defects"
ON public.defects FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.projects p
  WHERE p.id = defects.project_id
  AND has_workspace_access(p.workspace_id, auth.uid(), 'tester'::app_role)
));

CREATE POLICY "Managers+ can delete defects"
ON public.defects FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.projects p
  WHERE p.id = defects.project_id
  AND has_workspace_access(p.workspace_id, auth.uid(), 'manager'::app_role)
));

-- RLS Policies for reports
CREATE POLICY "Users can view reports in their projects"
ON public.reports FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.projects p
  WHERE p.id = reports.project_id
  AND has_workspace_access(p.workspace_id, auth.uid(), 'viewer'::app_role)
));

CREATE POLICY "Testers+ can create reports"
ON public.reports FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.projects p
  WHERE p.id = reports.project_id
  AND has_workspace_access(p.workspace_id, auth.uid(), 'tester'::app_role)
));

CREATE POLICY "Managers+ can update reports"
ON public.reports FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.projects p
  WHERE p.id = reports.project_id
  AND has_workspace_access(p.workspace_id, auth.uid(), 'manager'::app_role)
));

CREATE POLICY "Managers+ can delete reports"
ON public.reports FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.projects p
  WHERE p.id = reports.project_id
  AND has_workspace_access(p.workspace_id, auth.uid(), 'manager'::app_role)
));

-- Create triggers for updated_at columns
CREATE TRIGGER update_test_cases_updated_at
BEFORE UPDATE ON public.test_cases
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_test_runs_updated_at
BEFORE UPDATE ON public.test_runs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_test_executions_updated_at
BEFORE UPDATE ON public.test_executions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_defects_updated_at
BEFORE UPDATE ON public.defects
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
BEFORE UPDATE ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();