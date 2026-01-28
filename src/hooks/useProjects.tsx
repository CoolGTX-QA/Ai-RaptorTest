import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  workspace_id: string;
  workspace_name?: string;
}

export function useProjects() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-projects"],
    queryFn: async (): Promise<Project[]> => {
      if (!user) return [];

      // Get workspaces user is a member of
      const { data: memberships, error: memberError } = await supabase
        .from("workspace_members")
        .select("workspace_id, workspaces(id, name)")
        .eq("user_id", user.id)
        .not("accepted_at", "is", null);

      if (memberError) throw memberError;

      const workspaceIds = memberships?.map((m) => m.workspace_id) || [];
      if (workspaceIds.length === 0) return [];

      const workspaceMap = new Map(
        memberships?.map((m) => [
          m.workspace_id,
          (m.workspaces as any)?.name || "Unknown Workspace",
        ]) || []
      );

      // Get projects from those workspaces
      const { data: projects, error: projectsError } = await supabase
        .from("projects")
        .select("id, name, description, status, workspace_id")
        .in("workspace_id", workspaceIds)
        .order("name");

      if (projectsError) throw projectsError;

      return (projects || []).map((p) => ({
        ...p,
        workspace_name: workspaceMap.get(p.workspace_id),
      }));
    },
    enabled: !!user,
  });
}
