import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRBAC, ROLE_CONFIGS, AppRole } from "@/hooks/useRBAC";
import { useToast } from "@/hooks/use-toast";
import { logActivityDirect } from "@/hooks/useActivityLog";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  UserPlus,
  MoreHorizontal,
  Shield,
  Trash2,
  Mail,
  Crown,
  Users,
  ShieldCheck,
  UserCog,
  Eye,
} from "lucide-react";

interface Member {
  id: string;
  user_id: string;
  role: AppRole;
  accepted_at: string | null;
  invited_at: string;
  profile?: {
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface Workspace {
  id: string;
  name: string;
  description: string | null;
}

const ROLE_ICONS: Record<AppRole, typeof Shield> = {
  admin: Crown,
  manager: ShieldCheck,
  tester: UserCog,
  viewer: Eye,
};

const ROLE_COLORS: Record<AppRole, string> = {
  admin: "bg-destructive text-destructive-foreground",
  manager: "bg-primary text-primary-foreground",
  tester: "bg-secondary text-secondary-foreground",
  viewer: "bg-muted text-muted-foreground",
};

export default function WorkspaceMembers() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { userRole, hasPermission, canManageRole, getAssignableRoles, loading: rbacLoading } = useRBAC(workspaceId);

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AppRole>("viewer");
  const [inviting, setInviting] = useState(false);
  const [changingRole, setChangingRole] = useState<string | null>(null);

  useEffect(() => {
    if (workspaceId) {
      fetchWorkspaceAndMembers();
    }
  }, [workspaceId]);

  const fetchWorkspaceAndMembers = async () => {
    if (!workspaceId) return;

    setLoading(true);
    try {
      // Fetch workspace
      const { data: workspaceData, error: workspaceError } = await supabase
        .from("workspaces")
        .select("id, name, description")
        .eq("id", workspaceId)
        .single();

      if (workspaceError) throw workspaceError;
      setWorkspace(workspaceData);

      // Fetch members with profiles
      const { data: membersData, error: membersError } = await supabase
        .from("workspace_members")
        .select(`
          id,
          user_id,
          role,
          accepted_at,
          invited_at
        `)
        .eq("workspace_id", workspaceId);

      if (membersError) throw membersError;

      // Fetch profiles for each member
      const memberIds = membersData.map((m) => m.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, full_name, avatar_url")
        .in("id", memberIds);

      if (profilesError) throw profilesError;

      // Combine members with profiles
      const membersWithProfiles = membersData.map((member) => ({
        ...member,
        profile: profilesData.find((p) => p.id === member.user_id),
      }));

      setMembers(membersWithProfiles as Member[]);
    } catch (error: any) {
      console.error("Error fetching workspace members:", error);
      toast({
        title: "Error",
        description: "Failed to load workspace members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async () => {
    if (!workspaceId || !inviteEmail || !user) return;

    setInviting(true);
    try {
      // Check if user exists
      const { data: existingProfile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("email", inviteEmail.toLowerCase())
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        throw profileError;
      }

      if (!existingProfile) {
        // Create invite for non-existing user
        const { data: inviteData, error: inviteError } = await supabase
          .from("workspace_invites")
          .insert({
            workspace_id: workspaceId,
            email: inviteEmail.toLowerCase(),
            role: inviteRole,
            invited_by: user.id,
          })
          .select()
          .single();

        if (inviteError) throw inviteError;

        // Get inviter profile for email
        const { data: inviterProfile } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", user.id)
          .single();

        // Send invitation email via edge function
        try {
          const response = await supabase.functions.invoke("send-invite", {
            body: {
              inviteId: inviteData.id,
              email: inviteEmail.toLowerCase(),
              workspaceName: workspace?.name || "Workspace",
              inviterName: inviterProfile?.full_name || inviterProfile?.email || "A team member",
              role: inviteRole,
            },
          });

          if (response.error) {
            console.error("Failed to send email:", response.error);
            // Still show success as invite was created, just email failed
            toast({
              title: "Invitation created",
              description: `Invitation created for ${inviteEmail}. Note: Email delivery may have failed.`,
            });
          } else {
            toast({
              title: "Invitation sent",
              description: `An invitation email has been sent to ${inviteEmail}`,
            });
          }
        } catch (emailError) {
          console.error("Email sending error:", emailError);
          toast({
            title: "Invitation created",
            description: `Invitation created for ${inviteEmail}. Email notification could not be sent.`,
          });
        }

        // Log invite activity
        await logActivityDirect(user.id, {
          actionType: "create",
          entityType: "member",
          entityName: inviteEmail.toLowerCase(),
          workspaceId: workspaceId,
          details: { action: "invited", role: inviteRole, email: inviteEmail.toLowerCase() },
        });
      } else {
        // Check if already a member
        const { data: existingMember } = await supabase
          .from("workspace_members")
          .select("id")
          .eq("workspace_id", workspaceId)
          .eq("user_id", existingProfile.id)
          .single();

        if (existingMember) {
          toast({
            title: "Already a member",
            description: "This user is already a member of this workspace",
            variant: "destructive",
          });
          return;
        }

        // Add user as member directly
        const { error: memberError } = await supabase
          .from("workspace_members")
          .insert({
            workspace_id: workspaceId,
            user_id: existingProfile.id,
            role: inviteRole,
            invited_by: user.id,
            accepted_at: new Date().toISOString(),
          });

        if (memberError) throw memberError;

        // Log member added activity
        await logActivityDirect(user.id, {
          actionType: "create",
          entityType: "member",
          entityId: existingProfile.id,
          entityName: existingProfile.full_name || inviteEmail,
          workspaceId: workspaceId,
          details: { action: "added", role: inviteRole, email: inviteEmail.toLowerCase() },
        });

        toast({
          title: "Member added",
          description: `${inviteEmail} has been added to the workspace`,
        });
      }

      setInviteDialogOpen(false);
      setInviteEmail("");
      setInviteRole("viewer");
      fetchWorkspaceAndMembers();
    } catch (error: any) {
      console.error("Error inviting member:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to invite member",
        variant: "destructive",
      });
    } finally {
      setInviting(false);
    }
  };

  const handleChangeRole = async (memberId: string, memberName: string, oldRole: AppRole, newRole: AppRole) => {
    if (!workspaceId || !user) return;
    
    setChangingRole(memberId);
    try {
      const { error } = await supabase
        .from("workspace_members")
        .update({ role: newRole })
        .eq("id", memberId);

      if (error) throw error;

      // Log role change activity
      await logActivityDirect(user.id, {
        actionType: "update",
        entityType: "member",
        entityId: memberId,
        entityName: memberName,
        workspaceId: workspaceId,
        details: { action: "role_changed", oldRole, newRole },
      });

      toast({
        title: "Role updated",
        description: "Member role has been updated successfully",
      });

      fetchWorkspaceAndMembers();
    } catch (error: any) {
      console.error("Error changing role:", error);
      toast({
        title: "Error",
        description: "Failed to update member role",
        variant: "destructive",
      });
    } finally {
      setChangingRole(null);
    }
  };

  const handleRemoveMember = async (memberId: string, memberUserId: string, memberName?: string, memberEmail?: string) => {
    if (!workspaceId || !user) return;
    
    if (!confirm(`Are you sure you want to remove this member from the workspace?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("workspace_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;

      // Log member removal activity
      await logActivityDirect(user.id, {
        actionType: "delete",
        entityType: "member",
        entityId: memberUserId,
        entityName: memberName || memberEmail || "Unknown",
        workspaceId: workspaceId,
        details: { action: "removed", email: memberEmail },
      });

      toast({
        title: "Member removed",
        description: `${memberEmail || "Member"} has been removed from the workspace`,
      });

      fetchWorkspaceAndMembers();
    } catch (error: any) {
      console.error("Error removing member:", error);
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  if (loading || rbacLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const canInvite = hasPermission("member.invite");
  const canUpdateRoles = hasPermission("member.update_role");
  const canRemove = hasPermission("member.remove");

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
              <h1 className="text-2xl font-bold tracking-tight">
                {workspace?.name} - Members
              </h1>
              <p className="text-muted-foreground">
                Manage team members and their access levels
              </p>
            </div>
          </div>
          {canInvite && (
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                  <DialogDescription>
                    Send an invitation to join this workspace
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="colleague@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={inviteRole}
                      onValueChange={(value) => setInviteRole(value as AppRole)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getAssignableRoles().map((role) => {
                          const config = ROLE_CONFIGS[role];
                          return (
                            <SelectItem key={role} value={role}>
                              <div className="flex flex-col">
                                <span>{config.displayName}</span>
                                <span className="text-xs text-muted-foreground">
                                  {config.description}
                                </span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setInviteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleInviteMember}
                    disabled={!inviteEmail || inviting}
                  >
                    {inviting ? "Sending..." : "Send Invitation"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Role Legend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role Access Levels
            </CardTitle>
            <CardDescription>
              Understanding permission levels in your workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(Object.keys(ROLE_CONFIGS) as AppRole[]).map((role) => {
                const config = ROLE_CONFIGS[role];
                const Icon = ROLE_ICONS[role];
                return (
                  <div
                    key={role}
                    className="p-4 border rounded-lg space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <Badge className={ROLE_COLORS[role]}>
                        {config.displayName}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {config.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Members List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Members ({members.length})
            </CardTitle>
            <CardDescription>
              All members with access to this workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  {(canUpdateRoles || canRemove) && (
                    <TableHead className="w-[50px]"></TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => {
                  const RoleIcon = ROLE_ICONS[member.role];
                  const isCurrentUser = member.user_id === user?.id;
                  const canModify = !isCurrentUser && canManageRole(member.role);

                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={member.profile?.avatar_url || ""} />
                            <AvatarFallback>
                              {getInitials(
                                member.profile?.full_name || null,
                                member.profile?.email || ""
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {member.profile?.full_name || "Unknown User"}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                  (You)
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {member.profile?.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <RoleIcon className="h-4 w-4" />
                          <Badge className={ROLE_COLORS[member.role]}>
                            {ROLE_CONFIGS[member.role].displayName}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {member.accepted_at ? (
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(member.invited_at).toLocaleDateString()}
                        </span>
                      </TableCell>
                      {(canUpdateRoles || canRemove) && (
                        <TableCell>
                          {canModify && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {canUpdateRoles && (
                                  <>
                                    <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                                      Change Role
                                    </DropdownMenuItem>
                                    {getAssignableRoles().map((role) => (
                                      <DropdownMenuItem
                                        key={role}
                                        onClick={() => handleChangeRole(
                                          member.id, 
                                          member.profile?.full_name || member.profile?.email || "Unknown",
                                          member.role,
                                          role
                                        )}
                                        disabled={
                                          member.role === role ||
                                          changingRole === member.id
                                        }
                                      >
                                        <Shield className="h-4 w-4 mr-2" />
                                        {ROLE_CONFIGS[role].displayName}
                                      </DropdownMenuItem>
                                    ))}
                                    <DropdownMenuSeparator />
                                  </>
                                )}
                                {canRemove && (
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() =>
                                      handleRemoveMember(
                                        member.id,
                                        member.user_id,
                                        member.profile?.full_name || undefined,
                                        member.profile?.email
                                      )
                                    }
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Remove Member
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
