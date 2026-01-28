import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Bug,
  MoreHorizontal,
  AlertTriangle,
  Clock,
  User,
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
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useToast } from "@/hooks/use-toast";
import { useDefects } from "@/hooks/useDefects";
import { useProjects } from "@/hooks/useProjects";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ConfirmDialog } from "@/components/ConfirmDialog";

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
  resolved: "border-chart-1 text-chart-1",
  closed: "border-muted text-muted-foreground",
};

export default function Defects() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingDefect, setEditingDefect] = useState<any>(null);
  const { toast } = useToast();

  const { data: projects, isLoading: projectsLoading } = useProjects();
  const currentProjectId = selectedProject || projects?.[0]?.id || "";

  const { 
    defects, 
    isLoading, 
    stats,
    createDefect, 
    updateDefect,
    deleteDefect,
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
    });
    setEditingDefect(null);
  };

  const handleDeleteDefect = async () => {
    if (!deleteId) return;
    await deleteDefect.mutateAsync(deleteId);
    setDeleteId(null);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumbs
          items={[
            { label: "Projects", href: "/projects" },
            { label: "Defects" },
          ]}
        />

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive">
                <Bug className="h-6 w-6 text-destructive-foreground" />
              </div>
              Defects
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage and track software defects
            </p>
          </div>
          <div className="flex gap-2">
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

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button disabled={!currentProjectId}>
                  <Plus className="mr-2 h-4 w-4" />
                  Report Defect
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <form onSubmit={handleCreateDefect}>
                  <DialogHeader>
                    <DialogTitle>Report New Defect</DialogTitle>
                    <DialogDescription>
                      Create a new defect report
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        name="title"
                        placeholder="Brief description of the defect"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Detailed description of the defect and steps to reproduce"
                        rows={4}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="severity">Severity</Label>
                      <Select name="severity" defaultValue="medium">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
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
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleUpdateDefect}>
              <DialogHeader>
                <DialogTitle>Edit Defect</DialogTitle>
                <DialogDescription>
                  Update the defect details
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    name="title"
                    defaultValue={editingDefect?.title}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    name="description"
                    defaultValue={editingDefect?.description || ""}
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-severity">Severity</Label>
                    <Select name="severity" defaultValue={editingDefect?.severity || "medium"}>
                      <SelectTrigger>
                        <SelectValue />
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
                    <Select name="status" defaultValue={editingDefect?.status || "open"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setEditingDefect(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateDefect.isPending}>
                  {updateDefect.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
          title="Delete Defect"
          description="Are you sure you want to delete this defect? This action cannot be undone."
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={handleDeleteDefect}
          loading={deleteDefect.isPending}
        />

        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="border-border">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Bug className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Defects</p>
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
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
              <TabsTrigger value="closed">Closed</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search defects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
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
                {defects.length === 0 
                  ? "No defects have been reported yet" 
                  : "Try adjusting your search or filters"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reported By</TableHead>
                  <TableHead>Reported</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDefects.map((defect) => (
                  <TableRow key={defect.id} className="cursor-pointer">
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {defect.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Bug className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">{defect.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("capitalize", severityColors[defect.severity])}>
                        {defect.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("capitalize", statusColors[defect.status])}
                      >
                        {defect.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {defect.reported_by_profile?.full_name || defect.reported_by_profile?.email || "Unknown"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(defect.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingDefect(defect)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => setDeleteId(defect.id)}
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
    </AppLayout>
  );
}
