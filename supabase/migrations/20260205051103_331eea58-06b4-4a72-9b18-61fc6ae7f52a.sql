
-- ============================================
-- COMPLETE TEST MANAGEMENT MODULE SCHEMA
-- ============================================

-- Add new columns to test_cases table
ALTER TABLE public.test_cases 
ADD COLUMN IF NOT EXISTS test_type text NOT NULL DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS assigned_reviewer uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS folder_id uuid,
ADD COLUMN IF NOT EXISTS is_locked boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS submitted_at timestamptz,
ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

-- Create test case status enum values check
ALTER TABLE public.test_cases DROP CONSTRAINT IF EXISTS test_cases_status_check;
ALTER TABLE public.test_cases ADD CONSTRAINT test_cases_status_check 
CHECK (status IN ('draft', 'submitted_for_review', 'in_review', 'changes_required', 'reviewed', 'approved', 'ready_for_execution', 'executed', 'blocked', 'obsolete'));

-- ============================================
-- TEST FOLDERS TABLE (for hierarchical organization)
-- ============================================
CREATE TABLE IF NOT EXISTS public.test_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.test_folders(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add foreign key for folder_id in test_cases
ALTER TABLE public.test_cases 
ADD CONSTRAINT test_cases_folder_id_fkey 
FOREIGN KEY (folder_id) REFERENCES public.test_folders(id) ON DELETE SET NULL;

-- Enable RLS on test_folders
ALTER TABLE public.test_folders ENABLE ROW LEVEL SECURITY;

-- RLS policies for test_folders
CREATE POLICY "Users can view test folders" ON public.test_folders
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = test_folders.project_id 
    AND has_workspace_access(p.workspace_id, auth.uid(), 'viewer'::app_role)
  )
);

CREATE POLICY "Testers+ can create test folders" ON public.test_folders
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = test_folders.project_id 
    AND has_workspace_access(p.workspace_id, auth.uid(), 'tester'::app_role)
  )
);

CREATE POLICY "Testers+ can update test folders" ON public.test_folders
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = test_folders.project_id 
    AND has_workspace_access(p.workspace_id, auth.uid(), 'tester'::app_role)
  )
);

CREATE POLICY "Managers+ can delete test folders" ON public.test_folders
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM projects p 
    WHERE p.id = test_folders.project_id 
    AND has_workspace_access(p.workspace_id, auth.uid(), 'manager'::app_role)
  )
);

-- ============================================
-- TEST CASE VERSIONS TABLE (for versioning)
-- ============================================
CREATE TABLE IF NOT EXISTS public.test_case_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_case_id uuid NOT NULL REFERENCES public.test_cases(id) ON DELETE CASCADE,
  version integer NOT NULL,
  title text NOT NULL,
  description text,
  preconditions text,
  expected_result text,
  steps jsonb DEFAULT '[]'::jsonb,
  priority text NOT NULL,
  test_type text NOT NULL DEFAULT 'manual',
  tags text[] DEFAULT '{}'::text[],
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  change_summary text,
  UNIQUE(test_case_id, version)
);

ALTER TABLE public.test_case_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view test case versions" ON public.test_case_versions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM test_cases tc
    JOIN projects p ON p.id = tc.project_id
    WHERE tc.id = test_case_versions.test_case_id 
    AND has_workspace_access(p.workspace_id, auth.uid(), 'viewer'::app_role)
  )
);

CREATE POLICY "Testers+ can create test case versions" ON public.test_case_versions
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM test_cases tc
    JOIN projects p ON p.id = tc.project_id
    WHERE tc.id = test_case_versions.test_case_id 
    AND has_workspace_access(p.workspace_id, auth.uid(), 'tester'::app_role)
  )
);

-- ============================================
-- TEST CASE REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.test_case_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_case_id uuid NOT NULL REFERENCES public.test_cases(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES auth.users(id),
  assigned_by uuid NOT NULL REFERENCES auth.users(id),
  version_reviewed integer NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'approved', 'changes_required')),
  comments text,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.test_case_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view test case reviews" ON public.test_case_reviews
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM test_cases tc
    JOIN projects p ON p.id = tc.project_id
    WHERE tc.id = test_case_reviews.test_case_id 
    AND has_workspace_access(p.workspace_id, auth.uid(), 'viewer'::app_role)
  )
);

