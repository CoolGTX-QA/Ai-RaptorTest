 import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/hooks/useAuth";
 import { useToast } from "@/hooks/use-toast";
 
 export interface TestFolder {
   id: string;
   project_id: string;
   parent_id: string | null;
   name: string;
   created_by: string;
   created_at: string;
   updated_at: string;
   children?: TestFolder[];
 }
 
 export function useTestFoldersDB(projectId?: string) {
   const { user } = useAuth();
   const { toast } = useToast();
   const queryClient = useQueryClient();
 
   const foldersQuery = useQuery({
     queryKey: ["test-folders", projectId],
     queryFn: async () => {
       if (!projectId) return [];
       
       const { data, error } = await supabase
         .from("test_folders")
         .select("*")
         .eq("project_id", projectId)
         .order("name");
 
       if (error) throw error;
       return data as TestFolder[];
     },
     enabled: !!user && !!projectId,
   });
 
   // Build tree structure from flat list
   const buildTree = (folders: TestFolder[]): TestFolder[] => {
     const map = new Map<string, TestFolder>();
     const roots: TestFolder[] = [];
 
     folders.forEach((folder) => {
       map.set(folder.id, { ...folder, children: [] });
     });
 
     folders.forEach((folder) => {
       const node = map.get(folder.id)!;
       if (folder.parent_id && map.has(folder.parent_id)) {
         map.get(folder.parent_id)!.children!.push(node);
       } else {
         roots.push(node);
       }
     });
 
     return roots;
   };
 
   const createFolder = useMutation({
     mutationFn: async ({ name, parentId }: { name: string; parentId?: string }) => {
       if (!user || !projectId) throw new Error("Not authenticated or no project");
 
       const { data, error } = await supabase
         .from("test_folders")
         .insert({
           name,
           project_id: projectId,
           parent_id: parentId || null,
           created_by: user.id,
         })
         .select()
         .single();
 
       if (error) throw error;
       return data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["test-folders", projectId] });
       toast({ title: "Folder created", description: "Test folder has been created." });
     },
     onError: (error) => {
       toast({ title: "Error", description: error.message, variant: "destructive" });
     },
   });
 
   const renameFolder = useMutation({
     mutationFn: async ({ id, name }: { id: string; name: string }) => {
       const { error } = await supabase
         .from("test_folders")
         .update({ name, updated_at: new Date().toISOString() })
         .eq("id", id);
 
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["test-folders", projectId] });
       toast({ title: "Folder renamed", description: "Test folder has been renamed." });
     },
     onError: (error) => {
       toast({ title: "Error", description: error.message, variant: "destructive" });
     },
   });
 
   const deleteFolder = useMutation({
     mutationFn: async (id: string) => {
       const { error } = await supabase
         .from("test_folders")
         .delete()
         .eq("id", id);
 
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["test-folders", projectId] });
       toast({ title: "Folder deleted", description: "Test folder has been deleted." });
     },
     onError: (error) => {
       toast({ title: "Error", description: error.message, variant: "destructive" });
     },
   });
 
   const moveFolder = useMutation({
     mutationFn: async ({ id, newParentId }: { id: string; newParentId: string | null }) => {
       const { error } = await supabase
         .from("test_folders")
         .update({ parent_id: newParentId, updated_at: new Date().toISOString() })
         .eq("id", id);
 
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["test-folders", projectId] });
     },
     onError: (error) => {
       toast({ title: "Error", description: error.message, variant: "destructive" });
     },
   });
 
   return {
     folders: foldersQuery.data || [],
     folderTree: buildTree(foldersQuery.data || []),
     isLoading: foldersQuery.isLoading,
     createFolder,
     renameFolder,
     deleteFolder,
     moveFolder,
     refetch: foldersQuery.refetch,
   };
 }