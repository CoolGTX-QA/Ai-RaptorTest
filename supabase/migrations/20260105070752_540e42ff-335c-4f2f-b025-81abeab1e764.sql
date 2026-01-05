-- Fix workspace creation: avoid duplicate admin-membership insert
-- Keep the existing on_workspace_created trigger (handle_new_workspace), remove the duplicate trigger/function.

DROP TRIGGER IF EXISTS add_workspace_creator_trigger ON public.workspaces;
DROP FUNCTION IF EXISTS public.add_workspace_creator_as_admin();

-- Ensure the canonical trigger exists (safe no-op if already present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'workspaces'
      AND t.tgname = 'on_workspace_created'
  ) THEN
    CREATE TRIGGER on_workspace_created
      AFTER INSERT ON public.workspaces
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_workspace();
  END IF;
END;
$$;