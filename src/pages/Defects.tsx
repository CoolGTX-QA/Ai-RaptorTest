import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, Search, Bug, MoreHorizontal, AlertTriangle, Clock,
  User, Loader2, Trash2, Edit, Link as LinkIcon, RefreshCw,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useToast } from "@/hooks/use-toast";
import { useDefects } from "@/hooks/useDefects";
import { useProjects } from "@/hooks/useProjects";
import { useWorkspaceMembers } from "@/hooks/useWorkspaceMembers";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const severityColors: Record<string, string> = {
  critical: "bg-destructive text-destructive-foreground",
  high: "bg-chart-4 text-foreground",
  medium: "bg-chart-1 text-foreground",
  low: "bg-muted text-muted-foreground",
};

const statusColors: Record<string, string> = {
  new: "border-chart-3 text-chart-3",
  open: "border-destructive text-destructive",
  in_progress: "border-chart-4 text-chart-4",
  fixed: "border-chart-2 text-chart-2",
  retest: "border-primary text-primary",
  resolved: "border-chart-1 text-chart-1",
  closed: "border-muted text-muted-foreground",
};

const priorityColors: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive border-destructive/30",
  high: "bg-chart-4/10 text-chart-4 border-chart-4/30",
  medium: "bg-chart-1/10 text-chart-1 border-chart-1/30",
  low: "bg-muted text-muted-foreground",
};

