 import { useQuery } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/hooks/useAuth";
 
 import type { Json } from "@/integrations/supabase/types";
 
 export interface TestCaseVersion {
   id: string;
   test_case_id: string;
   version: number;
   title: string;
   description: string | null;
   preconditions: string | null;
   expected_result: string | null;
   steps: Json | null;
   priority: string;
   test_type: string;
   tags: string[] | null;
   created_by: string;
   created_at: string;
   change_summary: string | null;
   created_by_profile?: { full_name: string | null; email: string } | null;
 }
 
 export function useTestCaseVersions(testCaseId?: string) {
   const { user } = useAuth();
 
   return useQuery({
     queryKey: ["test-case-versions", testCaseId],
     queryFn: async () => {
       if (!testCaseId) return [];
 
       const { data, error } = await supabase
         .from("test_case_versions")
         .select("*")
         .eq("test_case_id", testCaseId)
         .order("version", { ascending: false });
 
       if (error) throw error;
 
       // Get profiles
       const userIds = [...new Set(data.map((v) => v.created_by))];
       const { data: profiles } = await supabase
         .from("profiles")
         .select("id, full_name, email")
         .in("id", userIds);
 
       const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
 
       return data.map((v) => ({
         ...v,
         created_by_profile: profileMap.get(v.created_by) || null,
       })) as TestCaseVersion[];
     },
     enabled: !!user && !!testCaseId,
   });
 }