import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { TestFolder } from "@/components/test-cases/FolderTree";

// Generate unique IDs for folders (in a real app, this would come from the database)
const generateId = () => `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Default folders for a project
const getDefaultFolders = (): TestFolder[] => [
  { id: "folder-smoke", name: "Smoke Tests", parentId: null },
  { id: "folder-regression", name: "Regression Tests", parentId: null },
  { id: "folder-integration", name: "Integration Tests", parentId: null },
];

export function useTestFolders(projectId: string) {
  const { toast } = useToast();
  
  // In a real implementation, this would be stored in Supabase
  // For now, we use local state with localStorage persistence
  const [folders, setFolders] = useState<TestFolder[]>(() => {
    if (!projectId) return [];
    const stored = localStorage.getItem(`test-folders-${projectId}`);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return getDefaultFolders();
      }
    }
    return getDefaultFolders();
  });

  const saveFolders = useCallback((newFolders: TestFolder[]) => {
    setFolders(newFolders);
    if (projectId) {
      localStorage.setItem(`test-folders-${projectId}`, JSON.stringify(newFolders));
    }
  }, [projectId]);

  const createFolder = useCallback((name: string, parentId: string | null) => {
    const newFolder: TestFolder = {
      id: generateId(),
      name,
      parentId,
    };
    
    const newFolders = [...folders, newFolder];
    saveFolders(newFolders);
    
    toast({
      title: "Folder created",
      description: `"${name}" has been created successfully.`,
    });
    
    return newFolder;
  }, [folders, saveFolders, toast]);

  const renameFolder = useCallback((folderId: string, newName: string) => {
    const newFolders = folders.map((folder) =>
      folder.id === folderId ? { ...folder, name: newName } : folder
    );
    saveFolders(newFolders);
    
    toast({
      title: "Folder renamed",
      description: `Folder has been renamed to "${newName}".`,
    });
  }, [folders, saveFolders, toast]);

  const deleteFolder = useCallback((folderId: string) => {
    // Get all descendant folder IDs
    const getDescendantIds = (id: string): string[] => {
      const children = folders.filter((f) => f.parentId === id);
      return [id, ...children.flatMap((child) => getDescendantIds(child.id))];
    };
    
    const idsToDelete = new Set(getDescendantIds(folderId));
    const folderToDelete = folders.find((f) => f.id === folderId);
    const newFolders = folders.filter((folder) => !idsToDelete.has(folder.id));
    
    saveFolders(newFolders);
    
    toast({
      title: "Folder deleted",
      description: folderToDelete
        ? `"${folderToDelete.name}" and its subfolders have been deleted.`
        : "Folder has been deleted.",
    });
  }, [folders, saveFolders, toast]);

  const moveFolder = useCallback((folderId: string, newParentId: string | null) => {
    // Prevent moving a folder into its own descendant
    const getDescendantIds = (id: string): string[] => {
      const children = folders.filter((f) => f.parentId === id);
      return [id, ...children.flatMap((child) => getDescendantIds(child.id))];
    };
    
    const descendantIds = new Set(getDescendantIds(folderId));
    if (newParentId && descendantIds.has(newParentId)) {
      toast({
        title: "Cannot move folder",
        description: "A folder cannot be moved into its own subfolder.",
        variant: "destructive",
      });
      return;
    }
    
    const newFolders = folders.map((folder) =>
      folder.id === folderId ? { ...folder, parentId: newParentId } : folder
    );
    saveFolders(newFolders);
    
    toast({
      title: "Folder moved",
      description: "Folder has been moved successfully.",
    });
  }, [folders, saveFolders, toast]);

  const getFolderPath = useCallback((folderId: string): TestFolder[] => {
    const path: TestFolder[] = [];
    let currentId: string | null = folderId;
    
    while (currentId) {
      const folder = folders.find((f) => f.id === currentId);
      if (folder) {
        path.unshift(folder);
        currentId = folder.parentId;
      } else {
        break;
      }
    }
    
    return path;
  }, [folders]);

  return {
    folders,
    createFolder,
    renameFolder,
    deleteFolder,
    moveFolder,
    getFolderPath,
  };
}
