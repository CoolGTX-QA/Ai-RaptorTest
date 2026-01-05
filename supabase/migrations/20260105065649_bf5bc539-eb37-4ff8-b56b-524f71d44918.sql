-- Create a trigger function to add workspace creator as admin member
CREATE OR REPLACE FUNCTION public.add_workspace_creator_as_admin()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.workspace_members (workspace_id, user_id, role, invited_by, accepted_at)
  VALUES (NEW.id, NEW.created_by, 'admin', NEW.created_by, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to automatically add creator as admin when workspace is created
DROP TRIGGER IF EXISTS add_workspace_creator_trigger ON public.workspaces;
CREATE TRIGGER add_workspace_creator_trigger
  AFTER INSERT ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.add_workspace_creator_as_admin();