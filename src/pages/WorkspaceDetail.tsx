import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRBAC } from "@/hooks/useRBAC";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageUpload } from "@/components/ImageUpload";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { RoleBadge } from "@/components/RoleBadge";
import { AppRole } from "@/hooks/useRBAC";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowLeft,
  Plus,
  FolderKanban,
  Users,
  MoreVertical,
  Loader2,
  Trash2,
  Edit,
  Shield,
  TestTube2,
} from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  status: string;
  created_at: string;
  created_by: string;
}

export default function WorkspaceDetail() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { hasPermission, loading: rbacLoading } = useRBAC(workspaceId);

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "", logo_url: "" });
  const [memberCount, setMemberCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (workspaceId && user) {
      fetchWorkspaceData();
    }
  }, [workspaceId, user]);

  const fetchWorkspaceData = async () => {
    if (!workspaceId) return;

    setLoading(true);
    try {
      // Fetch workspace details
      const { data: workspaceData, error: workspaceError } = await supabase
        .from("workspaces")
        .select("*")
        .eq("id", workspaceId)
        .maybeSingle();

      if (workspaceError) throw workspaceError;
      
      if (!workspaceData) {
        toast({
          title: "Workspace not found",
          description: "The workspace you're looking for doesn't exist.",
          variant: "destructive",
        });
        navigate("/workspaces");
        return;
      }

      setWorkspace(workspaceData);

      // Fetch projects in this workspace
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });

      if (projectsError) throw projectsError;
      setProjects(projectsData || []);

      // Fetch member count
      const { count } = await supabase
        .from("workspace_members")
        .select("*", { count: "exact", head: true })
        .eq("workspace_id", workspaceId)
        .not("accepted_at", "is", null);

      setMemberCount(count || 0);
    } catch (error: any) {
      console.error("Error fetching workspace data:", error);
      toast({
        title: "Error",
        description: "Failed to load workspace data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!workspaceId || !user || !newProject.name.trim()) return;

    setCreating(true);
    try {
      const { error } = await supabase.from("projects").insert({
        name: newProject.name.trim(),
        description: newProject.description.trim() || null,
        logo_url: newProject.logo_url || null,
        workspace_id: workspaceId,
        created_by: user.id,
        status: "active",
      });

      if (error) throw error;

      toast({
        title: "Project created",
        description: `"${newProject.name.trim()}" has been created successfully.`,
      });

      setNewProject({ name: "", description: "", logo_url: "" });
      setCreateDialogOpen(false);
      fetchWorkspaceData();
    } catch (error: any) {
      console.error("Error creating project:", error);
      toast({
        title: "Error creating project",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectToDelete.id);

      if (error) throw error;

      toast({
        title: "Project deleted",
        description: `"${projectToDelete.name}" has been deleted.`,
      });

      setProjectToDelete(null);
      setDeleteDialogOpen(false);
      fetchWorkspaceData();
    } catch (error: any) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: "Failed to delete project. You may not have permission.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteProjectDialog = (project: Project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  if (loading || rbacLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!workspace) {
    return null;
  }

  const canCreateProject = hasPermission("project.create");
  const canDeleteProject = hasPermission("project.delete");
  const canUpdateProject = hasPermission("project.update");
  const isWorkspaceAdmin = hasPermission("workspace.delete");

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/workspaces")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {workspace.name}
              </h1>
              {workspace.description && (
                <p className="text-muted-foreground">{workspace.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/workspaces/${workspaceId}/members`)}
            >
              <Users className="h-4 w-4 mr-2" />
              Members ({memberCount})
            </Button>
            {canCreateProject && (
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                      Create a new project in {workspace.name}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Project Logo (optional)</Label>
                      <ImageUpload
                        bucket="project-logos"
                        currentImageUrl={newProject.logo_url || null}
                        onImageUploaded={(url) => setNewProject({ ...newProject, logo_url: url })}
                        onImageRemoved={() => setNewProject({ ...newProject, logo_url: "" })}
                        folder={workspaceId}
                        placeholder="P"
                        shape="rounded"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="project-name">Project Name</Label>
                      <Input
                        id="project-name"
                        placeholder="My Project"
                        value={newProject.name}
                        onChange={(e) =>
                          setNewProject({ ...newProject, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="project-description">
                        Description (optional)
                      </Label>
                      <Textarea
                        id="project-description"
                        placeholder="A brief description of this project..."
                        value={newProject.description}
                        onChange={(e) =>
                          setNewProject({
                            ...newProject,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateProject}
                      disabled={creating || !newProject.name.trim()}
                    >
                      {creating && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Create Project
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Projects Grid */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-foreground">Projects</h2>
          {projects.length === 0 ? (
            <Card className="border-border">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No projects yet
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first project to start organizing your test cases.
                </p>
                {canCreateProject && (
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Project
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="border-border hover:border-primary/50 transition-colors"
                >
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="flex items-start gap-3 flex-1">
                      <Avatar className="h-10 w-10 rounded-lg">
                        <AvatarImage src={project.logo_url || undefined} alt={project.name} />
                        <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                          {project.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg text-foreground">
                          {project.name}
                        </CardTitle>
                        {project.description && (
                          <CardDescription className="line-clamp-2">
                            {project.description}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            navigate(`/test-repository?project=${project.id}`)
                          }
                        >
                          <TestTube2 className="mr-2 h-4 w-4" />
                          View Test Cases
                        </DropdownMenuItem>
                        {canUpdateProject && (
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Project
                          </DropdownMenuItem>
                        )}
                        {canDeleteProject && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => openDeleteProjectDialog(project)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Project
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            project.status === "active" ? "default" : "secondary"
                          }
                        >
                          {project.status}
                        </Badge>
                        {canDeleteProject && (
                          <Tooltip>
                            <TooltipTrigger>
                              <Shield className="h-3 w-3 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>You can manage this project</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Created{" "}
                        {new Date(project.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Delete Project Confirmation Dialog */}
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Project"
          description={`Are you sure you want to delete "${projectToDelete?.name}"? This will permanently delete all test cases, test runs, and data within this project. This action cannot be undone.`}
          confirmLabel="Delete Project"
          variant="destructive"
          loading={deleting}
          onConfirm={handleDeleteProject}
        />
      </div>
    </AppLayout>
  );
}
