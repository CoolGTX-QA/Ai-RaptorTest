import { useState, useMemo } from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FolderPlus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export interface TestFolder {
  id: string;
  name: string;
  parentId: string | null;
  children?: TestFolder[];
  testCaseCount?: number;
}

interface FolderTreeProps {
  folders: TestFolder[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onCreateFolder: (name: string, parentId: string | null) => void;
  onRenameFolder: (folderId: string, newName: string) => void;
  onDeleteFolder: (folderId: string) => void;
  totalTestCases?: number;
}

interface FolderNodeProps {
  folder: TestFolder;
  level: number;
  isLast: boolean;
  parentLines: boolean[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onCreateSubfolder: (parentId: string) => void;
  onRenameFolder: (folderId: string, currentName: string) => void;
  onDeleteFolder: (folderId: string) => void;
  expandedFolders: Set<string>;
  toggleExpand: (folderId: string) => void;
}

function FolderNode({
  folder,
  level,
  isLast,
  parentLines,
  selectedFolderId,
  onSelectFolder,
  onCreateSubfolder,
  onRenameFolder,
  onDeleteFolder,
  expandedFolders,
  toggleExpand,
}: FolderNodeProps) {
  const hasChildren = folder.children && folder.children.length > 0;
  const isExpanded = expandedFolders.has(folder.id);
  const isSelected = selectedFolderId === folder.id;

  return (
    <div>
      <div
        className={cn(
          "group flex items-center h-8 hover:bg-accent/50 rounded-sm cursor-pointer transition-colors",
          isSelected && "bg-accent text-accent-foreground"
        )}
        onClick={() => onSelectFolder(folder.id)}
      >
        {/* Tree lines */}
        <div className="flex items-center h-full">
          {parentLines.map((showLine, index) => (
            <div key={index} className="w-4 h-full flex justify-center relative">
              {showLine && (
                <div className="w-px bg-border absolute top-0 bottom-0" />
              )}
            </div>
          ))}
          {level > 0 && (
            <div className="w-4 h-full flex items-center relative">
              {/* Vertical line */}
              <div className={cn(
                "w-px bg-border absolute left-1/2 -translate-x-1/2",
                isLast ? "top-0 h-1/2" : "top-0 bottom-0"
              )} />
              {/* Horizontal line */}
              <div className="h-px bg-border absolute left-1/2 right-0 top-1/2" />
            </div>
          )}
        </div>

        {/* Expand/Collapse toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleExpand(folder.id);
          }}
          className="w-4 h-4 flex items-center justify-center shrink-0"
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            )
          ) : (
            <div className="w-3" />
          )}
        </button>

        {/* Folder icon */}
        <div className="w-5 h-5 flex items-center justify-center shrink-0 mx-1">
          {isExpanded && hasChildren ? (
            <FolderOpen className="h-4 w-4 text-chart-1" />
          ) : (
            <Folder className="h-4 w-4 text-chart-1" />
          )}
        </div>

        {/* Folder name */}
        <span className="text-sm truncate flex-1 pr-2">{folder.name}</span>

        {/* Test case count */}
        {folder.testCaseCount !== undefined && folder.testCaseCount > 0 && (
          <Badge variant="secondary" className="text-xs mr-2 shrink-0">
            {folder.testCaseCount}
          </Badge>
        )}

        {/* Actions menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onCreateSubfolder(folder.id)}>
              <FolderPlus className="h-4 w-4 mr-2" />
              New Subfolder
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRenameFolder(folder.id, folder.name)}>
              <Pencil className="h-4 w-4 mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDeleteFolder(folder.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {folder.children!.map((child, index) => (
            <FolderNode
              key={child.id}
              folder={child}
              level={level + 1}
              isLast={index === folder.children!.length - 1}
              parentLines={[...parentLines, !isLast]}
              selectedFolderId={selectedFolderId}
              onSelectFolder={onSelectFolder}
              onCreateSubfolder={onCreateSubfolder}
              onRenameFolder={onRenameFolder}
              onDeleteFolder={onDeleteFolder}
              expandedFolders={expandedFolders}
              toggleExpand={toggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FolderTree({
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  totalTestCases = 0,
}: FolderTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [createParentId, setCreateParentId] = useState<string | null>(null);
  const [renameFolderId, setRenameFolderId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // Build tree structure from flat list
  const folderTree = useMemo(() => {
    const folderMap = new Map<string, TestFolder>();
    const rootFolders: TestFolder[] = [];

    // Create a map of all folders with children arrays
    folders.forEach((folder) => {
      folderMap.set(folder.id, { ...folder, children: [] });
    });

    // Build tree structure
    folders.forEach((folder) => {
      const folderWithChildren = folderMap.get(folder.id)!;
      if (folder.parentId && folderMap.has(folder.parentId)) {
        folderMap.get(folder.parentId)!.children!.push(folderWithChildren);
      } else {
        rootFolders.push(folderWithChildren);
      }
    });

    return rootFolders;
  }, [folders]);

  const toggleExpand = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const handleCreateSubfolder = (parentId: string) => {
    setCreateParentId(parentId);
    setNewFolderName("");
    setIsCreateDialogOpen(true);
    // Auto-expand parent
    setExpandedFolders((prev) => new Set([...prev, parentId]));
  };

  const handleRenameFolder = (folderId: string, currentName: string) => {
    setRenameFolderId(folderId);
    setRenameValue(currentName);
    setIsRenameDialogOpen(true);
  };

  const handleCreateSubmit = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim(), createParentId);
      setIsCreateDialogOpen(false);
      setNewFolderName("");
      setCreateParentId(null);
    }
  };

  const handleRenameSubmit = () => {
    if (renameValue.trim() && renameFolderId) {
      onRenameFolder(renameFolderId, renameValue.trim());
      setIsRenameDialogOpen(false);
      setRenameValue("");
      setRenameFolderId(null);
    }
  };

  return (
    <div className="space-y-2">
      {/* All Tests option */}
      <div
        className={cn(
          "flex items-center justify-between h-8 px-2 hover:bg-accent/50 rounded-sm cursor-pointer transition-colors",
          selectedFolderId === null && "bg-accent text-accent-foreground"
        )}
        onClick={() => onSelectFolder(null)}
      >
        <div className="flex items-center gap-2">
          <Folder className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">All Tests</span>
        </div>
        <Badge variant="secondary" className="text-xs">
          {totalTestCases}
        </Badge>
      </div>

      {/* Folder tree */}
      <div className="space-y-0">
        {folderTree.map((folder, index) => (
          <FolderNode
            key={folder.id}
            folder={folder}
            level={0}
            isLast={index === folderTree.length - 1}
            parentLines={[]}
            selectedFolderId={selectedFolderId}
            onSelectFolder={onSelectFolder}
            onCreateSubfolder={handleCreateSubfolder}
            onRenameFolder={handleRenameFolder}
            onDeleteFolder={onDeleteFolder}
            expandedFolders={expandedFolders}
            toggleExpand={toggleExpand}
          />
        ))}
      </div>

      {/* Add folder button */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
        onClick={() => {
          setCreateParentId(null);
          setNewFolderName("");
          setIsCreateDialogOpen(true);
        }}
      >
        <Plus className="h-4 w-4" />
        New Folder
      </Button>

      {/* Create folder dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {createParentId ? "Create Subfolder" : "Create Folder"}
            </DialogTitle>
            <DialogDescription>
              {createParentId
                ? "Create a new subfolder inside the selected folder."
                : "Create a new top-level folder to organize your test cases."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input
              id="folder-name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Enter folder name..."
              className="mt-2"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreateSubmit();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSubmit} disabled={!newFolderName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename folder dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
            <DialogDescription>
              Enter a new name for this folder.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rename-folder">Folder Name</Label>
            <Input
              id="rename-folder"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="Enter folder name..."
              className="mt-2"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleRenameSubmit();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameSubmit} disabled={!renameValue.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
