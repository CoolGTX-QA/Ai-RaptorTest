import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { logActivityDirect } from "@/hooks/useActivityLog";
import type { Tables } from "@/integrations/supabase/types";

export type Defect = Tables<"defects"> & {
  reported_by_profile?: { full_name: string | null; email: string } | null;
  assigned_to_profile?: { full_name: string | null; email: string } | null;
};

export interface CreateDefectInput {
  title: string;
  description?: string;
  severity?: string;
  status?: string;
  assigned_to?: string;
  project_id: string;
  test_execution_id?: string;
}

export interface UpdateDefectInput {
  id: string;
  title?: string;
  description?: string;
  severity?: string;
  status?: string;
  assigned_to?: string;
}

export function useDefects(projectId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const defectsQuery = useQuery({
    queryKey: ["defects", projectId],
    queryFn: async () => {
      let query = supabase
        .from("defects")
        .select("*")
        .order("created_at", { ascending: false });

      if (projectId) {
        query = query.eq("project_id", projectId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch profile info for reported_by and assigned_to users
      const userIds = [...new Set([
        ...(data?.map((d) => d.reported_by) || []),
        ...(data?.map((d) => d.assigned_to).filter(Boolean) || []),
      ])];
      
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      return (data || []).map((d) => ({
        ...d,
        reported_by_profile: profileMap.get(d.reported_by) || null,
        assigned_to_profile: d.assigned_to ? profileMap.get(d.assigned_to) || null : null,
      })) as Defect[];
    },
    enabled: !!user,
  });

  const createDefect = useMutation({
    mutationFn: async (input: CreateDefectInput) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("defects")
        .insert({
          title: input.title,
          description: input.description || null,
          severity: input.severity || "medium",
          status: input.status || "open",
          assigned_to: input.assigned_to || null,
          project_id: input.project_id,
          test_execution_id: input.test_execution_id || null,
          reported_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Log activity
      const { data: project } = await supabase
        .from("projects")
        .select("workspace_id")
        .eq("id", input.project_id)
        .single();
      
      await logActivityDirect(user.id, {
        actionType: "create",
        entityType: "defect",
        entityId: data.id,
        entityName: data.title,
        projectId: input.project_id,
        workspaceId: project?.workspace_id,
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["defects"] });
      toast({ title: "Defect created", description: "Defect has been reported successfully." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateDefect = useMutation({
    mutationFn: async (input: UpdateDefectInput) => {
      if (!user) throw new Error("Not authenticated");
      const { id, ...updates } = input;
      const { data, error } = await supabase
        .from("defects")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      
      // Log activity
      const { data: project } = await supabase
        .from("projects")
        .select("workspace_id")
        .eq("id", data.project_id)
        .single();
      
      await logActivityDirect(user.id, {
        actionType: "update",
        entityType: "defect",
        entityId: data.id,
        entityName: data.title,
        projectId: data.project_id,
        workspaceId: project?.workspace_id,
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["defects"] });
      toast({ title: "Defect updated", description: "Defect has been updated successfully." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteDefect = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated");
      
      // Get defect info before deletion
      const { data: defect } = await supabase
        .from("defects")
        .select("title, project_id, projects(workspace_id)")
        .eq("id", id)
        .single();
      
      const { error } = await supabase.from("defects").delete().eq("id", id);
      if (error) throw error;
      
      // Log activity
      if (defect) {
        await logActivityDirect(user.id, {
          actionType: "delete",
          entityType: "defect",
          entityId: id,
          entityName: defect.title,
          projectId: defect.project_id,
          workspaceId: (defect.projects as any)?.workspace_id,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["defects"] });
      toast({ title: "Defect deleted", description: "Defect has been deleted successfully." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Compute stats from defects
  const stats = {
    total: defectsQuery.data?.length || 0,
    open: defectsQuery.data?.filter((d) => d.status === "open").length || 0,
    inProgress: defectsQuery.data?.filter((d) => d.status === "in_progress").length || 0,
    resolved: defectsQuery.data?.filter((d) => d.status === "resolved" || d.status === "closed").length || 0,
    bySeverity: {
      critical: defectsQuery.data?.filter((d) => d.severity === "critical").length || 0,
      high: defectsQuery.data?.filter((d) => d.severity === "high").length || 0,
      medium: defectsQuery.data?.filter((d) => d.severity === "medium").length || 0,
      low: defectsQuery.data?.filter((d) => d.severity === "low").length || 0,
    },
  };

  return {
    defects: defectsQuery.data || [],
    isLoading: defectsQuery.isLoading,
    error: defectsQuery.error,
    stats,
    createDefect,
    updateDefect,
    deleteDefect,
    refetch: defectsQuery.refetch,
  };
}