CREATE POLICY "Testers+ can create test case reviews" ON public.test_case_reviews
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM test_cases tc
    JOIN projects p ON p.id = tc.project_id
    WHERE tc.id = test_case_reviews.test_case_id 
    AND has_workspace_access(p.workspace_id, auth.uid(), 'tester'::app_role)
  )
);

CREATE POLICY "Reviewers can update their reviews" ON public.test_case_reviews
FOR UPDATE USING (
  reviewer_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM test_cases tc
    JOIN projects p ON p.id = tc.project_id
    WHERE tc.id = test_case_reviews.test_case_id 
    AND has_workspace_access(p.workspace_id, auth.uid(), 'manager'::app_role)
  )
);

-- ============================================
-- REVIEW COMMENTS TABLE (for detailed review history)
-- ============================================
CREATE TABLE IF NOT EXISTS public.review_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES public.test_case_reviews(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.review_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view review comments" ON public.review_comments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM test_case_reviews tcr
    JOIN test_cases tc ON tc.id = tcr.test_case_id
    JOIN projects p ON p.id = tc.project_id
    WHERE tcr.id = review_comments.review_id 
    AND has_workspace_access(p.workspace_id, auth.uid(), 'viewer'::app_role)
  )
);

CREATE POLICY "Users can create review comments" ON public.review_comments
FOR INSERT WITH CHECK (
  author_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM test_case_reviews tcr
    JOIN test_cases tc ON tc.id = tcr.test_case_id
    JOIN projects p ON p.id = tc.project_id
    WHERE tcr.id = review_comments.review_id 
    AND has_workspace_access(p.workspace_id, auth.uid(), 'viewer'::app_role)
  )
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  entity_type text,
  entity_id uuid,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.notifications
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON public.notifications
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON public.notifications
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own notifications" ON public.notifications
FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- UPDATE TEST EXECUTIONS TABLE
-- ============================================
ALTER TABLE public.test_executions
ADD COLUMN IF NOT EXISTS build_version text,
ADD COLUMN IF NOT EXISTS environment text,
ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS started_at timestamptz,
ADD COLUMN IF NOT EXISTS completed_at timestamptz,
ADD COLUMN IF NOT EXISTS duration_seconds integer;

-- ============================================
-- UPDATE DEFECTS TABLE
-- ============================================
ALTER TABLE public.defects
ADD COLUMN IF NOT EXISTS steps_to_reproduce text,
ADD COLUMN IF NOT EXISTS actual_result text,
ADD COLUMN IF NOT EXISTS expected_result text,
ADD COLUMN IF NOT EXISTS environment text,
ADD COLUMN IF NOT EXISTS priority text DEFAULT 'p2',
ADD COLUMN IF NOT EXISTS resolution text,
ADD COLUMN IF NOT EXISTS resolved_at timestamptz,
ADD COLUMN IF NOT EXISTS closed_at timestamptz,
ADD COLUMN IF NOT EXISTS linked_test_case_id uuid REFERENCES public.test_cases(id);

-- Update defects status constraint
ALTER TABLE public.defects DROP CONSTRAINT IF EXISTS defects_status_check;
ALTER TABLE public.defects ADD CONSTRAINT defects_status_check 
CHECK (status IN ('new', 'open', 'in_progress', 'reopened', 'resolved', 'verified', 'closed', 'retest'));

-- ============================================
-- FUNCTION: Create notification
-- ============================================
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_workspace_id uuid,
  p_project_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_entity_type text DEFAULT NULL,
  p_entity_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification_id uuid;
