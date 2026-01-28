import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { logActivityDirect } from "@/hooks/useActivityLog";
import type { Tables } from "@/integrations/supabase/types";

export type TestRun = Tables<"test_runs"> & {
  executions?: TestExecution[];
  stats?: {
    total: number;
    passed: number;
    failed: number;
    blocked: number;
    notRun: number;
    progress: number;
  };
};

export type TestExecution = Tables<"test_executions"> & {
  test_case?: {
    id: string;
    title: string;
    priority: string;
  };
};

export interface CreateTestRunInput {
  name: string;
  description?: string;
  project_id: string;
  test_case_ids: string[];
}

export function useTestRuns(projectId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const testRunsQuery = useQuery({
    queryKey: ["test-runs", projectId],
    queryFn: async () => {
      let query = supabase
        .from("test_runs")
        .select(`
          *,
          executions:test_executions(
            id,
            status,
            executed_at,
            notes,
            test_case:test_cases(id, title, priority)
          )
        `)
        .order("created_at", { ascending: false });

      if (projectId) {
        query = query.eq("project_id", projectId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Calculate stats for each run
      return (data || []).map((run) => {
        const executions = run.executions || [];
        const total = executions.length;
        const passed = executions.filter((e: any) => e.status === "passed").length;
        const failed = executions.filter((e: any) => e.status === "failed").length;
        const blocked = executions.filter((e: any) => e.status === "blocked").length;
        const notRun = executions.filter((e: any) => e.status === "not_run").length;
        const progress = total > 0 ? Math.round(((total - notRun) / total) * 100) : 0;

        return {
          ...run,
          stats: { total, passed, failed, blocked, notRun, progress },
        } as TestRun;
      });
    },
    enabled: !!user,
  });

  const createTestRun = useMutation({
    mutationFn: async (input: CreateTestRunInput) => {
      if (!user) throw new Error("Not authenticated");

      // Create the test run
      const { data: testRun, error: runError } = await supabase
        .from("test_runs")
        .insert({
          name: input.name,
          description: input.description || null,
          project_id: input.project_id,
          created_by: user.id,
          status: "pending",
        })
        .select()
        .single();

      if (runError) throw runError;

      // Create test executions for each test case
      if (input.test_case_ids.length > 0) {
        const executions = input.test_case_ids.map((testCaseId) => ({
          test_run_id: testRun.id,
          test_case_id: testCaseId,
          status: "not_run",
        }));

        const { error: execError } = await supabase
          .from("test_executions")
          .insert(executions);

        if (execError) throw execError;
      }

      // Log activity
      const { data: project } = await supabase
        .from("projects")
        .select("workspace_id")
        .eq("id", input.project_id)
        .single();
      
      await logActivityDirect(user.id, {
        actionType: "create",
        entityType: "test_run",
        entityId: testRun.id,
        entityName: testRun.name,
        projectId: input.project_id,
        workspaceId: project?.workspace_id,
      });

      return testRun;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test-runs"] });
      toast({ title: "Test run created", description: "Test run has been created successfully." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateTestRunStatus = useMutation({
    mutationFn: async ({ runId, status }: { runId: string; status: string }) => {
      if (!user) throw new Error("Not authenticated");
      const updates: Record<string, any> = { status };
      
      if (status === "in_progress") {
        updates.started_at = new Date().toISOString();
      } else if (status === "completed") {
        updates.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("test_runs")
        .update(updates)
        .eq("id", runId)
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
        entityType: "test_run",
        entityId: data.id,
        entityName: data.name,
        projectId: data.project_id,
        workspaceId: project?.workspace_id,
        details: { status },
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test-runs"] });
    },
  });

  const updateExecutionStatus = useMutation({
    mutationFn: async ({ 
      executionId, 
      status, 
      notes 
    }: { 
      executionId: string; 
      status: string; 
      notes?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("test_executions")
        .update({
          status,
          notes: notes || null,
          executed_by: user.id,
          executed_at: new Date().toISOString(),
        })
        .eq("id", executionId)
        .select(`
          *,
          test_run:test_runs(id, name, project_id, projects(workspace_id)),
          test_case:test_cases(title)
        `)
        .single();

      if (error) throw error;
      
      // Log activity
      await logActivityDirect(user.id, {
        actionType: "execute",
        entityType: "test_execution",
        entityId: data.id,
        entityName: (data.test_case as any)?.title || "Test Execution",
        projectId: (data.test_run as any)?.project_id,
        workspaceId: (data.test_run as any)?.projects?.workspace_id,
        details: { status, notes },
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test-runs"] });
      toast({ title: "Status updated", description: "Test execution status has been updated." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteTestRun = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated");
      
      // Get test run info before deletion
      const { data: testRun } = await supabase
        .from("test_runs")
        .select("name, project_id, projects(workspace_id)")
        .eq("id", id)
        .single();
      
      const { error } = await supabase.from("test_runs").delete().eq("id", id);
      if (error) throw error;
      
      // Log activity
      if (testRun) {
        await logActivityDirect(user.id, {
          actionType: "delete",
          entityType: "test_run",
          entityId: id,
          entityName: testRun.name,
          projectId: testRun.project_id,
          workspaceId: (testRun.projects as any)?.workspace_id,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test-runs"] });
      toast({ title: "Test run deleted", description: "Test run has been deleted successfully." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return {
    testRuns: testRunsQuery.data || [],
    isLoading: testRunsQuery.isLoading,
    error: testRunsQuery.error,
    createTestRun,
    updateTestRunStatus,
    updateExecutionStatus,
    deleteTestRun,
    refetch: testRunsQuery.refetch,
  };
}
