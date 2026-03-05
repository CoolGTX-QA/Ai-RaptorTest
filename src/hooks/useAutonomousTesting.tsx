import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface AutonomousProject {
  id: string;
  project_id: string;
  test_name: string;
  base_url: string;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AutonomousApi {
  id: string;
  autonomous_project_id: string;
  api_name: string;
  endpoint_url: string;
  auth_type: string;
  auth_config: any;
  extra_info: string | null;
  doc_url: string | null;
  created_at: string;
}

export interface AutonomousUrl {
  id: string;
  autonomous_project_id: string;
  url_name: string;
  start_url: string;
  login_email: string | null;
  login_password: string | null;
  extra_instructions: string | null;
  doc_url: string | null;
  created_at: string;
}

export interface AutonomousTestCase {
  id: string;
  autonomous_project_id: string;
  test_number: number;
  priority: string;
  test_name: string;
  test_description: string | null;
  is_enabled: boolean;
  test_type: string;
  generated_script: string | null;
  status: string;
  error_message: string | null;
  trace: string | null;
  cause: string | null;
  fix_suggestion: string | null;
  duration_ms: number | null;
  executed_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useAutonomousTesting(projectId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const projectsQuery = useQuery({
    queryKey: ["autonomous-projects", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const { data, error } = await supabase
        .from("autonomous_test_projects" as any)
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as AutonomousProject[];
    },
    enabled: !!projectId,
  });

  const createProject = useMutation({
    mutationFn: async (input: { test_name: string; base_url: string }) => {
      if (!projectId || !user) throw new Error("Missing context");
      const { data, error } = await supabase
        .from("autonomous_test_projects" as any)
        .insert({
          project_id: projectId,
          test_name: input.test_name,
          base_url: input.base_url,
          created_by: user.id,
        } as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as AutonomousProject;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["autonomous-projects", projectId] });
    },
  });

  const addApis = useMutation({
    mutationFn: async (input: { autonomous_project_id: string; apis: Omit<AutonomousApi, "id" | "autonomous_project_id" | "created_at">[] }) => {
      const rows = input.apis.map((a) => ({
        autonomous_project_id: input.autonomous_project_id,
        api_name: a.api_name,
        endpoint_url: a.endpoint_url,
        auth_type: a.auth_type,
        auth_config: a.auth_config || {},
        extra_info: a.extra_info,
      }));
      const { data, error } = await supabase
        .from("autonomous_test_apis" as any)
        .insert(rows as any)
        .select();
      if (error) throw error;
      return data;
    },
  });

  const addUrls = useMutation({
    mutationFn: async (input: { autonomous_project_id: string; urls: Omit<AutonomousUrl, "id" | "autonomous_project_id" | "created_at">[] }) => {
      const rows = input.urls.map((u) => ({
        autonomous_project_id: input.autonomous_project_id,
        url_name: u.url_name,
        start_url: u.start_url,
        login_email: u.login_email,
        login_password: u.login_password,
        extra_instructions: u.extra_instructions,
      }));
      const { data, error } = await supabase
        .from("autonomous_test_urls" as any)
        .insert(rows as any)
        .select();
      if (error) throw error;
      return data;
    },
  });

  const saveTestCases = useMutation({
    mutationFn: async (input: { autonomous_project_id: string; cases: Partial<AutonomousTestCase>[] }) => {
      const rows = input.cases.map((c, i) => ({
        autonomous_project_id: input.autonomous_project_id,
        test_number: c.test_number || i + 1,
        priority: c.priority || "medium",
        test_name: c.test_name || "",
        test_description: c.test_description,
        is_enabled: c.is_enabled ?? true,
        test_type: c.test_type || "frontend",
        generated_script: c.generated_script,
        status: "draft",
      }));
      const { data, error } = await supabase
        .from("autonomous_test_cases" as any)
        .insert(rows as any)
        .select();
      if (error) throw error;
      return data as unknown as AutonomousTestCase[];
    },
  });

  const getTestCases = (autonomousProjectId: string) =>
    useQuery({
      queryKey: ["autonomous-test-cases", autonomousProjectId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("autonomous_test_cases" as any)
          .select("*")
          .eq("autonomous_project_id", autonomousProjectId)
          .order("test_number");
        if (error) throw error;
        return (data || []) as unknown as AutonomousTestCase[];
      },
      enabled: !!autonomousProjectId,
    });

  const updateTestCase = useMutation({
    mutationFn: async (input: { id: string; updates: Partial<AutonomousTestCase> }) => {
      const { data, error } = await supabase
        .from("autonomous_test_cases" as any)
        .update(input.updates as any)
        .eq("id", input.id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as AutonomousTestCase;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["autonomous-test-cases"] });
    },
  });

  const updateProject = useMutation({
    mutationFn: async (input: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from("autonomous_test_projects" as any)
        .update({ status: input.status } as any)
        .eq("id", input.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["autonomous-projects", projectId] });
    },
  });

  return {
    projects: projectsQuery.data || [],
    isLoading: projectsQuery.isLoading,
    createProject,
    addApis,
    addUrls,
    saveTestCases,
    getTestCases,
    updateTestCase,
    updateProject,
  };
}
