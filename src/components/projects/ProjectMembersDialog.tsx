import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, UserPlus, Trash2, Users, Search } from "lucide-react";

interface Project {
  id: string;
  name: string;
  workspace_id?: string;
}

interface ProjectMember {
  id: string;
  user_id: string;
  role: string;
  assigned_at: string;
  profile?: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

interface WorkspaceMember {
  id: string;
  user_id: string;
  role: string;
  profile?: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

interface ProjectMembersDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
}

export function ProjectMembersDialog({
  project,
  open,
  onOpenChange,
  workspaceId,
}: ProjectMembersDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState("tester");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (open && project) {
      fetchData();
    }
  }, [open, project]);

  const fetchData = async () => {
    if (!project) return;

    setLoading(true);
    try {
      // Fetch project members with profiles
      const { data: members, error: membersError } = await supabase
        .from("project_members")
        .select("*")
        .eq("project_id", project.id);

      if (membersError) throw membersError;

      // Fetch profiles for project members
      if (members && members.length > 0) {
        const userIds = members.map((m) => m.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, email, avatar_url")
          .in("id", userIds);

        const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
        setProjectMembers(
          members.map((m) => ({
            ...m,
            profile: profileMap.get(m.user_id),
          }))
        );
      } else {
        setProjectMembers([]);
      }

      // Fetch workspace members (to add new project members from)
      const { data: wMembers, error: wMembersError } = await supabase
        .from("workspace_members")
        .select("id, user_id, role")
        .eq("workspace_id", workspaceId)
        .not("accepted_at", "is", null);

      if (wMembersError) throw wMembersError;

      if (wMembers && wMembers.length > 0) {
        const userIds = wMembers.map((m) => m.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, email, avatar_url")
          .in("id", userIds);

        const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
        setWorkspaceMembers(
          wMembers.map((m) => ({
            ...m,
            profile: profileMap.get(m.user_id),
          }))
        );
      } else {
        setWorkspaceMembers([]);
      }
    } catch (error: any) {
      console.error("Error fetching members:", error);
      toast({
        title: "Error",
        description: "Failed to load members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!project || !selectedUserId || !user) return;

    setSaving(true);
    try {
      const { error } = await supabase.from("project_members").insert({
        project_id: project.id,
        user_id: selectedUserId,
        role: selectedRole,
        assigned_by: user.id,
      });

      if (error) throw error;

      toast({
        title: "Member added",
        description: "Project member has been added successfully.",
      });

      setSelectedUserId("");
      setSelectedRole("tester");
      fetchData();
    } catch (error: any) {
      console.error("Error adding member:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add member",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!project) return;

    try {
      const { error } = await supabase
        .from("project_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;

      toast({
        title: "Member removed",
        description: "Project member has been removed.",
      });

      fetchData();
    } catch (error: any) {
      console.error("Error removing member:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove member",
        variant: "destructive",
      });
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from("project_members")
        .update({ role: newRole })
        .eq("id", memberId);

      if (error) throw error;

      toast({
        title: "Role updated",
        description: "Member role has been updated.",
      });

      fetchData();
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update role",
        variant: "destructive",
      });
    }
  };

  // Filter workspace members not already in project
  const availableMembers = workspaceMembers.filter(
    (wm) => !projectMembers.some((pm) => pm.user_id === wm.user_id)
  );

  const filteredAvailableMembers = availableMembers.filter((m) => {
    const name = m.profile?.full_name?.toLowerCase() || "";
    const email = m.profile?.email?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manage Project Members
          </DialogTitle>
          <DialogDescription>
            Add or remove team members for "{project.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Add Member Section */}
          <div className="space-y-4 p-4 rounded-lg bg-muted/50">
            <Label className="flex items-center gap-2 text-base font-medium">
              <UserPlus className="h-4 w-4" />
              Add Team Member
            </Label>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a workspace member" />
                </SelectTrigger>
                <SelectContent>
                  {availableMembers.length === 0 ? (
                    <SelectItem value="none" disabled>
                      All workspace members are already added
                    </SelectItem>
                  ) : (
                    availableMembers.map((m) => (
                      <SelectItem key={m.user_id} value={m.user_id}>
                        <div className="flex items-center gap-2">
                          <span>{m.profile?.full_name || m.profile?.email}</span>
                          <span className="text-xs text-muted-foreground">
                            ({m.role})
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="tester">Tester</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleAddMember}
                disabled={!selectedUserId || saving}
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add
              </Button>
            </div>
          </div>

          {/* Current Members */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">
                Current Members ({projectMembers.length})
              </Label>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : projectMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No project-specific members assigned</p>
                <p className="text-sm">
                  Admins and Managers have access to all projects by default
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {projectMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.profile?.avatar_url || undefined} />
                        <AvatarFallback>
                          {member.profile?.full_name?.charAt(0) ||
                            member.profile?.email?.charAt(0) ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {member.profile?.full_name || "Unknown User"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {member.profile?.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={member.role}
                        onValueChange={(value) =>
                          handleUpdateRole(member.id, value)
                        }
                      >
                        <SelectTrigger className="w-[110px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lead">Lead</SelectItem>
                          <SelectItem value="tester">Tester</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="p-4 rounded-lg bg-muted/30 border">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Admins and Managers automatically have
              access to all projects in the workspace. Use this to assign
              Testers and Viewers to specific projects.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
