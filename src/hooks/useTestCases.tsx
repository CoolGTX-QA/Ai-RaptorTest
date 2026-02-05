import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { logActivityDirect } from "@/hooks/useActivityLog";
import type { Tables, TablesUpdate } from "@/integrations/supabase/types";
import { createNotification } from "./useNotifications";

export type TestCase = Tables<"test_cases"> & {
  created_by_profile?: { full_name: string | null; email: string } | null;
  reviewed_by_profile?: { full_name: string | null; email: string } | null;
  reviewer_profile?: { full_name: string | null; email: string } | null;
};

export interface CreateTestCaseInput {
  title: string;
  description?: string;
  priority?: string;
  status?: string;
  preconditions?: string;
  expected_result?: string;
  steps?: Array<{ action: string; expected: string }>;
  tags?: string[];
  project_id: string;
  test_type?: string;
  folder_id?: string;
}

export interface UpdateTestCaseInput {
  id: string;
  title?: string;
  description?: string;
  priority?: string;
  status?: string;
  preconditions?: string;
  expected_result?: string;
  steps?: Array<{ action: string; expected: string }>;
  tags?: string[];
  test_type?: string;
  folder_id?: string;
}

export function useTestCases(projectId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const testCasesQuery = useQuery({
    queryKey: ["test-cases", projectId],
    queryFn: async () => {
      let query = supabase
        .from("test_cases")
        .select("*")
        .order("created_at", { ascending: false });

      if (projectId) {
        query = query.eq("project_id", projectId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch profile info for all relevant users
      const userIds = [...new Set([
        ...(data?.map((tc) => tc.created_by) || []),
        ...(data?.map((tc) => tc.reviewed_by).filter(Boolean) || []),
        ...(data?.map((tc) => tc.assigned_reviewer).filter(Boolean) || []),
      ])] as string[];
      
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      return (data || []).map((tc) => ({
        ...tc,
        created_by_profile: profileMap.get(tc.created_by) || null,
        reviewed_by_profile: tc.reviewed_by ? profileMap.get(tc.reviewed_by) || null : null,
        reviewer_profile: tc.assigned_reviewer ? profileMap.get(tc.assigned_reviewer) || null : null,
      })) as TestCase[];
    },
    enabled: !!user,
  });

  const createTestCase = useMutation({
    mutationFn: async (input: CreateTestCaseInput) => {
      if (!user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("test_cases")
        .insert({
          title: input.title,
          description: input.description || null,
          priority: input.priority || "medium",
          status: input.status || "draft",
          preconditions: input.preconditions || null,
          expected_result: input.expected_result || null,
          steps: input.steps || [],
          tags: input.tags || [],
          project_id: input.project_id,
          created_by: user.id,
          test_type: input.test_type || "manual",
          folder_id: input.folder_id || null,
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
        entityType: "test_case",
        entityId: data.id,
        entityName: data.title,
        projectId: input.project_id,
        workspaceId: project?.workspace_id,
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test-cases"] });
      toast({ title: "Test case created", description: "Test case has been created successfully." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateTestCase = useMutation({
    mutationFn: async (input: UpdateTestCaseInput) => {
      if (!user) throw new Error("Not authenticated");
      const { id, ...updates } = input;
      
      // Check if test case is locked
      const { data: current } = await supabase
        .from("test_cases")
        .select("is_locked, status")
        .eq("id", id)
        .single();
      
      if (current?.is_locked && !["submitted_for_review", "in_review"].includes(updates.status || "")) {
        throw new Error("Test case is locked during review");
      }
      
      const { data, error } = await supabase
        .from("test_cases")
        .update(updates as TablesUpdate<"test_cases">)
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
        entityType: "test_case",
        entityId: data.id,
        entityName: data.title,
        projectId: data.project_id,
        workspaceId: project?.workspace_id,
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test-cases"] });
      toast({ title: "Test case updated", description: "Test case has been updated successfully." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteTestCase = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated");
      
      // Get test case info before deletion
      const { data: testCase } = await supabase
        .from("test_cases")
        .select("title, project_id, projects(workspace_id)")
        .eq("id", id)
        .single();
      
      const { error } = await supabase.from("test_cases").delete().eq("id", id);
      if (error) throw error;
      
      // Log activity
      if (testCase) {
        await logActivityDirect(user.id, {
          actionType: "delete",
          entityType: "test_case",
          entityId: id,
          entityName: testCase.title,
          projectId: testCase.project_id,
          workspaceId: (testCase.projects as any)?.workspace_id,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test-cases"] });
      toast({ title: "Test case deleted", description: "Test case has been deleted successfully." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const submitForReview = useMutation({
    mutationFn: async (testCaseId: string) => {
      if (!user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("test_cases")
        .update({ status: "submitted_for_review", submitted_at: new Date().toISOString() })
        .eq("id", testCaseId)
        .select("*, projects(workspace_id)")
        .single();
      
      if (error) throw error;
      
      // Notify managers in the workspace
      const { data: managers } = await supabase
        .from("workspace_members")
        .select("user_id")
        .eq("workspace_id", (data.projects as any)?.workspace_id)
        .in("role", ["admin", "manager"]);
      
      if (managers) {
        for (const manager of managers) {
          if (manager.user_id !== user.id) {
            await createNotification({
              userId: manager.user_id,
              workspaceId: (data.projects as any)?.workspace_id,
              projectId: data.project_id,
              type: "review_requested",
              title: "Test case submitted for review",
              message: `"${data.title}" has been submitted for review`,
              entityType: "test_case",
              entityId: data.id,
            });
          }
        }
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test-cases"] });
      toast({ title: "Submitted for review", description: "Test case has been submitted for review." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const approveTestCase = useMutation({
    mutationFn: async (testCaseId: string) => {
      if (!user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("test_cases")
        .update({ status: "approved" })
        .eq("id", testCaseId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test-cases"] });
      toast({ title: "Approved", description: "Test case has been approved." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const markReadyForExecution = useMutation({
    mutationFn: async (testCaseId: string) => {
      if (!user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("test_cases")
        .update({ status: "ready_for_execution" })
        .eq("id", testCaseId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test-cases"] });
      toast({ title: "Ready for execution", description: "Test case is now ready to be executed." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const bulkCreateTestCases = useMutation({
    mutationFn: async (inputs: CreateTestCaseInput[]) => {
      if (!user) throw new Error("Not authenticated");
      
      const testCases = inputs.map((input) => ({
        title: input.title,
        description: input.description || null,
        priority: input.priority || "medium",
        status: input.status || "draft",
        preconditions: input.preconditions || null,
        expected_result: input.expected_result || null,
        steps: input.steps || [],
        tags: input.tags || [],
        project_id: input.project_id,
        created_by: user.id,
      }));

      const { data, error } = await supabase
        .from("test_cases")
        .insert(testCases)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["test-cases"] });
      toast({ title: "Test cases imported", description: `${data.length} test cases have been imported successfully.` });
    },
    onError: (error) => {
      toast({ title: "Import failed", description: error.message, variant: "destructive" });
    },
  });

  return {
    testCases: testCasesQuery.data || [],
    isLoading: testCasesQuery.isLoading,
    error: testCasesQuery.error,
    createTestCase,
    updateTestCase,
    deleteTestCase,
    bulkCreateTestCases,
    submitForReview,
    approveTestCase,
    markReadyForExecution,
    refetch: testCasesQuery.refetch,
  };
}
