import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FolderKanban,
  Search,
  MoreVertical,
  Layers,
  TestTube2,
  ArrowRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  status: string;
  created_at: string;
  workspace_id: string;
  workspace_name: string;
}

export default function AllProjects() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get all workspaces user is a member of
      const { data: memberships, error: memberError } = await supabase
        .from("workspace_members")
        .select("workspace_id, workspaces(name)")
        .eq("user_id", user.id)
        .not("accepted_at", "is", null);

      if (memberError) throw memberError;

      if (!memberships || memberships.length === 0) {
        setProjects([]);
        return;
      }

      const workspaceIds = memberships.map((m) => m.workspace_id);
      const workspaceMap = new Map(
        memberships.map((m) => [
          m.workspace_id,
          (m.workspaces as any)?.name || "Unknown Workspace",
        ])
      );

      // Get all projects from those workspaces
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .in("workspace_id", workspaceIds)
        .order("created_at", { ascending: false });

      if (projectsError) throw projectsError;

      const projectsWithWorkspace = (projectsData || []).map((p) => ({
        ...p,
        workspace_name: workspaceMap.get(p.workspace_id) || "Unknown",
      }));

      setProjects(projectsWithWorkspace);
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.workspace_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">All Projects</h1>
            <p className="text-muted-foreground">
              View and manage projects across all your workspaces
            </p>
          </div>
          <Button onClick={() => navigate("/workspaces")}>
            <Layers className="mr-2 h-4 w-4" />
            View Workspaces
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <Card className="border-border">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {projects.length === 0
                  ? "No projects yet"
                  : "No projects match your filters"}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {projects.length === 0
                  ? "Create a workspace and add projects to get started."
                  : "Try adjusting your search or filter criteria."}
              </p>
              {projects.length === 0 && (
                <Button onClick={() => navigate("/workspaces")}>
                  <Layers className="mr-2 h-4 w-4" />
                  Go to Workspaces
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                className="border-border hover:border-primary/50 transition-colors cursor-pointer group"
                onClick={() => navigate(`/workspaces/${project.workspace_id}`)}
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
                      <CardTitle className="text-lg text-foreground group-hover:text-primary transition-colors">
                        {project.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Layers className="h-3 w-3" />
                        {project.workspace_name}
                      </CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/test-repository?project=${project.id}`);
                        }}
                      >
                        <TestTube2 className="mr-2 h-4 w-4" />
                        View Test Cases
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/workspaces/${project.workspace_id}`);
                        }}
                      >
                        <Layers className="mr-2 h-4 w-4" />
                        View Workspace
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {project.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={project.status === "active" ? "default" : "secondary"}
                    >
                      {project.status}
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