export default function Defects() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingDefect, setEditingDefect] = useState<any>(null);
  const [viewingDefect, setViewingDefect] = useState<any>(null);
  const { toast } = useToast();

  const { data: projects, isLoading: projectsLoading } = useProjects();
  const currentProjectId = selectedProject || projects?.[0]?.id || "";
  const currentProject = projects?.find((p) => p.id === currentProjectId);
  const { data: workspaceMembers } = useWorkspaceMembers(currentProject?.workspace_id);

  const {
    defects, isLoading, stats, createDefect, updateDefect, deleteDefect,
  } = useDefects(currentProjectId);

  const filteredDefects = useMemo(() => {
    return defects.filter((defect) => {
      const matchesSearch = defect.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || defect.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [defects, searchQuery, statusFilter]);

  const handleCreateDefect = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentProjectId) {
      toast({ title: "Error", description: "Please select a project first", variant: "destructive" });
      return;
    }
    const formData = new FormData(e.currentTarget);
    await createDefect.mutateAsync({
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      severity: formData.get("severity") as string,
      priority: formData.get("priority") as string,
      steps_to_reproduce: formData.get("steps_to_reproduce") as string,
      assigned_to: (formData.get("assigned_to") as string) || undefined,
      status: "open",
      project_id: currentProjectId,
    });
    setIsCreateOpen(false);
  };

  const handleUpdateDefect = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingDefect) return;
    const formData = new FormData(e.currentTarget);
    await updateDefect.mutateAsync({
      id: editingDefect.id,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      severity: formData.get("severity") as string,
      status: formData.get("status") as string,
      assigned_to: (formData.get("assigned_to") as string) || undefined,
    });
    setEditingDefect(null);
  };

  const handleDeleteDefect = async () => {
    if (!deleteId) return;
    await deleteDefect.mutateAsync(deleteId);
    setDeleteId(null);
  };

  const handleStatusChange = async (defectId: string, newStatus: string) => {
    await updateDefect.mutateAsync({ id: defectId, status: newStatus });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "Projects", href: "/projects" }, { label: "Defects" }]} />

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive">
                <Bug className="h-6 w-6 text-destructive-foreground" />
              </div>
              Defects
            </h1>
            <p className="text-muted-foreground mt-2">Manage and track software defects</p>
          </div>
          <div className="flex gap-2">
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
                  projects?.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)
                )}
              </SelectContent>
            </Select>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button disabled={!currentProjectId}>
                  <Plus className="mr-2 h-4 w-4" />Report Defect
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleCreateDefect}>
                  <DialogHeader>
                    <DialogTitle>Report New Defect</DialogTitle>
                    <DialogDescription>Create a new defect report with full details</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input id="title" name="title" placeholder="Brief description of the defect" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" name="description" placeholder="Detailed description of the defect" rows={3} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="severity">Severity</Label>
                        <Select name="severity" defaultValue="medium">
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select name="priority" defaultValue="medium">
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="steps_to_reproduce">Steps to Reproduce</Label>
                      <Textarea id="steps_to_reproduce" name="steps_to_reproduce" placeholder="1. Step one&#10;2. Step two&#10;3. Step three" rows={4} />
                    </div>
                    {workspaceMembers && workspaceMembers.length > 0 && (
                      <div className="grid gap-2">
                        <Label>Assign To</Label>
                        <Select name="assigned_to">
                          <SelectTrigger><SelectValue placeholder="Select assignee (optional)" /></SelectTrigger>
                          <SelectContent>
                            {workspaceMembers.map((m) => (
                              <SelectItem key={m.user_id} value={m.user_id}>
                                {m.profile?.full_name || m.profile?.email || m.user_id}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={createDefect.isPending}>
                      {createDefect.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Defect
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingDefect} onOpenChange={(open) => !open && setEditingDefect(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleUpdateDefect}>
              <DialogHeader>
                <DialogTitle>Edit Defect</DialogTitle>
                <DialogDescription>Update the defect details</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input id="edit-title" name="title" defaultValue={editingDefect?.title} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea id="edit-description" name="description" defaultValue={editingDefect?.description || ""} rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Severity</Label>
                    <Select name="severity" defaultValue={editingDefect?.severity || "medium"}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Status</Label>
                    <Select name="status" defaultValue={editingDefect?.status || "open"}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="fixed">Fixed</SelectItem>
                        <SelectItem value="retest">Retest</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {workspaceMembers && workspaceMembers.length > 0 && (
                  <div className="grid gap-2">
                    <Label>Assign To</Label>
                    <Select name="assigned_to" defaultValue={editingDefect?.assigned_to || ""}>
                      <SelectTrigger><SelectValue placeholder="Select assignee" /></SelectTrigger>
                      <SelectContent>
                        {workspaceMembers.map((m) => (
                          <SelectItem key={m.user_id} value={m.user_id}>
                            {m.profile?.full_name || m.profile?.email || m.user_id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setEditingDefect(null)}>Cancel</Button>
                <Button type="submit" disabled={updateDefect.isPending}>
                  {updateDefect.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* View Defect Detail Dialog */}
        <Dialog open={!!viewingDefect} onOpenChange={(open) => !open && setViewingDefect(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bug className="h-5 w-5 text-destructive" />
                {viewingDefect?.title}
              </DialogTitle>
              <DialogDescription>
                <span className="font-mono">{viewingDefect?.id?.slice(0, 8)}</span> • Reported {viewingDefect?.created_at && format(new Date(viewingDefect.created_at), "MMM d, yyyy")}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4 py-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className={cn("capitalize", severityColors[viewingDefect?.severity || "medium"])}>
                    Severity: {viewingDefect?.severity}
                  </Badge>
                  <Badge variant="outline" className={cn("capitalize", statusColors[viewingDefect?.status || "open"])}>
                    {viewingDefect?.status?.replace("_", " ")}
                  </Badge>
                  {viewingDefect?.priority && (
                    <Badge variant="outline" className={cn("capitalize", priorityColors[viewingDefect.priority])}>
                      Priority: {viewingDefect.priority}
                    </Badge>
                  )}
                </div>

                {(viewingDefect?.linked_test_case_id || viewingDefect?.test_execution_id) && (
                  <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
                    {viewingDefect.linked_test_case_id && (
                      <Badge variant="secondary" className="gap-1">
                        <LinkIcon className="h-3 w-3" />
                        Linked Test Case: {viewingDefect.linked_test_case_id.slice(0, 8)}
                      </Badge>
                    )}
                    {viewingDefect.test_execution_id && (
                      <Badge variant="secondary" className="gap-1">
                        <LinkIcon className="h-3 w-3" />
                        Execution: {viewingDefect.test_execution_id.slice(0, 8)}
                      </Badge>
                    )}
                  </div>
                )}

                {viewingDefect?.description && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Description</Label>
                    <p className="text-sm mt-1">{viewingDefect.description}</p>
                  </div>
                )}

                {viewingDefect?.steps_to_reproduce && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Steps to Reproduce</Label>
                    <pre className="text-sm mt-1 whitespace-pre-wrap p-3 bg-muted rounded-md">{viewingDefect.steps_to_reproduce}</pre>
                  </div>
                )}

                {viewingDefect?.expected_result && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Expected Result</Label>
                    <p className="text-sm mt-1">{viewingDefect.expected_result}</p>
                  </div>
                )}

                {viewingDefect?.actual_result && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Actual Result</Label>
                    <p className="text-sm mt-1">{viewingDefect.actual_result}</p>
                  </div>
                )}

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-xs text-muted-foreground">Reported By</Label>
                    <p>{viewingDefect?.reported_by_profile?.full_name || viewingDefect?.reported_by_profile?.email || "Unknown"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Assigned To</Label>
                    <p>{viewingDefect?.assigned_to_profile?.full_name || viewingDefect?.assigned_to_profile?.email || "Unassigned"}</p>
                  </div>
                  {viewingDefect?.environment && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Environment</Label>
                      <p>{viewingDefect.environment}</p>
                    </div>
                  )}
                  {viewingDefect?.resolution && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Resolution</Label>
                      <p>{viewingDefect.resolution}</p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
            <DialogFooter>
              {viewingDefect?.status === "fixed" && (
                <Button
                  variant="outline"
                  onClick={() => {
                    handleStatusChange(viewingDefect.id, "retest");
                    setViewingDefect({ ...viewingDefect, status: "retest" });
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />Retest
                </Button>
              )}
              {viewingDefect?.status === "retest" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleStatusChange(viewingDefect.id, "open");
                      setViewingDefect({ ...viewingDefect, status: "open" });
                    }}
                  >
                    Retest Failed
                  </Button>
                  <Button
                    onClick={() => {
                      handleStatusChange(viewingDefect.id, "closed");
                      setViewingDefect(null);
                    }}
                  >
                    Verified & Close
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={() => { setEditingDefect(viewingDefect); setViewingDefect(null); }}>
                <Edit className="h-4 w-4 mr-2" />Edit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}
          title="Delete Defect"
          description="Are you sure you want to delete this defect? This action cannot be undone."
          confirmLabel="Delete" variant="destructive"
          onConfirm={handleDeleteDefect} loading={deleteDefect.isPending}
        />

        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
          <Card className="border-border">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Bug className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-destructive" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.open}</p>
                  <p className="text-sm text-muted-foreground">Open</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-chart-4" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.inProgress}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Bug className="h-8 w-8 text-chart-1" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.resolved}</p>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-chart-4" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.bySeverity.critical}</p>
                  <p className="text-sm text-muted-foreground">Critical</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress</TabsTrigger>
              <TabsTrigger value="fixed">Fixed</TabsTrigger>
              <TabsTrigger value="retest">Retest</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
              <TabsTrigger value="closed">Closed</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search defects..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
        </div>

        {/* Defects Table */}
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
          ) : filteredDefects.length === 0 ? (
            <div className="p-12 text-center">
              <Bug className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No defects found</h3>
              <p className="text-muted-foreground mb-4">
                {defects.length === 0 ? "No defects have been reported yet" : "Try adjusting your search or filters"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Linked</TableHead>
                  <TableHead>Reported</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDefects.map((defect) => (
                  <TableRow key={defect.id} className="cursor-pointer" onClick={() => setViewingDefect(defect)}>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {defect.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Bug className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium text-foreground truncate max-w-[200px]">{defect.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("capitalize", severityColors[defect.severity])}>
                        {defect.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {defect.priority ? (
                        <Badge variant="outline" className={cn("capitalize", priorityColors[defect.priority])}>
                          {defect.priority}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("capitalize", statusColors[defect.status])}>
                        {defect.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground truncate max-w-[120px]">
                          {defect.assigned_to_profile?.full_name || defect.assigned_to_profile?.email || "Unassigned"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {defect.linked_test_case_id || defect.test_execution_id ? (
                        <LinkIcon className="h-4 w-4 text-primary" />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(defect.created_at), "MMM d")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setViewingDefect(defect); }}>
                            <Bug className="mr-2 h-4 w-4" />View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditingDefect(defect); }}>
                            <Edit className="mr-2 h-4 w-4" />Edit
                          </DropdownMenuItem>
                          {defect.status === "fixed" && (
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange(defect.id, "retest"); }}>
                              <RefreshCw className="mr-2 h-4 w-4" />Mark for Retest
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteId(defect.id); }}>
                            <Trash2 className="mr-2 h-4 w-4" />Delete
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
    </AppLayout>
  );
}
