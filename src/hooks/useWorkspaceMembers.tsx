 import { useQuery } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/hooks/useAuth";
 
 export interface WorkspaceMember {
   id: string;
   user_id: string;
   workspace_id: string;
   role: "admin" | "manager" | "tester" | "viewer";
   invited_at: string;
   accepted_at: string | null;
   profile?: {
     id: string;
     full_name: string | null;
     email: string;
     avatar_url: string | null;
   };
 }
 
 export function useWorkspaceMembers(workspaceId?: string) {
   const { user } = useAuth();
 
   return useQuery({
     queryKey: ["workspace-members", workspaceId],
     queryFn: async () => {
       if (!workspaceId) return [];
 
       const { data, error } = await supabase
         .from("workspace_members")
         .select("*")
         .eq("workspace_id", workspaceId)
         .not("accepted_at", "is", null);
 
       if (error) throw error;
 
       // Get profiles for all members
       const userIds = data.map((m) => m.user_id);
       const { data: profiles } = await supabase
         .from("profiles")
         .select("id, full_name, email, avatar_url")
         .in("id", userIds);
 
       const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
 
       return data.map((m) => ({
         ...m,
         profile: profileMap.get(m.user_id) || null,
       })) as WorkspaceMember[];
     },
     enabled: !!user && !!workspaceId,
   });
 }