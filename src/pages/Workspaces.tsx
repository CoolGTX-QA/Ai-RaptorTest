import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Layers,
  Plus,
  Users,
  FolderKanban,
  Settings,
  MoreVertical,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { RoleBadge } from "@/components/RoleBadge";
import { AppRole } from "@/hooks/useRBAC";

interface Workspace {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  created_by: string;
  member_count?: number;
  project_count?: number;
  role?: string;
}

export default function Workspaces() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState({ name: "", description: "" });

  useEffect(() => {
    fetchWorkspaces();
  }, [user]);

  const fetchWorkspaces = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch workspaces the user is a member of
      const { data: memberData, error: memberError } = await supabase
        .from("workspace_members")
        .select(`
          role,
          workspace_id,
          workspaces (
            id,
            name,
            description,
            created_at,
            created_by
          )
        `)
        .eq("user_id", user.id)
        .not("accepted_at", "is", null);

      if (memberError) throw memberError;

      // Process and enrich workspace data
      const workspacesWithCounts = await Promise.all(
        (memberData || []).map(async (member) => {
          const workspace = member.workspaces as unknown as Workspace;
          
          // Get member count
          const { count: memberCount } = await supabase
            .from("workspace_members")
            .select("*", { count: "exact", head: true })
            .eq("workspace_id", workspace.id)
            .not("accepted_at", "is", null);

          // Get project count
          const { count: projectCount } = await supabase
            .from("projects")
            .select("*", { count: "exact", head: true })
            .eq("workspace_id", workspace.id);

          return {
            ...workspace,
            role: member.role,
            member_count: memberCount || 0,
            project_count: projectCount || 0,
          };
        })
      );

      setWorkspaces(workspacesWithCounts);
    } catch (error: any) {
      toast({
        title: "Error fetching workspaces",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkspace = async () => {
    if (!user || !newWorkspace.name.trim()) return;

    try {
      setCreating(true);
      
      const { error } = await supabase.from("workspaces").insert({
        name: newWorkspace.name.trim(),
        description: newWorkspace.description.trim() || null,
        created_by: user.id,
      });

      if (error) throw error;

      toast({
        title: "Workspace created",
        description: `"${newWorkspace.name.trim()}" has been created successfully.`,
      });

      setNewWorkspace({ name: "", description: "" });
      setCreateDialogOpen(false);
      fetchWorkspaces();
    } catch (error: any) {
      toast({
        title: "Error creating workspace",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };


  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Workspaces</h1>
            <p className="text-muted-foreground">
              Manage your workspaces and collaborate with your team
            </p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Workspace
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Workspace</DialogTitle>
                <DialogDescription>
                  Create a new workspace to organize your projects and team members.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Workspace Name</Label>
                  <Input
                    id="name"
                    placeholder="My Workspace"
                    value={newWorkspace.name}
                    onChange={(e) => setNewWorkspace({ ...newWorkspace, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="A brief description of this workspace..."
                    value={newWorkspace.description}
                    onChange={(e) => setNewWorkspace({ ...newWorkspace, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateWorkspace} disabled={creating || !newWorkspace.name.trim()}>
                  {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Workspace
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Workspaces Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : workspaces.length === 0 ? (
          <Card className="border-border">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Layers className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No workspaces yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first workspace to start organizing your projects.
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Workspace
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((workspace) => (
              <Card key={workspace.id} className="border-border hover:border-primary/50 transition-colors">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-lg text-foreground">{workspace.name}</CardTitle>
                    {workspace.description && (
                      <CardDescription className="line-clamp-2">
                        {workspace.description}
                      </CardDescription>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/workspaces/${workspace.id}/settings`)}>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/workspaces/${workspace.id}/members`)}>
                        <Users className="mr-2 h-4 w-4" />
                        Manage Members
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{workspace.member_count} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FolderKanban className="h-4 w-4" />
                      <span>{workspace.project_count} projects</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <RoleBadge role={(workspace.role || "viewer") as AppRole} />
                    <Button variant="outline" size="sm" onClick={() => navigate(`/workspaces/${workspace.id}/members`)}>
                      Open
                    </Button>
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
