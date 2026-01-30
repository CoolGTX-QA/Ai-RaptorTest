import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  MoreHorizontal,
  FileText,
  Sparkles,
  Upload,
  Loader2,
  Trash2,
  Edit,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Link, useSearchParams } from "react-router-dom";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ImportWizardDialog } from "@/components/test-cases/import-wizard/ImportWizardDialog";
import { useTestCases } from "@/hooks/useTestCases";
import { useProjects } from "@/hooks/useProjects";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { format } from "date-fns";
import { FolderTree } from "@/components/test-cases/FolderTree";
import { useTestFolders } from "@/hooks/useTestFolders";

const priorityColors: Record<string, string> = {
  critical: "bg-destructive text-destructive-foreground",
  high: "bg-chart-4 text-foreground",
  medium: "bg-chart-1 text-foreground",
  low: "bg-muted text-muted-foreground",
};

const statusColors: Record<string, string> = {
  active: "border-chart-1 text-chart-1",
  ready: "border-chart-1 text-chart-1",
  under_review: "border-chart-4 text-chart-4",
  in_review: "border-chart-4 text-chart-4",
  approved: "border-primary text-primary",
  draft: "border-muted text-muted-foreground",
  obsolete: "border-destructive text-destructive",
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
  const [editingTestCase, setEditingTestCase] = useState<any>(null);
  
  const { toast } = useToast();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  
  // Auto-select first project when projects load
  const currentProjectId = selectedProject || projects?.[0]?.id || "";
  
  const { 
    testCases, 
    isLoading, 
    createTestCase, 
    updateTestCase,
    deleteTestCase,
    bulkCreateTestCases 
  } = useTestCases(currentProjectId);

  // Folder management
  const {
    folders: testFolders,
    createFolder,
    renameFolder,
    deleteFolder,
  } = useTestFolders(currentProjectId);

  const handleCreateTestCase = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentProjectId) {
      toast({ title: "Error", description: "Please select a project first", variant: "destructive" });
      return;
    }
    
    const formData = new FormData(e.currentTarget);
    await createTestCase.mutateAsync({
      title: formData.get("name") as string,
      description: formData.get("description") as string,
      priority: formData.get("priority") as string,
      status: "draft",
      project_id: currentProjectId,
    });
    setIsCreateOpen(false);
  };

  const handleUpdateTestCase = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingTestCase) return;
    
    const formData = new FormData(e.currentTarget);
    await updateTestCase.mutateAsync({
      id: editingTestCase.id,
      title: formData.get("name") as string,
      description: formData.get("description") as string,
      priority: formData.get("priority") as string,
      status: formData.get("status") as string,
    });
    setEditingTestCase(null);
  };

  const handleDeleteTestCase = async () => {
    if (!deleteId) return;
    await deleteTestCase.mutateAsync(deleteId);
    setDeleteId(null);
  };

  const handleBulkImport = async (importedCases: Array<{
    title: string;
    description: string;
    priority: string;
    status: string;
    preconditions: string;
    expected_result: string;
    tags: string[];
  }>) => {
    if (!currentProjectId) {
      toast({ title: "Error", description: "Please select a project first", variant: "destructive" });
      return;
    }

    await bulkCreateTestCases.mutateAsync(
      importedCases.map((tc) => ({
        ...tc,
        project_id: currentProjectId,
      }))
    );
  };

  const handleFolderSelect = (folderId: string | null) => {
    setSelectedFolderId(folderId);
    // Reset priority filter when folder changes
    setPriorityFilter("all");
  };

  const filteredTestCases = useMemo(() => {
    return testCases.filter((tc) => {
      const matchesSearch = tc.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = priorityFilter === "all" || tc.priority === priorityFilter;
      const matchesStatus = statusFilter === "all" || tc.status === statusFilter;
      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [testCases, searchQuery, priorityFilter, statusFilter]);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumbs
          items={[
            { label: "Projects", href: "/projects" },
            { label: "Test Cases" },
          ]}
        />

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Test Repository</h1>
            <p className="text-muted-foreground">
              Manage and organize your test cases
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {/* Project Selector */}
            <Select value={currentProjectId} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projectsLoading ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : projects?.length === 0 ? (
                  <SelectItem value="none" disabled>No projects found</SelectItem>
                ) : (
                  projects?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            <Button variant="outline" asChild>
              <Link to="/ai-generation">
                <Sparkles className="mr-2 h-4 w-4" />
                AI Generate
              </Link>
            </Button>
            <Button variant="outline" onClick={() => setIsBulkImportOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Bulk Import
            </Button>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button disabled={!currentProjectId}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Test Case
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <form onSubmit={handleCreateTestCase}>
                  <DialogHeader>
                    <DialogTitle>Create New Test Case</DialogTitle>
                    <DialogDescription>
                      Add a new test case to your repository
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Test Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Enter a descriptive name"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Describe the purpose of this test case"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select name="priority" defaultValue="medium">
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="type">Type</Label>
                        <Select name="type" defaultValue="functional">
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="functional">Functional</SelectItem>
                            <SelectItem value="performance">Performance</SelectItem>
                            <SelectItem value="security">Security</SelectItem>
                            <SelectItem value="integration">Integration</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createTestCase.isPending}>
                      {createTestCase.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Test Case
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingTestCase} onOpenChange={(open) => !open && setEditingTestCase(null)}>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleUpdateTestCase}>
              <DialogHeader>
                <DialogTitle>Edit Test Case</DialogTitle>
                <DialogDescription>
                  Update the test case details
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Test Name</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    defaultValue={editingTestCase?.title}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    name="description"
                    defaultValue={editingTestCase?.description || ""}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-priority">Priority</Label>
                    <Select name="priority" defaultValue={editingTestCase?.priority || "medium"}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-status">Status</Label>
                    <Select name="status" defaultValue={editingTestCase?.status || "draft"}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="ready">Ready</SelectItem>
                        <SelectItem value="in_review">In Review</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="obsolete">Obsolete</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingTestCase(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateTestCase.isPending}>
                  {updateTestCase.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={!!deleteId}
          onOpenChange={(open) => !open && setDeleteId(null)}
          title="Delete Test Case"
          description="Are you sure you want to delete this test case? This action cannot be undone."
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={handleDeleteTestCase}
          loading={deleteTestCase.isPending}
        />

        {/* Bulk Import Wizard */}
        <ImportWizardDialog
          open={isBulkImportOpen}
          onOpenChange={setIsBulkImportOpen}
          onImport={handleBulkImport}
        />

        {/* Content */}
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Sidebar - Folders */}
          <Card className="h-fit border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-foreground">Test Folder</CardTitle>
            </CardHeader>
            <CardContent>
              <FolderTree
                folders={testFolders}
                selectedFolderId={selectedFolderId}
                onSelectFolder={handleFolderSelect}
                onCreateFolder={createFolder}
                onRenameFolder={renameFolder}
                onDeleteFolder={deleteFolder}
                totalTestCases={testCases.length}
              />
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search test cases..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center rounded-md border border-border">
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-r-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-l-none"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Test Cases Table */}
            <Card className="border-border">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 flex-1" />
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  ))}
                </div>
              ) : filteredTestCases.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No test cases found</h3>
                  <p className="text-muted-foreground mb-4">
                    {testCases.length === 0 
                      ? "Get started by creating your first test case" 
                      : "Try adjusting your search or filters"}
                  </p>
                  {testCases.length === 0 && (
                    <Button onClick={() => setIsCreateOpen(true)} disabled={!currentProjectId}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Test Case
                    </Button>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[100px]">ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTestCases.map((testCase) => (
                      <TableRow key={testCase.id} className="cursor-pointer">
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {testCase.id.slice(0, 8)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-foreground">{testCase.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "capitalize",
                              priorityColors[testCase.priority]
                            )}
                          >
                            {testCase.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "capitalize",
                              statusColors[testCase.status]
                            )}
                          >
                            {testCase.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {testCase.created_by_profile?.full_name || testCase.created_by_profile?.email || "Unknown"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(testCase.updated_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditingTestCase(testCase)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => setDeleteId(testCase.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
