 import { useState } from "react";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
 } from "@/components/ui/dropdown-menu";
 import {
   ChevronRight,
   ChevronDown,
   Folder,
   FolderOpen,
   Plus,
   MoreHorizontal,
   Edit,
   Trash2,
   FolderPlus,
 } from "lucide-react";
 import { cn } from "@/lib/utils";
 import type { TestFolder } from "@/hooks/useTestFoldersDB";
 
 interface FolderNodeProps {
   folder: TestFolder;
   level: number;
   selectedId: string | null;
   expandedIds: Set<string>;
   onSelect: (id: string) => void;
   onToggle: (id: string) => void;
   onCreateSubfolder: (parentId: string) => void;
   onRename: (id: string, name: string) => void;
   onDelete: (id: string) => void;
   editingId: string | null;
   setEditingId: (id: string | null) => void;
   editName: string;
   setEditName: (name: string) => void;
 }
 
 function FolderNode({
   folder,
   level,
   selectedId,
   expandedIds,
   onSelect,
   onToggle,
   onCreateSubfolder,
   onRename,
   onDelete,
   editingId,
   setEditingId,
   editName,
   setEditName,
 }: FolderNodeProps) {
   const hasChildren = folder.children && folder.children.length > 0;
   const isExpanded = expandedIds.has(folder.id);
   const isSelected = selectedId === folder.id;
   const isEditing = editingId === folder.id;
 
   const handleRenameSubmit = () => {
     if (editName.trim()) {
       onRename(folder.id, editName.trim());
     }
     setEditingId(null);
   };
 
   return (
     <div>
       <div
         className={cn(
           "group flex items-center gap-1 py-1.5 px-2 rounded-md cursor-pointer hover:bg-accent transition-colors",
           isSelected && "bg-accent"
         )}
         style={{ paddingLeft: `${level * 16 + 8}px` }}
         onClick={() => onSelect(folder.id)}
       >
         {/* Expand/collapse button */}
         <button
           className="p-0.5 hover:bg-muted rounded"
           onClick={(e) => {
             e.stopPropagation();
             onToggle(folder.id);
           }}
         >
           {hasChildren ? (
             isExpanded ? (
               <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
             ) : (
               <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
             )
           ) : (
             <span className="w-3.5" />
           )}
         </button>
 
         {/* Folder icon */}
         {isExpanded && hasChildren ? (
           <FolderOpen className="h-4 w-4 text-chart-4 flex-shrink-0" />
         ) : (
           <Folder className="h-4 w-4 text-chart-4 flex-shrink-0" />
         )}
 
         {/* Name or edit input */}
         {isEditing ? (
           <Input
             value={editName}
             onChange={(e) => setEditName(e.target.value)}
             onBlur={handleRenameSubmit}
             onKeyDown={(e) => {
               if (e.key === "Enter") handleRenameSubmit();
               if (e.key === "Escape") setEditingId(null);
             }}
             className="h-6 py-0 px-1 text-sm"
             autoFocus
             onClick={(e) => e.stopPropagation()}
           />
         ) : (
           <span className="text-sm truncate flex-1">{folder.name}</span>
         )}
 
         {/* Actions */}
         <DropdownMenu>
           <DropdownMenuTrigger asChild>
             <Button
               variant="ghost"
               size="icon"
               className="h-6 w-6 opacity-0 group-hover:opacity-100"
               onClick={(e) => e.stopPropagation()}
             >
               <MoreHorizontal className="h-3.5 w-3.5" />
             </Button>
           </DropdownMenuTrigger>
           <DropdownMenuContent align="end">
             <DropdownMenuItem
               onClick={(e) => {
                 e.stopPropagation();
                 onCreateSubfolder(folder.id);
               }}
             >
               <FolderPlus className="h-4 w-4 mr-2" />
               New Subfolder
             </DropdownMenuItem>
             <DropdownMenuItem
               onClick={(e) => {
                 e.stopPropagation();
                 setEditName(folder.name);
                 setEditingId(folder.id);
               }}
             >
               <Edit className="h-4 w-4 mr-2" />
               Rename
             </DropdownMenuItem>
             <DropdownMenuItem
               className="text-destructive"
               onClick={(e) => {
                 e.stopPropagation();
                 onDelete(folder.id);
               }}
             >
               <Trash2 className="h-4 w-4 mr-2" />
               Delete
             </DropdownMenuItem>
           </DropdownMenuContent>
         </DropdownMenu>
       </div>
 
       {/* Children */}
       {hasChildren && isExpanded && (
         <div className="relative">
           {/* Vertical line */}
           <div
             className="absolute left-0 top-0 bottom-0 w-px bg-border"
             style={{ marginLeft: `${level * 16 + 20}px` }}
           />
           {folder.children!.map((child) => (
             <FolderNode
               key={child.id}
               folder={child}
               level={level + 1}
               selectedId={selectedId}
               expandedIds={expandedIds}
               onSelect={onSelect}
               onToggle={onToggle}
               onCreateSubfolder={onCreateSubfolder}
               onRename={onRename}
               onDelete={onDelete}
               editingId={editingId}
               setEditingId={setEditingId}
               editName={editName}
               setEditName={setEditName}
             />
           ))}
         </div>
       )}
     </div>
   );
 }
 
 interface FolderTreeDBProps {
   folders: TestFolder[];
   selectedFolderId: string | null;
   onSelectFolder: (id: string | null) => void;
   onCreateFolder: (name: string, parentId?: string) => void;
   onRenameFolder: (id: string, name: string) => void;
   onDeleteFolder: (id: string) => void;
   testCaseCount?: number;
 }
 
 export function FolderTreeDB({
   folders,
   selectedFolderId,
   onSelectFolder,
   onCreateFolder,
   onRenameFolder,
   onDeleteFolder,
   testCaseCount = 0,
 }: FolderTreeDBProps) {
   const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
   const [isCreating, setIsCreating] = useState(false);
   const [newFolderName, setNewFolderName] = useState("");
   const [newFolderParentId, setNewFolderParentId] = useState<string | undefined>();
   const [editingId, setEditingId] = useState<string | null>(null);
   const [editName, setEditName] = useState("");
 
   const handleToggle = (id: string) => {
     const newExpanded = new Set(expandedIds);
     if (newExpanded.has(id)) {
       newExpanded.delete(id);
     } else {
       newExpanded.add(id);
     }
     setExpandedIds(newExpanded);
   };
 
   const handleCreateFolder = () => {
     if (newFolderName.trim()) {
       onCreateFolder(newFolderName.trim(), newFolderParentId);
       setNewFolderName("");
       setIsCreating(false);
       setNewFolderParentId(undefined);
       if (newFolderParentId) {
         setExpandedIds(new Set([...expandedIds, newFolderParentId]));
       }
     }
   };
 
   const handleCreateSubfolder = (parentId: string) => {
     setNewFolderParentId(parentId);
     setIsCreating(true);
     setExpandedIds(new Set([...expandedIds, parentId]));
   };
 
   return (
     <div className="space-y-2">
       {/* All Test Cases */}
       <div
         className={cn(
           "flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer hover:bg-accent transition-colors",
           selectedFolderId === null && "bg-accent"
         )}
         onClick={() => onSelectFolder(null)}
       >
         <Folder className="h-4 w-4 text-primary" />
         <span className="text-sm font-medium flex-1">All Test Cases</span>
         <span className="text-xs text-muted-foreground">{testCaseCount}</span>
       </div>
 
       {/* Folder tree */}
       {folders.map((folder) => (
         <FolderNode
           key={folder.id}
           folder={folder}
           level={0}
           selectedId={selectedFolderId}
           expandedIds={expandedIds}
           onSelect={onSelectFolder}
           onToggle={handleToggle}
           onCreateSubfolder={handleCreateSubfolder}
           onRename={onRenameFolder}
           onDelete={onDeleteFolder}
           editingId={editingId}
           setEditingId={setEditingId}
           editName={editName}
           setEditName={setEditName}
         />
       ))}
 
       {/* New folder input */}
       {isCreating ? (
         <div className="flex items-center gap-2 p-2">
           <Folder className="h-4 w-4 text-chart-4" />
           <Input
             value={newFolderName}
             onChange={(e) => setNewFolderName(e.target.value)}
             onBlur={() => {
               if (!newFolderName.trim()) {
                 setIsCreating(false);
                 setNewFolderParentId(undefined);
               }
             }}
             onKeyDown={(e) => {
               if (e.key === "Enter") handleCreateFolder();
               if (e.key === "Escape") {
                 setIsCreating(false);
                 setNewFolderParentId(undefined);
               }
             }}
             placeholder="Folder name"
             className="h-7 text-sm"
             autoFocus
           />
         </div>
       ) : (
         <Button
           variant="ghost"
           size="sm"
           className="w-full justify-start text-muted-foreground"
           onClick={() => setIsCreating(true)}
         >
           <Plus className="h-4 w-4 mr-2" />
           New Folder
         </Button>
       )}
     </div>
   );
 }