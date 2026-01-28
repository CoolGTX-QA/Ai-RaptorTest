-- Add new columns to project_settings for enhanced configuration
ALTER TABLE public.project_settings
ADD COLUMN IF NOT EXISTS defect_severities jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS defect_resolutions jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS test_environments jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS notification_settings jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS automation_settings jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS default_assignees jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS sla_settings jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS test_types jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS execution_statuses jsonb DEFAULT '[]'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN public.project_settings.defect_severities IS 'Custom defect severity levels (e.g., Critical, Major, Minor, Trivial)';
COMMENT ON COLUMN public.project_settings.defect_resolutions IS 'Defect resolution types (e.g., Fixed, Won''t Fix, Duplicate, Cannot Reproduce)';
COMMENT ON COLUMN public.project_settings.test_environments IS 'Test environments configuration (e.g., Dev, QA, Staging, Production)';
COMMENT ON COLUMN public.project_settings.notification_settings IS 'Email/webhook notification preferences';
COMMENT ON COLUMN public.project_settings.automation_settings IS 'CI/CD integration and automation triggers';
COMMENT ON COLUMN public.project_settings.default_assignees IS 'Default assignment rules for test cases and defects';
COMMENT ON COLUMN public.project_settings.sla_settings IS 'SLA thresholds for defect resolution times';
COMMENT ON COLUMN public.project_settings.test_types IS 'Test case type categories (e.g., Functional, Performance, Security)';
COMMENT ON COLUMN public.project_settings.execution_statuses IS 'Custom execution result statuses';