BEGIN
  INSERT INTO public.notifications (
    user_id, workspace_id, project_id, type, title, message, entity_type, entity_id
  ) VALUES (
    p_user_id, p_workspace_id, p_project_id, p_type, p_title, p_message, p_entity_type, p_entity_id
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- ============================================
-- FUNCTION: Check valid status transition for test cases
-- ============================================
CREATE OR REPLACE FUNCTION public.validate_test_case_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  valid_transition boolean := false;
  v_old_status text := COALESCE(OLD.status, 'draft');
  v_new_status text := NEW.status;
BEGIN
  -- Define valid transitions
  valid_transition := CASE
    WHEN v_old_status = 'draft' AND v_new_status IN ('draft', 'submitted_for_review', 'obsolete') THEN true
    WHEN v_old_status = 'submitted_for_review' AND v_new_status IN ('in_review', 'draft') THEN true
    WHEN v_old_status = 'in_review' AND v_new_status IN ('reviewed', 'changes_required') THEN true
    WHEN v_old_status = 'changes_required' AND v_new_status IN ('draft', 'submitted_for_review') THEN true
    WHEN v_old_status = 'reviewed' AND v_new_status IN ('approved', 'changes_required') THEN true
    WHEN v_old_status = 'approved' AND v_new_status IN ('ready_for_execution', 'obsolete') THEN true
    WHEN v_old_status = 'ready_for_execution' AND v_new_status IN ('executed', 'blocked', 'obsolete') THEN true
    WHEN v_old_status = 'executed' AND v_new_status IN ('ready_for_execution', 'obsolete') THEN true
    WHEN v_old_status = 'blocked' AND v_new_status IN ('ready_for_execution', 'obsolete') THEN true
    WHEN v_old_status = v_new_status THEN true
    ELSE false
  END;
  
  IF NOT valid_transition THEN
    RAISE EXCEPTION 'Invalid status transition from % to %', v_old_status, v_new_status;
  END IF;
  
  -- Lock test case during review
  IF v_new_status IN ('submitted_for_review', 'in_review') THEN
    NEW.is_locked := true;
  ELSIF v_new_status IN ('draft', 'changes_required', 'reviewed', 'approved') THEN
    NEW.is_locked := false;
  END IF;
  
  -- Set timestamps
  IF v_new_status = 'submitted_for_review' AND v_old_status = 'draft' THEN
    NEW.submitted_at := now();
  END IF;
  
  IF v_new_status = 'reviewed' AND v_old_status = 'in_review' THEN
    NEW.reviewed_at := now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for status validation
DROP TRIGGER IF EXISTS validate_test_case_status ON public.test_cases;
CREATE TRIGGER validate_test_case_status
  BEFORE UPDATE ON public.test_cases
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.validate_test_case_status_transition();

-- ============================================
-- FUNCTION: Auto-create version on test case update
-- ============================================
CREATE OR REPLACE FUNCTION public.create_test_case_version()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only create version if content changed (not just status)
  IF (OLD.title IS DISTINCT FROM NEW.title OR 
      OLD.description IS DISTINCT FROM NEW.description OR
      OLD.preconditions IS DISTINCT FROM NEW.preconditions OR
      OLD.expected_result IS DISTINCT FROM NEW.expected_result OR
      OLD.steps IS DISTINCT FROM NEW.steps OR
      OLD.priority IS DISTINCT FROM NEW.priority) THEN
    
    -- Increment version
    NEW.version := OLD.version + 1;
    
    -- Save old version
    INSERT INTO public.test_case_versions (
      test_case_id, version, title, description, preconditions, 
      expected_result, steps, priority, test_type, tags, created_by, change_summary
    ) VALUES (
      OLD.id, OLD.version, OLD.title, OLD.description, OLD.preconditions,
      OLD.expected_result, OLD.steps, OLD.priority, OLD.test_type, OLD.tags, 
      auth.uid(), 'Updated from version ' || OLD.version
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for versioning
DROP TRIGGER IF EXISTS create_test_case_version_trigger ON public.test_cases;
CREATE TRIGGER create_test_case_version_trigger
  BEFORE UPDATE ON public.test_cases
  FOR EACH ROW
  EXECUTE FUNCTION public.create_test_case_version();

-- ============================================
-- Add indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_test_cases_status ON public.test_cases(status);
CREATE INDEX IF NOT EXISTS idx_test_cases_project_status ON public.test_cases(project_id, status);
CREATE INDEX IF NOT EXISTS idx_test_cases_folder ON public.test_cases(folder_id);
CREATE INDEX IF NOT EXISTS idx_test_folders_project ON public.test_folders(project_id);
CREATE INDEX IF NOT EXISTS idx_test_folders_parent ON public.test_folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_test_case_reviews_test_case ON public.test_case_reviews(test_case_id);
CREATE INDEX IF NOT EXISTS idx_test_case_reviews_reviewer ON public.test_case_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_defects_test_execution ON public.defects(test_execution_id);
CREATE INDEX IF NOT EXISTS idx_defects_linked_test_case ON public.defects(linked_test_case_id);

-- ============================================
-- Enable realtime for notifications
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
