 import { useState, useMemo } from "react";
 import { AppLayout } from "@/components/layout/AppLayout";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Badge } from "@/components/ui/badge";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
 import {
   Plus, Search, Filter, Grid3X3, List, MoreHorizontal, FileText,
   Sparkles, Upload, Trash2, Edit, Send, Eye, Lock, CheckCircle, Clock
 } from "lucide-react";
 import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
 import { cn } from "@/lib/utils";
 import { useToast } from "@/hooks/use-toast";
 import { Link } from "react-router-dom";
 import { Breadcrumbs } from "@/components/Breadcrumbs";
 import { ImportWizardDialog } from "@/components/test-cases/import-wizard/ImportWizardDialog";
 import { useTestCases } from "@/hooks/useTestCases";
 import { useProjects } from "@/hooks/useProjects";
 import { Skeleton } from "@/components/ui/skeleton";
 import { ConfirmDialog } from "@/components/ConfirmDialog";
 import { format } from "date-fns";
 import { FolderTreeDB } from "@/components/test-cases/FolderTreeDB";
 import { useTestFoldersDB } from "@/hooks/useTestFoldersDB";
 import { TestCaseStatusBadge } from "@/components/test-cases/TestCaseStatusBadge";
 import { CreateTestCaseDialog } from "@/components/test-cases/CreateTestCaseDialog";
 import { TestCaseDetailDialog } from "@/components/test-cases/TestCaseDetailDialog";
 import { useTestCaseReviews } from "@/hooks/useTestCaseReviews";
 import { useTestCaseVersions } from "@/hooks/useTestCaseVersions";
 import { useWorkspaceMembers } from "@/hooks/useWorkspaceMembers";
 
 const priorityColors: Record<string, string> = {
   critical: "bg-destructive text-destructive-foreground",
   high: "bg-chart-4 text-foreground",
   medium: "bg-chart-1 text-foreground",
   low: "bg-muted text-muted-foreground",
 };
 
 export default function TestRepository() {
   const [viewMode, setViewMode] = useState<"list" | "grid">("list");
   const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
   const [searchQuery, setSearchQuery] = useState("");
   const [priorityFilter, setPriorityFilter] = useState("all");
   const [statusFilter, setStatusFilter] = useState("all");
   const [isCreateOpen, setIsCreateOpen] = useState(false);
   const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
   const [selectedProject, setSelectedProject] = useState<string>("");
   const [deleteId, setDeleteId] = useState<string | null>(null);
   const [selectedTestCase, setSelectedTestCase] = useState<any>(null);
 
   const { toast } = useToast();
   const { data: projects, isLoading: projectsLoading } = useProjects();
   const currentProjectId = selectedProject || projects?.[0]?.id || "";
   const currentProject = projects?.find((p) => p.id === currentProjectId);
 
   const {
     testCases, isLoading, createTestCase, updateTestCase, deleteTestCase,
     bulkCreateTestCases, submitForReview, markReadyForExecution
   } = useTestCases(currentProjectId);
 
   const { folderTree, createFolder, renameFolder, deleteFolder } = useTestFoldersDB(currentProjectId);
   const { reviews } = useTestCaseReviews(selectedTestCase?.id);
   const { data: versions } = useTestCaseVersions(selectedTestCase?.id);
   const { data: workspaceMembers } = useWorkspaceMembers(currentProject?.workspace_id);
 
   const handleCreateTestCase = async (data: any) => {
     if (!currentProjectId) {
       toast({ title: "Error", description: "Please select a project first", variant: "destructive" });
       return;
     }
     await createTestCase.mutateAsync({
       ...data, status: "draft", project_id: currentProjectId, folder_id: selectedFolderId || undefined,
     });
     setIsCreateOpen(false);
   };
 
   const handleUpdateTestCase = async (data: Partial<any>) => {
     if (!selectedTestCase) return;
     await updateTestCase.mutateAsync({ id: selectedTestCase.id, ...data });
   };
 
   const handleDeleteTestCase = async () => {
     if (!deleteId) return;
     await deleteTestCase.mutateAsync(deleteId);
     setDeleteId(null);
   };
 
   const handleSubmitForReview = async () => {
     if (!selectedTestCase) return;
     await submitForReview.mutateAsync(selectedTestCase.id);
     setSelectedTestCase(null);
   };
 
   const handleBulkImport = async (importedCases: any[]) => {
     if (!currentProjectId) {
       toast({ title: "Error", description: "Please select a project first", variant: "destructive" });
       return;
     }
     await bulkCreateTestCases.mutateAsync(importedCases.map((tc) => ({ ...tc, project_id: currentProjectId })));
   };
 
   const filteredTestCases = useMemo(() => {
     return testCases.filter((tc) => {
       const matchesSearch = tc.title.toLowerCase().includes(searchQuery.toLowerCase());
       const matchesPriority = priorityFilter === "all" || tc.priority === priorityFilter;
       const matchesStatus = statusFilter === "all" || tc.status === statusFilter;
       const matchesFolder = selectedFolderId === null || tc.folder_id === selectedFolderId;
       return matchesSearch && matchesPriority && matchesStatus && matchesFolder;
     });
   }, [testCases, searchQuery, priorityFilter, statusFilter, selectedFolderId]);
 
   const stats = {
     total: testCases.length,
     draft: testCases.filter((tc) => tc.status === "draft").length,
     inReview: testCases.filter((tc) => ["submitted_for_review", "in_review"].includes(tc.status)).length,
     approved: testCases.filter((tc) => ["approved", "ready_for_execution"].includes(tc.status)).length,
   };
 
   return (
     <AppLayout>
       <div className="space-y-6">
         <Breadcrumbs items={[{ label: "Projects", href: "/projects" }, { label: "Test Repository" }]} />
 
         {/* Header */}
         <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
           <div>
             <h1 className="text-3xl font-bold text-foreground">Test Repository</h1>
             <p className="text-muted-foreground">Manage and organize your test cases</p>
           </div>
           <div className="flex gap-2 flex-wrap">
             <Select value={currentProjectId} onValueChange={setSelectedProject}>
               <SelectTrigger className="w-[180px]">
                 <SelectValue placeholder="Select project" />
               </SelectTrigger>
               <SelectContent>
                 {projectsLoading ? (
                   <SelectItem value="loading" disabled>Loading...</SelectItem>
                 ) : projects?.length === 0 ? (
                   <SelectItem value="none" disabled>No projects found</SelectItem>
                 ) : (
                   projects?.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)
                 )}
               </SelectContent>
             </Select>
             <Button variant="outline" asChild>
               <Link to="/ai-generation"><Sparkles className="mr-2 h-4 w-4" />AI</Link>
             </Button>
             <Button variant="outline" onClick={() => setIsBulkImportOpen(true)}>
               <Upload className="mr-2 h-4 w-4" />Import
             </Button>
             <Button disabled={!currentProjectId} onClick={() => setIsCreateOpen(true)}>
               <Plus className="mr-2 h-4 w-4" />New Test Case
             </Button>
           </div>
         </div>
 
         {/* Dialogs */}
         <CreateTestCaseDialog
           open={isCreateOpen} onOpenChange={setIsCreateOpen}
           onSubmit={handleCreateTestCase} isSubmitting={createTestCase.isPending}
           selectedFolderId={selectedFolderId}
         />
         <TestCaseDetailDialog
           testCase={selectedTestCase} open={!!selectedTestCase}
           onOpenChange={(open) => !open && setSelectedTestCase(null)}
           onUpdate={handleUpdateTestCase} onSubmitForReview={handleSubmitForReview}
           isUpdating={updateTestCase.isPending}
           workspaceMembers={workspaceMembers} reviews={reviews} versions={versions || []}
         />
         <ConfirmDialog
           open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}
           title="Delete Test Case"
           description="Are you sure you want to delete this test case? This action cannot be undone."
           confirmLabel="Delete" variant="destructive"
           onConfirm={handleDeleteTestCase} loading={deleteTestCase.isPending}
         />
         <ImportWizardDialog open={isBulkImportOpen} onOpenChange={setIsBulkImportOpen} onImport={handleBulkImport} />
 
         {/* Stats */}
         <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
           <Card className="border-border">
             <CardContent className="pt-4">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                   <p className="text-sm text-muted-foreground">Total</p>
                 </div>
                 <FileText className="h-8 w-8 text-muted-foreground" />
               </div>
             </CardContent>
           </Card>
           <Card className="border-border">
             <CardContent className="pt-4">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-2xl font-bold text-foreground">{stats.draft}</p>
                   <p className="text-sm text-muted-foreground">Draft</p>
                 </div>
                 <Edit className="h-8 w-8 text-muted-foreground" />
               </div>
             </CardContent>
           </Card>
           <Card className="border-border">
             <CardContent className="pt-4">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-2xl font-bold text-foreground">{stats.inReview}</p>
                   <p className="text-sm text-muted-foreground">In Review</p>
                 </div>
                 <Clock className="h-8 w-8 text-chart-4" />
               </div>
             </CardContent>
           </Card>
           <Card className="border-border">
             <CardContent className="pt-4">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-2xl font-bold text-foreground">{stats.approved}</p>
                   <p className="text-sm text-muted-foreground">Approved</p>
                 </div>
                 <CheckCircle className="h-8 w-8 text-chart-1" />
               </div>
             </CardContent>
           </Card>
         </div>
 
         {/* Content */}
         <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
           {/* Sidebar - Folders */}
           <Card className="h-fit border-border">
             <CardHeader className="pb-3">
               <CardTitle className="text-base text-foreground">Test Folders</CardTitle>
             </CardHeader>
             <CardContent>
               <FolderTreeDB
                 folders={folderTree}
                 selectedFolderId={selectedFolderId}
                 onSelectFolder={setSelectedFolderId}
                 onCreateFolder={(name, parentId) => createFolder.mutate({ name, parentId })}
                 onRenameFolder={(id, name) => renameFolder.mutate({ id, name })}
                 onDeleteFolder={(id) => deleteFolder.mutate(id)}
                 testCaseCount={testCases.length}
               />
             </CardContent>
           </Card>
 
           {/* Main Content */}
           <div className="space-y-4">
             {/* Toolbar */}
             <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
               <div className="relative flex-1 max-w-sm">
                 <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                 <Input placeholder="Search test cases..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
               </div>
               <div className="flex items-center gap-2">
                 <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                   <SelectTrigger className="w-[130px]">
                     <Filter className="mr-2 h-4 w-4" />
                     <SelectValue placeholder="Priority" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">All Priority</SelectItem>
                     <SelectItem value="critical">Critical</SelectItem>
                     <SelectItem value="high">High</SelectItem>
                     <SelectItem value="medium">Medium</SelectItem>
                     <SelectItem value="low">Low</SelectItem>
                   </SelectContent>
                 </Select>
                 <Select value={statusFilter} onValueChange={setStatusFilter}>
                   <SelectTrigger className="w-[140px]">
                     <SelectValue placeholder="Status" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">All Status</SelectItem>
                     <SelectItem value="draft">Draft</SelectItem>
                     <SelectItem value="submitted_for_review">Submitted</SelectItem>
                     <SelectItem value="in_review">In Review</SelectItem>
                     <SelectItem value="changes_required">Changes Required</SelectItem>
                     <SelectItem value="reviewed">Reviewed</SelectItem>
                     <SelectItem value="approved">Approved</SelectItem>
                     <SelectItem value="ready_for_execution">Ready</SelectItem>
                   </SelectContent>
                 </Select>
                 <div className="flex rounded-md border border-input">
                   <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("list")} className="rounded-r-none">
                     <List className="h-4 w-4" />
                   </Button>
                   <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("grid")} className="rounded-l-none">
                     <Grid3X3 className="h-4 w-4" />
                   </Button>
                 </div>
               </div>
             </div>
 
             {/* Table or Grid */}
             <Card className="border-border">
               {isLoading ? (
                 <div className="p-6 space-y-4">
                   {[...Array(5)].map((_, i) => (
                     <div key={i} className="flex items-center gap-4">
                       <Skeleton className="h-4 w-16" />
                       <Skeleton className="h-4 flex-1" />
                       <Skeleton className="h-6 w-20" />
                     </div>
                   ))}
                 </div>
               ) : filteredTestCases.length === 0 ? (
                 <div className="p-12 text-center">
                   <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                   <h3 className="text-lg font-medium text-foreground mb-2">No test cases found</h3>
                   <p className="text-muted-foreground mb-4">
                     {testCases.length === 0 ? "Get started by creating your first test case" : "Try adjusting your search or filters"}
                   </p>
                   {testCases.length === 0 && (
                     <Button onClick={() => setIsCreateOpen(true)} disabled={!currentProjectId}>
                       <Plus className="mr-2 h-4 w-4" />Create Test Case
                     </Button>
                   )}
                 </div>
               ) : viewMode === "list" ? (
                 <Table>
                   <TableHeader>
                     <TableRow className="hover:bg-transparent">
                       <TableHead className="w-[100px]">ID</TableHead>
                       <TableHead>Title</TableHead>
                       <TableHead>Type</TableHead>
                       <TableHead>Priority</TableHead>
                       <TableHead>Status</TableHead>
                       <TableHead>Version</TableHead>
                       <TableHead>Updated</TableHead>
                       <TableHead className="w-[50px]"></TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {filteredTestCases.map((tc) => (
                       <TableRow key={tc.id} className="cursor-pointer" onClick={() => setSelectedTestCase(tc)}>
                         <TableCell className="font-mono text-sm text-muted-foreground">{tc.id.slice(0, 8)}</TableCell>
                         <TableCell>
                           <div className="flex items-center gap-2 max-w-[250px]">
                             {tc.is_locked && <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
                             <span className="font-medium text-foreground truncate">{tc.title}</span>
                           </div>
                         </TableCell>
                         <TableCell>
                           <Badge variant="outline" className="capitalize">{tc.test_type || "manual"}</Badge>
                         </TableCell>
                         <TableCell>
                           <Badge className={cn("text-xs", priorityColors[tc.priority])}>{tc.priority}</Badge>
                         </TableCell>
                         <TableCell><TestCaseStatusBadge status={tc.status} /></TableCell>
                         <TableCell className="text-muted-foreground">v{tc.version || 1}</TableCell>
                         <TableCell className="text-muted-foreground">{format(new Date(tc.updated_at), "MMM d, yyyy")}</TableCell>
                         <TableCell>
                           <DropdownMenu>
                             <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                               <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                             </DropdownMenuTrigger>
                             <DropdownMenuContent align="end">
                               <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedTestCase(tc); }}>
                                 <Eye className="mr-2 h-4 w-4" />View Details
                               </DropdownMenuItem>
                               {tc.status === "draft" && (
                                 <DropdownMenuItem onClick={(e) => { e.stopPropagation(); submitForReview.mutate(tc.id); }}>
                                   <Send className="mr-2 h-4 w-4" />Submit for Review
                                 </DropdownMenuItem>
                               )}
                               {tc.status === "approved" && (
                                 <DropdownMenuItem onClick={(e) => { e.stopPropagation(); markReadyForExecution.mutate(tc.id); }}>
                                   <CheckCircle className="mr-2 h-4 w-4" />Mark Ready
                                 </DropdownMenuItem>
                               )}
                               <DropdownMenuSeparator />
                               <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteId(tc.id); }}>
                                 <Trash2 className="mr-2 h-4 w-4" />Delete
                               </DropdownMenuItem>
                             </DropdownMenuContent>
                           </DropdownMenu>
                         </TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                 </Table>
               ) : (
                 <div className="p-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                   {filteredTestCases.map((tc) => (
                     <Card key={tc.id} className="cursor-pointer hover:border-primary/50" onClick={() => setSelectedTestCase(tc)}>
                       <CardContent className="pt-4">
                         <div className="flex items-start justify-between mb-2">
                           <div className="flex items-center gap-2">
                             {tc.is_locked && <Lock className="h-3 w-3 text-muted-foreground" />}
                             <span className="font-medium text-foreground line-clamp-1">{tc.title}</span>
                           </div>
                           <Badge className={cn("text-xs", priorityColors[tc.priority])}>{tc.priority}</Badge>
                         </div>
                         <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{tc.description || "No description"}</p>
                         <div className="flex items-center justify-between">
                           <TestCaseStatusBadge status={tc.status} />
                           <span className="text-xs text-muted-foreground">v{tc.version || 1}</span>
                         </div>
                       </CardContent>
                     </Card>
                   ))}
                 </div>
               )}
             </Card>
           </div>
         </div>
       </div>
     </AppLayout>
   );
 }