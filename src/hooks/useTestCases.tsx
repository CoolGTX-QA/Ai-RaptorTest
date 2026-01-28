import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { logActivityDirect } from "@/hooks/useActivityLog";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type TestCase = Tables<"test_cases"> & {
  created_by_profile?: { full_name: string | null; email: string } | null;
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

      // Fetch profile info for created_by users
      const userIds = [...new Set(data?.map((tc) => tc.created_by) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      return (data || []).map((tc) => ({
        ...tc,
        created_by_profile: profileMap.get(tc.created_by) || null,
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
    refetch: testCasesQuery.refetch,
  };
}
